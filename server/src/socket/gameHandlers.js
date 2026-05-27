import {
  rollDice,
  scoreSetAside,
  isShootingTheMoon,
  isPlayerDone,
  diceRemaining,
  calculatePayout,
  resolveScores,
  validateSetAside,
  HAND_SIZE,
  MAX_ROLLS,
} from '../game/engine.js';
import {
  getRoomState,
  updateRoomState,
  deleteRoomState,
  initialPlayerState,
  buildTurnOrder,
  allPlayersDone,
} from '../game/roomManager.js';
import { creditPayout, debitWager, recordRake, getBalance } from '../services/ledger.js';
import { checkSocketRateLimit } from '../middleware/rateLimit.js';
import { prisma } from '../app.js';

export function setupGameHandlers(io, socket) {
  // Leader presses "Deal Hand" — gated start.
  socket.on('leader_deal', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) return socket.emit('error', { code: 'ROOM_NOT_FOUND' });

      const leaderId = state.tableLeaderId || state.hostId;
      if (socket.userId !== leaderId) {
        return socket.emit('error', { code: 'NOT_TABLE_LEADER', message: 'Only the table leader can deal.' });
      }

      // Allow deal from WAITING (first hand) or COMPLETED (next hand).
      if (state.status === 'IN_PROGRESS') {
        return socket.emit('error', { code: 'HAND_IN_PROGRESS', message: 'A hand is already in progress.' });
      }

      // Leader must be seated.
      const leaderSeated = state.players.some((p) => p.userId === leaderId);
      if (!leaderSeated) {
        return socket.emit('error', { code: 'LEADER_NOT_SEATED', message: 'Leader must be seated to deal.' });
      }

      // Need at least two ready players (the leader counts if ready).
      const readyCount = state.readyPlayers.length;
      if (readyCount < 2) {
        return socket.emit('error', {
          code: 'NOT_ENOUGH_READY',
          message: 'Need at least two ready players to deal.',
        });
      }

      // Trim players list to those who are ready so unready players sit out.
      if (readyCount < state.players.length) {
        const stayingPlayers = state.players.filter((p) => state.readyPlayers.includes(p.userId));
        await updateRoomState(roomId, { players: stayingPlayers });
      }

      await startGame(io, roomId);
    } catch (err) {
      console.error('leader_deal error:', err);
      socket.emit('error', { code: 'DEAL_FAILED', message: 'Failed to deal hand.' });
    }
  });

  socket.on('roll_dice', async ({ roomId }) => {
    try {
      const allowed = await checkSocketRateLimit(socket.userId, 'roll', 1, 1);
      if (!allowed) return socket.emit('error', { code: 'RATE_LIMITED', message: 'Too fast' });

      const state = await getRoomState(roomId);
      if (!state) return socket.emit('error', { code: 'ROOM_NOT_FOUND' });
      if (state.status !== 'IN_PROGRESS') return;

      const currentId = state.turnOrder[state.turnIndex];
      if (currentId !== socket.userId) {
        return socket.emit('error', { code: 'NOT_YOUR_TURN' });
      }

      const ps = state.playerState[socket.userId];
      if (!ps || ps.done) return socket.emit('error', { code: 'ALREADY_DONE' });
      if (ps.currentRoll && ps.currentRoll.length > 0) {
        return socket.emit('error', { code: 'MUST_SET_ASIDE_FIRST' });
      }
      if (ps.rollsUsed >= MAX_ROLLS) {
        return socket.emit('error', { code: 'NO_ROLLS_LEFT' });
      }

      const toRoll = diceRemaining(ps);
      if (toRoll <= 0) return socket.emit('error', { code: 'NO_DICE_LEFT' });

      const dice = rollDice(toRoll);
      ps.currentRoll = dice;
      ps.rollsUsed += 1;

      const moon = isShootingTheMoon(dice);
      if (moon) {
        ps.shotTheMoon = true;
        ps.setAside = [...ps.setAside, ...dice];
        ps.currentRoll = null;
        ps.done = true;
        ps.score = scoreSetAside(ps.setAside);
      }

      const playerState = { ...state.playerState, [socket.userId]: ps };
      await updateRoomState(roomId, { playerState });

      io.to(`room:${roomId}`).emit('dice_rolled', {
        playerId: socket.userId,
        username: socket.username,
        dice,
        rollsUsed: ps.rollsUsed,
        shotTheMoon: moon,
      });

      if (moon) {
        await endGame(io, roomId, socket.userId);
      }
    } catch (err) {
      console.error('roll_dice error:', err);
      socket.emit('error', { code: 'ROLL_FAILED', message: 'Roll failed' });
    }
  });

  socket.on('set_aside', async ({ roomId, indices }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) return socket.emit('error', { code: 'ROOM_NOT_FOUND' });
      if (state.status !== 'IN_PROGRESS') return;

      const currentId = state.turnOrder[state.turnIndex];
      if (currentId !== socket.userId) {
        return socket.emit('error', { code: 'NOT_YOUR_TURN' });
      }

      const ps = state.playerState[socket.userId];
      if (!ps || ps.done) return socket.emit('error', { code: 'ALREADY_DONE' });
      if (!ps.currentRoll || ps.currentRoll.length === 0) {
        return socket.emit('error', { code: 'NO_DICE_TO_SET_ASIDE' });
      }

      const check = validateSetAside(ps.currentRoll, indices);
      if (!check.valid) {
        return socket.emit('error', { code: 'INVALID_SET_ASIDE', message: check.error });
      }

      const kept = [];
      const remaining = [];
      for (let i = 0; i < ps.currentRoll.length; i++) {
        if (indices.includes(i)) kept.push(ps.currentRoll[i]);
        else remaining.push(ps.currentRoll[i]);
      }

      ps.setAside = [...ps.setAside, ...kept];
      ps.currentRoll = null;
      ps.score = scoreSetAside(ps.setAside);

      const forcedDoneByRolls = ps.rollsUsed >= MAX_ROLLS && remaining.length === 0;
      if (isPlayerDone(ps) || forcedDoneByRolls) {
        ps.done = true;
      }

      const playerState = { ...state.playerState, [socket.userId]: ps };

      io.to(`room:${roomId}`).emit('dice_set_aside', {
        playerId: socket.userId,
        username: socket.username,
        setAside: ps.setAside,
        score: ps.score,
        done: ps.done,
      });

      let turnIndex = state.turnIndex;
      if (ps.done) {
        turnIndex = nextActiveTurn(state.turnOrder, playerState, state.turnIndex);
      }
      await updateRoomState(roomId, { playerState, turnIndex });

      if (allPlayersDone(state.turnOrder, playerState)) {
        await resolveGame(io, roomId);
      } else if (ps.done) {
        io.to(`room:${roomId}`).emit('turn_changed', {
          currentPlayerId: state.turnOrder[turnIndex],
        });
      }
    } catch (err) {
      console.error('set_aside error:', err);
      socket.emit('error', { code: 'SET_ASIDE_FAILED' });
    }
  });
}

