import { GoogleGenAI } from '@google/genai';
import { buildSummaryInstruction, buildSystemInstruction } from '../prompts/languagePartner.js';
import { buildContents } from '../utils/Conversation.js';
import { parseGemmaResponse } from '../utils/Gemmaresponse.js';
import { normalizeLevel, normalizeScenario, normalizeTargetLanguage, SCENARIOS } from '../utils/learnerContext.js';
import { buildFallbackSummary, parseSessionSummary, sanitizeSummaryInputs } from '../utils/sessionSummary.js';

/**
 * Generates a language-aware conversation response using Google Gemma 4.
 * The target language and level are passed to Gemma as context (data); the
 * service contains no language-specific logic.
 *
 * @param {object} params
 * @param {string} params.message - learner's newest message
 * @param {Array<{role: 'user'|'assistant', content: string}>} [params.conversationHistory]
 * @param {string} params.targetLanguage - required; chosen by the learner in the UI
 * @param {string} [params.level] - beginner | intermediate | advanced
 * @returns {Promise<{reply: string, correction: object|null, vocabulary: object[], difficulty: string}>}
 */
export async function generateConversationResponse({
  message,
  conversationHistory = [],
  targetLanguage,
  level,
  scenario,
}) {
  // The selected language is the source of truth; there is no default.
  const language = normalizeTargetLanguage(targetLanguage);
  if (!language) {
    const error = new Error('targetLanguage is required');
    error.isValidationError = true;
    throw error;
  }

  const scenarioId = normalizeScenario(scenario);
  if (!scenarioId) {
    const error = new Error('scenario is required or invalid');
    error.isValidationError = true;
    throw error;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    const error = new Error('GEMINI_API_KEY is not configured in server/.env');
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  const modelName = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
  const learnerLevel = normalizeLevel(level);

  // A short reminder on the newest turn keeps the JSON format reliable in long chats.
  const latestTurn = `Learner's message (practicing ${language}):\n${message}\n\n(Reply with the JSON object only.)`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: buildContents(latestTurn, conversationHistory),
      config: {
        systemInstruction: buildSystemInstruction({ targetLanguage: language, level: learnerLevel, scenario: SCENARIOS[scenarioId] }),
      },
    });

    if (!response || !response.text) {
      throw new Error('Gemma returned an empty or invalid response');
    }

    return parseGemmaResponse(response.text, learnerLevel);
  } catch (err) {
    console.error('Gemma Service Error:', err.message || err);
    if (err.isParseError) throw err;
    throw new Error(`Failed to generate response from Gemma 4: ${err.message || 'API Error'}`);
  }
}

export async function generateSessionSummary({ targetLanguage, level, scenario, conversationHistory, corrections, vocabulary }) {
  const language = normalizeTargetLanguage(targetLanguage);
  const scenarioId = normalizeScenario(scenario);
  if (!language || !scenarioId || !['beginner', 'intermediate', 'advanced'].includes(level)) {
    const error = new Error('Invalid session summary configuration');
    error.isValidationError = true;
    throw error;
  }

  const session = sanitizeSummaryInputs({ conversationHistory, corrections, vocabulary });
  const fallback = buildFallbackSummary({ scenario: scenarioId, ...session });
  if (!session.conversationHistory.some(({ role }) => role === 'user')) return fallback;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') return fallback;

  const modelName = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Write the requested concise session summary as JSON.',
      config: {
        systemInstruction: buildSummaryInstruction({
          targetLanguage: language,
          level,
          scenario: SCENARIOS[scenarioId],
          ...session,
        }),
        httpOptions: { timeout: 30000 },
      },
    });
    return parseSessionSummary(response?.text, fallback);
  } catch (error) {
    // Log provider details on the server; return a useful local summary to the learner.
    console.error('Gemma Summary Error:', error.message || error);
    return fallback;
  }
}
