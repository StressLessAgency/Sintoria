import {
  getRoomState,
  addPlayerToRoom,
  removePlayerFromRoom,
  setPlayerReady,
} from '../game/roomManager.js';
import { forfeitPlayer, scheduleForfeit, cancelForfeit } from './gameHandlers.js';
import { getBalance } from '../services/ledger.js';
import { prisma } from '../app.js';

export function setupRoomHandlers(io, socket) {
  socket.on('join_room', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) {
        return socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
      }

      if (state.players.find((p) => p.userId === socket.userId)) {
        // Rejoin — cancel any pending disconnect-forfeit and resync state.
        cancelForfeit(roomId, socket.userId);
        socket.join(`room:${roomId}`);
        socket.currentRoomId = roomId;
        socket.emit('room_state', await buildRoomStatePayload(roomId));
        return;
      }

      const balance = await getBalance(socket.userId);
      if (balance < state.wagerCents) {
        return socket.emit('error', {
          code: 'INSUFFICIENT_FUNDS',
          message: 'Not enough funds to join this table',
        });
      }

      await addPlayerToRoom(roomId, socket.userId, socket.username);

      await prisma.gameParticipant.upsert({
        where: { roomId_userId: { roomId, userId: socket.userId } },
        create: { roomId, userId: socket.userId },
        update: { isActive: true },
      });

      socket.join(`room:${roomId}`);
      socket.currentRoomId = roomId;

      socket.emit('room_state', await buildRoomStatePayload(roomId));

      socket.to(`room:${roomId}`).emit('player_joined', {
        userId: socket.userId,
        username: socket.username,
        avatarUrl: socket.avatarUrl,
      });
    } catch (err) {
      socket.emit('error', { code: err.message, message: getErrorMessage(err.message) });
    }
  });

  socket.on('leave_room', async ({ roomId }) => {
    try {
      const state = await getRoomState(roomId);
      if (!state) return;

      // Walking out mid-hand is an immediate forfeit — ante stays in the pot.
      cancelForfeit(roomId, socket.userId);
      if (state.status === 'IN_PROGRESS') {
        await forfeitPlayer(io, roomId, socket.userId);
      }

      await removePlayerFromRoom(roomId, socket.userId);
      socket.leave(`room:${roomId}`);
      socket.currentRoomId = null;

      io.to(`room:${roomId}`).emit('player_left', { playerId: socket.userId });

      const updatedState = await getRoomState(roomId);
      if (!updatedState || updatedState.players.length === 0) {
        await prisma.room
          .update({ where: { id: roomId }, data: { status: 'CANCELLED' } })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Leave room error:', err);
    }
  });

  socket.on('ready_up', async ({ roomId }) => {
    try {
      const { readyPlayers } = await setPlayerReady(roomId, socket.userId);

      io.to(`room:${roomId}`).emit('player_ready', {
        playerId: socket.userId,
        readyPlayers,
      });
      // No auto-start. The table leader presses "Deal Hand".
    } catch (err) {
      socket.emit('error', { code: err.message, message: getErrorMessage(err.message) });
    }
  });

  socket.on('disconnect', async () => {
    if (!socket.currentRoomId) return;
    const roomId = socket.currentRoomId;
    const state = await getRoomState(roomId);
    if (!state) return;

    if (state.status === 'WAITING') {
      await removePlayerFromRoom(roomId, socket.userId);
      io.to(`room:${roomId}`).emit('player_left', { playerId: socket.userId });
    } else if (state.status === 'IN_PROGRESS') {
      // Network blip ≠ ragequit: keep the seat and start a grace timer.
      // Rejoining within the window cancels the forfeit.
      scheduleForfeit(io, roomId, socket.userId);
      io.to(`room:${roomId}`).emit('player_disconnected', { playerId: socket.userId });
    }
  });
}

async function buildRoomStatePayload(roomId) {
  const state = await getRoomState(roomId);
  if (!state) return null;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { name: true, wagerCents: true, maxPlayers: true },
  });

  const currentPlayerId =
    state.turnOrder.length > 0 ? state.turnOrder[state.turnIndex] : null;

  return {
    roomId,
    room,
    hostId: state.hostId,
    tableLeaderId: state.tableLeaderId || state.hostId,
    players: state.players,
    readyPlayers: state.readyPlayers,
    status: state.status,
    phase: state.phase,
    currentRound: state.currentRound,
    turnOrder: state.turnOrder,
    currentPlayerId,
    playerState: state.playerState,
    potCents: state.potCents || state.wagerCents * state.players.length,
    tieReplayPlayerIds: state.tieReplayPlayerIds,
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
