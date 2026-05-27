import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatChips, timeAgo, cn } from '../../lib/utils';
import { Eyebrow } from '../ui/index';
import { FadeIn, StatCard, EmptyState, ChipNumber } from './parts.jsx';

export default function Overview() {
  const q = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => (await api.get('/admin/overview')).data,
    refetchInterval: 15000,
  });

  const data = q.data;
  const stats = data?.stats;

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Users Total"
            value={formatChips(stats?.totalUsers)}
            sub={stats ? `+${stats.newUsersToday} today` : ''}
            loading={!stats}
          />
          <StatCard
            label="Online Now"
            value={formatChips(stats?.onlineNow)}
            sub={stats?.onlineNow > 0 ? 'live in tables' : 'no one seated'}
            loading={!stats}
            tone="green"
          />
          <StatCard
            label="Active Tables"
            value={formatChips(stats?.activeTables)}
            sub={stats ? `${formatChips(stats.totalInPlayCents)} in play` : ''}
            loading={!stats}
            tone="gold"
          />
          <StatCard
            label="Chips Circulating"
            value={formatChips(stats?.chipsInCirculation)}
            sub={stats ? `${stats.newUsers24h} new users 24h` : ''}
            loading={!stats}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid lg:grid-cols-2 gap-6">
          <Panel title="Recent Hands">
            {!data ? (
              <ListLoading />
            ) : data.recentRounds.length === 0 ? (
              <EmptyState eyebrow="Quiet Floor" title="No hands yet." body="Recent hand outcomes will appear here as soon as a table finishes a round." />
            ) : (
              <ul className="divide-y divide-hairline">
                {data.recentRounds.map((r) => (
                  <li key={r.id} className="py-3.5 grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="min-w-0">
                      <div className="font-ui text-[13px] text-bone truncate">{r.roomName}</div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-1">
                        {r.winnerUsername || 'No winner'} · {formatChips(r.wagerCents)} ante
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[14px] tabular-nums text-gold-bright">
                        {formatChips(r.potCents)}
                      </div>
                      <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-bone-faint mt-0.5">
                        {timeAgo(r.completedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Activity Feed">
            {!data ? (
              <ListLoading />
            ) : data.activity.length === 0 ? (
              <EmptyState eyebrow="Nothing Moving" title="No house activity yet." body="Admin actions and chip grants will show up here as they happen." />
            ) : (
              <ul className="divide-y divide-hairline">
                {data.activity.map((a, i) => (
                  <ActivityRow key={i} item={a} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </FadeIn>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between mb-5">
        <Eyebrow>{title}</Eyebrow>
        <div className="h-px flex-1 bg-hairline ml-4" />
      </div>
      {children}
    </div>
  );
}

function ListLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 border-b border-hairline animate-pulse opacity-50" />
      ))}
    </div>
  );
}

function ActivityRow({ item }) {
  const map = {
    audit: {
      label:
        item.action === 'ROLE_CHANGED'
          ? `Role → ${item.metadata?.newRole || '?'}`
          : item.action === 'USER_SUSPENDED'
            ? 'User suspended'
            : item.action === 'USER_UNSUSPENDED'
              ? 'User unsuspended'
              : item.action === 'CHIPS_GRANTED'
                ? `Granted ${formatChips(item.metadata?.amount)} chips`
                : item.action === 'KYC_UPDATED'
                  ? `KYC ${item.metadata?.status}`
                  : item.action === 'TABLE_FORCE_ENDED'
                    ? 'Force-ended table'
                    : item.action,
      tone: 'text-bone',
    },
    grant: {
      label: `Granted ${formatChips(item.amount)} chips · ${item.source || 'manual'}`,
      tone: 'text-gold-bright',
    },
  };
  const m = map[item.kind] || { label: item.action || 'Event', tone: 'text-bone-dim' };
  const actor = item.actor || item.username;
  return (
    <li className="py-3 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
      <div className="w-1.5 h-1.5 rounded-full bg-gold-bright/60" />
      <div className="min-w-0">
        <div className={cn('font-ui text-[13px] truncate', m.tone)}>{m.label}</div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint mt-0.5">
          by {actor || 'system'}
        </div>
      </div>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
        {timeAgo(item.at)}
      </div>
    </li>
  );
}
