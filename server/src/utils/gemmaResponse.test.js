import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGemmaResponse } from './Gemmaresponse.js';

const japanese = {
  reply: 'それは楽しそうですね！何を見ましたか？',
  correction: { original: '昨日、映画を見ます。', corrected: '昨日、映画を見ました。', explanation: '「昨日」は過去なので「見ました」。' },
  vocabulary: [{ word: '楽しい', meaning: 'fun', example: '映画は楽しかったです。' }],
  difficulty: 'beginner',
};

test('parses a clean JSON reply (Japanese)', () => {
  const out = parseGemmaResponse(JSON.stringify(japanese));
  assert.equal(out.reply, japanese.reply);
  assert.equal(out.correction.corrected, '昨日、映画を見ました。');
  assert.equal(out.vocabulary[0].word, '楽しい');
});

test('handles code fences and surrounding text', () => {
  const out = parseGemmaResponse('Here you go:\n```json\n' + JSON.stringify(japanese) + '\n```');
  assert.equal(out.reply, japanese.reply);
});

test('works for Korean, Arabic and Cyrillic text', () => {
  for (const reply of ['어제 뭐 했어요?', 'ماذا فعلت أمس؟', 'Что ты делал вчера?']) {
    assert.equal(parseGemmaResponse(JSON.stringify({ reply })).reply, reply);
  }
});

test('null correction and missing fields get safe defaults', () => {
  const out = parseGemmaResponse('{"reply":"¡Qué bien! ¿Y tú?","correction":null}', 'intermediate');
  assert.equal(out.correction, null);
  assert.deepEqual(out.vocabulary, []);
  assert.equal(out.difficulty, 'intermediate');
});

test('identical or incomplete corrections are dropped', () => {
  const same = parseGemmaResponse('{"reply":"ok","correction":{"original":"a","corrected":"a","explanation":"x"}}');
  assert.equal(same.correction, null);
  const partial = parseGemmaResponse('{"reply":"ok","correction":{"original":"a"}}');
  assert.equal(partial.correction, null);
});

test('correction without explanation is kept', () => {
  const out = parseGemmaResponse('{"reply":"ok","correction":{"original":"a","corrected":"b"}}');
  assert.deepEqual(out.correction, { original: 'a', corrected: 'b', explanation: '' });
});

test('vocabulary is limited to 3 valid, unique items', () => {
  const vocab = [
    { word: 'a', meaning: '1' }, { word: 'a', meaning: 'dup' }, { word: '', meaning: 'x' },
    { word: 'b', meaning: '2' }, { word: 'c', meaning: '3' }, { word: 'd', meaning: '4' },
  ];
  const out = parseGemmaResponse(JSON.stringify({ reply: 'ok', vocabulary: vocab }));
  assert.deepEqual(out.vocabulary.map((v) => v.word), ['a', 'b', 'c']);
});

test('invalid difficulty falls back to the requested level', () => {
  assert.equal(parseGemmaResponse('{"reply":"ok","difficulty":"expert"}', 'advanced').difficulty, 'advanced');
});

test('plain text (model ignored the format) becomes the reply', () => {
  const out = parseGemmaResponse('Nice to meet you! What do you do?');
  assert.equal(out.reply, 'Nice to meet you! What do you do?');
  assert.equal(out.correction, null);
});

test('truncated JSON still recovers the reply', () => {
  const out = parseGemmaResponse('{"reply": "こんにちは！元気ですか？", "correction": {"orig');
  assert.equal(out.reply, 'こんにちは！元気ですか？');
});

test('unusable output throws a parse error', () => {
  for (const bad of ['', '   ', '{"correction":null}', '{"broken": ', null, undefined]) {
    assert.throws(() => parseGemmaResponse(bad), (e) => e.isParseError === true);
  }
});

test('long text is clipped by code points without breaking characters', () => {
  const out = parseGemmaResponse(JSON.stringify({ reply: '😀'.repeat(3000) }));
  assert.equal(Array.from(out.reply).length, 2000);
  assert.ok(!out.reply.includes('\uFFFD'));
});

test('translation and tip are kept when present, null otherwise', () => {
  const out = parseGemmaResponse(JSON.stringify({
    reply: 'こんにちは！お元気ですか？',
    translation: 'Hello! How are you?',
    tip: 'You can answer: 元気です。 (I am fine.)',
  }));
  assert.equal(out.translation, 'Hello! How are you?');
  assert.equal(out.tip, 'You can answer: 元気です。 (I am fine.)');

  const none = parseGemmaResponse('{"reply":"ok","translation":null,"tip":42}');
  assert.equal(none.translation, null);
  assert.equal(none.tip, null);
});

test('a translation that just repeats the reply is dropped', () => {
  const out = parseGemmaResponse('{"reply":"Hello!","translation":"Hello!"}');
  assert.equal(out.translation, null);
});