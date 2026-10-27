import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const feedbackRouter = Router();

// POST /api/feedback - Citizen submits rating & feedback
feedbackRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { rating, category, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be a number between 1 and 5 stars.' });
      return;
    }

    if (!comment || comment.trim().length < 5) {
      res.status(400).json({ error: 'Comment must be at least 5 characters long.' });
      return;
    }

    const fb = await db.feedbacks.create({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      rating: Number(rating),
      category: category || 'General Suggestion',
      comment: comment.trim()
    });

    res.status(201).json({
      message: 'Thank you for your valuable feedback!',
      feedback: fb
    });
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// GET /api/feedback - Admin review feedback
feedbackRouter.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const feedbacks = await db.feedbacks.findAll();
    res.json({ feedbacks });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

// PUT /api/feedback/:id/respond - Admin responds to feedback
feedbackRouter.put('/:id/respond', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      res.status(400).json({ error: 'Response message is required' });
      return;
    }

    const updated = await db.feedbacks.respond(req.params.id, response.trim());
    if (!updated) {
      res.status(404).json({ error: 'Feedback record not found' });
      return;
    }

    // Optionally notify user
    await db.notifications.create({
      userId: updated.userId,
      title: 'Response to your feedback',
      message: `The administration team reviewed your feedback on "${updated.category}": "${response.trim()}"`,
      type: 'info',
      read: false
    });

    res.json({
      message: 'Feedback response saved successfully',
      feedback: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record feedback response.' });
  }
});
