import { rollDice, rerollDice, scoreRoll, resolveRound, calculatePayout, isAllThrees } from '../game/engine.js';
import { getRoomState, updateRoomState, deleteRoomState } from '../game/roomManager.js';
import { creditPayout, refundWager, getBalance, recordRake } from '../services/ledger.js';
import { checkSocketRateLimit } from '../middleware/rateLimit.js';
import { prisma } from '../app.js';

export function setupGameHandlers(io, socket) {
  // Roll dice
  socket.on('roll_dice', async ({ roomId }) => {
    try {
      // Rate limit
      const allowed = await checkSocketRateLimit(socket.userId, 'roll', 1, 2);
      if (!allowed) return socket.emit('error', { code: 'RATE_LIMITED', message: 'Too fast' });

      const state = await getRoomState(roomId);
      if (!state) return socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      if (state.status !== 'IN_PROGRESS') return;

      // Check player is in room and active
      const player = state.players.find(p => p.userId === socket.userId);
      if (!player) return;
      if (state.eliminatedPlayers.includes(socket.userId)) return;

      // Check hasn't already rolled this round
      if (state.rolls[socket.userId]) {
        return socket.emit('error', { code: 'ALREADY_ROLLED', message: 'Already rolled this round' });
      }

      // Generate roll server-side
      const dice = rollDice(6);
      const score = scoreRoll(dice);
      const eliminated = isAllThrees(dice);

      // Store roll
      const rolls = { ...state.rolls, [socket.userId]: dice };
      await updateRoomState(roomId, { rolls });

      // Broadcast to all players in room
      io.to(`room:${roomId}`).emit('dice_rolled', {
        playerId: socket.userId,
        username: socket.username,
        dice,
        score,
        eliminated,
      });

      // Check if all active players have rolled
      const activePlayers = state.players.filter(
        p => !state.eliminatedPlayers.includes(p.userId)
      );
      const allRolled = activePlayers.every(p => rolls[p.userId]);

      if (allRolled) {
        // If reroll is enabled, wait for rerolls
        if (state.rerollEnabled && !state.rerollPhase) {
          await updateRoomState(roomId, { rerollPhase: 'true' });
          io.to(`room:${roomId}`).emit('reroll_phase', {
            timeoutMs: (parseInt(process.env.AFK_TIMEOUT_SECONDS) || 30) * 1000,
          });

          // Auto-resolve after timeout
          setTimeout(async () => {
            const currentState = await getRoomState(roomId);
            if (currentState && currentState.rerollPhase === 'true') {
              await resolveAndBroadcast(io, roomId);
            }
          }, (parseInt(process.env.AFK_TIMEOUT_SECONDS) || 30) * 1000);
        } else if (!state.rerollEnabled) {
          // Resolve immediately
          await resolveAndBroadcast(io, roomId);
        }
      }
    } catch (err) {
      console.error('Roll dice error:', err);
      socket.emit('error', { code: 'ROLL_FAILED', message: 'Roll failed' });
    }
  });

  // Reroll dice (if enabled)
  socket.on('reroll_dice', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state || !state.rerollEnabled) return;
      if (state.rerollPhase !== 'true') return;

      if (state.hasRerolled.includes(socket.userId)) {
        return socket.emit('error', { code: 'ALREADY_REROLLED', message: 'Already used reroll' });
      }

      const originalDice = state.rolls[socket.userId];
      if (!originalDice) return;

      // Reroll non-3 dice
      const newDice = rerollDice(originalDice);
      const score = scoreRoll(newDice);

      // Update state
      const rerolls = { ...state.rerolls, [socket.userId]: newDice };
      const hasRerolled = [...state.hasRerolled, socket.userId];

      // Update rolls with new dice
      const rolls = { ...state.rolls, [socket.userId]: newDice };

      await updateRoomState(roomId, { rolls, rerolls, hasRerolled });

      io.to(`room:${roomId}`).emit('reroll_result', {
        playerId: socket.userId,
        username: socket.username,
        dice: newDice,
        score,
        originalDice,
      });

      // Check if all active players have made their reroll decision
      const activePlayers = state.players.filter(
        p => !state.eliminatedPlayers.includes(p.userId)
      );
      const allDecided = activePlayers.every(
        p => hasRerolled.includes(p.userId) || state.hasRerolled.includes(p.userId)
      );

      // We don't force rerolls — just wait for timeout or explicit skip
    } catch (err) {
      console.error('Reroll error:', err);
    }
  });

  // Skip reroll
  socket.on('skip_reroll', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state || state.rerollPhase !== 'true') return;

      const hasRerolled = [...state.hasRerolled, socket.userId];
      await updateRoomState(roomId, { hasRerolled });

      // Check if everyone has decided
      const activePlayers = state.players.filter(
        p => !state.eliminatedPlayers.includes(p.userId)
      );
      const allDecided = activePlayers.every(p => hasRerolled.includes(p.userId));

      if (allDecided) {
        await resolveAndBroadcast(io, roomId);
      }
    } catch (err) {
      console.error('Skip reroll error:', err);
    }
  });
}

