import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';
import { setupRoomHandlers } from './roomHandlers.js';
import { setupGameHandlers } from './gameHandlers.js';

export function setupSocketServer(io) {
  // Auth middleware — validate JWT on every connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('AUTH_REQUIRED'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, isSuspended: true, avatarUrl: true },
      });

      if (!user) return next(new Error('USER_NOT_FOUND'));
      if (user.isSuspended) return next(new Error('ACCOUNT_SUSPENDED'));

      socket.userId = user.id;
      socket.username = user.username;
      socket.avatarUrl = user.avatarUrl;

      next();
    } catch (err) {
      next(new Error('AUTH_FAILED'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.username} (${socket.id})`);

    // Join user-specific room for wallet updates etc.
    socket.join(`user:${socket.userId}`);

    // Setup handlers
    setupRoomHandlers(io, socket);
    setupGameHandlers(io, socket);

    // Chat
    socket.on('send_chat', ({ roomId, message }) => {
      if (!message || message.length > 200) return;
      io.to(`room:${roomId}`).emit('chat_message', {
        playerId: socket.userId,
        username: socket.username,
        message: message.trim(),
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.username}`);
    });
  });
}
