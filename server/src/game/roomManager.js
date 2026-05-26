import { redis } from '../app.js';
import { HAND_SIZE } from './engine.js';

const ROOM_TTL = 3600; // 1 hour

/**
 * Room state stored in Redis for real-time access.
 * Persistent data (history, results) goes to Postgres.
 *
 * Per-player game state lives in `playerState` keyed by userId:
 *   { setAside: int[], currentRoll: int[]|null, rollsUsed: int,
 *     score: int, done: bool, shotTheMoon: bool }
 */

function emptyPlayerState() {
  return {
    setAside: [],
    currentRoll: null,
    rollsUsed: 0,
    score: 0,
    done: false,
    shotTheMoon: false,
  };
}

export async function createRoomState(roomId, hostId, config) {
  const state = {
    roomId,
    hostId,
    wagerCents: config.wagerCents,
    maxPlayers: config.maxPlayers,
    status: 'WAITING',
    phase: 'WAITING',
    players: JSON.stringify([]),
    readyPlayers: JSON.stringify([]),
    turnOrder: JSON.stringify([]),
    turnIndex: 0,
    playerState: JSON.stringify({}),
    potCents: 0,
    currentRound: 0,
    lastWinnerId: '',
    tieReplayPlayerIds: JSON.stringify([]),
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

  return {
    ...state,
    wagerCents: parseInt(state.wagerCents),
    maxPlayers: parseInt(state.maxPlayers),
    currentRound: parseInt(state.currentRound || '0'),
    turnIndex: parseInt(state.turnIndex || '0'),
    potCents: parseInt(state.potCents || '0'),
    players: JSON.parse(state.players || '[]'),
    readyPlayers: JSON.parse(state.readyPlayers || '[]'),
    turnOrder: JSON.parse(state.turnOrder || '[]'),
    playerState: JSON.parse(state.playerState || '{}'),
    tieReplayPlayerIds: JSON.parse(state.tieReplayPlayerIds || '[]'),
    lastWinnerId: state.lastWinnerId || null,
  };
}

export async function updateRoomState(roomId, updates) {
  const serialized = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) {
      serialized[key] = '';
    } else if (typeof value === 'object') {
      serialized[key] = JSON.stringify(value);
    } else {
      serialized[key] = String(value);
    }
  }
  await redis.hmset(`room:${roomId}`, serialized);
  await redis.expire(`room:${roomId}`, ROOM_TTL);
}

export async function addPlayerToRoom(roomId, userId, username) {
  const state = await getRoomState(roomId);
  if (!state) throw new Error('ROOM_NOT_FOUND');
  if (state.status !== 'WAITING') throw new Error('GAME_IN_PROGRESS');
  if (state.players.length >= state.maxPlayers) throw new Error('ROOM_FULL');
  if (state.players.find((p) => p.userId === userId)) throw new Error('ALREADY_IN_ROOM');

  const players = [...state.players, { userId, username }];
  await updateRoomState(roomId, { players });
  return players;
}

export async function removePlayerFromRoom(roomId, userId) {
  const state = await getRoomState(roomId);
  if (!state) return null;

  const players = state.players.filter((p) => p.userId !== userId);
  const readyPlayers = state.readyPlayers.filter((id) => id !== userId);
  await updateRoomState(roomId, { players, readyPlayers });

  if (players.length === 0) {
    await deleteRoomState(roomId);
  }
  return players;
}

export async function setPlayerReady(roomId, userId) {
  const state = await getRoomState(roomId);
  if (!state) throw new Error('ROOM_NOT_FOUND');
  if (!state.players.find((p) => p.userId === userId)) throw new Error('NOT_IN_ROOM');

  const readyPlayers = [...new Set([...state.readyPlayers, userId])];
  await updateRoomState(roomId, { readyPlayers });

  const allReady =
    state.players.length >= 2 && state.players.every((p) => readyPlayers.includes(p.userId));
  return { readyPlayers, allReady };
}

/**
 * Initialize per-player state for a new game and set the turn order.
 * `firstPlayerId` rolls first (winner of last game, else host).
 */
export function initialPlayerState(playerIds) {
  const ps = {};
  for (const id of playerIds) ps[id] = emptyPlayerState();
  return ps;
}

export function buildTurnOrder(playerIds, firstPlayerId) {
  if (!firstPlayerId || !playerIds.includes(firstPlayerId)) return [...playerIds];
  const idx = playerIds.indexOf(firstPlayerId);
  return [...playerIds.slice(idx), ...playerIds.slice(0, idx)];
}

export function allPlayersDone(turnOrder, playerState) {
  return turnOrder.every((id) => playerState[id]?.done);
}

export { HAND_SIZE };

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
        totalInPlay += state.potCents;
      }
    }
  }
  return {
    activeRooms: roomIds.length,
    totalPlayers,
    totalInPlayCents: totalInPlay,
  };
}