function nextActiveTurn(turnOrder, playerState, startIdx) {
  for (let step = 1; step <= turnOrder.length; step++) {
    const idx = (startIdx + step) % turnOrder.length;
    if (!playerState[turnOrder[idx]]?.done) return idx;
  }
  return startIdx;
}

/**
 * Called by the table leader's "Deal Hand" socket event. Debits wagers,
 * initializes per-player state, builds turn order, broadcasts game_started.
 * Accepts WAITING (first hand) or COMPLETED (next hand) state.
 */
export async function startGame(io, roomId) {
  const state = await getRoomState(roomId);
  if (!state) return;
  if (state.status === 'IN_PROGRESS') return;

  const playerIds = state.players.map((p) => p.userId);
  const debited = [];

  for (const id of playerIds) {
    try {
      await debitWager(id, state.wagerCents, roomId);
      debited.push(id);
    } catch (err) {
      for (const refundId of debited) {
        try {
          await debitWager(refundId, -state.wagerCents, roomId);
        } catch {
          // best-effort refund
        }
      }
      io.to(`room:${roomId}`).emit('game_start_failed', {
        reason: 'INSUFFICIENT_FUNDS',
        playerId: id,
      });
      return;
    }
  }

  const firstId = state.lastWinnerId || state.hostId || playerIds[0];
  const turnOrder = buildTurnOrder(playerIds, firstId);
  const playerState = initialPlayerState(playerIds);
  const potCents = state.wagerCents * playerIds.length;

  const round = await prisma.gameRound.create({
    data: {
      roomId,
      roundNumber: state.currentRound + 1,
      status: 'ROLLING',
      potCents,
    },
  });

  await updateRoomState(roomId, {
    status: 'IN_PROGRESS',
    phase: 'PLAYING',
    turnOrder,
    turnIndex: 0,
    playerState,
    potCents,
    currentRound: state.currentRound + 1,
    currentRoundId: round.id,
    tieReplayPlayerIds: [],
  });

  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'IN_PROGRESS' },
  });

  io.to(`room:${roomId}`).emit('game_started', {
    turnOrder,
    currentPlayerId: turnOrder[0],
    potCents,
    handSize: HAND_SIZE,
    maxRolls: MAX_ROLLS,
  });

  for (const player of state.players) {
    const balance = await getBalance(player.userId);
    io.to(`user:${player.userId}`).emit('wallet_updated', { newBalanceCents: balance });
  }
}

