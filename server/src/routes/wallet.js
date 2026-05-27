import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getBalance, getTransactionHistory } from '../services/ledger.js';

const router = Router();

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const balanceCents = await getBalance(req.userId);
    res.json({ balanceCents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

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
