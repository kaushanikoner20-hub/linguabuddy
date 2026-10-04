// Verifies Stage 1 + Stage 2 against a RUNNING server.
//   1) start the server (npm run dev:server) with your key in server/.env
//   2) npm run test:smoke
// Prints your result only; it never prints or needs your API key.
import { execSync } from 'node:child_process';

const BASE = process.env.API_URL || 'http://localhost:5000';
let failed = 0;

const report = (status, name, detail = '') => {
  if (status === 'FAIL') failed++;
  console.log(`${status.padEnd(5)} ${name}${detail ? ' - ' + detail : ''}`);
};

async function call(path, options) {
  const res = await fetch(BASE + path, options);
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  return { status: res.status, body };
}

async function main() {
  console.log(`Testing ${BASE}\n`);

  // Stage 1: health
  try {
    const { status, body } = await call('/api/health');
    if (status === 200 && body?.status === 'ok') report('PASS', 'GET /api/health');
    else report('FAIL', 'GET /api/health', `status ${status}`);
  } catch {
    report('FAIL', 'GET /api/health', 'server not reachable - is it running?');
    return;
  }

  // Stage 2: validation (no Gemma call is made)
  try {
    const { status } = await call('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });
    if (status === 400) report('PASS', 'POST /api/chat rejects empty message (400)');
    else report('FAIL', 'POST /api/chat rejects empty message', `got ${status}`);
  } catch (e) {
    report('FAIL', 'POST /api/chat validation', e.message);
  }

  // Stage 2: LIVE Gemma call
  try {
    const { status, body } = await call('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello! I want to practice English.' }),
    });
    if (status === 200 && typeof body?.reply === 'string' && body.reply.trim()) {
      report('PASS', 'LIVE Gemma call', `reply: "${body.reply.slice(0, 80).replace(/\s+/g, ' ')}..."`);
    } else {
      report('FAIL', 'LIVE Gemma call', `status ${status}, error: ${body?.error || 'none'} (see server console for details)`);
    }
  } catch (e) {
    report('FAIL', 'LIVE Gemma call', e.message);
  }

  // Stage 3: multi-turn context (history is sent by the client)
  try {
    const { status, body } = await call('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is my name?',
        conversationHistory: [
          { role: 'user', content: 'Hello!' },
          { role: 'assistant', content: 'Hi! How are you today?' },
          { role: 'user', content: 'My name is Kaushani.' },
          { role: 'assistant', content: 'Nice to meet you, Kaushani! What would you like to practice?' },
        ],
      }),
    });
    if (status === 200 && /kaushani/i.test(body?.reply || '')) {
      report('PASS', 'multi-turn context (reply uses the name from history)');
    } else if (status === 200) {
      report('WARN', 'multi-turn context', `reply did not mention the name: "${(body?.reply || '').slice(0, 80)}"`);
    } else {
      report('FAIL', 'multi-turn context', `status ${status}, error: ${body?.error || 'none'}`);
    }
  } catch (e) {
    report('FAIL', 'multi-turn context', e.message);
  }

  // Security: tracked-file checks (needs git)
  try {
    const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
    const envTracked = files.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith('.env.example'));
    if (envTracked.length) report('FAIL', 'no .env file is tracked', envTracked.join(', '));
    else report('PASS', 'no .env file is tracked');

    const { readFileSync } = await import('node:fs');
    const leaks = files.filter((f) => {
      try { return /AIza[0-9A-Za-z_\-]{30,}/.test(readFileSync(f, 'utf8')); } catch { return false; }
    });
    if (leaks.length) report('FAIL', 'no Google API key pattern in tracked files', leaks.join(', '));
    else report('PASS', 'no Google API key pattern in tracked files');
  } catch {
    report('SKIP', 'security file scan', 'not a git repo or git unavailable');
  }
}

main().then(() => {
  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
  process.exit(failed ? 1 : 0);
});