import { Router } from 'express';
import { prisma } from '../app.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { getLiveStats } from '../game/roomManager.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const liveStats = await getLiveStats();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayDeposits,
      todayWithdrawals,
      todayRake,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', createdAt: { gte: startOfDay } },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL', createdAt: { gte: startOfDay } },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { type: 'RAKE', createdAt: { gte: startOfDay } },
        _sum: { amountCents: true },
      }),
    ]);

    res.json({
      live: liveStats,
      totalUsers,
      today: {
        deposits: {
          count: todayDeposits._count,
          totalCents: todayDeposits._sum.amountCents || 0,
        },
        withdrawals: {
          count: todayWithdrawals._count,
          totalCents: Math.abs(todayWithdrawals._sum.amountCents || 0),
        },
        rakeCents: todayRake._sum.amountCents || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

// Users list
router.get('/users', async (req, res) => {
  try {
    const { search, kycStatus, page = 1, limit = 20 } = req.query;
    const where = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { wallet: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: {
          id: true, email: true, username: true, kycStatus: true,
          isVerified: true, isSuspended: true, isAdmin: true,
          createdAt: true, wallet: { select: { balanceCents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Suspend/unsuspend user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isSuspended: suspended },
    });
    res.json({ id: user.id, isSuspended: user.isSuspended });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// KYC update
router.put('/users/:id/kyc', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: status },
    });
    res.json({ id: user.id, kycStatus: user.kycStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update KYC' });
  }
});

// Game logs
router.get('/games', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where: { status: 'COMPLETED' },
        include: {
          rounds: true,
          participants: {
            include: { user: { select: { username: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.room.count({ where: { status: 'COMPLETED' } }),
    ]);

    res.json({ rooms, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// Financials
router.get('/financials', async (req, res) => {
  try {
    const [deposits, withdrawals, rake, totalFloat] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT' },
        _sum: { amountCents: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAWAL' },
        _sum: { amountCents: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'RAKE' },
        _sum: { amountCents: true },
      }),
      prisma.wallet.aggregate({
        _sum: { balanceCents: true },
      }),
    ]);

    res.json({
      totalDepositsCents: deposits._sum.amountCents || 0,
      totalWithdrawalsCents: Math.abs(withdrawals._sum.amountCents || 0),
      totalRakeCents: rake._sum.amountCents || 0,
      totalFloatCents: totalFloat._sum.balanceCents || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get financials' });
  }
});

export default router;
