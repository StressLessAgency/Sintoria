import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatMoney } from '../lib/utils';
import { Button, Eyebrow, toast } from '../components/ui/index';
import { BalanceDisplay } from '../components/wallet/index';
import { RoomCard, RoomFilters, CreateRoomModal } from '../components/lobby/index';
import { useWallet } from '../hooks/useWallet';

export default function Lobby() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ minWager: null, maxWager: null });

  const roomsQuery = useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const params = {};
      if (filters.minWager) params.minWager = filters.minWager;
      if (filters.maxWager) params.maxWager = filters.maxWager;
      const { data } = await api.get('/rooms', { params });
      return data;
    },
    refetchInterval: 5000,
  });

  const createRoom = useMutation({
    mutationFn: async (config) => {
      const { data } = await api.post('/rooms', config);
      return data;
    },
    onSuccess: (room) => {
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(`/room/${room.id}`);
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to create room', 'error');
    },
  });

  const rooms = roomsQuery.data || [];
  const waitingRooms = rooms.filter((r) => r.status === 'WAITING');
  const liveRooms = rooms.filter((r) => r.status === 'IN_PROGRESS');

  return (
    <div className="relative min-h-screen text-bone overflow-hidden">
      <div className="overhead-cone" />

      <header className="relative z-10 border-b border-hairline px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-[18px] tracking-[0.14em] text-bone">
            THR<span className="font-display-italic text-red-hot">3</span>ES
          </Link>

          <div className="flex items-center gap-6">
            <BalanceDisplay balanceCents={balance} compact />
            <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.16em] uppercase">
              <Link to="/wallet" className="text-bone-dim hover:text-gold-bright transition-colors">
                Wallet
              </Link>
              <Link to="/profile" className="text-bone-dim hover:text-gold-bright transition-colors">
                Profile
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-bone-dim hover:text-gold-bright transition-colors">
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-bone-faint hover:text-red-hot transition-colors"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Eyebrow>The Floor</Eyebrow>
            <h1
              className="font-display text-bone mt-2"
              style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              Tonight’s Tables.
            </h1>
            <p className="font-ui text-[14px] text-bone-dim mt-2">
              {rooms.length} table{rooms.length === 1 ? '' : 's'} active ·{' '}
              {liveRooms.length} live ·{' '}
              {waitingRooms.length} waiting
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="md">
            New Table
          </Button>
        </div>

        <div className="mb-8 border-t border-hairline pt-5">
          <RoomFilters filters={filters} onChange={setFilters} />
        </div>

        {liveRooms.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
              <Eyebrow>Live Now</Eyebrow>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5">
            <Eyebrow>Open Tables</Eyebrow>
          </div>
          {waitingRooms.length === 0 ? (
            <div className="surface text-center py-20 px-6">
              <Eyebrow>Empty Floor</Eyebrow>
              <h3
                className="font-display text-bone mt-3 mb-3"
                style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.01em' }}
              >
                Nobody dealing yet.
              </h3>
              <p className="font-ui text-[14px] text-bone-dim mb-6 max-w-sm mx-auto">
                Open a table at the ante you want and pull in the rest of the room.
              </p>
              <Button onClick={() => setShowCreate(true)}>Open the First Table</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waitingRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateRoomModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createRoom.mutate}
        isLoading={createRoom.isPending}
      />
    </div>
  );
}
