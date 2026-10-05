// Turns Gemma's text into a safe, predictable object:
//   { reply, translation | null, tip | null, correction | null, vocabulary: [], difficulty }
// Nothing here knows about any particular language.

import { LEVELS } from './learnerContext.js';

const MAX_REPLY = 2000;
const MAX_FIELD = 500;
const MAX_EXPLANATION = 1000;
const MAX_VOCAB = 3;

// Length-limit by Unicode code points (never splits an emoji or CJK character).
const clip = (value, max) =>
  typeof value === 'string' ? Array.from(value.trim()).slice(0, max).join('') : '';

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

// Finds the first complete {...} block, aware of strings and escapes.
function extractFirstObject(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseJsonObject(text) {
  const candidates = [text, stripCodeFences(text), extractFirstObject(text)];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

// Last resort for truncated JSON: recover just the "reply" string.
function salvageReply(text) {
  const match = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (!match) return null;
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return null;
  }
}

export function normalizeCorrection(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const original = clip(value.original, MAX_FIELD);
  const corrected = clip(value.corrected, MAX_FIELD);
  const explanation = clip(value.explanation, MAX_EXPLANATION);
  if (!original || !corrected) return null;
  if (original.normalize('NFC') === corrected.normalize('NFC')) return null; // nothing changed
  return { original, corrected, explanation };
}

export function normalizeVocabulary(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const items = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const word = clip(entry.word, 100);
    const meaning = clip(entry.meaning, MAX_FIELD);
    if (!word || !meaning || seen.has(word)) continue;
    seen.add(word);
    items.push({ word, meaning, example: clip(entry.example, MAX_FIELD) });
    if (items.length === MAX_VOCAB) break;
  }
  return items;
}

/**
 * @param {string} rawText - text returned by Gemma
 * @param {string} fallbackLevel - used when Gemma omits/garbles "difficulty"
 * @throws {Error} with isParseError = true when no usable reply can be found
 */
export function parseGemmaResponse(rawText, fallbackLevel = 'beginner') {
  const raw = typeof rawText === 'string' ? rawText.trim() : '';
  const parsed = raw ? parseJsonObject(raw) : null;

  let reply = parsed ? clip(parsed.reply, MAX_REPLY) : '';

  if (!parsed) {
    reply = clip(salvageReply(raw) ?? '', MAX_REPLY);
    // Gemma ignored the JSON format and just wrote a normal reply: keep it as the reply.
    if (!reply && raw && !raw.startsWith('{') && !raw.startsWith('```')) {
      reply = clip(raw, MAX_REPLY);
    }
  }

  if (!reply) {
    const error = new Error('Gemma returned no usable reply');
    error.isParseError = true;
    throw error;
  }

  const difficulty =
    typeof parsed?.difficulty === 'string' && LEVELS.includes(parsed.difficulty.trim().toLowerCase())
      ? parsed.difficulty.trim().toLowerCase()
      : fallbackLevel;

  // Optional English-guidance fields (null when absent). Dropped if they just repeat the reply.
  const translation = clip(parsed?.translation, MAX_FIELD);
  const tip = clip(parsed?.tip, MAX_FIELD);

  return {
    reply,
    translation: translation && translation !== reply ? translation : null,
    tip: tip || null,
    correction: normalizeCorrection(parsed?.correction),
    vocabulary: normalizeVocabulary(parsed?.vocabulary),
    difficulty,
  };
}