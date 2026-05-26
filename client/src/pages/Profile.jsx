import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatMoney, cn, timeAgo } from '../lib/utils';
import { Button, Input, Badge, Modal } from '../components/ui/index';
import { toast } from '../components/ui/index';

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [showExclusion, setShowExclusion] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  const statsQuery = useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: async () => (await api.get('/profile/stats')).data,
  });

  const historyQuery = useQuery({
    queryKey: ['profile', 'history'],
    queryFn: async () => (await api.get('/profile/history')).data,
    enabled: activeTab === 'history',
  });

  const rgQuery = useQuery({
    queryKey: ['profile', 'responsible-gambling'],
    queryFn: async () => (await api.get('/profile/responsible-gambling')).data,
    enabled: activeTab === 'responsible',
  });

  const updateRG = useMutation({
    mutationFn: async (data) => (await api.put('/profile/responsible-gambling', data)).data,
    onSuccess: () => {
      toast('Settings updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['profile', 'responsible-gambling'] });
    },
    onError: (err) => toast(err.response?.data?.error || 'Update failed', 'error'),
  });

  const selfExclude = useMutation({
    mutationFn: async (duration) => (await api.post('/profile/self-exclude', { duration })).data,
    onSuccess: (data) => {
      toast(data.message, 'warning');
      useAuthStore.getState().logout();
    },
  });

  const stats = statsQuery.data;
  const tabs = ['stats', 'history', 'responsible'];

  return (
    <div className="min-h-screen">
      <header className="border-b border-gold/5 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/lobby" className="text-txt-muted hover:text-gold transition-colors text-sm">&larr; Lobby</Link>
            <span className="font-display text-xl text-gold">Profile</span>
          </div>
          <span className="font-mono text-sm text-txt-muted">{user?.username}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
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
              {t === 'responsible' ? 'Responsible Play' : t}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {activeTab === 'stats' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Games', value: stats.totalGames },
                { label: 'Win Rate', value: `${stats.winRate}%` },
                { label: 'Net P&L', value: formatMoney(stats.netPLCents), color: stats.netPLCents >= 0 ? 'text-win' : 'text-loss' },
                { label: 'Biggest Win', value: formatMoney(stats.biggestWinCents), color: 'text-gold-bright' },
              ].map(stat => (
                <div key={stat.label} className="card text-center">
                  <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-1">{stat.label}</span>
                  <span className={cn('font-mono text-2xl font-bold', stat.color || 'text-txt-primary')}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-1">Total Won</span>
                <span className="font-mono text-xl text-win">{formatMoney(stats.totalWonCents)}</span>
              </div>
              <div className="card">
                <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-1">Total Lost</span>
                <span className="font-mono text-xl text-loss">{formatMoney(stats.totalLostCents)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {historyQuery.isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
            ) : !historyQuery.data?.games?.length ? (
              <div className="card text-center py-12 text-txt-muted">No games played yet</div>
            ) : (
              <div className="space-y-2">
                {historyQuery.data.games.map((game, i) => (
                  <div key={i} className="card flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={game.mode === 'ELIMINATION' ? 'gold' : 'default'} className="text-[10px]">
                        {game.mode === 'ELIMINATION' ? 'ELIM' : 'SINGLE'}
                      </Badge>
                      <span className="font-mono text-sm">{formatMoney(game.wagerCents)}/round</span>
                      <span className="text-xs text-txt-faint">{game.rounds} round{game.rounds !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        game.totalWon - game.totalLost >= 0 ? 'text-win' : 'text-loss'
                      )}>
                        {game.totalWon - game.totalLost >= 0 ? '+' : ''}{formatMoney(game.totalWon - game.totalLost)}
                      </span>
                      <p className="text-xs text-txt-faint">{timeAgo(game.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Responsible gambling tab */}
        {activeTab === 'responsible' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="card space-y-6">
              <h3 className="font-display text-lg text-gold">Deposit Limits</h3>
              <p className="text-sm text-txt-muted">
                Set a daily deposit limit. Decreases take effect immediately. Increases require a 24-hour cooling period.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[null, 5000, 10000, 25000].map(limit => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => updateRG.mutate({ dailyDepositLimitCents: limit })}
                    className={cn(
                      'py-2 text-sm font-mono border transition-all',
                      rgQuery.data?.dailyDepositLimitCents === limit
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gold/10 text-txt-muted hover:border-gold/30'
                    )}
                  >
                    {limit ? formatMoney(limit) : 'None'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-display text-lg text-loss">Self-Exclusion</h3>
              <p className="text-sm text-txt-muted">
                Temporarily or permanently lock your account. This action logs you out immediately. Permanent exclusion cannot be reversed.
              </p>
              <Button variant="ghost" className="border-loss/30 text-loss hover:bg-loss/10" onClick={() => setShowExclusion(true)}>
                Activate Self-Exclusion
              </Button>
            </div>

            <div className="p-4 border border-gold/10 bg-surface text-sm text-txt-muted">
              <p className="font-body font-semibold text-txt-primary mb-2">Need help?</p>
              <p>National Council on Problem Gambling: 1-800-522-4700</p>
              <p>GamCare: gamcare.org.uk</p>
              <p>1-800-GAMBLER: 1-800-426-2537</p>
            </div>
          </motion.div>
        )}
      </main>

      <Modal isOpen={showExclusion} onClose={() => setShowExclusion(false)} title="Self-Exclusion">
        <p className="text-sm text-txt-muted mb-6">
          Choose an exclusion period. You will be logged out immediately and cannot access your account until the period expires.
        </p>
        <div className="space-y-3">
          {[
            { duration: '24h', label: '24 Hours' },
            { duration: '7d', label: '7 Days' },
            { duration: '30d', label: '30 Days' },
            { duration: 'permanent', label: 'Permanent (irreversible)' },
          ].map(opt => (
            <button
              key={opt.duration}
              onClick={() => {
                if (opt.duration === 'permanent') {
                  if (!confirm('PERMANENT self-exclusion cannot be reversed. Are you absolutely sure?')) return;
                }
                selfExclude.mutate(opt.duration);
              }}
              className={cn(
                'w-full p-3 text-left border transition-all hover:border-loss/30',
                opt.duration === 'permanent' ? 'border-loss/20 text-loss' : 'border-gold/10 text-txt-primary'
              )}
            >
              <span className="font-mono">{opt.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
