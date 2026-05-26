import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { getSocket } from '../lib/socket';

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
    socket.on('game_over', (data) => setGameOver(data));
    socket.on('chat_message', (msg) => addChatMessage(msg));

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
      socket.off('game_over');
      socket.off('chat_message');
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

  const sendChat = useCallback(
    (message) => {
      const socket = getSocket();
      if (socket) socket.emit('send_chat', { roomId, message });
    },
    [roomId]
  );

  return { rollDice, setAside, readyUp, sendChat };
}
