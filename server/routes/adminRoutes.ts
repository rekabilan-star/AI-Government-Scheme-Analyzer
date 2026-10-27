import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const adminRouter = Router();

// GET /api/admin/analytics - Detailed Administrative Analytics
adminRouter.get('/analytics', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [users, schemes, applications, savedSchemes, feedbacks] = await Promise.all([
      db.users.find(),
      db.schemes.find(),
      db.applications.findAll(),
      Promise.resolve([]), // or db.savedSchemes.count
      db.feedbacks.findAll()
    ]);

    const totalUsers = users.length;
    const citizenCount = users.filter(u => u.role === 'citizen').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    const totalSchemes = schemes.length;
    const activeSchemes = schemes.filter(s => s.isActive).length;
    const inactiveSchemes = totalSchemes - activeSchemes;

    // Applications by status
    const statusCounts: Record<string, number> = {
      'Not Started': 0,
      'Preparing Documents': 0,
      'Ready to Apply': 0,
      'Submitted': 0,
      'Completed': 0
    };
    for (const app of applications) {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      } else {
        statusCounts[app.status] = 1;
      }
    }

    const applicationStatusChart = Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Schemes by category
    const categoryCounts: Record<string, number> = {};
    for (const s of schemes) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
    const categoryChart = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Financial benefit stats
    const totalBenefitPool = schemes.reduce((sum, s) => sum + (s.benefits.financialAmount || 0), 0);
    const avgBenefit = activeSchemes > 0 ? Math.round(totalBenefitPool / activeSchemes) : 0;

    // Feedback rating stats
    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1))
      : 5.0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star: `${star} Star`,
      count: feedbacks.filter(f => f.rating === star).length
    }));

    res.json({
      summary: {
        totalUsers,
        citizenCount,
        adminCount,
        totalSchemes,
        activeSchemes,
        inactiveSchemes,
        totalApplications: applications.length,
        totalFeedbacks,
        avgRating,
        totalBenefitPool,
        avgBenefit,
        databaseType: db.isMongoConnected() ? 'MongoDB Atlas' : 'Embedded Persistent Store'
      },
      applicationStatusChart,
      categoryChart,
      ratingDistribution,
      recentFeedbacks: feedbacks.slice(0, 5),
      recentApplications: applications.slice(0, 5)
    });
  } catch (err: any) {
    console.error('Analytics computation error:', err);
    res.status(500).json({ error: 'Failed to compute administrative analytics.' });
  }
});
