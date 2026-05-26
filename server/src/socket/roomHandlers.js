import {
  getRoomState, addPlayerToRoom, removePlayerFromRoom,
  setPlayerReady, updateRoomState, deleteRoomState,
} from '../game/roomManager.js';
import { debitWager, refundWager, getBalance } from '../services/ledger.js';
import { prisma } from '../app.js';

export function setupRoomHandlers(io, socket) {
  // Join room
  socket.on('join_room', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) {
        return socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      }

      // Check if already in room
      if (state.players.find(p => p.userId === socket.userId)) {
        // Rejoin — just send state
        socket.join(`room:${roomId}`);
        socket.currentRoomId = roomId;
        socket.emit('room_state', await buildRoomStatePayload(roomId));
        return;
      }

      // Check balance
      const balance = await getBalance(socket.userId);
      if (balance < state.wagerCents) {
        return socket.emit('error', {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Not enough funds to join this table',
        });
      }

      // Add to room
      const players = await addPlayerToRoom(roomId, socket.userId, socket.username);

      // Add to Prisma participants
      await prisma.gameParticipant.upsert({
        where: { roomId_userId: { roomId, userId: socket.userId } },
        create: { roomId, userId: socket.userId },
        update: { isActive: true },
      });

      socket.join(`room:${roomId}`);
      socket.currentRoomId = roomId;

      // Send full state to joining player
      socket.emit('room_state', await buildRoomStatePayload(roomId));

      // Notify others
      socket.to(`room:${roomId}`).emit('player_joined', {
        userId: socket.userId,
        username: socket.username,
        avatarUrl: socket.avatarUrl,
      });
    } catch (err) {
      socket.emit('error', { code: err.message, message: getErrorMessage(err.message) });
    }
  });

  // Leave room
  socket.on('leave_room', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) return;

      // If game is in progress and player has wagered, they forfeit
      if (state.status === 'IN_PROGRESS') {
        // Mark as eliminated
        const eliminatedPlayers = [...state.eliminatedPlayers, socket.userId];
        await updateRoomState(roomId, { eliminatedPlayers });
      }

      await removePlayerFromRoom(roomId, socket.userId);
      socket.leave(`room:${roomId}`);
      socket.currentRoomId = null;

      io.to(`room:${roomId}`).emit('player_left', { playerId: socket.userId });

      // If room is now empty, clean up
      const updatedState = await getRoomState(roomId);
      if (!updatedState || updatedState.players.length === 0) {
        await prisma.room.update({
          where: { id: roomId },
          data: { status: 'CANCELLED' },
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Leave room error:', err);
    }
  });

  // Ready up
  socket.on('ready_up', async ({ roomId }) => {
    try {
      const { readyPlayers, allReady } = await setPlayerReady(roomId, socket.userId);

      io.to(`room:${roomId}`).emit('player_ready', {
        playerId: socket.userId,
        readyPlayers,
      });

      if (allReady) {
        // Start the game
        const state = await getRoomState(roomId);
        await startGame(io, roomId, state);
      }
    } catch (err) {
      socket.emit('error', { code: err.message, message: getErrorMessage(err.message) });
    }
  });

  // Handle disconnects
  socket.on('disconnect', async () => {
    if (socket.currentRoomId) {
      const state = await getRoomState(socket.currentRoomId);
      if (state && state.status === 'WAITING') {
        await removePlayerFromRoom(socket.currentRoomId, socket.userId);
        io.to(`room:${socket.currentRoomId}`).emit('player_left', {
          playerId: socket.userId,
        });
      }
    }
  });
}

async function startGame(io, roomId, state) {
  try {
    // Debit wagers from all players
    for (const player of state.players) {
      try {
        await debitWager(player.userId, state.wagerCents, roomId);
      } catch (err) {
        // If a player can't pay, remove them
        io.to(`room:${roomId}`).emit('error', {
          code: 'WAGER_FAILED',
          message: `${player.username} couldn't cover the wager`,
        });
        await removePlayerFromRoom(roomId, player.userId);
      }
    }

    // Update state
    await updateRoomState(roomId, {
      status: 'IN_PROGRESS',
      currentRound: 1,
      rolls: {},
      rerolls: {},
      hasRerolled: [],
    });

    // Update DB
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'IN_PROGRESS' },
    });

    // Create first round in DB
    const round = await prisma.gameRound.create({
      data: {
        roomId,
        roundNumber: 1,
        status: 'ROLLING',
      },
    });

    await updateRoomState(roomId, { currentRoundId: round.id });

    // Notify players
    io.to(`room:${roomId}`).emit('round_started', {
      roundId: round.id,
      roundNumber: 1,
      timeoutMs: (parseInt(process.env.AFK_TIMEOUT_SECONDS) || 30) * 1000,
    });

    // Notify wallet updates
    for (const player of state.players) {
      const balance = await getBalance(player.userId);
      io.to(`user:${player.userId}`).emit('wallet_updated', {
        newBalanceCents: balance,
      });
    }
  } catch (err) {
    console.error('Start game error:', err);
    // Refund all wagers on failure
    for (const player of state.players) {
      await refundWager(player.userId, state.wagerCents, roomId).catch(() => {});
    }
    io.to(`room:${roomId}`).emit('error', { code: 'GAME_START_FAILED', message: 'Failed to start game' });
  }
}

async function buildRoomStatePayload(roomId) {
  const state = await getRoomState(roomId);
  if (!state) return null;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { name: true, mode: true, wagerCents: true, maxPlayers: true, rerollEnabled: true },
  });

  return {
    roomId,
    room,
    players: state.players,
    readyPlayers: state.readyPlayers,
    status: state.status,
    currentRound: state.currentRound,
    rolls: state.rolls,
    eliminatedPlayers: state.eliminatedPlayers,
    potCents: state.wagerCents * state.players.length,
  };
}

function getErrorMessage(code) {
  const messages = {
    ROOM_NOT_FOUND: 'Room not found',
    GAME_IN_PROGRESS: 'Game already in progress',
    ROOM_FULL: 'Room is full',
    ALREADY_IN_ROOM: 'Already in this room',
    NOT_IN_ROOM: 'Not in this room',
    INSUFFICIENT_FUNDS: 'Not enough funds',
  };
  return messages[code] || 'An error occurred';
}

export { startGame };
