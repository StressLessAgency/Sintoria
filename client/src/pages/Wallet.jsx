import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuthStore } from '../store/authStore';
import { formatMoney, cn } from '../lib/utils';
import { Button } from '../components/ui/index';
import { BalanceDisplay, DepositForm, WithdrawForm, TxHistory } from '../components/wallet/index';
import { toast } from '../components/ui/index';

export default function Wallet() {
  const [tab, setTab] = useState('deposit');
  const user = useAuthStore(s => s.user);
  const { balance, transactions, isLoadingTransactions, deposit, withdraw, refetchBalance } = useWallet();

  const handleDeposit = async (amountCents) => {
    try {
      const result = await deposit.mutateAsync(amountCents);
      toast(`Deposit initiated: ${formatMoney(amountCents)}. Complete payment via Stripe.`, 'success');
      // In production, this would redirect to Stripe Checkout or open Elements
    } catch (err) {
      toast(err.response?.data?.error || 'Deposit failed', 'error');
    }
  };

  const handleWithdraw = async (amountCents) => {
    try {
      await withdraw.mutateAsync(amountCents);
      toast(`Withdrawal of ${formatMoney(amountCents)} initiated`, 'success');
      refetchBalance();
    } catch (err) {
      toast(err.response?.data?.error || 'Withdrawal failed', 'error');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/5 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/lobby" className="text-txt-muted hover:text-gold transition-colors text-sm">
              &larr; Lobby
            </Link>
            <span className="font-display text-xl text-gold">Wallet</span>
          </div>
          <BalanceDisplay balanceCents={balance} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Balance card */}
        <motion.div
          className="card gold-glow text-center py-10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-mono text-txt-muted uppercase tracking-widest block mb-2">Balance</span>
          <span className="font-mono text-5xl font-bold text-gold-bright">{formatMoney(balance)}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Deposit / Withdraw */}
          <div className="card">
            <div className="flex border-b border-gold/10 mb-6">
              {['deposit', 'withdraw'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-3 text-sm font-mono uppercase tracking-widest transition-all border-b-2 -mb-px',
                    tab === t
                      ? 'border-gold text-gold'
                      : 'border-transparent text-txt-muted hover:text-txt-primary'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'deposit' ? (
              <DepositForm onDeposit={handleDeposit} isLoading={deposit.isPending} />
            ) : (
              <WithdrawForm
                balanceCents={balance}
                onWithdraw={handleWithdraw}
                isLoading={withdraw.isPending}
                kycStatus={user?.kycStatus}
              />
            )}
          </div>

          {/* Transaction history */}
          <div className="card">
            <h3 className="text-sm font-mono text-txt-muted uppercase tracking-widest mb-4">History</h3>
            <TxHistory transactions={transactions} isLoading={isLoadingTransactions} />
          </div>
        </div>

        {/* Compliance notice */}
        <div className="mt-8 p-4 border border-gold/10 bg-surface text-xs text-txt-faint font-body text-center">
          All deposits and withdrawals are processed via Stripe. Withdrawals require KYC verification.
          Gambling involves risk. Please play responsibly.
        </div>
      </main>
    </div>
  );
}
