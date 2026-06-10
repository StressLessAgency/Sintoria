import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatMoney, cn, timeAgo } from '../lib/utils';
import { Button, Eyebrow, Input, Modal, Skeleton, toast } from '../components/ui/index';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
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

  const changePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }) =>
      (await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })).data,
    onError: (err) => toast(err.response?.data?.error || 'Failed to change password', 'error'),
  });

  const stats = statsQuery.data;
  const tabs = [
    { id: 'stats', label: 'Record' },
    { id: 'history', label: 'History' },
    { id: 'security', label: 'Security' },
    { id: 'responsible', label: 'Responsible Play' },
  ];

  return (
    <div className="relative min-h-screen text-bone overflow-hidden">
      <div className="overhead-cone" />

      <header className="relative z-10 border-b border-hairline px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/lobby"
              className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim hover:text-gold-bright transition-colors"
            >
              ← Lobby
            </Link>
            <div className="w-px h-3.5 bg-hairline" />
            <span className="font-display text-[18px] tracking-[0.04em] text-bone">Profile</span>
          </div>
          <span className="font-mono text-[12px] text-bone-dim">@{user?.username}</span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
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

        {activeTab === 'stats' && stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Hands', value: stats.totalGames },
                { label: 'Win Rate', value: `${stats.winRate}%` },
                {
                  label: 'Net',
                  value: formatMoney(stats.netPLCents),
                  tone: stats.netPLCents >= 0 ? 'text-green' : 'text-red-hot',
                },
                {
                  label: 'Best Hand',
                  value: formatMoney(stats.biggestWinCents),
                  tone: 'text-gold-bright',
                },
              ].map((s) => (
                <div key={s.label} className="surface p-5">
                  <Eyebrow>{s.label}</Eyebrow>
                  <div className={cn('font-mono text-2xl font-medium tabular-nums mt-2', s.tone || 'text-bone')}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="surface p-5">
                <Eyebrow>Total Won</Eyebrow>
                <div className="font-mono text-xl text-green tabular-nums mt-2">
                  {formatMoney(stats.totalWonCents)}
                </div>
              </div>
              <div className="surface p-5">
                <Eyebrow>Total Lost</Eyebrow>
                <div className="font-mono text-xl text-red-hot tabular-nums mt-2">
                  {formatMoney(stats.totalLostCents)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {historyQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : !historyQuery.data?.games?.length ? (
              <div className="surface py-16 text-center">
                <Eyebrow>No Hands Yet</Eyebrow>
                <div className="font-display text-bone text-2xl mt-3">
                  Sit down at your first table.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {historyQuery.data.games.map((game, i) => {
                  const net = game.totalWon - game.totalLost;
                  const positive = net >= 0;
                  return (
                    <div key={i} className="flex items-center justify-between py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[14px] tabular-nums text-bone">
                          {formatMoney(game.wagerCents)} ante
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint">
                          {game.rounds} hand{game.rounds === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            'font-mono text-[14px] font-medium tabular-nums',
                            positive ? 'text-green' : 'text-red-hot'
                          )}
                        >
                          {positive ? '+' : ''}
                          {formatMoney(net)}
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint">
                          {timeAgo(game.date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
            <ChangePasswordForm
              loading={changePassword.isPending}
              onSubmit={(values, reset) =>
                changePassword.mutate(values, {
                  onSuccess: () => {
                    toast('Password changed', 'success');
                    reset();
                  },
                })
              }
            />
          </motion.div>
        )}

        {activeTab === 'responsible' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="surface p-7 space-y-5">
              <div>
                <Eyebrow>Deposit Limit</Eyebrow>
                <h3 className="font-display text-2xl text-bone mt-1" style={{ letterSpacing: '-0.01em' }}>
                  Cap what you deposit daily.
                </h3>
              </div>
              <p className="font-ui text-[13px] text-bone-dim">
                Decreases take effect immediately. Increases require a 24-hour cooling period.
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[null, 5000, 10000, 25000].map((limit) => {
                  const active = rgQuery.data?.dailyDepositLimitCents === limit;
                  return (
                    <button
                      key={limit ?? 'none'}
                      onClick={() => updateRG.mutate({ dailyDepositLimitCents: limit })}
                      className={cn(
                        'py-2.5 text-[12px] font-mono tabular-nums border transition-all',
                        active
                          ? 'border-gold bg-gold/10 text-gold-bright'
                          : 'border-hairline text-bone-dim hover:text-bone hover:border-hairline-hi'
                      )}
                    >
                      {limit ? formatMoney(limit) : 'None'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="surface p-7 space-y-5 border-red-hot/30">
              <div>
                <Eyebrow className="!text-red-hot">Self-Exclude</Eyebrow>
                <h3 className="font-display text-2xl text-bone mt-1" style={{ letterSpacing: '-0.01em' }}>
                  Lock yourself out.
                </h3>
              </div>
              <p className="font-ui text-[13px] text-bone-dim">
                Temporarily or permanently freeze your account. You’ll be signed out immediately.
                Permanent exclusion cannot be reversed.
              </p>
              <button
                onClick={() => setShowExclusion(true)}
                className="btn-ghost !border-red-hot/40 !text-red-hot hover:!bg-red-hot/10"
              >
                Activate Self-Exclusion
              </button>
            </div>

            <div className="px-6 py-5 border border-hairline">
              <Eyebrow>Help Lines</Eyebrow>
              <ul className="mt-3 space-y-1.5 font-ui text-[13px] text-bone-dim">
                <li>National Council on Problem Gambling: 1-800-522-4700</li>
                <li>GamCare: gamcare.org.uk</li>
                <li>1-800-GAMBLER: 1-800-426-2537</li>
              </ul>
            </div>
          </motion.div>
        )}
      </main>

      <Modal isOpen={showExclusion} onClose={() => setShowExclusion(false)} title="Self-Exclusion">
        <p className="font-ui text-[13px] text-bone-dim mb-6">
          Choose a period. You’ll be signed out immediately and locked out until it expires.
        </p>
        <div className="space-y-2">
          {[
            { duration: '24h', label: '24 Hours' },
            { duration: '7d', label: '7 Days' },
            { duration: '30d', label: '30 Days' },
            { duration: 'permanent', label: 'Permanent · irreversible' },
          ].map((opt) => (
            <button
              key={opt.duration}
              onClick={() => {
                if (
                  opt.duration === 'permanent' &&
                  !confirm('Permanent self-exclusion cannot be reversed. Are you sure?')
                )
                  return;
                selfExclude.mutate(opt.duration);
              }}
              className={cn(
                'w-full px-4 py-3 text-left border font-mono text-[13px] transition-all',
                opt.duration === 'permanent'
                  ? 'border-red-hot/30 text-red-hot hover:bg-red-hot/5'
                  : 'border-hairline text-bone hover:border-hairline-hi'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function ChangePasswordForm({ loading, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLocalError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!currentPassword || !newPassword) {
      setLocalError('Both fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('New passwords don’t match');
      return;
    }
    if (newPassword === currentPassword) {
      setLocalError('New password must differ from current');
      return;
    }
    onSubmit({ currentPassword, newPassword, confirmPassword }, reset);
  };

  return (
    <div className="surface p-7 space-y-6">
      <div>
        <Eyebrow>Change Password</Eyebrow>
        <h3 className="font-display text-2xl text-bone mt-1" style={{ letterSpacing: '-0.01em' }}>
          Pick something new.
        </h3>
        <p className="font-ui text-[13px] text-bone-dim mt-2">
          Minimum eight characters. Other sessions will be signed out.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {localError && (
          <p className="font-mono text-[11px] text-red-hot">{localError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={loading}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}
