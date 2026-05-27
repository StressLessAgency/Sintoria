import { Router } from 'express';
import { prisma } from '../app.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { getLiveStats, getAllActiveRoomStates, getRoomState, deleteRoomState } from '../game/roomManager.js';
import { creditGrant, refundWager } from '../services/ledger.js';

const router = Router();
router.use(authMiddleware, adminMiddleware);

const VALID_ROLES = new Set(['PLAYER', 'TABLE_LEADER', 'ADMIN']);

async function recordAudit(actorId, action, target, metadata) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId,
        action,
        targetType: target?.type || null,
        targetId: target?.id || null,
        metadata: metadata || undefined,
      },
    });
  } catch (err) {
    // Audit log failure must never block the action it describes.
    console.error('Audit log failed:', err);
  }
}

// Overview — live + 24h stats + recent rounds + activity feed
router.get('/overview', async (req, res) => {
  try {
    const liveStats = await getLiveStats();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      onlineNow,
      chipsInCirculation,
      newUsersDelta,
      recentRounds,
      recentAudits,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      // "Online" approximated as users with a transaction in last hour OR active in a live room.
      Promise.resolve(liveStats.totalPlayers),
      prisma.wallet.aggregate({ _sum: { balanceCents: true } }),
      prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.gameRound.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 20,
        include: {
          room: { select: { name: true, wagerCents: true, id: true } },
        },
      }),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { actor: { select: { username: true } } },
      }),
      prisma.transaction.findMany({
        where: { type: { in: ['DEPOSIT', 'PAYOUT', 'RAKE'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { username: true } } },
      }),
    ]);

    // Build activity feed: registrations + audit events + chip grants. Merge & sort.
    const activity = [];
    for (const a of recentAudits) {
      activity.push({
        kind: 'audit',
        at: a.createdAt,
        actor: a.actor?.username || 'system',
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        metadata: a.metadata,
      });
    }
    for (const t of recentTransactions) {
      if (t.metadata?.kind === 'GRANT') {
        activity.push({
          kind: 'grant',
          at: t.createdAt,
          username: t.user?.username || 'unknown',
          amount: t.amountCents,
          source: t.metadata?.source,
        });
      }
    }
    activity.sort((a, b) => new Date(b.at) - new Date(a.at));

    res.json({
      stats: {
        totalUsers,
        newUsersToday,
        onlineNow,
        activeTables: liveStats.activeRooms,
        chipsInCirculation: chipsInCirculation._sum.balanceCents || 0,
        totalInPlayCents: liveStats.totalInPlayCents,
        newUsers24h: newUsersDelta,
      },
      recentRounds: recentRounds.map((r) => ({
        id: r.id,
        roomId: r.roomId,
        roomName: r.room?.name || 'Table',
        wagerCents: r.room?.wagerCents || 0,
        potCents: r.potCents,
        rakeCents: r.rakeCents,
        winnerUsername: r.finalState?.winnerUsername || null,
        completedAt: r.completedAt,
      })),
      activity: activity.slice(0, 30),
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

// Legacy dashboard (kept for any old caller)
router.get('/dashboard', async (req, res) => {
  try {
    const liveStats = await getLiveStats();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [totalUsers, todayDeposits, todayRake] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', createdAt: { gte: startOfDay } },
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
        deposits: { count: todayDeposits._count, totalCents: todayDeposits._sum.amountCents || 0 },
        withdrawals: { count: 0, totalCents: 0 },
        rakeCents: todayRake._sum.amountCents || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

// Users list with role + status filters
router.get('/users', async (req, res) => {
  try {
    const { search, kycStatus, role, suspended, page = 1, limit = 25 } = req.query;
    const where = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (role && VALID_ROLES.has(role)) where.role = role;
    if (suspended === 'true') where.isSuspended = true;
    if (suspended === 'false') where.isSuspended = false;
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
          isVerified: true, isSuspended: true, isAdmin: true, role: true,
          createdAt: true, wallet: { select: { balanceCents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map((u) => ({
        ...u,
        role: u.role || (u.isAdmin ? 'ADMIN' : 'PLAYER'),
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Single user detail with full transaction + participation history
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        wallet: true,
        responsibleGambling: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [transactions, participations] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.gameParticipant.findMany({
        where: { userId: user.id },
        orderBy: { id: 'desc' },
        take: 50,
        include: { room: { select: { name: true, wagerCents: true, status: true, createdAt: true } } },
      }),
    ]);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || (user.isAdmin ? 'ADMIN' : 'PLAYER'),
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        avatarUrl: user.avatarUrl,
        balanceCents: user.wallet?.balanceCents || 0,
        createdAt: user.createdAt,
      },
      transactions,
      participations,
    });
  } catch (err) {
    console.error('User detail error:', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// Change role
router.post('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (req.params.id === req.userId && role !== 'ADMIN') {
      return res.status(400).json({ error: 'You cannot downgrade your own admin role.' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, isAdmin: role === 'ADMIN' },
      select: { id: true, role: true, username: true },
    });
    await recordAudit(req.userId, 'ROLE_CHANGED', { type: 'user', id: user.id }, { newRole: role });
    res.json(user);
  } catch (err) {
    console.error('Role change error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Suspend / unsuspend
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isSuspended: suspended },
    });
    await recordAudit(req.userId, suspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED', {
      type: 'user', id: user.id,
    });
    res.json({ id: user.id, isSuspended: user.isSuspended });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Grant chips
router.post('/users/:id/grant', async (req, res) => {
  try {
    const { amount, note } = req.body;
    const amountChips = parseInt(amount, 10);
    if (!Number.isFinite(amountChips) || amountChips <= 0 || amountChips > 1_000_000) {
      return res.status(400).json({ error: 'amount must be a positive integer up to 1,000,000' });
    }
    const wallet = await creditGrant(req.params.id, amountChips, `admin_${req.userId}`);
    await recordAudit(req.userId, 'CHIPS_GRANTED', { type: 'user', id: req.params.id }, {
      amount: amountChips, note: note || null,
    });
    res.json({ userId: req.params.id, granted: amountChips, balanceCents: wallet.balanceCents });
  } catch (err) {
    if (err.message === 'WALLET_NOT_FOUND') {
      return res.status(404).json({ error: 'User wallet not found' });
    }
    console.error('Grant error:', err);
    res.status(500).json({ error: 'Grant failed' });
  }
});

// KYC update
router.put('/users/:id/kyc', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING', 'SUBMITTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { kycStatus: status },
    });
    await recordAudit(req.userId, 'KYC_UPDATED', { type: 'user', id: user.id }, { status });
    res.json({ id: user.id, kycStatus: user.kycStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update KYC' });
  }
});

// Live tables (from Redis)
router.get('/tables/live', async (req, res) => {
  try {
    const states = await getAllActiveRoomStates();
    if (states.length === 0) return res.json({ tables: [] });

    // Enrich with leader username + wallet balances per seated player.
    const userIds = new Set();
    for (const s of states) {
      if (s.tableLeaderId) userIds.add(s.tableLeaderId);
      for (const p of s.players) userIds.add(p.userId);
    }
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      include: { wallet: { select: { balanceCents: true } } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Pull room name from Postgres (Redis only has wager/state).
    const roomIds = states.map((s) => s.id);
    const rooms = await prisma.room.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true },
    });
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    const tables = states.map((s) => ({
      id: s.id,
      name: roomMap.get(s.id)?.name || 'Table',
      wagerCents: s.wagerCents,
      maxPlayers: s.maxPlayers,
      status: s.status,
      phase: s.phase,
      potCents: s.potCents,
      currentPlayerId: s.currentPlayerId,
      currentRound: s.currentRound,
      createdAt: s.createdAt,
      leader: s.tableLeaderId
        ? {
            id: s.tableLeaderId,
            username: userMap.get(s.tableLeaderId)?.username || 'unknown',
          }
        : null,
      players: s.players.map((p) => ({
        userId: p.userId,
        username: userMap.get(p.userId)?.username || p.username,
        balanceCents: userMap.get(p.userId)?.wallet?.balanceCents || 0,
        ready: s.readyPlayers?.includes(p.userId) || false,
      })),
    }));
    res.json({ tables });
  } catch (err) {
    console.error('Live tables error:', err);
    res.status(500).json({ error: 'Failed to load live tables' });
  }
});

// Force end a live table: refunds all antes (debited but unresolved) and tears down.
router.post('/tables/:id/end', async (req, res) => {
  try {
    const roomId = req.params.id;
    const state = await getRoomState(roomId);
    if (!state) return res.status(404).json({ error: 'Table not found' });

    const refunds = [];
    if (state.status === 'IN_PROGRESS') {
      // Refund every player still owed an ante. Pot is split by ante, so refund wagerCents each.
      for (const player of state.players) {
        try {
          await refundWager(player.userId, state.wagerCents, roomId);
          refunds.push(player.userId);
        } catch (err) {
          console.error('Refund failed for', player.userId, err);
        }
      }
      if (state.currentRoundId) {
        await prisma.gameRound
          .update({
            where: { id: state.currentRoundId },
            data: { status: 'CANCELLED', completedAt: new Date() },
          })
          .catch(() => {});
      }
    }

    await prisma.room
      .update({ where: { id: roomId }, data: { status: 'CANCELLED' } })
      .catch(() => {});
    await deleteRoomState(roomId);

    // Broadcast end to anyone still in the room.
    req.app.get('io')?.to(`room:${roomId}`).emit('game_over', {
      winnerId: null,
      winnerUsername: null,
      potCents: state.potCents,
      rakeCents: 0,
      payoutCents: 0,
      forcedByAdmin: true,
    });

    await recordAudit(req.userId, 'TABLE_FORCE_ENDED', { type: 'room', id: roomId }, {
      refunds, players: state.players.length,
    });
    res.json({ ok: true, refunded: refunds.length });
  } catch (err) {
    console.error('Force end error:', err);
    res.status(500).json({ error: 'Failed to end table' });
  }
});

// Games audit — completed rounds with finalState
router.get('/games', async (req, res) => {
  try {
    const { search, page = 1, limit = 25 } = req.query;
    const where = { status: 'COMPLETED' };
    if (search) {
      where.OR = [
        { room: { name: { contains: search, mode: 'insensitive' } } },
        {
          room: {
            participants: {
              some: { user: { username: { contains: search, mode: 'insensitive' } } },
            },
          },
        },
      ];
    }

    const [rounds, total] = await Promise.all([
      prisma.gameRound.findMany({
        where,
        include: {
          room: {
            select: {
              id: true, name: true, wagerCents: true, tableLeaderId: true,
              participants: {
                include: { user: { select: { username: true } } },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.gameRound.count({ where }),
    ]);

    res.json({
      rounds: rounds.map((r) => ({
        id: r.id,
        roomId: r.roomId,
        roomName: r.room?.name || 'Table',
        wagerCents: r.room?.wagerCents || 0,
        potCents: r.potCents,
        rakeCents: r.rakeCents,
        roundNumber: r.roundNumber,
        completedAt: r.completedAt,
        winnerUsername: r.finalState?.winnerUsername || null,
        playerCount: r.room?.participants?.length || 0,
        finalState: r.finalState || null,
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Games list error:', err);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

router.get('/games/:id', async (req, res) => {
  try {
    const round = await prisma.gameRound.findUnique({
      where: { id: req.params.id },
      include: {
        room: {
          include: { participants: { include: { user: { select: { username: true, id: true } } } } },
        },
      },
    });
    if (!round) return res.status(404).json({ error: 'Round not found' });
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load round' });
  }
});

// Financials (still used by overview, kept for back-compat)
router.get('/financials', async (req, res) => {
  try {
    const [deposits, withdrawals, rake, totalFloat] = await Promise.all([
      prisma.transaction.aggregate({ where: { type: 'DEPOSIT' }, _sum: { amountCents: true } }),
      prisma.transaction.aggregate({ where: { type: 'WITHDRAWAL' }, _sum: { amountCents: true } }),
      prisma.transaction.aggregate({ where: { type: 'RAKE' }, _sum: { amountCents: true } }),
      prisma.wallet.aggregate({ _sum: { balanceCents: true } }),
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
