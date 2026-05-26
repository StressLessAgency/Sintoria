import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';
import { formatMoney, cn } from '../lib/utils';
import { Button, Badge, Eyebrow } from '../components/ui/index';
import { Die, LockedRow, ScoreDisplay } from '../components/dice/index';
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
    gameOverData,
  } = useGameStore();

  const { rollDice, setAside, readyUp } = useGame(roomId);
  const [picked, setPicked] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const myState = playerState[userId] || null;
  const isMyTurn = currentPlayerId === userId;
  const isReady = readyPlayers?.includes(userId);
  const inTieReplay = tieReplayPlayerIds.length > 0;
  const amInTieReplay = inTieReplay ? tieReplayPlayerIds.includes(userId) : true;

  const togglePick = (idx) =>
    setPicked((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]));

  const handleRoll = () => {
    if (!isMyTurn || isRolling) return;
    setIsRolling(true);
    rollDice();
    setTimeout(() => setIsRolling(false), 700);
  };

  const handleConfirm = () => {
    if (!isMyTurn || picked.length < 1) return;
    setAside(picked);
    setPicked([]);
  };

  const turnPlayerName = useMemo(() => {
    const p = players.find((pp) => pp.userId === currentPlayerId);
    return p?.username || '—';
  }, [players, currentPlayerId]);

  const orderedPlayers = useMemo(() => {
    if (!players.length) return [];
    if (!currentPlayerId) return players;
    const idx = players.findIndex((p) => p.userId === currentPlayerId);
    if (idx < 0) return players;
    return [...players.slice(idx), ...players.slice(0, idx)];
  }, [players, currentPlayerId]);

  if (!room) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="overhead-cone" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-gold-bright animate-ping" />
          <span className="eyebrow">Joining table</span>
        </div>
      </div>
    );
  }

  const wagerLabel = formatMoney(room.wagerCents);
  const potLabel = formatMoney(potCents || room.wagerCents * players.length);

  return (
    <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
      <div className="overhead-cone" />
      <div className="felt-pool" />

      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-hairline">
        <div className="flex items-center gap-4">
          <Link
            to="/lobby"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim hover:text-gold-bright transition-colors"
          >
            ← Lobby
          </Link>
          <div className="w-px h-3.5 bg-hairline" />
          <span className="font-ui text-[13px] text-bone font-medium">{room.name}</span>
          {inTieReplay && <Badge variant="gold">Tie Replay</Badge>}
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="eyebrow !text-[9px]">Wallet</div>
            <div className="font-mono text-[13px] text-gold-bright tabular-nums">
              {formatMoney(balance)}
            </div>
          </div>
          <div className="w-px h-8 bg-hairline" />
          <div className="text-right">
            <div className="eyebrow !text-[9px]">Hand</div>
            <div className="font-mono text-[13px] text-bone tabular-nums">
              {String(currentRound || 0).padStart(2, '0')}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col">
        <section className="px-6 pt-16 pb-10 text-center">
          <Eyebrow>The Pot</Eyebrow>
          <motion.div
            key={potCents}
            initial={{ scale: 0.94, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="font-display gold-text my-2"
            style={{
              fontSize: 'clamp(56px, 8vw, 112px)',
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            {potLabel}
          </motion.div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-bone-dim">
            Ante {wagerLabel} · {players.length} player{players.length === 1 ? '' : 's'}
          </div>
        </section>

        <section className="flex-1 px-4 pb-48 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-3">
            {orderedPlayers.map((p) => (
              <PlayerRow
                key={p.userId}
                player={p}
                state={playerState[p.userId]}
                isMe={p.userId === userId}
                isCurrentTurn={
                  p.userId === currentPlayerId && status === 'IN_PROGRESS'
                }
                isReady={readyPlayers.includes(p.userId)}
                outOfTie={inTieReplay && !tieReplayPlayerIds.includes(p.userId)}
                showReady={phase === 'WAITING'}
              />
            ))}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-6 pt-3 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {phase === 'WAITING' && (
            <WaitingPanel
              isReady={isReady}
              count={players.length}
              readyCount={readyPlayers.length}
              onReady={readyUp}
            />
          )}
          {status === 'IN_PROGRESS' && amInTieReplay && (
            <ActionPanel
              isMyTurn={isMyTurn}
              myState={myState}
              turnPlayerName={turnPlayerName}
              picked={picked}
              togglePick={togglePick}
              onRoll={handleRoll}
              onConfirm={handleConfirm}
              isRolling={isRolling}
            />
          )}
          {status === 'IN_PROGRESS' && !amInTieReplay && (
            <Spectator />
          )}
        </div>
      </div>

      <AnimatePresence>
        {gameOverData && (
          <GameOver
            data={gameOverData}
            userId={userId}
            onLeave={() => navigate('/lobby')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlayerRow({
  player,
  state,
  isMe,
  isCurrentTurn,
  isReady,
  outOfTie,
  showReady,
}) {
  const setAside = state?.setAside || [];
  const score = state?.score ?? null;
  const rollsUsed = state?.rollsUsed ?? 0;
  const done = state?.done;
  const moon = state?.shotTheMoon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: outOfTie ? 0.3 : 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 240 }}
      className={cn(
        'relative grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 surface',
        isCurrentTurn && 'border-hairline-hi',
        done && !moon && 'opacity-90'
      )}
      style={
        isCurrentTurn
          ? { boxShadow: '0 0 0 1px var(--hairline-hi), 0 24px 60px -28px rgba(255, 208, 106, 0.4)' }
          : undefined
      }
    >
      {isCurrentTurn && (
        <motion.div
          layoutId="turn-marker"
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold-bright"
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        />
      )}

      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center font-mono text-[12px] font-medium',
          isMe ? 'bg-gold/15 text-gold-bright' : 'bg-ash text-bone-dim'
        )}
      >
        {player.username?.[0]?.toUpperCase()}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'font-ui text-[14px] font-medium truncate',
              isMe ? 'text-gold-bright' : 'text-bone'
            )}
          >
            {player.username}
            {isMe && <span className="text-bone-dim font-normal"> · you</span>}
          </span>
          {isCurrentTurn && <Badge variant="gold">Turn</Badge>}
          {moon && <Badge variant="gold">Moon</Badge>}
          {done && !moon && <Badge>Done</Badge>}
          {showReady && isReady && <Badge variant="success">Ready</Badge>}
        </div>
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone-faint mt-1">
          {rollsUsed}/{MAX_ROLLS} rolls · {setAside.length}/{HAND_SIZE} locked
        </div>
      </div>

      <div className="hidden md:block">
        <LockedRow dice={setAside} size={28} />
      </div>

      <div className="w-14 text-right">
        <ScoreDisplay
          score={score}
          tone={done ? (moon ? 'win' : 'neutral') : 'dim'}
          size="md"
        />
      </div>
    </motion.div>
  );
}

function WaitingPanel({ isReady, count, readyCount, onReady }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface px-6 py-5 flex items-center justify-between"
    >
      <div>
        <Eyebrow>{isReady ? 'Standing By' : 'When you’re ready'}</Eyebrow>
        <div className="font-display text-bone text-2xl mt-1" style={{ letterSpacing: '-0.01em' }}>
          {isReady
            ? `Waiting on ${Math.max(0, count - readyCount)} more`
            : count < 2
              ? 'Waiting for the table to fill'
              : 'Ante up and play'}
        </div>
      </div>
      {!isReady && (
        <Button onClick={onReady} pulse size="lg">
          Ready
        </Button>
      )}
    </motion.div>
  );
}

