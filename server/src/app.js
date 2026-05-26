import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import roomRoutes from './routes/rooms.js';
import profileRoutes from './routes/profile.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';
import { setupSocketServer } from './socket/index.js';

const app = express();
const httpServer = createServer(app);

// Globals
export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Stripe webhooks need raw body — mount before json parser
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '10mb' }));

// Compliance banner middleware for dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Compliance-Warning',
      'DEV MODE: Real-money gambling requires jurisdiction-specific licensing. Consult a gaming attorney before going live.');
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io
setupSocketServer(io);

// Export for socket handlers
export { io };

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Threes server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  COMPLIANCE: Real-money gambling requires licensing. This is a development build.');
  }
});
