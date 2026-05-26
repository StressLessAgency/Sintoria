import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatMoney, timeAgo } from '../../lib/utils';
import { Button, Input } from '../ui/index';

export function BalanceDisplay({ balanceCents, compact = false }) {
  return (
    <div className={cn(
      'flex items-center gap-2',
      compact ? 'text-sm' : 'text-lg'
    )}>
      <svg className={cn('text-gold', compact ? 'w-4 h-4' : 'w-5 h-5')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
      </svg>
      <motion.span
        className="font-mono font-bold text-gold-bright tabular-nums"
        key={balanceCents}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
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
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-2">
        {presets.map(cents => (
          <button
            key={cents}
            onClick={() => setAmount((cents / 100).toFixed(2))}
            className={cn(
              'py-2 text-sm font-mono border transition-all',
              amount === (cents / 100).toFixed(2)
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/15 text-txt-muted hover:border-gold/30 hover:text-txt-primary'
            )}
          >
            {formatMoney(cents)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Custom amount"
          type="number"
          step="0.01"
          min="5.00"
          max="1000.00"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <Button variant="primary" className="w-full" loading={isLoading} disabled={!amount || parseFloat(amount) < 5}>
          Deposit {amount ? formatMoney(Math.round(parseFloat(amount) * 100)) : ''}
        </Button>
      </form>

      <p className="text-xs text-txt-faint text-center">
        Minimum $5.00 &middot; Maximum $1,000.00
      </p>
    </div>
  );
}

export function WithdrawForm({ balanceCents, onWithdraw, isLoading, kycStatus }) {
  const [amount, setAmount] = useState('');

  if (kycStatus !== 'APPROVED') {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
          </svg>
        </div>
        <p className="text-txt-muted font-body">KYC verification required before withdrawals.</p>
        <p className="text-xs text-txt-faint">Contact support to start the process.</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amount) * 100);
    if (cents >= 1000 && cents <= balanceCents) onWithdraw(cents);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-txt-muted mb-2">
        Available: <span className="text-gold font-mono">{formatMoney(balanceCents)}</span>
      </div>
      <Input
        label="Withdrawal amount"
        type="number"
        step="0.01"
        min="10.00"
        max={(balanceCents / 100).toFixed(2)}
        placeholder="0.00"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Button variant="ghost" className="w-full" loading={isLoading} disabled={!amount || parseFloat(amount) < 10}>
        Withdraw {amount ? formatMoney(Math.round(parseFloat(amount) * 100)) : ''}
      </Button>
      <p className="text-xs text-txt-faint text-center">
        Minimum $10.00 &middot; Processing takes 3-5 business days
      </p>
    </form>
  );
}

export function TxHistory({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-12" />
        ))}
      </div>
    );
  }

  if (!transactions?.transactions?.length) {
    return (
      <div className="text-center py-8 text-txt-muted text-sm">
        No transactions yet
      </div>
    );
  }

  const typeIcons = {
    DEPOSIT: { icon: '↓', color: 'text-win' },
    WITHDRAWAL: { icon: '↑', color: 'text-loss' },
    WAGER: { icon: '⬢', color: 'text-loss' },
    PAYOUT: { icon: '★', color: 'text-gold-bright' },
    REFUND: { icon: '↩', color: 'text-txt-muted' },
  };

  return (
    <div className="space-y-1">
      {transactions.transactions.map(tx => {
        const config = typeIcons[tx.type] || { icon: '·', color: 'text-txt-muted' };
        return (
          <div key={tx.id} className="flex items-center justify-between py-3 px-3 hover:bg-surface/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={cn('text-lg', config.color)}>{config.icon}</span>
              <div>
                <span className="text-sm font-mono">{tx.type}</span>
                <p className="text-xs text-txt-faint">{timeAgo(tx.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn(
                'font-mono font-bold text-sm',
                tx.amountCents > 0 ? 'text-win' : 'text-loss'
              )}>
                {tx.amountCents > 0 ? '+' : ''}{formatMoney(tx.amountCents)}
              </span>
              <p className="text-xs text-txt-faint font-mono">
                bal: {formatMoney(tx.balanceCents)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
