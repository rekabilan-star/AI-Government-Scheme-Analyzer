import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const notificationRouter = Router();

// GET /api/notifications - List user's notifications
notificationRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const notifications = await db.notifications.findByUserId(req.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// PUT /api/notifications/:id/read - Mark single as read
notificationRouter.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    await db.notifications.markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// PUT /api/notifications/read-all - Mark all as read
notificationRouter.put('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    await db.notifications.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});
