import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { cn, formatChips, timeAgo } from '../../lib/utils';
import { Input, Button, Eyebrow } from '../ui/index';
import { FadeIn, EmptyState, RowSkeleton } from './parts.jsx';
import { Die } from '../dice/index';

export default function Games() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const q = useQuery({
    queryKey: ['admin', 'games', { search, page }],
    queryFn: async () =>
      (
        await api.get('/admin/games', {
          params: { search: search || undefined, page, limit: 25 },
        })
      ).data,
    keepPreviousData: true,
  });

  return (
    <FadeIn>
      <div className="space-y-5">
        <div className="surface p-4">
          <Input
            placeholder="Search by username or table name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {q.isLoading ? (
          <RowSkeleton count={8} />
        ) : !q.data?.rounds?.length ? (
          <EmptyState
            eyebrow="Empty Log"
            title="No completed hands yet."
            body="As soon as a table finishes a hand it will be recorded here with full dice detail."
          />
        ) : (
          <div className="surface divide-y divide-hairline">
            {q.data.rounds.map((r) => (
              <GameRow
                key={r.id}
                round={r}
                expanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              />
            ))}
          </div>
        )}

        {q.data && q.data.totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint">
              {q.data.total} hands · page {q.data.page} of {q.data.totalPages}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
                ← Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPage(Math.min(q.data.totalPages, page + 1))}
                disabled={page >= q.data.totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function GameRow({ round, expanded, onToggle }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full text-left grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-ash/40 transition-colors"
      >
        <div className="min-w-0">
          <div className="font-ui text-[13px] text-bone truncate">{round.roomName}</div>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-1">
            {round.winnerUsername ? `Won by ${round.winnerUsername}` : 'No winner'} · {round.playerCount} players
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[13px] tabular-nums text-gold-bright">
            {formatChips(round.potCents)}
          </div>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-bone-faint">
            Rake {formatChips(round.rakeCents)}
          </div>
        </div>
        <div className="hidden md:block font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
          {timeAgo(round.completedAt)}
        </div>
        <span
          className={cn(
            'font-mono text-[10px] tracking-[0.22em] uppercase transition-colors',
            expanded ? 'text-gold-bright' : 'text-bone-dim'
          )}
        >
          {expanded ? 'Close' : 'Open'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <GameDetail round={round} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameDetail({ round }) {
  const final = round.finalState;
  if (!final?.players?.length) {
    return (
      <div className="px-4 py-5 border-t border-hairline">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
          Detailed dice state not captured for this hand
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 pb-5 pt-3 border-t border-hairline space-y-3 bg-bg/40">
      {final.players.map((p) => (
        <div key={p.userId} className="surface p-3 grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('font-ui text-[13px] truncate', p.wasWinner ? 'text-gold-bright' : 'text-bone')}>
                {p.username || 'Unknown'}
              </span>
              {p.wasWinner && (
                <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-gold-bright">Winner</span>
              )}
              {p.shotTheMoon && (
                <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-gold-bright">Moon</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(p.setAside || []).map((d, i) => (
                <Die key={i} value={d} size={28} />
              ))}
              {!(p.setAside || []).length && (
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
                  No dice set aside
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-2">
              {p.rollsUsed}/5 rolls used
            </div>
          </div>
          <div className="text-right">
            <Eyebrow>Score</Eyebrow>
            <div
              className={cn(
                'font-display tabular-nums mt-1',
                p.wasWinner ? 'text-gold-bright' : 'text-bone'
              )}
              style={{ fontSize: 28, lineHeight: 1 }}
            >
              {p.score ?? '—'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
