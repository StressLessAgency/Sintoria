import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || '';

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('threes_token');
  if (!token) return null;

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    if (err.message === 'AUTH_REQUIRED' || err.message === 'AUTH_FAILED') {
      disconnectSocket();
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}
