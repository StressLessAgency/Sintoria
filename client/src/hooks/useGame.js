import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../lib/socket';

export function useGame(roomId) {
  const userId = useAuthStore(s => s.user?.id);
  const {
    setRoom, addPlayer, removePlayer, setReadyPlayers,
    startRound, setDiceRolled, setRerollPhase, setRerollResult,
    setRoundResult, eliminatePlayer, setGameOver, addChatMessage,
  } = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join_room', { roomId });

    // Event listeners
    socket.on('room_state', (data) => {
      setRoom(roomId, data);
    });

    socket.on('player_joined', (player) => {
      addPlayer(player);
    });

    socket.on('player_left', ({ playerId }) => {
      removePlayer(playerId);
    });

    socket.on('player_ready', ({ readyPlayers }) => {
      setReadyPlayers(readyPlayers);
    });

    socket.on('round_started', (roundData) => {
      startRound(roundData);
    });

    socket.on('dice_rolled', ({ playerId, dice, score, eliminated }) => {
      setDiceRolled(playerId, dice, score, playerId === userId);
    });

    socket.on('reroll_phase', () => {
      setRerollPhase();
    });

    socket.on('reroll_result', ({ playerId, dice, score }) => {
      setRerollResult(playerId, dice, score, playerId === userId);
    });

    socket.on('round_result', (result) => {
      setRoundResult(result);
    });

    socket.on('player_eliminated', ({ playerId }) => {
      eliminatePlayer(playerId);
    });

    socket.on('game_over', (data) => {
      setGameOver(data);
    });

    socket.on('chat_message', (msg) => {
      addChatMessage(msg);
    });

    return () => {
      socket.off('room_state');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('player_ready');
      socket.off('round_started');
      socket.off('dice_rolled');
      socket.off('reroll_phase');
      socket.off('reroll_result');
      socket.off('round_result');
      socket.off('player_eliminated');
      socket.off('game_over');
      socket.off('chat_message');
      socket.emit('leave_room', { roomId });
    };
  }, [roomId, userId]);

  const rollDice = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('roll_dice', { roomId });
  }, [roomId]);

  const rerollDice = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('reroll_dice', { roomId });
  }, [roomId]);

  const skipReroll = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('skip_reroll', { roomId });
  }, [roomId]);

  const readyUp = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('ready_up', { roomId });
  }, [roomId]);

  const sendChat = useCallback((message) => {
    const socket = getSocket();
    if (socket) socket.emit('send_chat', { roomId, message });
  }, [roomId]);

  return { rollDice, rerollDice, skipReroll, readyUp, sendChat };
}
