import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { chatAssistantAI } from '../services/geminiService.js';

export const chatRouter = Router();

// POST /api/chat - Conversational AI Assistant
chatRouter.post('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const schemes = await db.schemes.find({ isActive: true });
    const profile = req.user?.profile;

    const result = await chatAssistantAI(
      message.trim(),
      Array.isArray(history) ? history : [],
      profile,
      schemes
    );

    res.json({
      reply: result.reply,
      referencedSchemes: result.referencedSchemes,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});
