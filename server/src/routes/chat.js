import express from 'express';
import { generateConversationResponse } from '../services/gemmaService.js';
import { MAX_MESSAGE_LENGTH } from '../utils/Conversation.js';
import { normalizeTargetLanguage } from '../utils/learnerContext.js';

const router = express.Router();

// POST /api/chat
// Body: {
//   message: string,
//   targetLanguage: string,         // required; any language name, treated as data
//   level?: 'beginner' | 'intermediate' | 'advanced',
//   conversationHistory?: [{ role: 'user'|'assistant', content: string }]
// }
// Returns: { reply, correction: {original, corrected, explanation} | null,
//            vocabulary: [{word, meaning, example}], difficulty }
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory, targetLanguage, level } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Message is required and cannot be empty.'
      });
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`
      });
    }

    if (!normalizeTargetLanguage(targetLanguage)) {
      return res.status(400).json({
        error: 'targetLanguage is required. Choose a language to practice.'
      });
    }

    const result = await generateConversationResponse({
      message: message.trim(),
      conversationHistory,
      targetLanguage,
      level,
    });

    return res.status(200).json(result);
  } catch (error) {
    // Log details on the server only; never send internals to the client.
    console.error('Chat Route Error:', error.message);

    if (error.isValidationError) {
      return res.status(400).json({
        error: 'targetLanguage is required. Choose a language to practice.'
      });
    }

    if (error.isConfigError) {
      return res.status(500).json({
        error: 'The AI service is not configured correctly on the server.'
      });
    }

    return res.status(500).json({
      error: 'An error occurred while generating a response from LinguaBuddy AI.'
    });
  }
});

export default router;