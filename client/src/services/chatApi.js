const NETWORK_ERROR =
  "Can't reach LinguaBuddy right now. Check that the server is running, then try again.";
const SERVER_ERROR =
  'LinguaBuddy had trouble replying. Please try sending your message again.';

/**
 * Sends the new message plus recent history to the backend.
 * Always throws an Error with a friendly, safe message (never server internals).
 * AbortError is re-thrown unchanged so the caller can ignore cancelled requests.
 */
export async function sendChatMessage({ message, conversationHistory }, signal) {
  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory }),
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
  return data.reply;
}