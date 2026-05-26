import { create } from 'zustand';

export const useWalletStore = create((set) => ({
  balanceCents: 0,
  isLoading: false,

  setBalance: (balanceCents) => set({ balanceCents }),

  updateBalance: (newBalanceCents) => set({ balanceCents: newBalanceCents }),
}));
