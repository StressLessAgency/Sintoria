import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatMoney, timeAgo } from '../../lib/utils';
import { Button, Input, Skeleton } from '../ui/index';

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

export function DepositForm({ onDeposit, isLoading }) {
  const [amount, setAmount] = useState('');
  const presets = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = (e) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amount) * 100);
    if (cents >= 500) onDeposit(cents);
  };

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

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <Button
          className="w-full"
          size="lg"
          loading={isLoading}
          disabled={!amount || parseFloat(amount) < 5}
        >
          Deposit {amount ? formatMoney(Math.round(parseFloat(amount) * 100)) : ''}
        </Button>
      </form>

      <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint text-center">
        Minimum $5.00 · Maximum $1,000.00
      </p>
    </div>
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
