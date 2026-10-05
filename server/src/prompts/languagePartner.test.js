import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSummaryInstruction } from './languagePartner.js';
import { SCENARIOS } from '../utils/learnerContext.js';

test('summary prompt carries multilingual session settings and conversation data', () => {
  const cases = [
    ['Japanese', 'beginner', 'travel'],
    ['Korean', 'intermediate', 'restaurant'],
    ['Spanish', 'advanced', 'job-interview'],
    ['Bengali', 'beginner', 'daily-life'],
    ['English', 'beginner', 'free-conversation'],
  ];

  for (const [targetLanguage, level, scenarioId] of cases) {
    const prompt = buildSummaryInstruction({
      targetLanguage,
      level,
      scenario: SCENARIOS[scenarioId],
      conversationHistory: [{ role: 'user', content: `sample ${targetLanguage}` }],
      corrections: [],
      vocabulary: [],
    });
    assert.ok(prompt.includes(`Target language: ${targetLanguage}`));
    assert.ok(prompt.includes(`Learner level: ${level}`));
    assert.ok(prompt.includes(`Practice scenario: ${SCENARIOS[scenarioId].label}`));
    assert.ok(prompt.includes(`sample ${targetLanguage}`));
  }
});
