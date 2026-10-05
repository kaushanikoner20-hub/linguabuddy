const NETWORK_ERROR =
  "Can't reach LinguaBuddy right now. Check that the server is running, then try again.";
const SERVER_ERROR =
  'LinguaBuddy had trouble replying. Please try sending your message again.';

/**
 * Sends the new message, learner settings and recent history to the backend.
 * Resolves to { reply, correction, vocabulary, difficulty } (optional parts are
 * null / [] when missing). Always throws an Error with a friendly, safe message.
 * AbortError is re-thrown unchanged so the caller can ignore cancelled requests.
 */
export async function sendChatMessage(
  { message, conversationHistory, targetLanguage, level },
  signal
) {
  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory, targetLanguage, level }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error(NETWORK_ERROR);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response; handled below
  }

  if (!res.ok || !data || typeof data.reply !== 'string') {
    throw new Error(SERVER_ERROR);
  }

  return {
    reply: data.reply,
    translation: typeof data.translation === 'string' ? data.translation : null,
    tip: typeof data.tip === 'string' ? data.tip : null,
    correction:
      data.correction && typeof data.correction === 'object' ? data.correction : null,
    vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
    difficulty: typeof data.difficulty === 'string' ? data.difficulty : null,
  };
}