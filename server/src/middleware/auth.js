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

export function adminMiddleware(req, res, next) {
  // Must be used after authMiddleware
  prisma.user.findUnique({ where: { id: req.userId } })
    .then(user => {
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
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
