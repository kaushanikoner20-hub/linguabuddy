// Normalizes the learner settings sent by the client. The target language is
// treated purely as DATA that is passed to Gemma; no language-specific logic lives here.
// There is deliberately NO default language: the client's selector is the source of truth.

export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const DEFAULT_LEVEL = 'beginner'; // only used if a client omits the level
export const SUPPORTED_LANGUAGES = [
  'English', 'Japanese', 'Korean', 'Spanish', 'French', 'German', 'Hindi',
  'Bengali', 'Italian', 'Portuguese', 'Mandarin Chinese',
];
export const SCENARIOS = {
  'free-conversation': { label: 'Free Conversation', guidance: 'Have a natural conversation on topics the learner brings up. Do not force a fixed setting.' },
  travel: { label: 'Travel', guidance: 'Role-play a practical travel situation such as an airport, hotel, asking directions, sightseeing, or transportation.' },
  restaurant: { label: 'Restaurant', guidance: 'Role-play ordering food, asking about menu items or dietary needs, and paying.' },
  'job-interview': { label: 'Job Interview', guidance: 'Act as an interviewer, ask professional questions, and follow up on the learner’s answers.' },
  'daily-life': { label: 'Daily Life', guidance: 'Practice casual everyday conversations about routines, hobbies, plans, and familiar situations.' },
  shopping: { label: 'Shopping', guidance: 'Role-play shopping: asking about prices, sizes, colors, availability, and buying items.' },
};
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

export function normalizeScenario(value) {
  return typeof value === 'string' && Object.hasOwn(SCENARIOS, value) ? value : null;
}
