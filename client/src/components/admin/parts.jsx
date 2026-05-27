import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatChips, timeAgo } from '../../lib/utils';
import { Eyebrow, Skeleton } from '../ui/index';

// Reduced-motion-aware fade-up. Pass `index` for stagger.
export function FadeIn({ children, className, delay = 0 }) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ label, value, sub, tone = 'bone', loading }) {
  const toneClass =
    tone === 'gold'
      ? 'text-gold-bright'
      : tone === 'green'
        ? 'text-green'
        : tone === 'red'
          ? 'text-red-hot'
          : 'text-bone';
  return (
    <div className="surface p-6 flex flex-col gap-3">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-end justify-between gap-3">
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <div
            className={cn('font-display tabular-nums', toneClass)}
            style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {value}
          </div>
        )}
      </div>
      <div className="h-px bg-hairline" />
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint min-h-[14px]">
        {sub || ''}
      </div>
    </div>
  );
}

export function RoleBadge({ role, className }) {
  const map = {
    PLAYER: { label: 'Player', tone: 'bone' },
    TABLE_LEADER: { label: 'Leader', tone: 'gold' },
    ADMIN: { label: 'Admin', tone: 'gold' },
  };
  const r = map[role] || map.PLAYER;
  const colors =
    r.tone === 'gold'
      ? 'text-gold-bright border-hairline-hi'
      : 'text-bone-dim border-hairline';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 border font-mono uppercase tracking-[0.18em] text-[10px]',
        colors,
        className
      )}
    >
      {r.label}
    </span>
  );
}

export function Avatar({ username, size = 36, tone = 'ash' }) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-mono tabular-nums',
        tone === 'gold' ? 'bg-gold/15 text-gold-bright' : 'bg-ash text-bone-dim'
      )}
      style={{ width: size, height: size, fontSize: Math.round(size / 3) }}
    >
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export function StatusPill({ status, className }) {
  const map = {
    WAITING: { label: 'Waiting', dot: 'bg-gold/60' },
    IN_PROGRESS: { label: 'Live', dot: 'bg-green' },
    COMPLETED: { label: 'Complete', dot: 'bg-bone-faint' },
    CANCELLED: { label: 'Cancelled', dot: 'bg-red-hot/70' },
  };
  const s = map[status] || { label: status, dot: 'bg-bone-faint' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 border border-hairline font-mono text-[10px] uppercase tracking-[0.18em] text-bone-dim',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot, status === 'IN_PROGRESS' && 'animate-pulse')} />
      {s.label}
    </span>
  );
}

export function EmptyState({ eyebrow, title, body, action }) {
  return (
    <div className="surface text-center py-16 px-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3
        className="font-display text-bone mt-3 mb-3"
        style={{ fontSize: 28, lineHeight: 1, letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      {body && (
        <p className="font-ui text-[13px] text-bone-dim mb-5 max-w-sm mx-auto">{body}</p>
      )}
      {action}
    </div>
  );
}

// Inline single-line skeleton row for tables.
export function RowSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface px-4 py-3 flex items-center gap-4">
          <Skeleton className="w-9 h-9 !rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function formatRelative(date) {
  if (!date) return '—';
  return timeAgo(date);
}

export function ChipNumber({ value, className }) {
  return (
    <span className={cn('font-mono tabular-nums', className)}>{formatChips(value)}</span>
  );
}
