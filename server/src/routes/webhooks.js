import { Router } from 'express';
import express from 'express';
import { constructWebhookEvent } from '../services/stripe.js';
import { creditDeposit } from '../services/ledger.js';
import { io } from '../app.js';

const router = Router();

// Stripe needs raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).send('Missing signature');

    let event;
    try {
      event = constructWebhookEvent(req.body, sig);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send('Invalid signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { userId } = paymentIntent.metadata;
        const amountCents = paymentIntent.amount;

        if (!userId) {
          console.error('Payment intent missing userId metadata');
          break;
        }

        // Credit wallet (idempotent — checks for existing tx)
        const wallet = await creditDeposit(userId, amountCents, paymentIntent.id);

        if (wallet) {
          // Notify connected client of balance update
          io.to(`user:${userId}`).emit('wallet_updated', {
            newBalanceCents: wallet.balanceCents,
          });
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { userId } = paymentIntent.metadata;
        console.log(`Payment failed for user ${userId}:`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook handler failed');
  }
});

export default router;
