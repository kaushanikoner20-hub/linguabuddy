import express from 'express';
import { generateReviewActivity } from '../services/gemmaService.js';
import { LEVELS, normalizeScenario, normalizeTargetLanguage } from '../utils/learnerContext.js';
import { normalizeReviewRequest } from '../utils/reviewActivity.js';

const router = express.Router();

router.post('/review-activity', async (req, res) => {
  const { targetLanguage, level, scenario } = req.body || {};
  const review = normalizeReviewRequest(req.body || {});
  if (!normalizeTargetLanguage(targetLanguage) || !LEVELS.includes(level) || !normalizeScenario(scenario) || !review) {
    return res.status(400).json({ error: 'Choose valid practice settings and a review topic.' });
  }
  try {
    const activity = await generateReviewActivity({ targetLanguage, level, scenario, ...review });
    return res.status(200).json(activity);
  } catch (error) {
    console.error('Review Activity Route Error:', error.message);
    if (error.isValidationError) return res.status(400).json({ error: 'Choose a valid review topic.' });
    return res.status(503).json({ error: 'A review activity could not be prepared right now. Please try again.' });
  }
});

export default router;
