import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatChips, timeAgo } from '../../lib/utils';
import { Skeleton } from '../ui/index';

export function BalanceDisplay({ balanceCents, compact = false }) {
  return (
    <div className={cn('flex items-baseline gap-2', compact ? 'text-sm' : 'text-base')}>
      <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-bone-dim">
        Chips
      </span>
      <motion.span
        key={balanceCents}
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="font-mono font-medium text-gold-bright tabular-nums"
        style={{ fontSize: compact ? 14 : 16 }}
      >
        {formatChips(balanceCents)}
      </motion.span>
    </div>
  );
}

export function ChipsPanel({ balanceCents, username }) {
  return (
    <div className="surface px-6 py-8 text-center space-y-5">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-dim">
        Your Stack
      </div>
      <motion.div
        key={balanceCents}
        initial={{ scale: 0.94, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="font-display gold-text"
        style={{
          fontSize: 'clamp(56px, 9vw, 96px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontWeight: 400,
        }}
      >
        {formatChips(balanceCents)}
      </motion.div>
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint">
        Chips · played in lieu of cash
      </div>
      <div className="pt-4 border-t border-hairline">
        <div className="font-ui text-[13px] text-bone-dim leading-relaxed">
          Need more? Ask the host.
          {username && (
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-2">
              You · {username}
            </div>
          )}
        </div>
      </div>
    </div>
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
        No hands played yet
      </div>
    );
  }

  const toneFor = (type, amount) => {
    if (type === 'PAYOUT') return 'text-gold-bright';
    if (type === 'WAGER') return 'text-red-hot';
    if (type === 'DEPOSIT' && amount > 0) return 'text-green';
    if (amount > 0) return 'text-green';
    return 'text-bone-dim';
  };

  const labelFor = (tx) => {
    if (tx.type === 'DEPOSIT') {
      const kind = tx.metadata?.kind === 'GRANT' ? tx.metadata?.source : null;
      if (kind === 'welcome') return 'Welcome Stack';
      if (kind) return 'Host Grant';
      return 'Credit';
    }
    return {
      WAGER: 'Ante',
      PAYOUT: 'Pot Won',
      REFUND: 'Refund',
      RAKE: 'House Rake',
      WITHDRAWAL: 'Cash Out',
    }[tx.type] || tx.type;
  };

  return (
    <div className="divide-y divide-hairline">
      {transactions.transactions.map((tx) => {
        const positive = tx.amountCents > 0;
        return (
          <div key={tx.id} className="flex items-center justify-between py-4">
            <div>
              <div className="font-ui text-[13px] text-bone font-medium">
                {labelFor(tx)}
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint mt-0.5">
                {timeAgo(tx.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className={cn('font-mono text-[14px] font-medium tabular-nums', toneFor(tx.type, tx.amountCents))}>
                {positive ? '+' : ''}
                {formatChips(tx.amountCents)}
              </div>
              <div className="font-mono text-[10px] text-bone-faint tabular-nums mt-0.5">
                bal {formatChips(tx.balanceCents)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
