import express from 'express';
import { generateSessionSummary } from '../services/gemmaService.js';
import { LEVELS, normalizeScenario, normalizeTargetLanguage } from '../utils/learnerContext.js';

const router = express.Router();

router.post('/session-summary', async (req, res) => {
  const { targetLanguage, level, scenario, conversationHistory, corrections, vocabulary } = req.body || {};

  if (!normalizeTargetLanguage(targetLanguage)) {
    return res.status(400).json({ error: 'Choose a valid target language.' });
  }
  if (typeof level !== 'string' || !LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Choose a valid proficiency level.' });
  }
  if (!normalizeScenario(scenario)) {
    return res.status(400).json({ error: 'Choose a valid practice scenario.' });
  }

  try {
    const summary = await generateSessionSummary({
      targetLanguage,
      level,
      scenario,
      conversationHistory,
      corrections,
      vocabulary,
    });
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Session Summary Route Error:', error.message);
    if (error.isValidationError) {
      return res.status(400).json({ error: 'Choose valid session settings.' });
    }
    return res.status(500).json({ error: 'The session summary could not be prepared.' });
  }
});

export default router;
