import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuthStore } from '../store/authStore';
import { Eyebrow } from '../components/ui/index';
import { BalanceDisplay, ChipsPanel, TxHistory } from '../components/wallet/index';

export default function Wallet() {
  const user = useAuthStore((s) => s.user);
  const { balance, transactions, isLoadingTransactions } = useWallet();

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
            <span className="font-display text-[18px] tracking-[0.04em] text-bone">Chips</span>
          </div>
          <BalanceDisplay balanceCents={balance} compact />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <ChipsPanel balanceCents={balance} username={user?.username} />

          <div className="surface p-7">
            <Eyebrow>History</Eyebrow>
            <div className="mt-5">
              <TxHistory transactions={transactions} isLoading={isLoadingTransactions} />
            </div>
          </div>
        </motion.div>

        <p className="mt-10 px-6 py-4 border border-hairline text-center font-mono text-[10px] tracking-[0.16em] uppercase text-bone-faint">
          Chips have no cash value · For tracking who's up, who's down · Play with friends
        </p>
      </main>
    </div>
  );
}
