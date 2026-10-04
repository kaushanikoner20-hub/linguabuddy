import express from 'express';
import { generateConversationResponse } from '../services/gemmaService.js';
import { MAX_MESSAGE_LENGTH } from '../utils/Conversation.js';

const router = express.Router();

// POST /api/chat
// Body: { message: string, conversationHistory?: [{ role: 'user'|'assistant', content: string }] }
// Returns: { reply: string }
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body || {};

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

    const replyText = await generateConversationResponse(
      message.trim(),
      conversationHistory
    );

    return res.status(200).json({
      reply: replyText
    });
  } catch (error) {
    // Log details on the server only; never send internals to the client.
    console.error('Chat Route Error:', error.message);

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