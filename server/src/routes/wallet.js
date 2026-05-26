import { Router } from 'express';
import { prisma } from '../app.js';
import { authMiddleware } from '../middleware/auth.js';
import { depositLimiter } from '../middleware/rateLimit.js';
import { checkDepositLimit } from '../middleware/compliance.js';
import { getBalance, getTransactionHistory, creditDeposit, debitWithdrawal } from '../services/ledger.js';
import { createPaymentIntent } from '../services/stripe.js';
import { sendWithdrawalConfirmation } from '../services/email.js';

const router = Router();

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const balanceCents = await getBalance(req.userId);
    res.json({ balanceCents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Create deposit (Stripe PaymentIntent)
router.post('/deposit', authMiddleware, depositLimiter, async (req, res) => {
  try {
    const { amountCents } = req.body;

    if (!amountCents || amountCents < 500) {
      return res.status(400).json({ error: 'Minimum deposit is $5.00' });
    }
    if (amountCents > 100000) {
      return res.status(400).json({ error: 'Maximum deposit is $1,000.00' });
    }

    // Check deposit limit
    const limitCheck = await checkDepositLimit(req.userId, amountCents);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'DEPOSIT_LIMIT_EXCEEDED',
        message: limitCheck.message,
        limit: limitCheck.limit,
        used: limitCheck.used,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      amountCents,
      req.userId,
      user.email
    );

    res.json({ clientSecret, paymentIntentId });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// Request withdrawal
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amountCents } = req.body;

    if (!amountCents || amountCents < 1000) {
      return res.status(400).json({ error: 'Minimum withdrawal is $10.00' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { wallet: true },
    });

    if (user.kycStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'KYC_REQUIRED',
        message: 'KYC verification required before withdrawals',
      });
    }

    if (!user.wallet || user.wallet.balanceCents < amountCents) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Debit wallet and create pending withdrawal
    const wallet = await debitWithdrawal(req.userId, amountCents, `withdrawal_${Date.now()}`);

    await sendWithdrawalConfirmation(user.email, user.username, amountCents);

    res.json({
      message: 'Withdrawal initiated. Processing takes 3–5 business days.',
      newBalanceCents: wallet.balanceCents,
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// Transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const result = await getTransactionHistory(req.userId, {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      type: type || undefined,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

export default router;
