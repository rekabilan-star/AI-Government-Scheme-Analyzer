import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const schemeRouter = Router();

// GET /api/schemes/meta - Categories and Ministries metadata
schemeRouter.get('/meta', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allSchemes = await db.schemes.find();
    const categories = Array.from(new Set(allSchemes.map(s => s.category)));
    const ministries = Array.from(new Set(allSchemes.map(s => s.ministry)));
    res.json({ categories, ministries });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve metadata' });
  }
});

// GET /api/schemes - Search, Filter, Sort, Paginate
schemeRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, ministry, search, sort, page = '1', limit = '12', includeInactive } = req.query;

    const queryFilter: any = {};
    if (category && category !== 'All') queryFilter.category = String(category);
    if (ministry && ministry !== 'All') queryFilter.ministry = String(ministry);
    if (search) queryFilter.search = String(search);
    if (includeInactive !== 'true') queryFilter.isActive = true;

    let schemes = await db.schemes.find(queryFilter);

    // Sorting
    if (sort === 'financial_desc') {
      schemes.sort((a, b) => (b.benefits.financialAmount || 0) - (a.benefits.financialAmount || 0));
    } else if (sort === 'financial_asc') {
      schemes.sort((a, b) => (a.benefits.financialAmount || 0) - (b.benefits.financialAmount || 0));
    } else if (sort === 'name_asc') {
      schemes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: recent
      schemes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(String(limit), 10) || 12));
    const total = schemes.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedSchemes = schemes.slice(startIndex, startIndex + limitNum);

    res.json({
      schemes: paginatedSchemes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ error: 'Failed to fetch government schemes.' });
  }
});

// GET /api/schemes/:id - Detailed Scheme View
schemeRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const scheme = await db.schemes.findById(req.params.id);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }
    res.json({ scheme });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch scheme details.' });
  }
});

// POST /api/schemes - Admin Create Scheme
schemeRouter.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      shortName,
      code,
      description,
      ministry,
      category,
      benefits,
      eligibility,
      requiredDocuments,
      applicationProcedure,
      officialSourceUrl,
      officialApplicationUrl,
      tags,
      isActive,
      deadline
    } = req.body;

    if (!name || !description || !ministry || !category || !officialSourceUrl) {
      res.status(400).json({ error: 'Name, description, ministry, category, and official source URL are required.' });
      return;
    }

    const newScheme = await db.schemes.create({
      name: name.trim(),
      shortName: shortName?.trim() || name.trim(),
      code: code?.trim() || `SCHEME-${Date.now().toString().slice(-6)}`,
      description: description.trim(),
      ministry: ministry.trim(),
      category,
      benefits: benefits || { description: 'Government welfare assistance' },
      eligibility: eligibility || {},
      requiredDocuments: requiredDocuments || [],
      applicationProcedure: applicationProcedure || [],
      officialSourceUrl: officialSourceUrl.trim(),
      officialApplicationUrl: officialApplicationUrl?.trim() || officialSourceUrl.trim(),
      tags: tags || [category],
      isActive: isActive !== false,
      deadline
    });

    res.status(201).json({
      message: 'Government scheme created successfully',
      scheme: newScheme
    });
  } catch (err: any) {
    console.error('Error creating scheme:', err);
    res.status(500).json({ error: 'Failed to create scheme.' });
  }
});

// PUT /api/schemes/:id - Admin Update Scheme
schemeRouter.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const scheme = await db.schemes.findById(req.params.id);
    if (!scheme) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }

    const updatedScheme = await db.schemes.update(req.params.id, req.body);
    res.json({
      message: 'Scheme updated successfully',
      scheme: updatedScheme
    });
  } catch (err: any) {
    console.error('Error updating scheme:', err);
    res.status(500).json({ error: 'Failed to update scheme.' });
  }
});

// DELETE /api/schemes/:id - Admin Deactivate Scheme
schemeRouter.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const success = await db.schemes.delete(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Scheme not found.' });
      return;
    }
    res.json({ message: 'Scheme deactivated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to deactivate scheme.' });
  }
});
