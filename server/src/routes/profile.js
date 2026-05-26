import { Router } from 'express';
import { prisma } from '../app.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get profile stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const participations = await prisma.gameParticipant.findMany({
      where: { userId: req.userId },
    });

    const totalGames = participations.length;
    const totalWon = participations.reduce((sum, p) => sum + p.totalWon, 0);
    const totalLost = participations.reduce((sum, p) => sum + p.totalLost, 0);
    const wins = participations.filter(p => p.totalWon > 0).length;

    res.json({
      totalGames,
      wins,
      winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0',
      totalWonCents: totalWon,
      totalLostCents: totalLost,
      netPLCents: totalWon - totalLost,
      biggestWinCents: participations.length > 0
        ? Math.max(...participations.map(p => p.totalWon))
        : 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Game history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [games, total] = await Promise.all([
      prisma.gameParticipant.findMany({
        where: { userId: req.userId },
        include: {
          room: {
            include: {
              rounds: { orderBy: { roundNumber: 'asc' } },
            },
          },
        },
        orderBy: { room: { createdAt: 'desc' } },
        skip,
        take: parseInt(limit),
      }),
      prisma.gameParticipant.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      games: games.map(g => ({
        roomId: g.roomId,
        mode: g.room.mode,
        wagerCents: g.room.wagerCents,
        totalWon: g.totalWon,
        totalLost: g.totalLost,
        rounds: g.room.rounds.length,
        date: g.room.createdAt,
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Get responsible gambling settings
router.get('/responsible-gambling', authMiddleware, async (req, res) => {
  try {
    let rg = await prisma.responsibleGambling.findUnique({
      where: { userId: req.userId },
    });

    if (!rg) {
      rg = await prisma.responsibleGambling.create({
        data: { userId: req.userId },
      });
    }

    res.json(rg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update responsible gambling settings
router.put('/responsible-gambling', authMiddleware, async (req, res) => {
  try {
    const { dailyDepositLimitCents, sessionLimitMinutes } = req.body;

    const current = await prisma.responsibleGambling.findUnique({
      where: { userId: req.userId },
    });

    // Limits can only be decreased immediately; increases take 24h
    if (current?.dailyDepositLimitCents && dailyDepositLimitCents > current.dailyDepositLimitCents) {
      if (current.lastLimitChangeAt) {
        const hoursSinceChange = (Date.now() - current.lastLimitChangeAt.getTime()) / 3600000;
        if (hoursSinceChange < 24) {
          return res.status(400).json({
            error: 'Deposit limit increases require a 24-hour cooling period',
          });
        }
      }
    }

    const rg = await prisma.responsibleGambling.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        dailyDepositLimitCents,
        sessionLimitMinutes,
        lastLimitChangeAt: new Date(),
      },
      update: {
        dailyDepositLimitCents,
        sessionLimitMinutes,
        lastLimitChangeAt: new Date(),
      },
    });

    res.json(rg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Self-exclusion
router.post('/self-exclude', authMiddleware, async (req, res) => {
  try {
    const { duration } = req.body; // '24h', '7d', '30d', 'permanent'

    let exclusionUntil;
    switch (duration) {
      case '24h':
        exclusionUntil = new Date(Date.now() + 24 * 3600000);
        break;
      case '7d':
        exclusionUntil = new Date(Date.now() + 7 * 24 * 3600000);
        break;
      case '30d':
        exclusionUntil = new Date(Date.now() + 30 * 24 * 3600000);
        break;
      case 'permanent':
        exclusionUntil = new Date('2099-12-31');
        break;
      default:
        return res.status(400).json({ error: 'Invalid duration' });
    }

    await prisma.responsibleGambling.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, exclusionUntil },
      update: { exclusionUntil },
    });

    // Log them out
    await prisma.user.update({
      where: { id: req.userId },
      data: { refreshToken: null },
    });

    res.json({
      message: 'Self-exclusion activated',
      until: exclusionUntil,
      resources: [
        { name: 'National Council on Problem Gambling', url: 'https://www.ncpgambling.org' },
        { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
        { name: '1-800-GAMBLER', phone: '1-800-426-2537' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set exclusion' });
  }
});

// Update avatar
router.put('/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl },
    });
    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

export default router;
