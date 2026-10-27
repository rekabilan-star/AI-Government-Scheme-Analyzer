import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { User } from '../models/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET || 'scheme_analyzer_jwt_secure_secret_key_2026';

export function signToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await db.users.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
}

export async function optionalAuthenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = await db.users.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore invalid optional token
    }
  }
  next();
}
