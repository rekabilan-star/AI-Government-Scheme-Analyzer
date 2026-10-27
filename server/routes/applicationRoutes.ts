import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const applicationRouter = Router();

// GET /api/applications - List citizen's tracked applications
applicationRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const applications = await db.applications.findByUserId(req.user.id);
    res.json({ applications });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch application records.' });
  }
});

// POST /api/applications - Create or start tracking a scheme application
applicationRouter.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { schemeId, status, applicationDate, trackingNumber, notes } = req.body;

    if (!schemeId) {
      res.status(400).json({ error: 'schemeId is required' });
      return;
    }

    const scheme = await db.schemes.findById(schemeId);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found' });
      return;
    }

    // Initialize checklist based on required documents of the scheme
    const initialChecklist = (scheme.requiredDocuments || []).map(doc => ({
      docName: doc.name,
      completed: false
    }));

    const newApp = await db.applications.create({
      userId: req.user.id,
      schemeId: scheme.id,
      schemeName: scheme.name,
      schemeCategory: scheme.category,
      ministry: scheme.ministry,
      status: status || 'Not Started',
      applicationDate: applicationDate || new Date().toISOString().split('T')[0],
      trackingNumber: trackingNumber || undefined,
      notes: notes || '',
      checklist: initialChecklist
    });

    // Notify user
    await db.notifications.create({
      userId: req.user.id,
      title: 'Application Tracking Started',
      message: `You started tracking your application for "${scheme.shortName}". Remember to assemble required documents!`,
      type: 'info',
      read: false,
      link: '/applications'
    });

    res.status(201).json({
      message: 'Application tracking created successfully',
      application: newApp
    });
  } catch (err: any) {
    console.error('Error creating application tracking:', err);
    res.status(500).json({ error: 'Failed to create application record.' });
  }
});

// PUT /api/applications/:id - Update status, checklist, or notes
applicationRouter.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const app = await db.applications.findById(req.params.id);
    if (!app) {
      res.status(404).json({ error: 'Application record not found' });
      return;
    }

    if (app.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to modify this application record' });
      return;
    }

    const { status, applicationDate, trackingNumber, notes, checklist } = req.body;

    const updates: any = {};
    if (status) updates.status = status;
    if (applicationDate !== undefined) updates.applicationDate = applicationDate;
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (notes !== undefined) updates.notes = notes;
    if (checklist) updates.checklist = checklist;

    const updatedApp = await db.applications.update(req.params.id, updates);

    // If status changed to Submitted or Completed, add notification
    if (status && status !== app.status) {
      await db.notifications.create({
        userId: req.user.id,
        title: `Status Updated: ${app.schemeName}`,
        message: `Your tracking stage has been updated to "${status}".`,
        type: status === 'Completed' ? 'success' : 'info',
        read: false,
        link: '/applications'
      });
    }

    res.json({
      message: 'Application tracking record updated',
      application: updatedApp
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update application record.' });
  }
});

// DELETE /api/applications/:id - Delete tracking record
applicationRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const success = await db.applications.delete(req.params.id, req.user.id);
    if (!success) {
      res.status(404).json({ error: 'Application record not found or unauthorized' });
      return;
    }

    res.json({ message: 'Application tracking record deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete application record.' });
  }
});
