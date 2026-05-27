import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, fetchUser, login, register, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const role = user?.role || (user?.isAdmin ? 'ADMIN' : 'PLAYER');

  const flags = useMemo(
    () => ({
      isAdmin: role === 'ADMIN',
      isTableLeader: role === 'TABLE_LEADER' || role === 'ADMIN',
      isPlayer: role === 'PLAYER',
    }),
    [role]
  );

  return { user, isAuthenticated, isLoading, login, register, logout, role, ...flags };
}
