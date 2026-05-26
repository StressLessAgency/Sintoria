import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';
import { formatMoney, cn } from '../lib/utils';
import { Button, Badge } from '../components/ui/index';
import { DiceRow, ScoreDisplay } from '../components/dice/index';
import { GameTable, RoundTimer, ChatPanel } from '../components/table/index';
import { BalanceDisplay } from '../components/wallet/index';
import { useWalletStore } from '../store/walletStore';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const userId = useAuthStore(s => s.user?.id);
  const balance = useWalletStore(s => s.balanceCents);
  const {
    room, players, readyPlayers, status, currentRound,
    rolls, scores, losers, eliminatedPlayers, potCents,
    myDice, myScore, roundResult, gameOverData, phase, chatMessages,
  } = useGameStore();

  const { rollDice, rerollDice, skipReroll, readyUp, sendChat } = useGame(roomId);
  const [isRolling, setIsRolling] = useState(false);

  const isReady = readyPlayers?.includes(userId);
  const hasRolled = !!rolls[userId];
  const isEliminated = eliminatedPlayers?.includes(userId);
  const isLoser = losers?.includes(userId);
  const myPlayer = players.find(p => p.userId === userId);
  const winners = roundResult ? Object.keys(roundResult.payouts || {}) : [];

  const handleRoll = () => {
    if (hasRolled || isEliminated) return;
    setIsRolling(true);
    rollDice();
    setTimeout(() => setIsRolling(false), 1000);
  };

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
      {/* Top bar */}
      <header className="border-b border-gold/5 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/lobby" className="text-txt-muted hover:text-gold transition-colors text-sm">
            &larr; Lobby
          </Link>
          <span className="text-gold/20">|</span>
          <span className="font-body text-sm text-txt-primary">{room.name}</span>
          <Badge variant={room.mode === 'ELIMINATION' ? 'gold' : 'default'} className="text-[10px]">
            {room.mode === 'ELIMINATION' ? 'ELIMINATION' : 'SINGLE'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <BalanceDisplay balanceCents={balance} compact />
          <span className="font-mono text-xs text-txt-faint">
            Round {currentRound || '-'}
          </span>
        </div>
      </header>

      {/* Game area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Table */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <GameTable
            players={players}
            currentUserId={userId}
            readyPlayers={readyPlayers}
            eliminatedPlayers={eliminatedPlayers}
            rolls={rolls}
            scores={scores}
            losers={losers}
            winners={winners}
            potCents={potCents || (room.wagerCents * players.length)}
            wagerCents={room.wagerCents}
            phase={phase}
          />

          {/* My dice row (larger) */}
          {phase !== 'WAITING' && !isEliminated && (
            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DiceRow dice={myDice} isRolling={isRolling} size={56} />
              {myScore != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-txt-muted font-mono">YOUR SCORE:</span>
                  <ScoreDisplay score={myScore} isLoser={isLoser} isWinner={winners.includes(userId)} animate />
                </div>
              )}
            </motion.div>
          )}

          {/* Timer */}
          {(phase === 'ROLLING' || phase === 'REROLL') && (
            <div className="w-full max-w-md mt-4">
              <RoundTimer
                key={`${currentRound}-${phase}`}
                timeoutMs={(parseInt(import.meta.env.VITE_AFK_TIMEOUT || '30')) * 1000}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {phase === 'WAITING' && !isReady && players.length >= 1 && (
              <Button variant="primary" onClick={readyUp} className="px-12 py-4 text-lg">
                Ready Up
              </Button>
            )}
            {phase === 'WAITING' && isReady && (
              <div className="flex flex-col items-center gap-2">
                <Badge variant="success">READY</Badge>
                <span className="text-xs text-txt-muted font-mono">
                  Waiting for {players.length - readyPlayers.length} more...
                </span>
              </div>
            )}
            {phase === 'WAITING' && players.length < 2 && (
              <p className="text-txt-muted text-sm font-body">Waiting for more players to join...</p>
            )}

            {phase === 'ROLLING' && !hasRolled && !isEliminated && (
              <Button variant="primary" onClick={handleRoll} className="px-12 py-4 text-lg" loading={isRolling}>
                Roll Dice
              </Button>
            )}
            {phase === 'ROLLING' && hasRolled && (
              <span className="text-xs text-txt-muted font-mono">Waiting for other players...</span>
            )}

            {phase === 'REROLL' && !isEliminated && (
              <div className="flex gap-3">
                <Button variant="primary" onClick={rerollDice}>
                  Reroll (keep 3s)
                </Button>
                <Button variant="ghost" onClick={skipReroll}>
                  Keep Roll
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* Room info */}
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
              <span className="text-txt-muted">Reroll</span>
              <span className="font-mono">{room.rerollEnabled ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Players list */}
          <div className="card">
            <h3 className="text-xs font-mono text-txt-muted uppercase tracking-widest mb-3">Players</h3>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.userId} className={cn(
                  'flex items-center justify-between py-1.5',
                  eliminatedPlayers.includes(p.userId) && 'opacity-40',
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-6 h-6 rounded-full border text-[10px] flex items-center justify-center font-mono',
                      p.userId === userId ? 'border-gold text-gold' : 'border-txt-faint text-txt-muted'
                    )}>
                      {p.username?.[0]?.toUpperCase()}
                    </div>
                    <span className={cn(
                      'text-sm font-mono truncate max-w-[100px]',
                      p.userId === userId && 'text-gold'
                    )}>
                      {p.username}
                    </span>
                  </div>
                  {scores[p.userId] != null && (
                    <span className={cn(
                      'font-mono text-sm',
                      losers.includes(p.userId) ? 'text-loss' : 'text-txt-primary'
                    )}>
                      {scores[p.userId]}
                    </span>
                  )}
                  {readyPlayers.includes(p.userId) && phase === 'WAITING' && (
                    <Badge variant="success" className="text-[8px]">RDY</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-[200px]">
            <ChatPanel messages={chatMessages} onSend={sendChat} />
          </div>
        </div>
      </main>

      {/* Round result overlay */}
      <AnimatePresence>
        {roundResult && phase === 'RESULT' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-elevated border border-gold/15 p-8 max-w-md w-full mx-4 text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {isLoser ? (
                <>
                  <motion.div
                    className="text-5xl mb-4"
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    &#128128;
                  </motion.div>
                  <h2 className="font-display text-2xl text-loss mb-2">You Lost</h2>
                  <p className="text-txt-muted text-sm mb-4">
                    Score: {myScore} &middot; Lost {formatMoney(room.wagerCents)}
                  </p>
                </>
              ) : (
                <>
                  <motion.div
                    className="text-5xl mb-4"
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    &#127942;
                  </motion.div>
                  <h2 className="font-display text-2xl text-gold-bright mb-2">You Won</h2>
                  <p className="text-txt-muted text-sm mb-2">Score: {myScore}</p>
                  <p className="font-mono text-3xl text-gold-bright gold-glow inline-block px-4 py-2">
                    +{formatMoney(roundResult.payouts?.[userId] - room.wagerCents || 0)}
                  </p>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-gold/10 text-xs text-txt-faint font-mono">
                Pot: {formatMoney(roundResult.potCents)} &middot; Rake: {formatMoney(roundResult.rakeCents)}
              </div>

              {phase === 'RESULT' && room.mode !== 'ELIMINATION' && (
                <Button variant="ghost" className="mt-6" onClick={() => navigate('/lobby')}>
                  Back to Lobby
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over overlay */}
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
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {gameOverData.winnerId === userId ? '&#127942;' : '&#127922;'}
              </motion.div>
              <h2 className="font-display text-3xl text-gold-bright mb-3">
                {gameOverData.winnerId === userId ? 'VICTORY' : 'GAME OVER'}
              </h2>
              <p className="text-txt-muted font-body mb-2">
                {gameOverData.winnerUsername} wins the game
              </p>
              <p className="font-mono text-2xl text-gold-bright">
                {formatMoney(gameOverData.finalPot)}
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
