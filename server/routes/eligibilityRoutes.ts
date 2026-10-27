import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { evaluateEligibility } from '../services/eligibilityEngine.js';
import { explainEligibilityAI } from '../services/geminiService.js';

export const eligibilityRouter = Router();

// POST /api/eligibility/analyze - Analyze Eligibility for a Specific Scheme
eligibilityRouter.post('/analyze', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { schemeId, profileOverride, requestAiExplanation } = req.body;

    if (!schemeId) {
      res.status(400).json({ error: 'schemeId is required.' });
      return;
    }

    const scheme = await db.schemes.findById(schemeId);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }

    // Use profile from body or authenticated user
    const profile = profileOverride || req.user?.profile;

    // 1. Run deterministic rule-based evaluation
    const evaluation = evaluateEligibility(scheme, profile);

    // 2. Optional AI explanation grounded in deterministic evaluation
    if (requestAiExplanation !== false) {
      evaluation.aiExplanation = await explainEligibilityAI(scheme, profile, evaluation);
    }

    res.json({
      scheme,
      evaluation
    });
  } catch (err: any) {
    console.error('Error during eligibility analysis:', err);
    res.status(500).json({ error: 'Failed to analyze eligibility.' });
  }
});

// POST /api/eligibility/batch - Analyze all active schemes for profile
eligibilityRouter.post('/batch', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { profileOverride } = req.body;
    const profile = profileOverride || req.user?.profile;

    const schemes = await db.schemes.find({ isActive: true });
    const evaluations = schemes.map(scheme => ({
      schemeId: scheme.id,
      schemeName: scheme.name,
      shortName: scheme.shortName,
      category: scheme.category,
      evaluation: evaluateEligibility(scheme, profile)
    }));

    res.json({
      totalAnalyzed: evaluations.length,
      evaluations
    });
  } catch (err: any) {
    console.error('Batch eligibility evaluation error:', err);
    res.status(500).json({ error: 'Failed to execute batch eligibility analysis.' });
  }
});