/**
 * After all players are done, find the lowest score. One winner → pay out
 * and end. Multiple winners → tied players re-ante and play another hand.
 */
async function resolveGame(io, roomId) {
  const state = await getRoomState(roomId);
  if (!state) return;

  const activeIds = state.tieReplayPlayerIds.length > 0
    ? state.tieReplayPlayerIds
    : state.turnOrder;

  const playerScores = activeIds.map((id) => ({
    userId: id,
    score: state.playerState[id]?.score ?? 0,
  }));

  const { winners, minScore } = resolveScores(playerScores);

  io.to(`room:${roomId}`).emit('round_result', {
    scores: Object.fromEntries(playerScores.map((p) => [p.userId, p.score])),
    minScore,
    winners,
  });

  if (winners.length === 1) {
    await endGame(io, roomId, winners[0]);
    return;
  }

  await startTieReplay(io, roomId, winners);
}

/**
 * Tied players each ante one more wager unit. The pot grows. Only tied
 * players play the next hand; non-tied players are out.
 */
async function startTieReplay(io, roomId, tiedIds) {
  const state = await getRoomState(roomId);
  if (!state) return;

  let extraPot = 0;
  const stillIn = [];
  for (const id of tiedIds) {
    try {
      await debitWager(id, state.wagerCents, roomId);
      extraPot += state.wagerCents;
      stillIn.push(id);
    } catch (err) {
      io.to(`room:${roomId}`).emit('tie_replay_drop', { playerId: id, reason: 'INSUFFICIENT_FUNDS' });
    }
  }

  if (stillIn.length <= 1) {
    if (stillIn.length === 1) {
      await updateRoomState(roomId, { potCents: state.potCents + extraPot });
      await endGame(io, roomId, stillIn[0]);
    } else {
      await endGame(io, roomId, null);
    }
    return;
  }

  const playerState = { ...state.playerState };
  for (const id of stillIn) {
    playerState[id] = {
      setAside: [],
      currentRoll: null,
      rollsUsed: 0,
      score: 0,
      done: false,
      shotTheMoon: false,
    };
  }
  for (const id of state.turnOrder) {
    if (!stillIn.includes(id)) {
      playerState[id] = { ...playerState[id], done: true };
    }
  }

  const turnOrder = buildTurnOrder(stillIn, stillIn[0]);

  await updateRoomState(roomId, {
    playerState,
    turnOrder,
    turnIndex: 0,
    potCents: state.potCents + extraPot,
    tieReplayPlayerIds: stillIn,
  });

  io.to(`room:${roomId}`).emit('tie_replay', {
    tiedPlayerIds: stillIn,
    newPotCents: state.potCents + extraPot,
    currentPlayerId: turnOrder[0],
  });

  for (const id of stillIn) {
    const balance = await getBalance(id);
    io.to(`user:${id}`).emit('wallet_updated', { newBalanceCents: balance });
  }
}

