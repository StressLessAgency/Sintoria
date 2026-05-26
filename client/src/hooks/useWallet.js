import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useWalletStore } from '../store/walletStore';
import { useEffect } from 'react';

export function useWallet() {
  const setBalance = useWalletStore(s => s.setBalance);
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await api.get('/wallet/balance');
      return data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (balanceQuery.data) {
      setBalance(balanceQuery.data.balanceCents);
    }
  }, [balanceQuery.data, setBalance]);

  const transactionsQuery = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: async () => {
      const { data } = await api.get('/wallet/transactions');
      return data;
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (amountCents) => {
      const { data } = await api.post('/wallet/deposit', { amountCents });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amountCents) => {
      const { data } = await api.post('/wallet/withdraw', { amountCents });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  return {
    balance: balanceQuery.data?.balanceCents ?? 0,
    isLoadingBalance: balanceQuery.isLoading,
    transactions: transactionsQuery.data,
    isLoadingTransactions: transactionsQuery.isLoading,
    deposit: depositMutation,
    withdraw: withdrawMutation,
    refetchBalance: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] }),
  };
}
