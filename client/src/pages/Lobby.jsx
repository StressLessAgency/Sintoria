import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { formatMoney } from '../lib/utils';
import { Button } from '../components/ui/index';
import { BalanceDisplay } from '../components/wallet/index';
import { RoomCard, RoomFilters, CreateRoomModal } from '../components/lobby/index';
import { useWallet } from '../hooks/useWallet';
import { toast } from '../components/ui/index';

export default function Lobby() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { balance } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ minWager: null, maxWager: null, mode: null });

  const roomsQuery = useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const params = {};
      if (filters.minWager) params.minWager = filters.minWager;
      if (filters.maxWager) params.maxWager = filters.maxWager;
      if (filters.mode) params.mode = filters.mode;
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
  const waitingRooms = rooms.filter(r => r.status === 'WAITING');
  const liveRooms = rooms.filter(r => r.status === 'IN_PROGRESS');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-gold">THREES</Link>

          <div className="flex items-center gap-6">
            <BalanceDisplay balanceCents={balance} compact />
            <nav className="flex items-center gap-4 text-sm font-body">
              <Link to="/wallet" className="text-txt-muted hover:text-gold transition-colors">Wallet</Link>
              <Link to="/profile" className="text-txt-muted hover:text-gold transition-colors">Profile</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-txt-muted hover:text-gold transition-colors">Admin</Link>
              )}
              <button onClick={logout} className="text-txt-faint hover:text-loss transition-colors">
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-gold">Lobby</h1>
            <p className="text-txt-muted font-body text-sm mt-1">
              {rooms.length} table{rooms.length !== 1 ? 's' : ''} active
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            + Create Table
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <RoomFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Live games */}
        {liveRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-mono text-txt-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-win rounded-full animate-pulse" />
              Live Games
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Waiting rooms */}
        <div>
          <h2 className="text-sm font-mono text-txt-muted uppercase tracking-widest mb-4">
            Open Tables
          </h2>
          {waitingRooms.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-txt-muted font-body mb-4">No tables waiting. Be the first.</p>
              <Button variant="ghost" onClick={() => setShowCreate(true)}>Create Table</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waitingRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          )}
        </div>
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
