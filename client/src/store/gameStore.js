import { create } from 'zustand';

export const useGameStore = create((set) => ({
  roomId: null,
  room: null,
  hostId: null,
  tableLeaderId: null,
  players: [],
  readyPlayers: [],
  status: 'WAITING',
  phase: 'WAITING', // WAITING | PLAYING | TIE_REPLAY | GAME_OVER
  currentRound: 0,
  turnOrder: [],
  currentPlayerId: null,
  playerState: {},
  potCents: 0,
  tieReplayPlayerIds: [],
  roundResult: null,
  gameOverData: null,
  chatMessages: [],

  setRoom: (roomId, data) =>
    set({
      roomId,
      room: data.room,
      hostId: data.hostId || null,
      tableLeaderId: data.tableLeaderId || data.hostId || null,
      players: data.players || [],
      readyPlayers: data.readyPlayers || [],
      status: data.status || 'WAITING',
      phase: data.phase || (data.status === 'IN_PROGRESS' ? 'PLAYING' : 'WAITING'),
      currentRound: data.currentRound || 0,
      turnOrder: data.turnOrder || [],
      currentPlayerId: data.currentPlayerId || null,
      playerState: data.playerState || {},
      potCents: data.potCents || 0,
      tieReplayPlayerIds: data.tieReplayPlayerIds || [],
      roundResult: null,
      gameOverData: null,
      chatMessages: [],
    }),

  addPlayer: (player) =>
    set((s) => ({
      players: [...s.players.filter((p) => p.userId !== player.userId), player],
    })),

  removePlayer: (playerId) =>
    set((s) => ({
      players: s.players.filter((p) => p.userId !== playerId),
      readyPlayers: s.readyPlayers.filter((id) => id !== playerId),
    })),

  setReadyPlayers: (readyPlayers) => set({ readyPlayers }),

  startGame: ({ turnOrder, currentPlayerId, potCents }) =>
    set((s) => ({
      status: 'IN_PROGRESS',
      phase: 'PLAYING',
      turnOrder,
      currentPlayerId,
      potCents,
      playerState: Object.fromEntries(
        s.players.map((p) => [
          p.userId,
          { setAside: [], currentRoll: null, rollsUsed: 0, score: 0, done: false, shotTheMoon: false },
        ])
      ),
      roundResult: null,
      gameOverData: null,
    })),

  applyDiceRolled: ({ playerId, dice, rollsUsed, shotTheMoon }) =>
    set((s) => {
      const prev = s.playerState[playerId] || {
        setAside: [],
        currentRoll: null,
        rollsUsed: 0,
        score: 0,
        done: false,
        shotTheMoon: false,
      };
      const updated = shotTheMoon
        ? {
            ...prev,
            setAside: [...prev.setAside, ...dice],
            currentRoll: null,
            rollsUsed,
            done: true,
            shotTheMoon: true,
            score: scoreDice([...prev.setAside, ...dice]),
          }
        : { ...prev, currentRoll: dice, rollsUsed };
      return { playerState: { ...s.playerState, [playerId]: updated } };
    }),

  applyDiceSetAside: ({ playerId, setAside, score, done }) =>
    set((s) => {
      const prev = s.playerState[playerId] || {};
      return {
        playerState: {
          ...s.playerState,
          [playerId]: { ...prev, setAside, score, done, currentRoll: null },
        },
      };
    }),

  setCurrentPlayer: (currentPlayerId) => set({ currentPlayerId }),

  applyForfeit: (playerId) =>
    set((s) => {
      const prev = s.playerState[playerId] || {};
      return {
        playerState: {
          ...s.playerState,
          [playerId]: { ...prev, currentRoll: null, done: true, forfeited: true },
        },
      };
    }),

  applyTieReplay: ({ tiedPlayerIds, newPotCents, currentPlayerId }) =>
    set((s) => {
      const playerState = { ...s.playerState };
      for (const id of tiedPlayerIds) {
        playerState[id] = {
          setAside: [],
          currentRoll: null,
          rollsUsed: 0,
          score: 0,
          done: false,
          shotTheMoon: false,
        };
      }
      return {
        phase: 'TIE_REPLAY',
        playerState,
        potCents: newPotCents,
        tieReplayPlayerIds: tiedPlayerIds,
        currentPlayerId,
        roundResult: null,
      };
    }),

  setRoundResult: (result) => set({ roundResult: result }),

  setGameOver: (data) =>
    set({
      gameOverData: data,
      phase: 'GAME_OVER',
      status: 'COMPLETED',
    }),

  // Wipe transient hand state so the leader's next "Deal Hand" starts clean.
  resetForNextHand: () =>
    set({
      status: 'WAITING',
      phase: 'WAITING',
      readyPlayers: [],
      turnOrder: [],
      currentPlayerId: null,
      playerState: {},
      potCents: 0,
      tieReplayPlayerIds: [],
      roundResult: null,
      gameOverData: null,
    }),

  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages.slice(-100), msg] })),

  reset: () =>
    set({
      roomId: null,
      room: null,
      players: [],
      readyPlayers: [],
      status: 'WAITING',
      phase: 'WAITING',
      currentRound: 0,
      turnOrder: [],
      currentPlayerId: null,
      playerState: {},
      potCents: 0,
      tieReplayPlayerIds: [],
      roundResult: null,
      gameOverData: null,
      chatMessages: [],
    }),
}));

function scoreDice(dice) {
  return dice.reduce((sum, d) => sum + (d === 3 ? 0 : d), 0);
}
