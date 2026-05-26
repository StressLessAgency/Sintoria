import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { formatMoney } from '../lib/utils';
import { Die } from '../components/dice/index';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [heroRoll, setHeroRoll] = useState([4, 1, 3, 6, 2, 5]);
  const [rolling, setRolling] = useState(false);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    api.get('/rooms/stats/live').then(r => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRolling(true);
      setTimeout(() => {
        setHeroRoll(Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1));
        setRolling(false);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gold/5">
        <Link to="/" className="font-display text-2xl text-gold tracking-wider">THREES</Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/lobby" className="btn-primary text-sm">Enter Lobby</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-txt-muted hover:text-gold transition-colors font-body">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">Play Now</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Dice display */}
          <div className="flex justify-center gap-3 mb-12">
            {heroRoll.map((value, i) => (
              <Die key={i} value={value} isRolling={rolling} delay={i * 80} size={64} />
            ))}
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-gold-bright mb-4 leading-tight">
            THREES
          </h1>
          <p className="font-body text-xl text-txt-primary mb-2">
            Roll six dice. Dodge the threes. Keep your money.
          </p>
          <p className="text-txt-muted font-body mb-10 max-w-md mx-auto">
            Real-money multiplayer dice where 3s are worth nothing and the lowest score loses everything.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to={isAuthenticated ? '/lobby' : '/register'} className="btn-primary text-lg px-10 py-4">
              {isAuthenticated ? 'Enter Lobby' : 'Create Account'}
            </Link>
            <a href="#rules" className="btn-ghost text-lg px-10 py-4">
              How It Works
            </a>
          </div>

          {/* Live stats */}
          {stats && (
            <motion.div
              className="flex items-center justify-center gap-8 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center">
                <div className="font-mono text-2xl text-gold-bright">{stats.activeRooms || 0}</div>
                <div className="text-txt-faint font-mono text-xs uppercase tracking-widest">Tables</div>
              </div>
              <div className="w-px h-8 bg-gold/10" />
              <div className="text-center">
                <div className="font-mono text-2xl text-gold-bright">{stats.totalPlayers || 0}</div>
                <div className="text-txt-faint font-mono text-xs uppercase tracking-widest">Players</div>
              </div>
              <div className="w-px h-8 bg-gold/10" />
              <div className="text-center">
                <div className="font-mono text-2xl text-gold-bright">{formatMoney(stats.totalInPlayCents || 0)}</div>
                <div className="text-txt-faint font-mono text-xs uppercase tracking-widest">In Play</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Rules */}
      <section id="rules" className="border-t border-gold/5 px-6 py-20 bg-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-gold mb-10 text-center">The Rules</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Ante', desc: 'Each player puts one unit in the pot. Five dice, taken in turn.' },
              { step: '02', title: 'Set Aside', desc: 'Up to five rolls. After each, set at least one die aside. 3s count as zero — lowest total wins.' },
              { step: '03', title: 'Take the Pot', desc: 'Winner takes the pot, minus a 2% house take. Five 6s on one roll wins on the spot.' },
            ].map((rule, i) => (
              <motion.div
                key={rule.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <span className="font-mono text-4xl text-gold/30 block mb-3">{rule.step}</span>
                <h3 className="font-display text-xl text-gold mb-2">{rule.title}</h3>
                <p className="text-txt-muted font-body text-sm">{rule.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/5 px-6 py-6 text-center">
        <p className="text-xs text-txt-faint font-mono">
          THREES &middot; Must be 18+ to play &middot; Please gamble responsibly
        </p>
      </footer>
    </div>
  );
}
