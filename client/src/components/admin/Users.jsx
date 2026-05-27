import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { cn, formatChips, timeAgo } from '../../lib/utils';
import { Input, Button, Eyebrow, Skeleton, toast } from '../ui/index';
import { FadeIn, Avatar, RoleBadge, EmptyState, RowSkeleton, ChipNumber } from './parts.jsx';

const ROLE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'PLAYER', label: 'Players' },
  { id: 'TABLE_LEADER', label: 'Leaders' },
  { id: 'ADMIN', label: 'Admins' },
];
const STATUS_FILTERS = [
  { id: '', label: 'Any Status' },
  { id: 'false', label: 'Active' },
  { id: 'true', label: 'Suspended' },
];

export default function Users() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [suspended, setSuspended] = useState('');
  const [page, setPage] = useState(1);
  const [drawerUserId, setDrawerUserId] = useState(null);

  const q = useQuery({
    queryKey: ['admin', 'users', { search, role, suspended, page }],
    queryFn: async () =>
      (
        await api.get('/admin/users', {
          params: {
            search: search || undefined,
            role: role || undefined,
            suspended: suspended || undefined,
            page,
            limit: 25,
          },
        })
      ).data,
    keepPreviousData: true,
  });

  return (
    <FadeIn>
      <div className="space-y-5">
        <div className="surface p-4 space-y-4">
          <Input
            placeholder="Search by email or username"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterRow label="Role" options={ROLE_FILTERS} value={role} onChange={(v) => { setRole(v); setPage(1); }} />
            <FilterRow label="Status" options={STATUS_FILTERS} value={suspended} onChange={(v) => { setSuspended(v); setPage(1); }} />
          </div>
        </div>

        {q.isLoading ? (
          <RowSkeleton count={8} />
        ) : !q.data?.users?.length ? (
          <EmptyState eyebrow="No Match" title="No users found." body="Try a different search or filter combination." />
        ) : (
          <>
            <div className="surface divide-y divide-hairline">
              {q.data.users.map((u) => (
                <UserRow key={u.id} user={u} onOpen={() => setDrawerUserId(u.id)} />
              ))}
            </div>
            <Pagination
              page={q.data.page}
              totalPages={q.data.totalPages}
              total={q.data.total}
              onPage={setPage}
            />
          </>
        )}

        <UserDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />
      </div>
    </FadeIn>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={cn(
                'px-3 py-1 font-mono text-[11px] tracking-[0.18em] uppercase border transition-colors',
                active
                  ? 'border-gold text-gold-bright bg-gold/5'
                  : 'border-transparent text-bone-dim hover:text-bone hover:border-hairline'
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UserRow({ user, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-ash/50 transition-colors"
    >
      <Avatar username={user.username} />
      <div className="min-w-0">
        <div className="font-ui text-[13px] text-bone truncate flex items-center gap-2">
          {user.username}
          {user.isSuspended && (
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-red-hot">Suspended</span>
          )}
        </div>
        <div className="font-mono text-[10px] text-bone-faint truncate">{user.email}</div>
      </div>
      <div className="hidden md:block"><RoleBadge role={user.role} /></div>
      <div className="hidden md:block font-mono text-[13px] tabular-nums text-gold-bright text-right">
        {formatChips(user.wallet?.balanceCents || 0)}
      </div>
      <div className="hidden md:block font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint text-right">
        {timeAgo(user.createdAt)}
      </div>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-dim">
        Open →
      </div>
    </button>
  );
}

function Pagination({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-faint">
        {total} users · page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>
          ← Prev
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next →
        </Button>
      </div>
    </div>
  );
}

function UserDrawer({ userId, onClose }) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  const detail = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => (await api.get(`/admin/users/${userId}`)).data,
    enabled,
  });

  const setRole = useMutation({
    mutationFn: async (role) => (await api.post(`/admin/users/${userId}/role`, { role })).data,
    onSuccess: () => {
      toast('Role updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast(e.response?.data?.error || 'Failed to update role', 'error'),
  });

  const suspend = useMutation({
    mutationFn: async (suspended) =>
      (await api.put(`/admin/users/${userId}/suspend`, { suspended })).data,
    onSuccess: () => {
      toast('User updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast('Failed to update user', 'error'),
  });

  const grant = useMutation({
    mutationFn: async ({ amount, note }) =>
      (await api.post(`/admin/users/${userId}/grant`, { amount, note })).data,
    onSuccess: () => {
      toast('Chips granted', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast(e.response?.data?.error || 'Grant failed', 'error'),
  });

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full max-w-[480px] bg-bg border-l border-hairline overflow-y-auto"
          >
            <div className="sticky top-0 bg-bg/95 backdrop-blur-md border-b border-hairline px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar username={detail.data?.user?.username} size={32} tone="gold" />
                <div className="min-w-0">
                  <Eyebrow>User</Eyebrow>
                  <div className="font-display text-[18px] text-bone truncate">
                    {detail.data?.user?.username || '...'}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-bone-dim hover:text-bone-bright">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {detail.isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              detail.data && (
                <div className="p-6 space-y-8">
                  <ProfileBlock user={detail.data.user} />

                  <Section title="Role">
                    <div className="grid grid-cols-3 gap-1.5">
                      {['PLAYER', 'TABLE_LEADER', 'ADMIN'].map((r) => {
                        const active = detail.data.user.role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => !active && setRole.mutate(r)}
                            disabled={setRole.isPending}
                            className={cn(
                              'py-2.5 font-mono text-[10px] tracking-[0.18em] uppercase border transition-colors',
                              active
                                ? 'border-gold bg-gold/10 text-gold-bright'
                                : 'border-hairline text-bone-dim hover:text-bone hover:border-hairline-hi'
                            )}
                          >
                            {r === 'TABLE_LEADER' ? 'Leader' : r === 'ADMIN' ? 'Admin' : 'Player'}
                          </button>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="Status">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => suspend.mutate(!detail.data.user.isSuspended)}
                      loading={suspend.isPending}
                    >
                      {detail.data.user.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
                    </Button>
                  </Section>

                  <Section title="Grant Chips">
                    <GrantForm onSubmit={(payload) => grant.mutate(payload)} loading={grant.isPending} />
                  </Section>

                  <Section title="Transactions">
                    {detail.data.transactions.length === 0 ? (
                      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-faint py-4">
                        No transactions yet
                      </div>
                    ) : (
                      <div className="max-h-[260px] overflow-y-auto pr-1 divide-y divide-hairline">
                        {detail.data.transactions.map((t) => (
                          <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-ui text-[12px] text-bone">{t.type}</div>
                              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint">
                                {timeAgo(t.createdAt)} · {t.reference?.slice(0, 10) || '—'}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'font-mono tabular-nums text-[13px]',
                                t.amountCents >= 0 ? 'text-green' : 'text-red-hot'
                              )}
                            >
                              {t.amountCents >= 0 ? '+' : ''}{formatChips(t.amountCents)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>

                  <Section title="Game History">
                    {detail.data.participations.length === 0 ? (
                      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-faint py-4">
                        Never sat down yet
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {detail.data.participations.map((p) => (
                          <div key={p.id} className="py-2 border-b border-hairline last:border-b-0 flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="font-ui text-[12px] text-bone truncate">
                                {p.room?.name || 'Table'}
                              </div>
                              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint">
                                {p.room?.status} · {timeAgo(p.room?.createdAt)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-[12px] tabular-nums text-green">+{formatChips(p.totalWon)}</div>
                              <div className="font-mono text-[10px] tabular-nums text-red-hot">-{formatChips(p.totalLost)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
              )
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProfileBlock({ user }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Balance" value={formatChips(user.balanceCents)} tone="gold" />
      <Stat label="Role" value={user.role.replace('_', ' ')} />
      <Stat label="KYC" value={user.kycStatus} />
      <Stat label="Joined" value={timeAgo(user.createdAt)} />
      <div className="col-span-2 font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint truncate">
        {user.email}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="surface p-3">
      <Eyebrow>{label}</Eyebrow>
      <div
        className={cn(
          'font-mono text-[14px] tabular-nums mt-1',
          tone === 'gold' ? 'text-gold-bright' : 'text-bone'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <Eyebrow className="mb-3">{title}</Eyebrow>
      {children}
    </div>
  );
}

function GrantForm({ onSubmit, loading }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const valid = Number(amount) > 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Amount in chips"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
        />
        <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button
        size="sm"
        disabled={!valid || loading}
        loading={loading}
        onClick={() => {
          onSubmit({ amount: Number(amount), note });
          setAmount('');
          setNote('');
        }}
      >
        Grant {amount ? formatChips(Number(amount)) : ''} chips
      </Button>
    </div>
  );
}
