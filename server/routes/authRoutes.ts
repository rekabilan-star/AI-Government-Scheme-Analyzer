import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { authenticateToken, signToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const authRouter = Router();

// POST /api/auth/register - Citizen Registration
authRouter.post('/register', async (req, res): Promise<void> => {
  try {
    const { name, email, password, profile } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await db.users.findByEmail(emailNormalized);

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Enforce role = 'citizen' on public registration to prevent self-elevation
    const newUser = await db.users.create({
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      role: 'citizen',
      profile: profile || {}
    });

    // Create welcome notification
    await db.notifications.create({
      userId: newUser.id,
      title: 'Welcome to Scheme Analyzer!',
      message: 'Your account is ready. Complete your profile attributes to receive personalized scheme recommendations.',
      type: 'info',
      read: false,
      link: '/profile'
    });

    const token = signToken(newUser);

    // Exclude password hash from response
    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.users.findByEmail(email.trim());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

// GET /api/auth/me - Authenticated user details
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// PUT /api/auth/profile - Update Citizen Profile
authRouter.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { profile, name } = req.body;

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (profile) {
      updates.profile = {
        ...req.user.profile,
        ...profile
      };
      if (profile.annualFamilyIncome !== undefined) {
        updates.profile.annualFamilyIncome = Number(profile.annualFamilyIncome);
      }
      if (profile.age !== undefined) {
        updates.profile.age = Number(profile.age);
      }
    }

    const updatedUser = await db.users.update(req.user.id, updates);
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