async function resolveAndBroadcast(io, roomId) {
  const state = await getRoomState(roomId);
  if (!state) return;

  // Prevent double resolution
  if (state.resolving === 'true') return;
  await updateRoomState(roomId, { resolving: 'true', rerollPhase: 'false' });

  try {
    // Build final rolls (only active players)
    const activeRolls = {};
    const activePlayers = state.players.filter(
      p => !state.eliminatedPlayers.includes(p.userId)
    );

    for (const player of activePlayers) {
      if (state.rolls[player.userId]) {
        activeRolls[player.userId] = state.rolls[player.userId];
      }
    }

    if (Object.keys(activeRolls).length < 2) {
      // Not enough players — end game
      await endGame(io, roomId, state);
      return;
    }

    // Resolve round
    const result = resolveRound(activeRolls);
    const payout = calculatePayout(
      state.wagerCents,
      activePlayers.length,
      result.losers.length
    );

    // Process payouts
    const payouts = {};
    const winners = activePlayers
      .filter(p => !result.losers.includes(p.userId))
      .map(p => p.userId);

    for (const winnerId of winners) {
      try {
        await creditPayout(winnerId, payout.returnPerWinner, state.currentRoundId);
        payouts[winnerId] = payout.returnPerWinner;

        // Update participant stats
        await prisma.gameParticipant.updateMany({
          where: { roomId, userId: winnerId },
          data: { totalWon: { increment: payout.payoutPerWinner } },
        });
      } catch (err) {
        console.error(`Payout failed for ${winnerId}:`, err);
      }
    }

    // Record rake
    if (payout.rake > 0) {
      await recordRake(payout.rake, state.currentRoundId);
    }

    // Update loser stats
    for (const loserId of result.losers) {
      await prisma.gameParticipant.updateMany({
        where: { roomId, userId: loserId },
        data: {
          totalLost: { increment: state.wagerCents },
          isActive: state.mode === 'ELIMINATION' ? false : undefined,
        },
      }).catch(() => {});
    }

    // Update round in DB
    await prisma.gameRound.update({
      where: { id: state.currentRoundId },
      data: {
        rolls: state.rolls,
        rerolls: Object.keys(state.rerolls).length > 0 ? state.rerolls : undefined,
        scores: result.scores,
        losers: result.losers,
        potCents: payout.totalPot,
        rakeCents: payout.rake,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Broadcast round result
    io.to(`room:${roomId}`).emit('round_result', {
      scores: result.scores,
      losers: result.losers,
      winners,
      potCents: payout.totalPot,
      rakeCents: payout.rake,
      payouts,
      payoutPerWinner: payout.returnPerWinner,
    });

    // Send wallet updates
    for (const player of state.players) {
      const balance = await getBalance(player.userId);
      io.to(`user:${player.userId}`).emit('wallet_updated', {
        newBalanceCents: balance,
      });
    }

    // Determine next action based on game mode
    if (state.mode === 'ELIMINATION') {
      // Update eliminated list
      const newEliminated = [...new Set([...state.eliminatedPlayers, ...result.losers])];
      await updateRoomState(roomId, { eliminatedPlayers: newEliminated });

      // Notify eliminations
      for (const loserId of result.losers) {
        io.to(`room:${roomId}`).emit('player_eliminated', {
          playerId: loserId,
        });
      }

      // Check if game is over (1 or fewer active players)
      const remainingPlayers = state.players.filter(
        p => !newEliminated.includes(p.userId)
      );

      if (remainingPlayers.length <= 1) {
        await endGame(io, roomId, { ...state, eliminatedPlayers: newEliminated });
      } else {
        // Start next round after delay
        setTimeout(async () => {
          await startNextRound(io, roomId);
        }, 5000);
      }
    } else {
      // Single round — game over
      await endGame(io, roomId, state);
    }
  } catch (err) {
    console.error('Resolve error:', err);
    await updateRoomState(roomId, { resolving: 'false' });
  }
}

async function startNextRound(io, roomId) {
  const state = await getRoomState(roomId);
  if (!state) return;

  const nextRoundNumber = state.currentRound + 1;

  // Debit wagers from remaining players
  const activePlayers = state.players.filter(
    p => !state.eliminatedPlayers.includes(p.userId)
  );

  for (const player of activePlayers) {
    try {
      await (await import('../services/ledger.js')).debitWager(player.userId, state.wagerCents, roomId);
    } catch (err) {
      // Player can't cover — eliminate them
      const newEliminated = [...state.eliminatedPlayers, player.userId];
      await updateRoomState(roomId, { eliminatedPlayers: newEliminated });
      io.to(`room:${roomId}`).emit('player_eliminated', { playerId: player.userId });
    }
  }

  const round = await prisma.gameRound.create({
    data: {
      roomId,
      roundNumber: nextRoundNumber,
      status: 'ROLLING',
    },
  });

  await updateRoomState(roomId, {
    currentRound: nextRoundNumber,
    currentRoundId: round.id,
    rolls: {},
    rerolls: {},
    hasRerolled: [],
    resolving: 'false',
    rerollPhase: 'false',
  });

  io.to(`room:${roomId}`).emit('round_started', {
    roundId: round.id,
    roundNumber: nextRoundNumber,
    timeoutMs: (parseInt(process.env.AFK_TIMEOUT_SECONDS) || 30) * 1000,
  });

  // Send wallet updates
  for (const player of activePlayers) {
    const balance = await getBalance(player.userId);
    io.to(`user:${player.userId}`).emit('wallet_updated', {
      newBalanceCents: balance,
    });
  }
}

async function endGame(io, roomId, state) {
  // Find winner (last active player in elimination, or non-losers in single round)
  const activePlayers = state.players.filter(
    p => !state.eliminatedPlayers.includes(p.userId)
  );

  const winnerId = activePlayers[0]?.userId || null;

  // Update room status
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'COMPLETED' },
  });

  await updateRoomState(roomId, { status: 'COMPLETED' });

  io.to(`room:${roomId}`).emit('game_over', {
    winnerId,
    winnerUsername: activePlayers[0]?.username,
    finalPot: state.wagerCents * state.players.length,
  });

  // Clean up Redis state after a delay
  setTimeout(async () => {
    await deleteRoomState(roomId);
  }, 60000); // Keep state for 1 min for reconnects
}
