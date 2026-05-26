import rateLimit from 'express-rate-limit';
import { redis } from '../app.js';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints — stricter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, try again later' },
});

// Deposit rate limit
export const depositLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many deposit attempts, try again later' },
});

// Socket rate limiter using Redis
export async function checkSocketRateLimit(userId, event, maxPerWindow = 1, windowSeconds = 2) {
  const key = `ratelimit:socket:${userId}:${event}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= maxPerWindow;
}
