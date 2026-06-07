import { prisma } from '../app.js';

/**
 * All money operations use Prisma interactive transactions
 * with SELECT FOR UPDATE on the wallet row to prevent race conditions.
 * Balances are integer chips (column kept as `balanceCents` for back-compat;
 * one "cent" here equals one chip — chips have no cash value).
 */

export const HOUSE_USER_ID = 'house';

export async function debitWager(userId, amountCents, roomId) {
  return prisma.$transaction(async (tx) => {
    // Lock the wallet row
    const wallet = await tx.$queryRaw`
      SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;

    if (!wallet[0] || wallet[0].balanceCents < amountCents) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    const newBalance = wallet[0].balanceCents - amountCents;

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'WAGER',
        amountCents: -amountCents,
        balanceCents: newBalance,
        reference: roomId,
      },
    });

    return updatedWallet;
  });
}

export async function creditPayout(userId, amountCents, roundId) {
  return prisma.$transaction(async (tx) => {
    // Idempotency: if a PAYOUT for this round already exists, do nothing.
    if (roundId) {
      const existing = await tx.transaction.findFirst({
        where: { type: 'PAYOUT', reference: roundId, userId },
      });
      if (existing) return { skipped: true, balanceCents: existing.balanceCents };
    }

    const wallet = await tx.$queryRaw`
      SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;

    if (!wallet[0]) throw new Error('WALLET_NOT_FOUND');

    const newBalance = wallet[0].balanceCents + amountCents;

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'PAYOUT',
        amountCents,
        balanceCents: newBalance,
        reference: roundId,
      },
    });

    return updatedWallet;
  });
}

export async function creditGrant(userId, amountChips, source = 'manual') {
  const reference = `grant_${source}_${Date.now()}`;
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.$queryRaw`
      SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;
    if (!wallet[0]) throw new Error('WALLET_NOT_FOUND');

    const newBalance = wallet[0].balanceCents + amountChips;

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        amountCents: amountChips,
        balanceCents: newBalance,
        reference,
        metadata: { kind: 'GRANT', source },
      },
    });

    return updatedWallet;
  });
}

export async function debitWithdrawal(userId, amountCents, stripePayoutId) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.$queryRaw`
      SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;

    if (!wallet[0] || wallet[0].balanceCents < amountCents) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    const newBalance = wallet[0].balanceCents - amountCents;

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amountCents: -amountCents,
        balanceCents: newBalance,
        reference: stripePayoutId,
      },
    });

    return updatedWallet;
  });
}

export async function recordRake(amountCents, roundId) {
  // Rake goes to the seeded 'house' system user so the FK on
  // Transaction.userId holds. House wallet isn't tracked separately.
  await prisma.transaction.create({
    data: {
      userId: HOUSE_USER_ID,
      type: 'RAKE',
      amountCents,
      balanceCents: 0,
      reference: roundId,
    },
  });
}

export async function refundWager(userId, amountCents, roomId) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.$queryRaw`
      SELECT * FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;

    if (!wallet[0]) throw new Error('WALLET_NOT_FOUND');

    const newBalance = wallet[0].balanceCents + amountCents;

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: 'REFUND',
        amountCents,
        balanceCents: newBalance,
        reference: roomId,
      },
    });

    return updatedWallet;
  });
}

export async function getBalance(userId) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  return wallet?.balanceCents || 0;
}

export async function getTransactionHistory(userId, { page = 1, limit = 20, type } = {}) {
  const where = { userId };
  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
}
