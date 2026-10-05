import { normalizeCorrection } from './gemmaResponse.js';
import { sanitizeHistory } from './Conversation.js';
import { SCENARIOS } from './learnerContext.js';

const MAX_ITEMS = 20;
const clip = (value, max = 500) =>
  typeof value === 'string' ? Array.from(value.trim()).slice(0, max).join('') : '';

export function sanitizeSummaryInputs({ conversationHistory, corrections, vocabulary }) {
  const cleanCorrections = (Array.isArray(corrections) ? corrections : [])
    .map(normalizeCorrection)
    .filter(Boolean)
    .slice(-MAX_ITEMS);

  const seen = new Set();
  const cleanVocabulary = [];
  for (const item of Array.isArray(vocabulary) ? vocabulary : []) {
    if (!item || typeof item !== 'object') continue;
    const word = clip(item.word, 100);
    const meaning = clip(item.meaning);
    if (!word || !meaning || seen.has(word.toLocaleLowerCase())) continue;
    seen.add(word.toLocaleLowerCase());
    cleanVocabulary.push({ word, meaning, example: clip(item.example) });
    if (cleanVocabulary.length >= MAX_ITEMS) break;
  }

  return {
    conversationHistory: sanitizeHistory(conversationHistory),
    corrections: cleanCorrections,
    vocabulary: cleanVocabulary,
  };
}

export function buildFallbackSummary({ scenario, conversationHistory = [], corrections = [], vocabulary = [] }) {
  const scenarioLabel = SCENARIOS[scenario]?.label || 'conversation practice';
  const learnerMessages = sanitizeHistory(conversationHistory).filter(({ role }) => role === 'user').length;

  return {
    overview: learnerMessages
      ? `You practiced ${scenarioLabel.toLowerCase()} in ${learnerMessages} learner message${learnerMessages === 1 ? '' : 's'}.`
      : `You finished setting up a ${scenarioLabel.toLowerCase()} session. Send a message next time to begin practicing.`,
    strengths: learnerMessages ? ['You made time to practice in your target language.'] : [],
    improvements: corrections.length
      ? ['Review the corrections below and try the improved forms in another message.']
      : learnerMessages
        ? ['Keep practicing by adding details to your answers.']
        : [],
    corrections,
    vocabulary,
    insights: [
      ...(corrections.length ? [{ category: 'grammar', topic: 'Review your recent corrections', reason: 'These forms were corrected during this session, so they may be useful to revisit.', priority: 'medium' }] : []),
      ...(vocabulary.length ? [{ category: 'vocabulary', topic: 'Practice session vocabulary', reason: 'These words came up during this session and are ready for another practice round.', priority: 'medium' }] : []),
    ].slice(0, 3),
    fallback: true,
  };
}

export function parseSessionSummary(rawText, fallback) {
  let parsed;
  try {
    parsed = JSON.parse(String(rawText || '').trim());
  } catch {
    return fallback;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;

  const overview = clip(parsed.overview, 800);
  if (!overview) return fallback;

  const list = (value) => Array.isArray(value)
    ? value.map((item) => clip(item, 300)).filter(Boolean).slice(0, 3)
    : [];

  const allowedCategories = new Set(['grammar', 'vocabulary', 'sentence formation', 'fluency', 'comprehension', 'word choice', 'confidence', 'pronunciation/text accuracy']);
  const insights = Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3).flatMap((item) => {
    if (!item || typeof item !== 'object' || !allowedCategories.has(String(item.category || '').toLowerCase())) return [];
    const topic = clip(item.topic, 100);
    const reason = clip(item.reason, 220);
    const priority = ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium';
    return topic && reason ? [{ category: String(item.category).toLowerCase(), topic, reason, priority }] : [];
  }) : fallback.insights;

  return {
    overview,
    strengths: list(parsed.strengths),
    improvements: list(parsed.improvements),
    // Preserve only items supplied from the completed chat; never trust new AI facts here.
    corrections: fallback.corrections,
    vocabulary: fallback.vocabulary,
    insights,
    fallback: false,
  };
}
