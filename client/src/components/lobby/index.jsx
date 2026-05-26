import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, formatMoney, getWagerTier, timeAgo } from '../../lib/utils';
import { Button, Input, Modal, Badge } from '../ui/index';

export function RoomCard({ room, index }) {
  const navigate = useNavigate();
  const tier = getWagerTier(room.wagerCents);
  const isFull = room.playerCount >= room.maxPlayers;

  return (
    <motion.div
      className={cn(
        'card cursor-pointer group',
        room.status === 'IN_PROGRESS' && 'border-win/20',
        isFull && 'opacity-60'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/room/${room.id}`)}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-body font-semibold text-txt-primary group-hover:text-gold transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={tier.class.replace('badge-', '')} className="text-[10px]">
              {tier.label}
            </Badge>
            {room.mode === 'ELIMINATION' && (
              <Badge variant="gold" className="text-[10px]">ELIM</Badge>
            )}
            {room.rerollEnabled && (
              <Badge className="text-[10px]">REROLL</Badge>
            )}
          </div>
        </div>
        <span className="font-mono text-lg font-bold text-gold-bright">
          {formatMoney(room.wagerCents)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-txt-muted font-mono text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {room.playerCount}/{room.maxPlayers}
          </span>
          <span>{timeAgo(room.createdAt)}</span>
        </div>
        {room.status === 'IN_PROGRESS' ? (
          <Badge variant="pulse">LIVE</Badge>
        ) : isFull ? (
          <Badge variant="danger">FULL</Badge>
        ) : (
          <span className="text-xs text-gold font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            JOIN &rarr;
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function RoomFilters({ filters, onChange }) {
  const wagerPresets = [
    { label: 'All', min: null, max: null },
    { label: 'Micro', min: 25, max: 99 },
    { label: 'Low', min: 100, max: 500 },
    { label: 'Mid', min: 501, max: 2000 },
    { label: 'High', min: 2001, max: 50000 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {wagerPresets.map(preset => (
        <button
          key={preset.label}
          onClick={() => onChange({ ...filters, minWager: preset.min, maxWager: preset.max })}
          className={cn(
            'px-3 py-1.5 text-xs font-mono border transition-all',
            filters.minWager === preset.min && filters.maxWager === preset.max
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-gold/10 text-txt-muted hover:border-gold/30'
          )}
        >
          {preset.label}
        </button>
      ))}
      <button
        onClick={() => onChange({ ...filters, mode: filters.mode === 'ELIMINATION' ? null : 'ELIMINATION' })}
        className={cn(
          'px-3 py-1.5 text-xs font-mono border transition-all',
          filters.mode === 'ELIMINATION'
            ? 'border-gold bg-gold/10 text-gold'
            : 'border-gold/10 text-txt-muted hover:border-gold/30'
        )}
      >
        Elimination Only
      </button>
    </div>
  );
}

export function CreateRoomModal({ isOpen, onClose, onCreate, isLoading }) {
  const [form, setForm] = useState({
    name: '',
    wagerCents: 100,
    maxPlayers: 4,
    mode: 'SINGLE_ROUND',
    rerollEnabled: false,
  });

  const wagerOptions = [25, 50, 100, 250, 500, 1000, 2500, 5000];

  const handleSubmit = () => {
    onCreate({
      ...form,
      name: form.name || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Table">
      <div className="space-y-6">
        <Input
          label="Table name (optional)"
          placeholder="My Table"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          maxLength={30}
        />

        <div>
          <label className="block text-sm text-txt-muted mb-2">Wager per round</label>
          <div className="grid grid-cols-4 gap-2">
            {wagerOptions.map(cents => (
              <button
                key={cents}
                onClick={() => setForm({ ...form, wagerCents: cents })}
                className={cn(
                  'py-2 text-sm font-mono border transition-all',
                  form.wagerCents === cents
                    ? 'border-gold bg-gold/10 text-gold-bright'
                    : 'border-gold/10 text-txt-muted hover:border-gold/30'
                )}
              >
                {formatMoney(cents)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-txt-muted mb-2">
            Players: <span className="text-gold font-mono">{form.maxPlayers}</span>
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={form.maxPlayers}
            onChange={e => setForm({ ...form, maxPlayers: parseInt(e.target.value) })}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs text-txt-faint font-mono">
            <span>2</span><span>6</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.mode === 'ELIMINATION'}
              onChange={e => setForm({ ...form, mode: e.target.checked ? 'ELIMINATION' : 'SINGLE_ROUND' })}
              className="accent-gold"
            />
            <span className="text-sm text-txt-primary">Elimination mode</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.rerollEnabled}
              onChange={e => setForm({ ...form, rerollEnabled: e.target.checked })}
              className="accent-gold"
            />
            <span className="text-sm text-txt-primary">Allow reroll</span>
          </label>
        </div>

        <Button variant="primary" className="w-full" onClick={handleSubmit} loading={isLoading}>
          Create Table &middot; {formatMoney(form.wagerCents)} wager
        </Button>
      </div>
    </Modal>
  );
}
