import express from 'express';
import { generateConversationResponse } from '../services/gemmaService.js';

const router = express.Router();

// POST /api/chat - Sends learner message to Gemma 4 and returns AI partner reply
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Message is required and cannot be empty.'
      });
    }

    const replyText = await generateConversationResponse(message.trim());

    return res.status(200).json({
      reply: replyText
    });
  } catch (error) {
    console.error('Chat Route Error:', error.message);

    if (error.isConfigError) {
      return res.status(500).json({
        error: 'API Configuration Error: GEMINI_API_KEY is missing or invalid in server environment.'
      });
    }

    return res.status(500).json({
      error: 'An error occurred while generating a response from LinguaBuddy AI.'
    });
  }
});

export default router;
