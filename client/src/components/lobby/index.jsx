import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, formatMoney, timeAgo } from '../../lib/utils';
import { Button, Input, Modal, Badge } from '../ui/index';

export function RoomCard({ room, index }) {
  const navigate = useNavigate();
  const isFull = room.playerCount >= room.maxPlayers;
  const isLive = room.status === 'IN_PROGRESS';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/room/${room.id}`)}
      disabled={isFull && !isLive}
      className={cn(
        'surface group text-left p-5 transition-all w-full',
        'hover:border-hairline-hi',
        isFull && !isLive && 'opacity-50 cursor-not-allowed',
        isLive && 'border-green/30'
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="min-w-0">
          <div className="eyebrow !text-[9px] mb-1">Table</div>
          <h3 className="font-display text-xl text-bone group-hover:text-gold-bright transition-colors truncate" style={{ letterSpacing: '-0.01em' }}>
            {room.name}
          </h3>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="eyebrow !text-[9px] mb-0.5">Ante</div>
          <div className="font-mono text-[18px] text-gold-bright font-medium tabular-nums">
            {formatMoney(room.wagerCents)}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: room.maxPlayers }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  i < room.playerCount ? 'bg-gold-bright' : 'bg-hairline'
                )}
              />
            ))}
          </div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint">
            {room.playerCount}/{room.maxPlayers} seated · {timeAgo(room.createdAt)}
          </div>
        </div>
        <div>
          {isLive ? (
            <Badge variant="pulse">Live</Badge>
          ) : isFull ? (
            <Badge variant="danger">Full</Badge>
          ) : (
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim group-hover:text-gold-bright transition-colors">
              Sit →
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export function RoomFilters({ filters, onChange }) {
  const presets = [
    { label: 'All', min: null, max: null },
    { label: 'Micro', min: 25, max: 99 },
    { label: 'Low', min: 100, max: 500 },
    { label: 'Mid', min: 501, max: 2000 },
    { label: 'High', min: 2001, max: 50000 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {presets.map((p) => {
        const active = filters.minWager === p.min && filters.maxWager === p.max;
        return (
          <button
            key={p.label}
            onClick={() => onChange({ ...filters, minWager: p.min, maxWager: p.max })}
            className={cn(
              'px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase font-mono transition-all border',
              active
                ? 'border-gold text-gold-bright bg-gold/5'
                : 'border-transparent text-bone-dim hover:text-bone hover:border-hairline'
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

export function CreateRoomModal({ isOpen, onClose, onCreate, isLoading }) {
  const [form, setForm] = useState({
    name: '',
    wagerCents: 100,
    maxPlayers: 4,
  });
  const wagerOptions = [25, 50, 100, 250, 500, 1000, 2500, 5000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Table">
      <div className="space-y-7">
        <Input
          label="Table Name"
          placeholder="My Table"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={30}
        />

        <div>
          <label className="field-label">Ante per hand</label>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {wagerOptions.map((cents) => {
              const active = form.wagerCents === cents;
              return (
                <button
                  key={cents}
                  onClick={() => setForm({ ...form, wagerCents: cents })}
                  className={cn(
                    'py-2.5 text-[12px] font-mono tabular-nums border transition-all',
                    active
                      ? 'border-gold bg-gold/10 text-gold-bright'
                      : 'border-hairline text-bone-dim hover:text-bone hover:border-hairline-hi'
                  )}
                >
                  {formatMoney(cents)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="field-label !mb-0">Players</label>
            <span className="font-mono text-[18px] text-gold-bright tabular-nums">
              {form.maxPlayers}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            value={form.maxPlayers}
            onChange={(e) => setForm({ ...form, maxPlayers: parseInt(e.target.value, 10) })}
            className="w-full accent-gold-bright"
          />
          <div className="flex justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint mt-1">
            <span>2 min</span>
            <span>6 max</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          loading={isLoading}
          onClick={() => onCreate({ ...form, name: form.name || undefined })}
        >
          Open Table · {formatMoney(form.wagerCents)} ante
        </Button>
      </div>
    </Modal>
  );
}
