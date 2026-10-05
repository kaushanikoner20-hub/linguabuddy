import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateReviewAnswer, normalizeReviewRequest, parseReviewActivity } from './reviewActivity.js';
import { buildReviewActivityInstruction } from '../prompts/languagePartner.js';
import { SCENARIOS } from './learnerContext.js';

const valid = { activityType: 'fill_blank', topic: 'directions', instruction: 'Choose the best phrase.', question: '駅___行きます。', options: ['に', 'が', 'を'], expectedAnswer: 'に', explanation: 'This marks a destination.' };

test('review request requires a valid mode and useful topic', () => {
  assert.equal(normalizeReviewRequest({ mode: 'weak-area', insight: { topic: 'particles', reason: 'appeared several times' } }).insight.topic, 'particles');
  assert.equal(normalizeReviewRequest({ mode: 'unknown', insight: { topic: 'x', reason: 'y' } }), null);
  assert.equal(normalizeReviewRequest({ mode: 'mistakes', insight: { topic: '', reason: 'y' } }), null);
});

test('review activity parser requires bounded structured choices and a matching answer', () => {
  assert.deepEqual(parseReviewActivity(JSON.stringify(valid)), valid);
  for (const activityType of ['correction_practice', 'fill_blank', 'vocabulary_practice']) {
    assert.equal(parseReviewActivity(JSON.stringify({ ...valid, activityType })).activityType, activityType);
  }
  assert.equal(parseReviewActivity('{broken'), null);
  assert.equal(parseReviewActivity(JSON.stringify({ ...valid, expectedAnswer: 'unknown' })), null);
  assert.equal(parseReviewActivity(JSON.stringify({ ...valid, options: ['same', 'same', 'third'] })), null);
  assert.equal(parseReviewActivity(JSON.stringify({ ...valid, activityType: 'translation_practice' })), null);
});

test('answer checking handles Unicode and empty answers without exposing internals', () => {
  assert.equal(evaluateReviewAnswer(' に ', 'に', 'destination').correct, true);
  assert.equal(evaluateReviewAnswer('を', 'に', 'destination').correct, false);
  assert.equal(evaluateReviewAnswer('  ', 'に', 'destination'), null);
});

test('review prompt carries chosen language, level, scenario and topic across five languages', () => {
  const cases = [['Japanese', 'beginner', 'travel'], ['Korean', 'intermediate', 'restaurant'], ['Spanish', 'advanced', 'job-interview'], ['Bengali', 'beginner', 'daily-life'], ['English', 'beginner', 'free-conversation']];
  for (const [targetLanguage, level, scenarioId] of cases) {
    const prompt = buildReviewActivityInstruction({ targetLanguage, level, scenario: SCENARIOS[scenarioId], mode: 'weak-area', insight: { topic: 'selected topic', reason: 'supported by session' }, corrections: [], vocabulary: [] });
    assert.ok(prompt.includes(`Target language: ${targetLanguage}`));
    assert.ok(prompt.includes(`Learner level: ${level}`));
    assert.ok(prompt.includes(SCENARIOS[scenarioId].label));
    assert.ok(prompt.includes('selected topic'));
  }
});
