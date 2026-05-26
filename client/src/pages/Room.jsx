import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';
import { formatMoney, cn } from '../lib/utils';
import { Button, Badge } from '../components/ui/index';
import { Die } from '../components/dice/index';
import { ChatPanel } from '../components/table/index';
import { BalanceDisplay } from '../components/wallet/index';
import { useWalletStore } from '../store/walletStore';

const HAND_SIZE = 5;
const MAX_ROLLS = 5;

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const balance = useWalletStore((s) => s.balanceCents);
  const {
    room,
    players,
    readyPlayers,
    status,
    phase,
    currentRound,
    currentPlayerId,
    playerState,
    potCents,
    tieReplayPlayerIds,
    roundResult,
    gameOverData,
    chatMessages,
  } = useGameStore();

  const { rollDice, setAside, readyUp, sendChat } = useGame(roomId);
  const [picked, setPicked] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const myState = playerState[userId] || null;
  const isMyTurn = currentPlayerId === userId;
  const isReady = readyPlayers?.includes(userId);
  const inTieReplay = tieReplayPlayerIds.length > 0;
  const amInTieReplay = inTieReplay ? tieReplayPlayerIds.includes(userId) : true;

  const togglePick = (idx) => {
    setPicked((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]));
  };

  const handleRoll = () => {
    if (!isMyTurn || isRolling) return;
    setIsRolling(true);
    rollDice();
    setTimeout(() => setIsRolling(false), 700);
  };

  const handleConfirmSetAside = () => {
    if (!isMyTurn || picked.length < 1) return;
    setAside(picked);
    setPicked([]);
  };

  const turnPlayerName = useMemo(() => {
    const p = players.find((pp) => pp.userId === currentPlayerId);
    return p?.username || '...';
  }, [players, currentPlayerId]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-txt-muted font-mono text-sm">Joining table...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gold/5 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/lobby" className="text-txt-muted hover:text-gold transition-colors text-sm">
            &larr; Lobby
          </Link>
          <span className="text-gold/20">|</span>
          <span className="font-body text-sm text-txt-primary">{room.name}</span>
          {inTieReplay && <Badge variant="gold" className="text-[10px]">TIE REPLAY</Badge>}
        </div>
        <div className="flex items-center gap-4">
          <BalanceDisplay balanceCents={balance} compact />
          <span className="font-mono text-xs text-txt-faint">
            Hand {currentRound || '-'}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        <section className="flex-1 flex flex-col gap-6">
          <PotPanel potCents={potCents || room.wagerCents * players.length} wagerCents={room.wagerCents} />

          <div className="grid gap-3">
            {players.map((p) => (
              <PlayerRow
                key={p.userId}
                player={p}
                state={playerState[p.userId]}
                isMe={p.userId === userId}
                isCurrentTurn={p.userId === currentPlayerId && status === 'IN_PROGRESS'}
                isReady={readyPlayers.includes(p.userId)}
                outOfTie={inTieReplay && !tieReplayPlayerIds.includes(p.userId)}
                showReady={phase === 'WAITING'}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-4">
            {phase === 'WAITING' && !isReady && (
              <Button variant="primary" onClick={readyUp} className="px-12 py-4 text-lg">
                Ready Up
              </Button>
            )}
            {phase === 'WAITING' && isReady && (
              <div className="flex flex-col items-center gap-2">
                <Badge variant="success">READY</Badge>
                <span className="text-xs text-txt-muted font-mono">
                  Waiting for {Math.max(0, players.length - readyPlayers.length)} more...
                </span>
              </div>
            )}
            {phase === 'WAITING' && players.length < 2 && (
              <p className="text-txt-muted text-sm font-body">Waiting for at least 2 players...</p>
            )}

            {status === 'IN_PROGRESS' && amInTieReplay && (
              <ActionPanel
                isMyTurn={isMyTurn}
                myState={myState}
                turnPlayerName={turnPlayerName}
                picked={picked}
                togglePick={togglePick}
                onRoll={handleRoll}
                onConfirm={handleConfirmSetAside}
                isRolling={isRolling}
              />
            )}

            {status === 'IN_PROGRESS' && !amInTieReplay && (
              <p className="text-txt-muted text-sm font-mono">
                You’re out — watching the tie replay.
              </p>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-72 flex flex-col gap-4">
          <div className="card space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-txt-muted">Wager</span>
              <span className="font-mono text-gold">{formatMoney(room.wagerCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-txt-muted">Players</span>
              <span className="font-mono">{players.length}/{room.maxPlayers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-txt-muted">Pot</span>
              <span className="font-mono text-gold-bright">
                {formatMoney(potCents || room.wagerCents * players.length)}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[200px]">
            <ChatPanel messages={chatMessages} onSend={sendChat} />
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {gameOverData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-elevated border border-gold/20 gold-glow p-10 max-w-md w-full mx-4 text-center"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 18 }}
            >
              <h2 className="font-display text-3xl text-gold-bright mb-3">
                {gameOverData.winnerId === userId ? 'YOU WIN' : 'GAME OVER'}
              </h2>
              <p className="text-txt-muted font-body mb-2">
                {gameOverData.winnerUsername || '—'} takes the pot
              </p>
              <p className="font-mono text-3xl text-gold-bright">
                {formatMoney(gameOverData.payoutCents)}
              </p>
              <p className="text-xs text-txt-faint font-mono mt-2">
                Pot {formatMoney(gameOverData.potCents)} · Rake {formatMoney(gameOverData.rakeCents)}
              </p>
              <Button variant="primary" className="mt-8 px-10" onClick={() => navigate('/lobby')}>
                Back to Lobby
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PotPanel({ potCents, wagerCents }) {
  return (
    <div className="card text-center py-6">
      <div className="text-xs uppercase tracking-widest text-txt-muted font-mono mb-2">Pot</div>
      <div className="font-mono text-4xl text-gold-bright gold-glow inline-block px-4">
        {formatMoney(potCents)}
      </div>
      <div className="text-xs text-txt-faint font-mono mt-2">
        Ante {formatMoney(wagerCents)} each
      </div>
    </div>
  );
}

function PlayerRow({ player, state, isMe, isCurrentTurn, isReady, outOfTie, showReady }) {
  const setAside = state?.setAside || [];
  const score = state?.score ?? null;
  const rollsUsed = state?.rollsUsed ?? 0;
  const done = state?.done;
  const moon = state?.shotTheMoon;

  return (
    <div
      className={cn(
        'card flex items-center gap-4 p-3 transition-all',
        isCurrentTurn && 'border-gold/40 shadow-[0_0_0_1px_rgba(255,204,68,0.15)]',
        outOfTie && 'opacity-30',
        done && !moon && 'opacity-80'
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-full border text-xs flex items-center justify-center font-mono',
          isMe ? 'border-gold text-gold' : 'border-txt-faint text-txt-muted'
        )}
      >
        {player.username?.[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-mono text-sm truncate', isMe && 'text-gold')}>
            {player.username}
          </span>
          {isCurrentTurn && <Badge variant="gold" className="text-[8px]">TURN</Badge>}
          {moon && <Badge variant="gold" className="text-[8px]">MOON</Badge>}
          {done && !moon && <Badge variant="default" className="text-[8px]">DONE</Badge>}
          {showReady && isReady && <Badge variant="success" className="text-[8px]">RDY</Badge>}
        </div>
        <div className="text-[10px] text-txt-faint font-mono mt-0.5">
          rolls {rollsUsed}/{MAX_ROLLS} · set aside {setAside.length}/{HAND_SIZE}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {setAside.map((d, i) => (
          <div key={i} className="opacity-90">
            <Die value={d} isLocked size={28} />
          </div>
        ))}
        {Array.from({ length: HAND_SIZE - setAside.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-7 h-7 rounded border border-dashed border-txt-faint/30"
          />
        ))}
      </div>

      <div className="w-12 text-right">
        <span
          className={cn(
            'font-mono text-lg',
            done ? 'text-gold-bright' : 'text-txt-primary',
            moon && 'text-gold-bright'
          )}
        >
          {score ?? '-'}
        </span>
      </div>
    </div>
  );
}

function ActionPanel({ isMyTurn, myState, turnPlayerName, picked, togglePick, onRoll, onConfirm, isRolling }) {
  if (!isMyTurn) {
    return (
      <p className="text-txt-muted text-sm font-mono">
        Waiting on <span className="text-gold">{turnPlayerName}</span>...
      </p>
    );
  }

  const currentRoll = myState?.currentRoll;
  const setAsideCount = myState?.setAside?.length ?? 0;
  const rollsUsed = myState?.rollsUsed ?? 0;
  const canRoll = !currentRoll && setAsideCount < HAND_SIZE && rollsUsed < MAX_ROLLS;
  const canConfirm = currentRoll && picked.length > 0;

  return (
    <div className="card w-full max-w-xl p-6 flex flex-col items-center gap-4">
      <div className="text-xs uppercase tracking-widest text-gold font-mono">Your turn</div>

      {currentRoll && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-txt-faint font-mono uppercase">
            Tap dice to keep (min 1)
          </div>
          <div className="flex gap-2">
            {currentRoll.map((d, i) => {
              const isPicked = picked.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => togglePick(i)}
                  className={cn(
                    'rounded transition-all p-1',
                    isPicked
                      ? 'bg-gold/15 ring-2 ring-gold'
                      : 'hover:bg-white/5 ring-1 ring-transparent'
                  )}
                >
                  <Die value={d} size={48} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {canRoll && (
          <Button variant="primary" onClick={onRoll} loading={isRolling}>
            {rollsUsed === 0 ? 'Roll 5 Dice' : `Roll (${HAND_SIZE - setAsideCount})`}
          </Button>
        )}
        {canConfirm && (
          <Button variant="primary" onClick={onConfirm}>
            Set Aside {picked.length}
          </Button>
        )}
      </div>

      <div className="text-[10px] text-txt-faint font-mono">
        Rolls {rollsUsed}/{MAX_ROLLS} · Set aside {setAsideCount}/{HAND_SIZE}
      </div>
    </div>
  );
}
