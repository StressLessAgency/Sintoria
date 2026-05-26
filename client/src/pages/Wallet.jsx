import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuthStore } from '../store/authStore';
import { formatMoney, cn } from '../lib/utils';
import { Eyebrow, toast } from '../components/ui/index';
import { BalanceDisplay, DepositForm, WithdrawForm, TxHistory } from '../components/wallet/index';

export default function Wallet() {
  const [tab, setTab] = useState('deposit');
  const user = useAuthStore((s) => s.user);
  const { balance, transactions, isLoadingTransactions, deposit, withdraw, refetchBalance } =
    useWallet();

  const handleDeposit = async (amountCents) => {
    try {
      await deposit.mutateAsync(amountCents);
      toast(`Deposit initiated: ${formatMoney(amountCents)}. Complete via Stripe.`, 'success');
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
    <div className="relative min-h-screen text-bone overflow-hidden">
      <div className="overhead-cone" />

      <header className="relative z-10 border-b border-hairline px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/lobby"
              className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim hover:text-gold-bright transition-colors"
            >
              ← Lobby
            </Link>
            <div className="w-px h-3.5 bg-hairline" />
            <span className="font-display text-[18px] tracking-[0.04em] text-bone">Wallet</span>
          </div>
          <BalanceDisplay balanceCents={balance} compact />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="text-center py-10 mb-10"
        >
          <Eyebrow>Balance</Eyebrow>
          <div
            className="font-display gold-text mt-2"
            style={{ fontSize: 'clamp(56px, 8vw, 96px)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {formatMoney(balance)}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="surface p-7">
            <div className="flex border-b border-hairline mb-7 -mt-2">
              {['deposit', 'withdraw'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-all border-b -mb-px',
                    tab === t
                      ? 'border-gold-bright text-gold-bright'
                      : 'border-transparent text-bone-dim hover:text-bone'
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

          <div className="surface p-7">
            <Eyebrow>History</Eyebrow>
            <div className="mt-5">
              <TxHistory transactions={transactions} isLoading={isLoadingTransactions} />
            </div>
          </div>
        </div>

        <p className="mt-10 px-6 py-4 border border-hairline text-center font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint">
          Deposits and withdrawals process via Stripe · Withdrawals require KYC · Play responsibly
        </p>
      </main>
    </div>
  );
}
