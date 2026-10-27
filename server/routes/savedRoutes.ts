import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const savedRouter = Router();

// GET /api/saved-schemes - List user's saved schemes
savedRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const saved = await db.savedSchemes.findByUserId(req.user.id);
    res.json({ savedSchemes: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch saved schemes.' });
  }
});

// POST /api/saved-schemes/:schemeId - Save scheme
savedRouter.post('/:schemeId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { schemeId } = req.params;
    const { notes } = req.body;

    const scheme = await db.schemes.findById(schemeId);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }

    const saved = await db.savedSchemes.create(req.user.id, scheme, notes);
    res.status(201).json({
      message: 'Scheme saved successfully',
      savedScheme: saved
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save scheme.' });
  }
});

// DELETE /api/saved-schemes/:schemeId - Remove saved scheme
savedRouter.delete('/:schemeId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { schemeId } = req.params;
    const success = await db.savedSchemes.delete(req.user.id, schemeId);

    if (!success) {
      res.status(404).json({ error: 'Saved scheme not found.' });
      return;
    }

    res.json({ message: 'Scheme removed from saved list.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove saved scheme.' });
  }
});
