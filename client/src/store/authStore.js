import { create } from 'zustand';
import { api } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setToken: (token) => {
    localStorage.setItem('threes_token', token);
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    get().setToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { /* ignore */ }
    localStorage.removeItem('threes_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('threes_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token, isAuthenticated: true });
      const { data } = await api.get('/auth/me');
      set({ user: data, isLoading: false });
    } catch (err) {
      localStorage.removeItem('threes_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  refreshToken: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      get().setToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      get().logout();
      throw err;
    }
  },
}));
