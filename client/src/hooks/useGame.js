import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getSocket } from '../lib/socket';
import { toast } from '../components/ui/index';

export function useGame(roomId) {
  const {
    setRoom,
    addPlayer,
    removePlayer,
    setReadyPlayers,
    startGame,
    applyDiceRolled,
    applyDiceSetAside,
    setCurrentPlayer,
    applyTieReplay,
    applyForfeit,
    setRoundResult,
    setGameOver,
    addChatMessage,
  } = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit('join_room', { roomId });

    socket.on('room_state', (data) => setRoom(roomId, data));
    socket.on('player_joined', (player) => addPlayer(player));
    socket.on('player_left', ({ playerId }) => removePlayer(playerId));
    socket.on('player_ready', ({ readyPlayers }) => setReadyPlayers(readyPlayers));

    socket.on('game_started', (data) => startGame(data));
    socket.on('dice_rolled', (data) => applyDiceRolled(data));
    socket.on('dice_set_aside', (data) => applyDiceSetAside(data));
    socket.on('turn_changed', ({ currentPlayerId }) => setCurrentPlayer(currentPlayerId));
    socket.on('round_result', (data) => setRoundResult(data));
    socket.on('tie_replay', (data) => applyTieReplay(data));
    socket.on('player_forfeited', ({ playerId, username }) => {
      applyForfeit(playerId);
      if (username) toast(`${username} forfeited the hand`, 'warning');
    });
    socket.on('player_disconnected', () => {
      // Seat is held during the grace window; no state change needed.
    });
    socket.on('game_over', (data) => setGameOver(data));
    socket.on('chat_message', (msg) => addChatMessage(msg));

    const onError = (err) => {
      const friendly = {
        NOT_TABLE_LEADER: 'Only the table leader can deal.',
        NOT_ENOUGH_READY: 'Need at least two ready players to deal.',
        LEADER_NOT_SEATED: 'You must be seated to deal.',
        HAND_IN_PROGRESS: 'A hand is already in progress.',
        DEAL_FAILED: 'Could not start the hand. Try again.',
      };
      const code = err?.code;
      if (code && friendly[code]) toast(friendly[code], 'error');
      else if (err?.message) toast(err.message, 'error');
    };
    socket.on('error', onError);

    return () => {
      socket.off('room_state');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('player_ready');
      socket.off('game_started');
      socket.off('dice_rolled');
      socket.off('dice_set_aside');
      socket.off('turn_changed');
      socket.off('round_result');
      socket.off('tie_replay');
      socket.off('player_forfeited');
      socket.off('player_disconnected');
      socket.off('game_over');
      socket.off('chat_message');
      socket.off('error', onError);
      socket.emit('leave_room', { roomId });
    };
  }, [
    roomId,
    setRoom,
    addPlayer,
    removePlayer,
    setReadyPlayers,
    startGame,
    applyDiceRolled,
    applyDiceSetAside,
    setCurrentPlayer,
    applyTieReplay,
    applyForfeit,
    setRoundResult,
    setGameOver,
    addChatMessage,
  ]);

  const rollDice = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('roll_dice', { roomId });
  }, [roomId]);

  const setAside = useCallback(
    (indices) => {
      const socket = getSocket();
      if (socket) socket.emit('set_aside', { roomId, indices });
    },
    [roomId]
  );

  const readyUp = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('ready_up', { roomId });
  }, [roomId]);

  const deal = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('leader_deal', { roomId });
  }, [roomId]);

  const sendChat = useCallback(
    (message) => {
      const socket = getSocket();
      if (socket) socket.emit('send_chat', { roomId, message });
    },
    [roomId]
  );

  return { rollDice, setAside, readyUp, deal, sendChat };
}