async function endGame(io, roomId, winnerId) {
  const state = await getRoomState(roomId);
  if (!state) return;

  const payout = calculatePayout(state.potCents);

  if (winnerId) {
    try {
      await creditPayout(winnerId, payout.winnerCents, state.currentRoundId);
      await prisma.gameParticipant.updateMany({
        where: { roomId, userId: winnerId },
        data: { totalWon: { increment: payout.winnerCents - state.wagerCents } },
      });
    } catch (err) {
      console.error('Payout failed:', err);
    }
  }

  if (payout.rakeCents > 0 && winnerId) {
    await recordRake(payout.rakeCents, state.currentRoundId);
  }

  for (const player of state.players) {
    if (player.userId !== winnerId) {
      await prisma.gameParticipant.updateMany({
        where: { roomId, userId: player.userId },
        data: { totalLost: { increment: state.wagerCents } },
      }).catch(() => {});
    }
  }

  // Persist a rich snapshot of every player's final state for the admin Games audit.
  const finalState = {
    winnerId,
    winnerUsername: state.players.find((p) => p.userId === winnerId)?.username || null,
    potCents: state.potCents,
    payoutCents: payout.winnerCents,
    rakeCents: payout.rakeCents,
    players: state.turnOrder.map((id) => {
      const ps = state.playerState[id] || {};
      const player = state.players.find((p) => p.userId === id);
      return {
        userId: id,
        username: player?.username || null,
        setAside: ps.setAside || [],
        rollsUsed: ps.rollsUsed || 0,
        score: ps.score ?? null,
        done: !!ps.done,
        shotTheMoon: !!ps.shotTheMoon,
        wasWinner: id === winnerId,
      };
    }),
  };

  if (state.currentRoundId) {
    await prisma.gameRound.update({
      where: { id: state.currentRoundId },
      data: {
        rolls: state.playerState,
        scores: Object.fromEntries(
          Object.entries(state.playerState).map(([id, ps]) => [id, ps.score])
        ),
        losers: state.turnOrder.filter((id) => id !== winnerId),
        finalState,
        potCents: state.potCents,
        rakeCents: payout.rakeCents,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    }).catch(() => {});
  }

  // Reset the room back to WAITING so the leader can deal another hand.
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'WAITING' },
  }).catch(() => {});

  await updateRoomState(roomId, {
    status: 'WAITING',
    phase: 'WAITING',
    lastWinnerId: winnerId || '',
    readyPlayers: [],
    turnOrder: [],
    turnIndex: 0,
    playerState: {},
    potCents: 0,
    tieReplayPlayerIds: [],
  });

  io.to(`room:${roomId}`).emit('game_over', {
    winnerId,
    winnerUsername: state.players.find((p) => p.userId === winnerId)?.username,
    potCents: state.potCents,
    rakeCents: payout.rakeCents,
    payoutCents: payout.winnerCents,
    finalState,
  });

  for (const player of state.players) {
    const balance = await getBalance(player.userId);
    io.to(`user:${player.userId}`).emit('wallet_updated', { newBalanceCents: balance });
  }
  // Room stays alive so the leader can deal the next hand. It will expire
  // via Redis TTL or be cancelled when the last player leaves.
}