function Spectator() {
  return (
    <div className="surface px-6 py-5 text-center">
      <Eyebrow>Spectating</Eyebrow>
      <div className="font-display text-bone-dim text-xl mt-1">
        You’re out — tie replay in progress.
      </div>
    </div>
  );
}

function ActionPanel({
  isMyTurn,
  myState,
  turnPlayerName,
  picked,
  togglePick,
  onRoll,
  onConfirm,
  isRolling,
}) {
  const currentRoll = myState?.currentRoll;
  const setAsideCount = myState?.setAside?.length ?? 0;
  const rollsUsed = myState?.rollsUsed ?? 0;
  const canRoll = isMyTurn && !currentRoll && setAsideCount < HAND_SIZE && rollsUsed < MAX_ROLLS;
  const canConfirm = isMyTurn && currentRoll && picked.length > 0;

  if (!isMyTurn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface px-6 py-5 flex items-center justify-between"
      >
        <div>
          <Eyebrow>Waiting on</Eyebrow>
          <div className="font-display text-bone text-2xl mt-1">{turnPlayerName}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-bright animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 240 }}
      className="surface px-6 pt-5 pb-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <Eyebrow>Your Turn</Eyebrow>
          <div className="font-display text-bone text-xl mt-1" style={{ letterSpacing: '-0.01em' }}>
            {currentRoll ? 'Tap dice to keep — minimum one' : rollsUsed === 0 ? 'Roll all five' : 'Roll your remaining dice'}
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-dim text-right">
          <div>{rollsUsed}/{MAX_ROLLS} rolls</div>
          <div>{setAsideCount}/{HAND_SIZE} locked</div>
        </div>
      </div>

      {currentRoll && (
        <div className="flex justify-center gap-2.5 mb-5">
          {currentRoll.map((d, i) => (
            <Die
              key={i}
              value={d}
              rolling={isRolling}
              delay={i * 60}
              size={56}
              selected={picked.includes(i)}
              onClick={() => togglePick(i)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3">
        {canRoll && (
          <Button onClick={onRoll} loading={isRolling} size="lg">
            {rollsUsed === 0 ? 'Roll Five Dice' : `Roll ${HAND_SIZE - setAsideCount}`}
          </Button>
        )}
        {canConfirm && (
          <Button onClick={onConfirm} size="lg">
            Set Aside {picked.length}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function GameOver({ data, userId, onLeave }) {
  const youWon = data.winnerId === userId;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md px-4"
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
        className="surface px-10 py-12 max-w-md w-full text-center relative overflow-hidden"
      >
        <div className="absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,208,106,0.18),transparent_70%)] pointer-events-none" />

        <Eyebrow>{youWon ? 'Won' : 'Hand Over'}</Eyebrow>
        <h2
          className="font-display mt-3 mb-1"
          style={{
            fontSize: 56,
            lineHeight: 1,
            color: youWon ? 'var(--gold-bright)' : 'var(--bone)',
            letterSpacing: '-0.02em',
          }}
        >
          {youWon ? 'YOU TAKE IT' : 'NEXT TIME'}
        </h2>
        <p className="font-ui text-[14px] text-bone-dim mt-2">
          {data.winnerUsername || '—'} {youWon ? 'walks with' : 'takes'} the pot
        </p>

        <div className="my-8">
          <div className="font-display gold-text" style={{ fontSize: 48, lineHeight: 1 }}>
            {formatMoney(data.payoutCents)}
          </div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint mt-2">
            Pot {formatMoney(data.potCents)} · Rake {formatMoney(data.rakeCents)}
          </div>
        </div>

        <Button onClick={onLeave} size="lg" className="w-full">
          Back to Lobby
        </Button>
      </motion.div>
    </motion.div>
  );
}
