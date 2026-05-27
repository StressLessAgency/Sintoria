import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Loads the role from DB and attaches `req.user = { id, role }`. Use after
 * authMiddleware on any route that needs role-based checks.
 */
export async function loadUserMiddleware(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, role: true, isAdmin: true, isSuspended: true },
    });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to load user' });
  }
}

export function adminMiddleware(req, res, next) {
  // Must be used after authMiddleware
  prisma.user
    .findUnique({
      where: { id: req.userId },
      select: { id: true, role: true, isAdmin: true },
    })
    .then((user) => {
      if (!user || (user.role !== 'ADMIN' && !user.isAdmin)) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      req.user = user;
      next();
    })
    .catch(() => res.status(500).json({ error: 'Auth check failed' }));
}

/**
 * Allows TABLE_LEADER or ADMIN. Plain players (role=PLAYER) are rejected
 * with 403. Use for endpoints like POST /rooms that should be host-gated.
 */
export function tableLeaderMiddleware(req, res, next) {
  prisma.user
    .findUnique({
      where: { id: req.userId },
      select: { id: true, role: true, isAdmin: true },
    })
    .then((user) => {
      if (!user) return res.status(401).json({ error: 'User not found' });
      const role = user.role || (user.isAdmin ? 'ADMIN' : 'PLAYER');
      if (role !== 'TABLE_LEADER' && role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Tables are dealt by hosts. Ask a table leader for a seat.',
          code: 'LEADER_REQUIRED',
        });
      }
      req.user = user;
      next();
    })
    .catch(() => res.status(500).json({ error: 'Auth check failed' }));
}

export function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
