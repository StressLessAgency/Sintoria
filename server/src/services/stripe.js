import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(amountCents, userId, email) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { userId, type: 'deposit' },
    receipt_email: email,
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function createPayout(amountCents, stripeAccountId) {
  // In production, this would use Stripe Connect for payouts
  // For now, create a transfer record
  const payout = await stripe.payouts.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { type: 'withdrawal' },
  });

  return payout;
}

export function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export { stripe };
