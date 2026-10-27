import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getRecommendations } from '../services/recommendationEngine.js';
import { explainRecommendationsAI } from '../services/geminiService.js';

export const recommendationRouter = Router();

// GET /api/recommendations - Personalized Recommendations
recommendationRouter.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const profile = req.user?.profile;
    const schemes = await db.schemes.find({ isActive: true });

    const recommendations = getRecommendations(schemes, profile);

    // AI overview for top recommendations
    let aiOverview = '';
    if (recommendations.length > 0) {
      aiOverview = await explainRecommendationsAI(profile, recommendations);
    }

    res.json({
      total: recommendations.length,
      aiOverview,
      recommendations
    });
  } catch (err: any) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});
