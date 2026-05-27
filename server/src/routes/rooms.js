import { Router } from 'express';
import { prisma } from '../app.js';
import { authMiddleware, tableLeaderMiddleware } from '../middleware/auth.js';
import { exclusionMiddleware } from '../middleware/compliance.js';
import { validateWager } from '../game/engine.js';
import { createRoomState, getActiveRoomIds, getRoomState, getLiveStats } from '../game/roomManager.js';
import { getBalance } from '../services/ledger.js';

const router = Router();

// Get all rooms (for lobby)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, minWager, maxWager } = req.query;

    const where = {};
    if (status) where.status = status;
    if (minWager || maxWager) {
      where.wagerCents = {};
      if (minWager) where.wagerCents.gte = parseInt(minWager);
      if (maxWager) where.wagerCents.lte = parseInt(maxWager);
    }

    // Only show active rooms
    if (!status) {
      where.status = { in: ['WAITING', 'IN_PROGRESS'] };
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        participants: {
          include: {
            user: { select: { username: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Enrich with Redis state for live player counts
    const enriched = await Promise.all(rooms.map(async (room) => {
      const redisState = await getRoomState(room.id);
      return {
        id: room.id,
        hostId: room.hostId,
        tableLeaderId: room.tableLeaderId || room.hostId,
        name: room.name,
        wagerCents: room.wagerCents,
        maxPlayers: room.maxPlayers,
        status: redisState?.status || room.status,
        playerCount: redisState?.players?.length || room.participants.length,
        players: redisState?.players || room.participants.map(p => ({
          userId: p.userId,
          username: p.user.username,
        })),
        createdAt: room.createdAt,
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

// Create room — only TABLE_LEADER or ADMIN may open a table.
router.post('/', authMiddleware, tableLeaderMiddleware, exclusionMiddleware, async (req, res) => {
  try {
    const { wagerCents, maxPlayers = 6, name } = req.body;

    // Validate wager
    const wagerCheck = validateWager(wagerCents);
    if (!wagerCheck.valid) {
      return res.status(400).json({ error: wagerCheck.error });
    }

    // Check balance
    const balance = await getBalance(req.userId);
    if (balance < wagerCents) {
      return res.status(400).json({ error: 'Insufficient funds for this wager' });
    }

    if (maxPlayers < 2 || maxPlayers > 6) {
      return res.status(400).json({ error: 'Player count must be 2–6' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { username: true },
    });

    const room = await prisma.room.create({
      data: {
        hostId: req.userId,
        tableLeaderId: req.userId,
        name: name || `${user.username}'s Table`,
        wagerCents,
        maxPlayers,
      },
    });

    await createRoomState(room.id, req.userId, {
      wagerCents,
      maxPlayers,
      tableLeaderId: req.userId,
    });

    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get single room
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: {
            user: { select: { username: true, avatarUrl: true } },
          },
        },
        rounds: { orderBy: { roundNumber: 'desc' }, take: 10 },
      },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    const redisState = await getRoomState(room.id);

    res.json({ ...room, liveState: redisState });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Live stats for landing page
router.get('/stats/live', async (req, res) => {
  try {
    const stats = await getLiveStats();
    const recentWinner = await prisma.gameRound.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      include: {
        room: {
          include: {
            participants: {
              include: { user: { select: { username: true } } },
            },
          },
        },
      },
    });

    res.json({
      ...stats,
      recentWinner: recentWinner ? {
        username: recentWinner.room.participants[0]?.user?.username,
        amount: recentWinner.potCents,
      } : null,
    });
  } catch (err) {
    res.json({ activeRooms: 0, totalPlayers: 0, totalInPlayCents: 0, recentWinner: null });
  }
});

export default router;
