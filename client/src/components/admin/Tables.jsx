import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { cn, formatChips, timeAgo } from '../../lib/utils';
import { Button, Eyebrow, toast } from '../ui/index';
import { FadeIn, Avatar, StatusPill, EmptyState, RowSkeleton } from './parts.jsx';

export default function Tables() {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState(null);

  const q = useQuery({
    queryKey: ['admin', 'tables', 'live'],
    queryFn: async () => (await api.get('/admin/tables/live')).data,
    refetchInterval: 5000,
  });

  const forceEnd = useMutation({
    mutationFn: async (id) => (await api.post(`/admin/tables/${id}/end`)).data,
    onSuccess: () => {
      toast('Table closed and antes refunded', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'tables', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setConfirmId(null);
    },
    onError: (e) => toast(e.response?.data?.error || 'Failed to end table', 'error'),
  });

  return (
    <FadeIn>
      {q.isLoading ? (
        <RowSkeleton count={3} />
      ) : !q.data?.tables?.length ? (
        <EmptyState
          eyebrow="Empty Floor"
          title="No active tables right now."
          body="Live tables will appear here the moment a leader opens one. Refreshes every 5 seconds."
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {q.data.tables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              confirming={confirmId === t.id}
              onAskEnd={() => setConfirmId(t.id)}
              onCancelEnd={() => setConfirmId(null)}
              onConfirmEnd={() => forceEnd.mutate(t.id)}
              ending={forceEnd.isPending && forceEnd.variables === t.id}
            />
          ))}
        </div>
      )}
    </FadeIn>
  );
}

function TableCard({ table, confirming, onAskEnd, onCancelEnd, onConfirmEnd, ending }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      className="surface p-6 flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Table</Eyebrow>
          <h3
            className="font-display text-bone mt-2 truncate"
            style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.01em' }}
          >
            {table.name}
          </h3>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint mt-2">
            Round {String(table.currentRound || 0).padStart(2, '0')} · {timeAgo(table.createdAt)}
          </div>
        </div>
        <StatusPill status={table.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Eyebrow>Pot</Eyebrow>
          <div
            className="font-display text-gold-bright tabular-nums mt-1"
            style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {formatChips(table.potCents)}
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-1">
            Ante {formatChips(table.wagerCents)}
          </div>
        </div>
        <div>
          <Eyebrow>Seats</Eyebrow>
          <div
            className="font-display text-bone tabular-nums mt-1"
            style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {table.players.length}/{table.maxPlayers}
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-1">
            {table.players.filter((p) => p.ready).length} ready
          </div>
        </div>
      </div>

      <div className="h-px bg-hairline" />

      {table.leader && (
        <div className="flex items-center gap-3">
          <Avatar username={table.leader.username} size={28} tone="gold" />
          <div className="min-w-0 flex-1">
            <div className="font-ui text-[12px] text-bone truncate">{table.leader.username}</div>
            <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-gold-bright/80">
              Leader
            </div>
          </div>
        </div>
      )}

      <div>
        <Eyebrow className="mb-2">Seated</Eyebrow>
        {table.players.length === 0 ? (
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-faint">
            Nobody seated
          </div>
        ) : (
          <ul className="divide-y divide-hairline">
            {table.players.map((p) => (
              <li
                key={p.userId}
                className={cn(
                  'py-2 grid grid-cols-[auto_1fr_auto] items-center gap-3',
                  table.currentPlayerId === p.userId && 'opacity-100',
                )}
              >
                <Avatar username={p.username} size={26} />
                <div className="min-w-0">
                  <div className="font-ui text-[12px] text-bone truncate flex items-center gap-2">
                    {p.username}
                    {table.currentPlayerId === p.userId && (
                      <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-gold-bright">Turn</span>
                    )}
                    {p.ready && (
                      <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-green">Ready</span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[12px] tabular-nums text-gold-bright">
                  {formatChips(p.balanceCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-1">
        {confirming ? (
          <div className="surface bg-red-hot/5 border border-red-hot/40 p-3 flex items-center justify-between gap-3">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim">
              Refund all antes?
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onCancelEnd}>Cancel</Button>
              <Button size="sm" onClick={onConfirmEnd} loading={ending}>Confirm</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={onAskEnd}>
            Force End Table
          </Button>
        )}
      </div>
    </motion.div>
  );
}
