const clip = (value, max = 300) => typeof value === 'string' ? Array.from(value.trim()).slice(0, max).join('') : '';
const ACTIVITY_TYPES = new Set(['correction_practice', 'fill_blank', 'vocabulary_practice']);
const MODES = new Set(['mistakes', 'vocabulary', 'weak-area']);

export function normalizeReviewRequest(body = {}) {
  const mode = MODES.has(body.mode) ? body.mode : null;
  const insight = body.insight && typeof body.insight === 'object' ? {
    category: clip(body.insight.category, 60),
    topic: clip(body.insight.topic, 100),
    reason: clip(body.insight.reason, 220),
  } : null;
  if (!mode || !insight?.topic || !insight.reason) return null;
  return {
    mode,
    insight,
    corrections: Array.isArray(body.corrections) ? body.corrections.slice(0, 10) : [],
    vocabulary: Array.isArray(body.vocabulary) ? body.vocabulary.slice(0, 10) : [],
  };
}

export function parseReviewActivity(rawText) {
  let value;
  try { value = JSON.parse(String(rawText || '').trim()); } catch { return null; }
  if (!value || typeof value !== 'object' || Array.isArray(value) || !ACTIVITY_TYPES.has(value.activityType)) return null;
  const topic = clip(value.topic, 100);
  const instruction = clip(value.instruction, 220);
  const question = clip(value.question, 500);
  const options = Array.isArray(value.options) ? value.options.map((option) => clip(option, 160)).filter(Boolean).slice(0, 3) : [];
  const expectedAnswer = clip(value.expectedAnswer, 160);
  const explanation = clip(value.explanation, 500);
  const unique = new Set(options.map((option) => option.normalize('NFC').toLocaleLowerCase()));
  if (!topic || !instruction || !question || options.length !== 3 || unique.size !== 3 || !expectedAnswer || !options.includes(expectedAnswer) || !explanation) return null;
  return { activityType: value.activityType, topic, instruction, question, options, expectedAnswer, explanation };
}

export function evaluateReviewAnswer(answer, expectedAnswer, explanation) {
  const response = clip(answer, 300);
  const expected = clip(expectedAnswer, 160);
  if (!response) return null;
  if (!expected) return null;
  const correct = response.normalize('NFC').trim().toLocaleLowerCase() === expected.normalize('NFC').trim().toLocaleLowerCase();
  return {
    correct,
    feedback: correct ? 'That’s right. Nice work.' : 'Almost. Review the answer and try using it in another sentence.',
    expectedAnswer: expected,
    explanation: clip(explanation, 500),
  };
}
