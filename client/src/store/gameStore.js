import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  roomId: null,
  room: null,
  players: [],
  readyPlayers: [],
  status: 'WAITING',
  currentRound: 0,
  rolls: {},
  scores: {},
  losers: [],
  eliminatedPlayers: [],
  potCents: 0,
  myDice: null,
  myScore: null,
  roundResult: null,
  gameOverData: null,
  phase: 'WAITING', // WAITING, ROLLING, REROLL, REVEALING, RESULT, GAME_OVER
  chatMessages: [],

  setRoom: (roomId, data) => set({
    roomId,
    room: data.room,
    players: data.players || [],
    readyPlayers: data.readyPlayers || [],
    status: data.status || 'WAITING',
    currentRound: data.currentRound || 0,
    rolls: data.rolls || {},
    eliminatedPlayers: data.eliminatedPlayers || [],
    potCents: data.potCents || 0,
    phase: data.status === 'IN_PROGRESS' ? 'ROLLING' : 'WAITING',
    roundResult: null,
    gameOverData: null,
    chatMessages: [],
  }),

  addPlayer: (player) => set(s => ({
    players: [...s.players.filter(p => p.userId !== player.userId), player],
  })),

  removePlayer: (playerId) => set(s => ({
    players: s.players.filter(p => p.userId !== playerId),
    readyPlayers: s.readyPlayers.filter(id => id !== playerId),
  })),

  setReadyPlayers: (readyPlayers) => set({ readyPlayers }),

  startRound: (roundData) => set({
    currentRound: roundData.roundNumber,
    phase: 'ROLLING',
    rolls: {},
    scores: {},
    losers: [],
    myDice: null,
    myScore: null,
    roundResult: null,
  }),

  setDiceRolled: (playerId, dice, score, isMe) => set(s => {
    const rolls = { ...s.rolls, [playerId]: dice };
    const scores = { ...s.scores, [playerId]: score };
    const update = { rolls, scores };
    if (isMe) {
      update.myDice = dice;
      update.myScore = score;
    }
    return update;
  }),

  setRerollPhase: () => set({ phase: 'REROLL' }),

  setRerollResult: (playerId, dice, score, isMe) => set(s => {
    const rolls = { ...s.rolls, [playerId]: dice };
    const scores = { ...s.scores, [playerId]: score };
    const update = { rolls, scores };
    if (isMe) {
      update.myDice = dice;
      update.myScore = score;
    }
    return update;
  }),

  setRoundResult: (result) => set({
    roundResult: result,
    losers: result.losers,
    phase: 'RESULT',
  }),

  eliminatePlayer: (playerId) => set(s => ({
    eliminatedPlayers: [...new Set([...s.eliminatedPlayers, playerId])],
  })),

  setGameOver: (data) => set({
    gameOverData: data,
    phase: 'GAME_OVER',
    status: 'COMPLETED',
  }),

  addChatMessage: (msg) => set(s => ({
    chatMessages: [...s.chatMessages.slice(-100), msg],
  })),

  reset: () => set({
    roomId: null, room: null, players: [], readyPlayers: [],
    status: 'WAITING', currentRound: 0, rolls: {}, scores: {},
    losers: [], eliminatedPlayers: [], potCents: 0, myDice: null,
    myScore: null, roundResult: null, gameOverData: null,
    phase: 'WAITING', chatMessages: [],
  }),
}));
