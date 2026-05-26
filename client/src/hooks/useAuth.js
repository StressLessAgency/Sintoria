import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, fetchUser, login, register, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isAuthenticated, isLoading, login, register, logout };
}
