import { redis, prisma } from '../app.js';

const ROOM_TTL = 3600; // 1 hour

/**
 * Room state stored in Redis for real-time access.
 * Persistent data (history, results) goes to Postgres.
 */

export async function createRoomState(roomId, hostId, config) {
  const state = {
    roomId,
    hostId,
    wagerCents: config.wagerCents,
    maxPlayers: config.maxPlayers,
    mode: config.mode,
    rerollEnabled: config.rerollEnabled,
    status: 'WAITING',
    players: JSON.stringify([]),
    readyPlayers: JSON.stringify([]),
    currentRound: 0,
    rolls: JSON.stringify({}),
    rerolls: JSON.stringify({}),
    hasRerolled: JSON.stringify([]),
    eliminatedPlayers: JSON.stringify([]),
    createdAt: Date.now(),
  };

  await redis.hmset(`room:${roomId}`, state);
  await redis.expire(`room:${roomId}`, ROOM_TTL);
  await redis.sadd('active_rooms', roomId);
  return state;
}

export async function getRoomState(roomId) {
  const state = await redis.hgetall(`room:${roomId}`);
  if (!state || !state.roomId) return null;

  // Parse JSON fields
  return {
    ...state,
    wagerCents: parseInt(state.wagerCents),
    maxPlayers: parseInt(state.maxPlayers),
    currentRound: parseInt(state.currentRound),
    rerollEnabled: state.rerollEnabled === 'true',
    players: JSON.parse(state.players || '[]'),
    readyPlayers: JSON.parse(state.readyPlayers || '[]'),
    rolls: JSON.parse(state.rolls || '{}'),
    rerolls: JSON.parse(state.rerolls || '{}'),
    hasRerolled: JSON.parse(state.hasRerolled || '[]'),
    eliminatedPlayers: JSON.parse(state.eliminatedPlayers || '[]'),
  };
}

export async function updateRoomState(roomId, updates) {
  const serialized = {};
  for (const [key, value] of Object.entries(updates)) {
    serialized[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  await redis.hmset(`room:${roomId}`, serialized);
  await redis.expire(`room:${roomId}`, ROOM_TTL);
}

export async function addPlayerToRoom(roomId, userId, username) {
  const state = await getRoomState(roomId);
  if (!state) throw new Error('ROOM_NOT_FOUND');
  if (state.status !== 'WAITING') throw new Error('GAME_IN_PROGRESS');
  if (state.players.length >= state.maxPlayers) throw new Error('ROOM_FULL');
  if (state.players.find(p => p.userId === userId)) throw new Error('ALREADY_IN_ROOM');

  const players = [...state.players, { userId, username, isActive: true }];
  await updateRoomState(roomId, { players });
  return players;
}

export async function removePlayerFromRoom(roomId, userId) {
  const state = await getRoomState(roomId);
  if (!state) return null;

  const players = state.players.filter(p => p.userId !== userId);
  const readyPlayers = state.readyPlayers.filter(id => id !== userId);
  await updateRoomState(roomId, { players, readyPlayers });

  // If room is empty, clean up
  if (players.length === 0) {
    await deleteRoomState(roomId);
  }

  return players;
}

export async function setPlayerReady(roomId, userId) {
  const state = await getRoomState(roomId);
  if (!state) throw new Error('ROOM_NOT_FOUND');
  if (!state.players.find(p => p.userId === userId)) throw new Error('NOT_IN_ROOM');

  const readyPlayers = [...new Set([...state.readyPlayers, userId])];
  await updateRoomState(roomId, { readyPlayers });

  // Check if all players are ready (need at least 2)
  const allReady = state.players.length >= 2 &&
    state.players.every(p => readyPlayers.includes(p.userId));

  return { readyPlayers, allReady };
}

export async function deleteRoomState(roomId) {
  await redis.del(`room:${roomId}`);
  await redis.srem('active_rooms', roomId);
}

export async function getActiveRoomIds() {
  return redis.smembers('active_rooms');
}

export async function getLiveStats() {
  const roomIds = await getActiveRoomIds();
  let totalPlayers = 0;
  let totalInPlay = 0;

  for (const roomId of roomIds) {
    const state = await getRoomState(roomId);
    if (state) {
      totalPlayers += state.players.length;
      if (state.status === 'IN_PROGRESS') {
        totalInPlay += state.wagerCents * state.players.length;
      }
    }
  }

  return {
    activeRooms: roomIds.length,
    totalPlayers,
    totalInPlayCents: totalInPlay,
  };
}
