// Run with: node --test server/src/utils/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHistory, buildContents, MAX_HISTORY_MESSAGES } from './Conversation.js';

test('non-array history becomes empty', () => {
  assert.deepEqual(sanitizeHistory(undefined), []);
  assert.deepEqual(sanitizeHistory('hi'), []);
});

test('invalid entries are dropped', () => {
  const out = sanitizeHistory([
    null,
    { role: 'system', content: 'x' },
    { role: 'user', content: 42 },
    { role: 'user', content: '   ' },
    { role: 'user', content: ' Hello! ' },
  ]);
  assert.deepEqual(out, [{ role: 'user', content: 'Hello!' }]);
});

test('history is limited and starts with a user turn', () => {
  const history = [];
  for (let i = 0; i < 30; i++) {
    history.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `m${i}` });
  }
  const out = sanitizeHistory(history);
  assert.ok(out.length <= MAX_HISTORY_MESSAGES);
  assert.equal(out[0].role, 'user');
  assert.equal(out[out.length - 1].content, 'm29');
});

test('buildContents maps assistant to model and appends the new message', () => {
  const contents = buildContents('My name is Kaushani.', [
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi! How are you today?' },
  ]);
  assert.deepEqual(
    contents.map((c) => c.role),
    ['user', 'model', 'user']
  );
  assert.equal(contents[2].parts[0].text, 'My name is Kaushani.');
});

test('consecutive same-role turns are merged', () => {
  const contents = buildContents('second', [{ role: 'user', content: 'first' }]);
  assert.equal(contents.length, 1);
  assert.equal(contents[0].parts[0].text, 'first\nsecond');
});