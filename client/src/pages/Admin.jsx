import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { formatMoney, cn, timeAgo } from '../lib/utils';
import { Button, Input, Badge } from '../components/ui/index';
import { toast } from '../components/ui/index';

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
    queryFn: async () => (await api.get('/admin/users', { params: { search: userSearch || undefined } })).data,
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
    mutationFn: async ({ id, suspended }) => (await api.put(`/admin/users/${id}/suspend`, { suspended })).data,
    onSuccess: () => {
      toast('User updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const updateKyc = useMutation({
    mutationFn: async ({ id, status }) => (await api.put(`/admin/users/${id}/kyc`, { status })).data,
    onSuccess: () => {
      toast('KYC updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const dash = dashQuery.data;
  const tabs = ['dashboard', 'users', 'games', 'financials'];

  return (
    <div className="min-h-screen">
      <header className="border-b border-gold/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/lobby" className="text-txt-muted hover:text-gold transition-colors text-sm">&larr; Lobby</Link>
            <span className="font-display text-xl text-gold">Admin</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex border-b border-gold/10 mb-8">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'px-6 py-3 text-sm font-mono uppercase tracking-widest transition-all border-b-2 -mb-px',
                activeTab === t ? 'border-gold text-gold' : 'border-transparent text-txt-muted hover:text-txt-primary'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && dash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Active Tables', value: dash.live.activeRooms },
                { label: 'Online Players', value: dash.live.totalPlayers },
                { label: 'In Play', value: formatMoney(dash.live.totalInPlayCents), color: 'text-gold-bright' },
                { label: 'Total Users', value: dash.totalUsers },
              ].map(stat => (
                <div key={stat.label} className="card text-center">
                  <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-1">{stat.label}</span>
                  <span className={cn('font-mono text-2xl font-bold', stat.color || 'text-txt-primary')}>{stat.value}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-mono text-txt-muted uppercase tracking-widest mb-4">Today</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <span className="text-xs font-mono text-txt-muted block mb-1">Deposits</span>
                <span className="font-mono text-xl text-win">{formatMoney(dash.today.deposits.totalCents)}</span>
                <span className="text-xs text-txt-faint block">{dash.today.deposits.count} txns</span>
              </div>
              <div className="card text-center">
                <span className="text-xs font-mono text-txt-muted block mb-1">Withdrawals</span>
                <span className="font-mono text-xl text-loss">{formatMoney(dash.today.withdrawals.totalCents)}</span>
                <span className="text-xs text-txt-faint block">{dash.today.withdrawals.count} txns</span>
              </div>
              <div className="card text-center">
                <span className="text-xs font-mono text-txt-muted block mb-1">Rake</span>
                <span className="font-mono text-xl text-gold-bright">{formatMoney(dash.today.rakeCents)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <Input
                placeholder="Search by email or username..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            {usersQuery.isLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
            ) : (
              <div className="space-y-2">
                {usersQuery.data?.users?.map(u => (
                  <div key={u.id} className="card flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface border border-gold/15 flex items-center justify-center font-mono text-xs text-txt-muted">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-mono">{u.username}</p>
                        <p className="text-xs text-txt-faint">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={u.kycStatus === 'APPROVED' ? 'success' : u.kycStatus === 'REJECTED' ? 'danger' : 'default'} className="text-[10px]">
                        KYC: {u.kycStatus}
                      </Badge>
                      <span className="font-mono text-sm text-gold">{formatMoney(u.wallet?.balanceCents || 0)}</span>
                      <div className="flex gap-1">
                        {u.kycStatus === 'SUBMITTED' && (
                          <>
                            <button onClick={() => updateKyc.mutate({ id: u.id, status: 'APPROVED' })} className="text-xs text-win hover:underline">Approve</button>
                            <button onClick={() => updateKyc.mutate({ id: u.id, status: 'REJECTED' })} className="text-xs text-loss hover:underline">Reject</button>
                          </>
                        )}
                        <button
                          onClick={() => suspendUser.mutate({ id: u.id, suspended: !u.isSuspended })}
                          className={cn('text-xs hover:underline', u.isSuspended ? 'text-win' : 'text-loss')}
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

        {/* Games */}
        {activeTab === 'games' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {gamesQuery.isLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
            ) : (
              <div className="space-y-2">
                {gamesQuery.data?.rooms?.map(room => (
                  <div key={room.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{room.name || 'Unnamed'}</span>
                      <span className="text-xs text-txt-faint">{timeAgo(room.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-txt-muted font-mono">
                      <span>{formatMoney(room.wagerCents)}/round</span>
                      <span>{room.rounds.length} rounds</span>
                      <span>{room.participants.length} players</span>
                      <span>Rake: {formatMoney(room.rounds.reduce((s, r) => s + r.rakeCents, 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Financials */}
        {activeTab === 'financials' && financialsQuery.data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Total Deposits', value: financialsQuery.data.totalDepositsCents, color: 'text-win' },
                { label: 'Total Withdrawals', value: financialsQuery.data.totalWithdrawalsCents, color: 'text-loss' },
                { label: 'Total Rake Revenue', value: financialsQuery.data.totalRakeCents, color: 'text-gold-bright' },
                { label: 'Total Float (user balances)', value: financialsQuery.data.totalFloatCents, color: 'text-txt-primary' },
              ].map(stat => (
                <div key={stat.label} className="card text-center py-8">
                  <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-2">{stat.label}</span>
                  <span className={cn('font-mono text-3xl font-bold', stat.color)}>{formatMoney(stat.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
