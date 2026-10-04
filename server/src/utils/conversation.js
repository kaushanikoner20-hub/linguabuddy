// Helpers that turn the client-sent conversation history into Gemma "contents".
// Stateless by design: the frontend sends recent history with every request.

export const MAX_HISTORY_MESSAGES = 12;
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Validates and trims the history sent by the client.
 * - ignores anything that is not { role: 'user' | 'assistant', content: non-empty string }
 * - keeps only the most recent MAX_HISTORY_MESSAGES
 * - makes sure the history starts with a user message
 */
export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const cleaned = [];
  for (const item of history) {
    if (!item || typeof item !== 'object') continue;
    if (item.role !== 'user' && item.role !== 'assistant') continue;
    if (typeof item.content !== 'string') continue;

    const content = item.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!content) continue;

    cleaned.push({ role: item.role, content });
  }

  const recent = cleaned.slice(-MAX_HISTORY_MESSAGES);
  while (recent.length > 0 && recent[0].role !== 'user') recent.shift();
  return recent;
}

/**
 * Builds the `contents` array for ai.models.generateContent():
 * recent history followed by the new user message. Gemma uses the role
 * "model" for the assistant. Consecutive same-role turns are merged.
 */
export function buildContents(userMessage, history) {
  const turns = [
    ...sanitizeHistory(history),
    { role: 'user', content: userMessage },
  ];

  const contents = [];
  for (const turn of turns) {
    const role = turn.role === 'assistant' ? 'model' : 'user';
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n${turn.content}`;
    } else {
      contents.push({ role, parts: [{ text: turn.content }] });
    }
  }
  return contents;
}