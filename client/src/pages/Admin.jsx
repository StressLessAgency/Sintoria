import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { formatMoney, cn, timeAgo } from '../lib/utils';
import { Input, Badge, Eyebrow, Skeleton, toast } from '../components/ui/index';

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSearch, setUserSearch] = useState('');

  const dashQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data,
    refetchInterval: 10000,
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', userSearch],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { search: userSearch || undefined } })).data,
    enabled: activeTab === 'users',
  });

  const gamesQuery = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: async () => (await api.get('/admin/games')).data,
    enabled: activeTab === 'games',
  });

  const financialsQuery = useQuery({
    queryKey: ['admin', 'financials'],
    queryFn: async () => (await api.get('/admin/financials')).data,
    enabled: activeTab === 'financials',
  });

  const suspendUser = useMutation({
    mutationFn: async ({ id, suspended }) =>
      (await api.put(`/admin/users/${id}/suspend`, { suspended })).data,
    onSuccess: () => {
      toast('User updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const updateKyc = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.put(`/admin/users/${id}/kyc`, { status })).data,
    onSuccess: () => {
      toast('KYC updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const dash = dashQuery.data;
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'games', label: 'Games' },
    { id: 'financials', label: 'Financials' },
  ];

  return (
    <div className="relative min-h-screen text-bone overflow-hidden">
      <div className="overhead-cone" />

      <header className="relative z-10 border-b border-hairline px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/lobby"
              className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim hover:text-gold-bright transition-colors"
            >
              ← Lobby
            </Link>
            <div className="w-px h-3.5 bg-hairline" />
            <span className="font-display text-[18px] text-bone">Admin</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-1 border-b border-hairline mb-10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-all border-b -mb-px',
                activeTab === t.id
                  ? 'border-gold-bright text-gold-bright'
                  : 'border-transparent text-bone-dim hover:text-bone'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && dash && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tables', value: dash.live.activeRooms },
                { label: 'Players', value: dash.live.totalPlayers },
                { label: 'In Play', value: formatMoney(dash.live.totalInPlayCents), tone: 'text-gold-bright' },
                { label: 'Users', value: dash.totalUsers },
              ].map((s) => (
                <div key={s.label} className="surface p-5">
                  <Eyebrow>{s.label}</Eyebrow>
                  <div className={cn('font-mono text-2xl font-medium tabular-nums mt-2', s.tone || 'text-bone')}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Eyebrow>Today</Eyebrow>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <SmallStat label="Deposits" value={formatMoney(dash.today.deposits.totalCents)} sub={`${dash.today.deposits.count} txns`} tone="text-green" />
                <SmallStat label="Withdrawals" value={formatMoney(dash.today.withdrawals.totalCents)} sub={`${dash.today.withdrawals.count} txns`} tone="text-red-hot" />
                <SmallStat label="Rake" value={formatMoney(dash.today.rakeCents)} tone="text-gold-bright" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <Input
                placeholder="Search by email or username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            {usersQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {usersQuery.data?.users?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-ash flex items-center justify-center font-mono text-[11px] text-bone-dim">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-ui text-[13px] text-bone">{u.username}</div>
                        <div className="font-mono text-[10px] text-bone-faint">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          u.kycStatus === 'APPROVED'
                            ? 'success'
                            : u.kycStatus === 'REJECTED'
                              ? 'danger'
                              : 'default'
                        }
                      >
                        KYC {u.kycStatus}
                      </Badge>
                      <span className="font-mono text-[13px] text-gold-bright tabular-nums">
                        {formatMoney(u.wallet?.balanceCents || 0)}
                      </span>
                      <div className="flex gap-3 font-mono text-[10px] tracking-[0.16em] uppercase">
                        {u.kycStatus === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => updateKyc.mutate({ id: u.id, status: 'APPROVED' })}
                              className="text-green hover:underline"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateKyc.mutate({ id: u.id, status: 'REJECTED' })}
                              className="text-red-hot hover:underline"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => suspendUser.mutate({ id: u.id, suspended: !u.isSuspended })}
                          className={cn(u.isSuspended ? 'text-green' : 'text-red-hot', 'hover:underline')}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {gamesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {gamesQuery.data?.rooms?.map((room) => (
                  <div key={room.id} className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-ui text-[14px] text-bone">{room.name || 'Unnamed'}</span>
                      <span className="font-mono text-[10px] text-bone-faint">{timeAgo(room.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-5 font-mono text-[11px] text-bone-dim">
                      <span className="tabular-nums">{formatMoney(room.wagerCents)} ante</span>
                      <span>{room.rounds.length} rounds</span>
                      <span>{room.participants.length} players</span>
                      <span>
                        Rake {formatMoney(room.rounds.reduce((s, r) => s + r.rakeCents, 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'financials' && financialsQuery.data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Total Deposits', value: financialsQuery.data.totalDepositsCents, tone: 'text-green' },
                { label: 'Total Withdrawals', value: financialsQuery.data.totalWithdrawalsCents, tone: 'text-red-hot' },
                { label: 'Rake Revenue', value: financialsQuery.data.totalRakeCents, tone: 'text-gold-bright' },
                { label: 'User Float', value: financialsQuery.data.totalFloatCents, tone: 'text-bone' },
              ].map((s) => (
                <div key={s.label} className="surface text-center py-10 px-6">
                  <Eyebrow>{s.label}</Eyebrow>
                  <div className={cn('font-mono text-3xl font-medium tabular-nums mt-3', s.tone)}>
                    {formatMoney(s.value)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SmallStat({ label, value, sub, tone }) {
  return (
    <div className="surface p-5 text-center">
      <Eyebrow>{label}</Eyebrow>
      <div className={cn('font-mono text-xl font-medium tabular-nums mt-2', tone || 'text-bone')}>
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}
