import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { cn, formatMoney, timeAgo } from '../../lib/utils';
import { Button, Input, Skeleton } from '../ui/index';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const ELEMENTS_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#D4972E',
    colorBackground: '#0F0E14',
    colorText: '#DCD5C8',
    colorDanger: '#E23B3B',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '4px',
  },
};

export function BalanceDisplay({ balanceCents, compact = false }) {
  return (
    <div className={cn('flex items-baseline gap-2', compact ? 'text-sm' : 'text-base')}>
      <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-bone-dim">
        Balance
      </span>
      <motion.span
        key={balanceCents}
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="font-mono font-medium text-gold-bright tabular-nums"
        style={{ fontSize: compact ? 14 : 16 }}
      >
        {formatMoney(balanceCents)}
      </motion.span>
    </div>
  );
}

export function DepositForm({ createPaymentIntent, onSuccess }) {
  const [step, setStep] = useState('amount');
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [amountCents, setAmountCents] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const presets = [500, 1000, 2500, 5000, 10000];

  const startPayment = async (e) => {
    e.preventDefault();
    setError(null);
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 500 || cents > 100000) {
      setError('Amount must be between $5.00 and $1,000.00');
      return;
    }
    if (!stripePromise) {
      setError('Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.');
      return;
    }
    setIsStarting(true);
    try {
      const { clientSecret: cs } = await createPaymentIntent(cents);
      if (!cs) throw new Error('No clientSecret returned');
      setClientSecret(cs);
      setAmountCents(cents);
      setStep('pay');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not start payment');
    } finally {
      setIsStarting(false);
    }
  };

  const reset = () => {
    setStep('amount');
    setClientSecret(null);
    setAmountCents(0);
    setAmount('');
    setError(null);
  };

  if (step === 'pay' && clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: ELEMENTS_APPEARANCE }}
      >
        <PaymentStep
          amountCents={amountCents}
          onBack={reset}
          onSuccess={() => {
            setStep('success');
            onSuccess?.(amountCents);
          }}
        />
      </Elements>
    );
  }

  if (step === 'success') {
    return (
      <div className="text-center py-10 space-y-5">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-gold-bright">
          Payment received
        </div>
        <div
          className="font-display gold-text"
          style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          {formatMoney(amountCents)}
        </div>
        <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-bone-faint">
          Funds appear once Stripe confirms (usually a few seconds).
        </p>
        <button type="button" className="btn-ghost" onClick={reset}>
          Make another deposit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <label className="field-label">Quick add</label>
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {presets.map((cents) => {
            const active = amount === (cents / 100).toFixed(2);
            return (
              <button
                key={cents}
                type="button"
                onClick={() => setAmount((cents / 100).toFixed(2))}
                className={cn(
                  'py-2.5 text-[12px] font-mono tabular-nums border transition-all',
                  active
                    ? 'border-gold bg-gold/10 text-gold-bright'
                    : 'border-hairline text-bone-dim hover:text-bone hover:border-hairline-hi'
                )}
              >
                {formatMoney(cents)}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={startPayment} className="space-y-5">
        <Input
          label="Custom Amount"
          type="number"
          step="0.01"
          min="5.00"
          max="1000.00"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error && (
          <p className="font-mono text-[11px] text-red-hot">{error}</p>
        )}
        <Button
          className="w-full"
          size="lg"
          loading={isStarting}
          disabled={!amount || parseFloat(amount) < 5}
        >
          Continue {amount ? `· ${formatMoney(Math.round(parseFloat(amount) * 100))}` : ''}
        </Button>
      </form>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint text-center">
        Minimum $5.00 · Maximum $1,000.00 · Apple Pay on iOS &amp; Safari
      </p>
    </div>
  );
}

function PaymentStep({ amountCents, onBack, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/wallet?deposit=processing`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess();
      return;
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-hairline pb-4">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim">
          Depositing
        </span>
        <span className="font-mono text-[22px] text-gold-bright tabular-nums">
          {formatMoney(amountCents)}
        </span>
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />

      {error && <p className="font-mono text-[11px] text-red-hot">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="btn-ghost"
        >
          Back
        </button>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          loading={submitting}
          disabled={!stripe || !elements || submitting}
        >
          Pay {formatMoney(amountCents)}
        </Button>
      </div>
    </form>
  );
}

export function WithdrawForm({ balanceCents, onWithdraw, isLoading, kycStatus }) {
  const [amount, setAmount] = useState('');

  if (kycStatus !== 'APPROVED') {
    return (
      <div className="text-center space-y-4 py-10">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-gold-bright">
          Verification Required
        </div>
        <h3 className="font-display text-2xl text-bone" style={{ letterSpacing: '-0.01em' }}>
          KYC needed first.
        </h3>
        <p className="font-ui text-[13px] text-bone-dim max-w-xs mx-auto">
          We verify identity before any withdrawal. Contact support to start.
        </p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amount) * 100);
    if (cents >= 1000 && cents <= balanceCents) onWithdraw(cents);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.16em] uppercase">
        <span className="text-bone-dim">Available</span>
        <span className="text-gold-bright tabular-nums">{formatMoney(balanceCents)}</span>
      </div>
      <Input
        label="Withdraw Amount"
        type="number"
        step="0.01"
        min="10.00"
        max={(balanceCents / 100).toFixed(2)}
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        type="submit"
        disabled={isLoading || !amount || parseFloat(amount) < 10}
        className="btn-ghost w-full"
      >
        Withdraw {amount ? formatMoney(Math.round(parseFloat(amount) * 100)) : ''}
      </button>
      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint text-center">
        Minimum $10.00 · 3–5 business days
      </p>
    </form>
  );
}

export function TxHistory({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!transactions?.transactions?.length) {
    return (
      <div className="text-center py-12 font-mono text-[11px] tracking-[0.16em] uppercase text-bone-faint">
        No transactions yet
      </div>
    );
  }

  const toneFor = (type, amount) => {
    if (type === 'DEPOSIT' || type === 'PAYOUT') return 'text-green';
    if (type === 'WITHDRAWAL' || type === 'WAGER') return 'text-red-hot';
    if (amount > 0) return 'text-green';
    return 'text-bone-dim';
  };

  const labels = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    WAGER: 'Ante',
    PAYOUT: 'Payout',
    REFUND: 'Refund',
    RAKE: 'Rake',
  };

  return (
    <div className="divide-y divide-hairline">
      {transactions.transactions.map((tx) => {
        const positive = tx.amountCents > 0;
        return (
          <div key={tx.id} className="flex items-center justify-between py-4">
            <div>
              <div className="font-ui text-[13px] text-bone font-medium">
                {labels[tx.type] || tx.type}
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint mt-0.5">
                {timeAgo(tx.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className={cn('font-mono text-[14px] font-medium tabular-nums', toneFor(tx.type, tx.amountCents))}>
                {positive ? '+' : ''}
                {formatMoney(tx.amountCents)}
              </div>
              <div className="font-mono text-[10px] text-bone-faint tabular-nums mt-0.5">
                bal {formatMoney(tx.balanceCents)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
