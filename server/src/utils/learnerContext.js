// Normalizes the learner settings sent by the client. The target language is
// treated purely as DATA that is passed to Gemma; no language-specific logic lives here.
// There is deliberately NO default language: the client's selector is the source of truth.

export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const DEFAULT_LEVEL = 'beginner'; // only used if a client omits the level
const MAX_LANGUAGE_LENGTH = 40;

/**
 * Accepts any language name in any script ("Japanese", "日本語", "Português (Brasil)").
 * Removes characters that could break the prompt (newlines, quotes, braces, etc.).
 * @returns {string|null} the cleaned name, or null when missing/invalid
 */
export function normalizeTargetLanguage(value) {
  if (typeof value !== 'string') return null;

  const cleaned = Array.from(
    value
      .normalize('NFC')
      .replace(/[^\p{L}\p{M}\p{N} \-'’().,]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
    .slice(0, MAX_LANGUAGE_LENGTH)
    .join('')
    .trim();

  return cleaned || null;
}

export function normalizeLevel(value) {
  if (typeof value !== 'string') return DEFAULT_LEVEL;
  const level = value.trim().toLowerCase();
  return LEVELS.includes(level) ? level : DEFAULT_LEVEL;
}