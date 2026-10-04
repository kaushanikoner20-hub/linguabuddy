import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../prompts/languagePartner.js';
import { buildContents } from '../utils/Conversation.js';

/**
 * Generates a conversation reply using Google Gemma 4 via @google/genai.
 * @param {string} userMessage - The learner's newest message.
 * @param {Array<{role: 'user'|'assistant', content: string}>} [conversationHistory]
 *        Recent earlier messages (sent by the client; not stored on the server).
 * @returns {Promise<string>} The reply text from Gemma.
 */
export async function generateConversationResponse(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    const error = new Error('GEMINI_API_KEY is not configured in server/.env');
    error.statusCode = 500;
    error.isConfigError = true;
    throw error;
  }

  const modelName = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: buildContents(userMessage, conversationHistory),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    if (!response || !response.text) {
      throw new Error('Gemma returned an empty or invalid response');
    }

    return response.text;
  } catch (err) {
    if (err.isConfigError) throw err;
    console.error('Gemma Service Error:', err.message || err);
    throw new Error(`Failed to generate response from Gemma 4: ${err.message || 'API Error'}`);
  }
}