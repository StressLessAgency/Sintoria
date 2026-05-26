import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';

export function useSocket() {
  const socketRef = useRef(null);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const updateBalance = useWalletStore(s => s.updateBalance);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      socketRef.current = null;
      return;
    }

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Global wallet updates
    socket.on('wallet_updated', ({ newBalanceCents }) => {
      updateBalance(newBalanceCents);
    });

    socket.on('error', ({ code, message }) => {
      console.error(`Socket error [${code}]:`, message);
    });

    return () => {
      socket.off('wallet_updated');
      socket.off('error');
    };
  }, [isAuthenticated, updateBalance]);

  return socketRef.current;
}
