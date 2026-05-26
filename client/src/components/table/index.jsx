import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatMoney, getSeatPositions } from '../../lib/utils';
import { DiceRow, ScoreDisplay } from '../dice/index';
import { Badge } from '../ui/index';

export function PlayerSeat({ player, index, totalPlayers, isMe, isReady, isEliminated, dice, score, isLoser, isWinner, phase }) {
  const positions = getSeatPositions(totalPlayers);
  const pos = positions[index];

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1.5"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isEliminated ? 0.35 : 1 }}
      transition={{ type: 'spring', delay: index * 0.08 }}
    >
      {/* Avatar */}
      <div className={cn(
        'w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-mono font-bold transition-all duration-300',
        isMe ? 'border-gold bg-gold/20 text-gold' :
        isEliminated ? 'border-loss/40 bg-loss/10 text-loss/60' :
        isReady ? 'border-win bg-win/20 text-win' :
        'border-txt-faint bg-surface text-txt-muted'
      )}>
        {player.username?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Username */}
      <span className={cn(
        'text-xs font-mono truncate max-w-[80px]',
        isMe ? 'text-gold' : 'text-txt-muted'
      )}>
        {player.username}
        {isMe && ' (you)'}
      </span>

      {/* Status badges */}
      {phase === 'WAITING' && isReady && (
        <Badge variant="success" className="text-[10px]">READY</Badge>
      )}
      {isEliminated && (
        <Badge variant="danger" className="text-[10px]">OUT</Badge>
      )}

      {/* Dice */}
      {dice && (
        <div className="mt-1">
          <DiceRow dice={dice} size={32} />
        </div>
      )}

      {/* Score */}
      {score != null && phase !== 'WAITING' && (
        <ScoreDisplay score={score} isLoser={isLoser} isWinner={isWinner} animate />
      )}
    </motion.div>
  );
}

export function PotDisplay({ potCents, playerCount, wagerCents }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.3 }}
    >
      <div className="text-xs text-txt-muted font-mono uppercase tracking-widest mb-1">Pot</div>
      <motion.div
        className="text-3xl font-mono font-bold text-gold-bright gold-glow px-6 py-3 bg-elevated/80 border border-gold/20 backdrop-blur-sm"
        key={potCents}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {formatMoney(potCents)}
      </motion.div>
      <div className="text-[10px] text-txt-faint font-mono mt-1">
        {playerCount} players &middot; {formatMoney(wagerCents)} each
      </div>
    </motion.div>
  );
}

export function GameTable({ players, currentUserId, readyPlayers, eliminatedPlayers, rolls, scores, losers, winners, potCents, wagerCents, phase }) {
  const totalPlayers = Math.max(players.length, 2);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto">
      {/* Table felt background */}
      <div className="absolute inset-[8%] rounded-full bg-felt border-2 border-gold/10 felt-texture shadow-inner overflow-hidden">
        {/* Inner ring */}
        <div className="absolute inset-[15%] rounded-full border border-gold/5" />
      </div>

      {/* Pot in center */}
      <PotDisplay
        potCents={potCents || wagerCents * players.length}
        playerCount={players.length}
        wagerCents={wagerCents}
      />

      {/* Player seats around the table */}
      {players.map((player, i) => (
        <PlayerSeat
          key={player.userId}
          player={player}
          index={i}
          totalPlayers={totalPlayers}
          isMe={player.userId === currentUserId}
          isReady={readyPlayers?.includes(player.userId)}
          isEliminated={eliminatedPlayers?.includes(player.userId)}
          dice={rolls?.[player.userId]}
          score={scores?.[player.userId]}
          isLoser={losers?.includes(player.userId)}
          isWinner={winners?.includes(player.userId)}
          phase={phase}
        />
      ))}
    </div>
  );
}

export function RoundTimer({ timeoutMs, onExpire }) {
  const [remaining, setRemaining] = React.useState(timeoutMs);

  React.useEffect(() => {
    setRemaining(timeoutMs);
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 100;
        if (next <= 0) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [timeoutMs]);

  const percent = (remaining / timeoutMs) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors',
            percent > 50 ? 'bg-gold' : percent > 20 ? 'bg-gold-bright' : 'bg-loss'
          )}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <span className={cn(
        'font-mono text-sm tabular-nums w-6 text-right',
        seconds <= 5 ? 'text-loss animate-pulse' : 'text-txt-muted'
      )}>
        {seconds}
      </span>
    </div>
  );
}

export function ChatPanel({ messages, onSend }) {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border border-gold/10 bg-surface">
      <div className="px-3 py-2 border-b border-gold/10 text-xs font-mono text-txt-muted uppercase tracking-widest">
        Table Chat
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[200px]">
        {messages.length === 0 && (
          <p className="text-xs text-txt-faint italic">No messages yet</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="font-mono text-gold text-xs">{msg.username}: </span>
            <span className="text-txt-primary">{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex border-t border-gold/10">
        <input
          className="flex-1 px-3 py-2 bg-transparent text-sm text-txt-primary placeholder-txt-faint focus:outline-none"
          placeholder="Type..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          maxLength={200}
        />
        <button onClick={handleSend} className="px-3 text-gold hover:text-gold-bright transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
