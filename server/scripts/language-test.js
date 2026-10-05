// Sends realistic learner messages for several selected languages/levels to a RUNNING
// server and prints what Gemma returns, so you can review it.
//   FAIL = structure/server problem.  WARN = model judgement call, review manually.
//   npm run test:languages
// Tip (PowerShell): run `chcp 65001` first so non-Latin text prints correctly.
const BASE = process.env.API_URL || 'http://localhost:5000';

// "script" only checks that the REPLY is written in the selected language's script (a sanity check).
const CASES = [
  { name: 'English, beginner (error)',        targetLanguage: 'English',  level: 'beginner',     message: 'I go to the market yesterday.',               expectCorrection: true },
  { name: 'Japanese, beginner (greeting)',    targetLanguage: 'Japanese', level: 'beginner',     message: 'こんにちは。日本語を勉強したいです。',          script: /[\u3040-\u30ff\u4e00-\u9fff]/ },
  { name: 'Japanese, beginner (error)',       targetLanguage: 'Japanese', level: 'beginner',     message: '昨日、映画を見ます。',                          expectCorrection: true, script: /[\u3040-\u30ff\u4e00-\u9fff]/ },
  { name: 'Korean, beginner (error)',         targetLanguage: 'Korean',   level: 'beginner',     message: '어제 친구를 만나요.',                           expectCorrection: true, script: /[\uac00-\ud7af]/ },
  { name: 'Spanish, intermediate (error)',    targetLanguage: 'Spanish',  level: 'intermediate', message: 'Yo tiene un perro.',                          expectCorrection: true },
  { name: 'Spanish, intermediate (correct)',  targetLanguage: 'Spanish',  level: 'intermediate', message: 'Ayer fui al mercado con mi hermana.',         expectCorrection: false },
  { name: 'Bengali, beginner (greeting)',     targetLanguage: 'Bengali',  level: 'beginner',     message: 'আমি বাংলা শিখতে চাই।',                         script: /[\u0980-\u09ff]/ },
  { name: 'Selector says English, user asks for Japanese (must NOT switch)', targetLanguage: 'English', level: 'beginner', message: 'Can we start learning Japanese?', review: true },
  { name: 'Japanese, advanced (compare with beginner)', targetLanguage: 'Japanese', level: 'advanced', message: '週末は友達と京都に行きました。',        script: /[\u3040-\u30ff\u4e00-\u9fff]/ },
];

let failed = 0;
let warned = 0;

function structureProblems(body) {
  const problems = [];
  if (typeof body?.reply !== 'string' || !body.reply.trim()) problems.push('reply missing');
  const c = body?.correction;
  if (c !== null && c !== undefined && (typeof c.original !== 'string' || typeof c.corrected !== 'string')) problems.push('bad correction shape');
  if (!Array.isArray(body?.vocabulary) || body.vocabulary.length > 3) problems.push('bad vocabulary');
  if (!['beginner', 'intermediate', 'advanced'].includes(body?.difficulty)) problems.push('bad difficulty');
  return problems;
}

for (const c of CASES) {
  console.log(`\n=== ${c.name} [${c.targetLanguage}, ${c.level}] ===`);
  console.log(`Learner: ${c.message}`);
  try {
    const res = await fetch(BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: c.message, targetLanguage: c.targetLanguage, level: c.level, conversationHistory: [] }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) { failed++; console.log(`FAIL  status ${res.status}: ${body?.error || 'no error body'}`); continue; }

    console.log(`Reply:      ${body.reply}`);
    console.log(`English:    ${body.translation ?? 'null'}`);
    console.log(`Tip:        ${body.tip ?? 'null'}`);
    console.log(`Correction: ${body.correction ? JSON.stringify(body.correction, null, 2) : 'null'}`);
    console.log(`Vocabulary: ${body.vocabulary?.length ? JSON.stringify(body.vocabulary) : '[]'}`);
    console.log(`Difficulty: ${body.difficulty}`);

    const problems = structureProblems(body);
    if (problems.length) { failed++; console.log(`FAIL  ${problems.join(', ')}`); continue; }

    const notes = [];
    if (c.script && !c.script.test(body.reply)) notes.push('reply does not contain the selected language\'s script');
    if (c.expectCorrection !== undefined && (body.correction !== null) !== c.expectCorrection) {
      notes.push(`expected correction: ${c.expectCorrection}, got: ${body.correction !== null}`);
    }
    if (c.targetLanguage !== 'English' && c.level !== 'advanced' && !body.translation) notes.push('no English translation was given');
    if (c.review) notes.push('review manually: it should stay in the selected language and point to the Language selector');

    if (notes.length) { warned++; console.log(`WARN  ${notes.join('; ')}`); }
    else console.log('PASS  structure OK, behaviour as expected');
  } catch (e) {
    failed++;
    console.log(`FAIL  ${e.message} - is the server running?`);
  }
}

console.log(`\n${failed} failed, ${warned} to review manually.`);
process.exit(failed ? 1 : 0);