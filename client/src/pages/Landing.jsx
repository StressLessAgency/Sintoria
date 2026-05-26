import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { formatMoney } from '../lib/utils';
import { Die } from '../components/dice/index';
import { useAuthStore } from '../store/authStore';

const HERO_ROLLS = [
  [6, 6, 6, 6, 6],
  [3, 6, 2, 1, 5],
  [4, 2, 1, 3, 5],
  [3, 3, 5, 4, 1],
];

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [rolling, setRolling] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    api
      .get('/rooms/stats/live')
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setRolling(true);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % HERO_ROLLS.length);
        setRolling(false);
      }, 700);
    }, 5200);
    return () => clearInterval(tick);
  }, []);

  const dice = HERO_ROLLS[heroIdx];

  return (
    <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
      <div className="overhead-cone" />
      <div className="felt-pool" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link to="/" className="group inline-flex items-baseline gap-2">
          <span className="font-display text-[22px] font-medium tracking-[0.14em] text-bone">
            THR<span className="font-display-italic text-red-hot">3</span>ES
          </span>
          <span className="eyebrow opacity-0 group-hover:opacity-100 transition-opacity">
            est. 2026
          </span>
        </Link>
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <Link to="/lobby" className="btn-primary !py-2.5 !px-5 !text-[12px]">
              Enter Lobby
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] text-bone-dim hover:text-bone transition-colors font-ui"
              >
                Sign In
              </Link>
              <Link to="/register" className="btn-primary !py-2.5 !px-5 !text-[12px]">
                Play Now
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="eyebrow mb-12"
        >
          A street game · since forever
        </motion.div>

        <motion.div
          key={heroIdx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex justify-center gap-3">
            {dice.map((v, i) => (
              <Die
                key={`${heroIdx}-${i}`}
                value={v}
                rolling={rolling}
                delay={i * 90}
                size={72}
              />
            ))}
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-display text-bone text-center"
          style={{
            fontSize: 'clamp(64px, 11vw, 156px)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            fontWeight: 400,
          }}
        >
          THR
          <span
            className="font-display-italic"
            style={{ color: 'var(--red-hot)', fontWeight: 300 }}
          >
            3
          </span>
          ES
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="my-7 h-px w-12 bg-gold/40 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="font-ui text-[17px] text-bone-dim max-w-md text-center leading-relaxed text-balance"
        >
          Five dice. Lowest total takes the pot. The threes are worth nothing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-12 flex items-center gap-4"
        >
          <Link
            to={isAuthenticated ? '/lobby' : '/register'}
            className="btn-primary warm-pulse"
          >
            {isAuthenticated ? 'Enter the Table' : 'Sit Down'}
          </Link>
          <a href="#rules" className="btn-ghost">
            How it plays
          </a>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-20 flex items-center gap-12 border-t border-hairline pt-6"
          >
            <Stat label="Tables" value={stats.activeRooms ?? 0} />
            <div className="w-px h-8 bg-hairline" />
            <Stat label="Players" value={stats.totalPlayers ?? 0} />
            <div className="w-px h-8 bg-hairline" />
            <Stat label="In Play" value={formatMoney(stats.totalInPlayCents ?? 0)} />
          </motion.div>
        )}
      </main>

      <section
        id="rules"
        className="relative z-10 border-t border-hairline px-6 py-28"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="eyebrow mb-3">The Rules</div>
            <h2
              className="font-display text-bone"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              Older than the rooms it’s played in.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                step: '01',
                title: 'Ante',
                desc: 'Every player drops one unit in the pot. Five dice come out.',
              },
              {
                step: '02',
                title: 'Set aside',
                desc:
                  'Up to five rolls. After each, lock at least one die. Threes count as zero.',
              },
              {
                step: '03',
                title: 'Lowest wins',
                desc:
                  'Sum the kept dice. Lowest takes the pot. Five sixes on a single throw ends it on the spot.',
              },
            ].map((rule, i) => (
              <motion.div
                key={rule.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="font-mono text-[11px] tracking-[0.22em] text-gold mb-4">
                  {rule.step}
                </div>
                <h3
                  className="font-display text-3xl text-bone mb-3"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {rule.title}
                </h3>
                <p className="font-ui text-[15px] text-bone-dim leading-relaxed">
                  {rule.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 border-t border-hairline">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow mb-4">Shoot the Moon</div>
          <p
            className="font-display-italic text-bone text-balance"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.15 }}
          >
            “Roll five sixes in one breath and the table is yours, no further play.”
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[6, 6, 6, 6, 6].map((v, i) => (
              <Die key={i} value={v} size={44} />
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-hairline px-8 py-6 flex items-center justify-between text-[11px] font-mono text-bone-faint tracking-[0.16em] uppercase">
        <span>THR3ES</span>
        <span>18+ Only · Gamble Responsibly</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="font-mono text-2xl text-bone font-medium tabular-nums">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}
