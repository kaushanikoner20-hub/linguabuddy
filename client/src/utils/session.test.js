import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addSessionToProgress,
  getSessionMetrics,
  makeFallbackSummary,
  readLocalProgress,
  saveLocalProgress,
} from './session.js';

test('session metrics count learner turns and deduplicate vocabulary', () => {
  const messages = [
    { role: 'user', content: 'こんにちは' },
    { role: 'assistant', content: '...' , correction: { original: 'a', corrected: 'b', explanation: 'Try b.' }, vocabulary: [{ word: '駅', meaning: 'station' }] },
    { role: 'user', content: '駅へ行きます' },
    { role: 'assistant', content: '...' , vocabulary: [{ word: '駅', meaning: 'station' }, { word: '切符', meaning: 'ticket' }] },
  ];
  const metrics = getSessionMetrics(messages, 1000, 6500);
  assert.equal(metrics.learnerMessages, 2);
  assert.equal(metrics.correctionCount, 1);
  assert.equal(metrics.vocabularyCount, 2);
  assert.equal(metrics.durationSeconds, 5);
});

test('empty-session fallback stays factual and has no invented learning items', () => {
  const metrics = getSessionMetrics([], 1000, 2200);
  const summary = makeFallbackSummary({ config: { scenario: 'travel' }, scenarioLabel: 'Travel', metrics });
  assert.match(summary.overview, /finished setting up/);
  assert.deepEqual(summary.corrections, []);
  assert.deepEqual(summary.vocabulary, []);
});

test('progress is aggregate-only and storage failures are safe', () => {
  let stored;
  const storage = {
    getItem: () => stored || null,
    setItem: (_key, value) => { stored = value; },
  };
  const metrics = { learnerMessages: 3, correctionCount: 1, vocabularyCount: 2 };
  const updated = addSessionToProgress(readLocalProgress(storage), metrics);
  assert.equal(saveLocalProgress(updated, storage), true);
  assert.deepEqual(readLocalProgress(storage), {
    sessionsCompleted: 1,
    totalPracticeMessages: 3,
    totalCorrections: 1,
    totalVocabulary: 2,
  });
  assert.equal(readLocalProgress({ getItem: () => '{bad json' }).sessionsCompleted, 0);
  assert.equal(saveLocalProgress(updated, { setItem: () => { throw new Error('blocked'); } }), false);
});
