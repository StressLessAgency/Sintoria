import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { Eyebrow } from '../ui/index';
import Overview from './Overview';
import Users from './Users';
import Tables from './Tables';
import Games from './Games';

const NAV = [
  { id: 'overview', label: 'Overview', mono: 'O1' },
  { id: 'users', label: 'Users', mono: 'U2' },
  { id: 'tables', label: 'Tables', mono: 'T3' },
  { id: 'games', label: 'Games', mono: 'G4' },
];

export default function AdminShell() {
  const [active, setActive] = useState('overview');
  const [navOpen, setNavOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative min-h-screen text-bone overflow-hidden bg-bg">
      <div className="overhead-cone" />

      {/* Mobile top bar */}
      <header className="md:hidden relative z-30 border-b border-hairline px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setNavOpen((s) => !s)}
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-bone-dim"
          aria-label="Toggle navigation"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M0 1H16M0 6H16M0 11H16" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Menu
        </button>
        <span className="font-display text-[14px] tracking-[0.16em] text-bone">
          <span className="font-display-italic text-gold-bright">3</span> Admin
        </span>
        <Link
          to="/lobby"
          className="font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint hover:text-gold-bright"
        >
          App →
        </Link>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-hairline min-h-screen sticky top-0 px-6 py-8">
          <div className="flex items-center gap-2.5 mb-12">
            <span
              className="font-display-italic text-gold-bright"
              style={{ fontSize: 24, lineHeight: 1 }}
            >
              3
            </span>
            <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-bone-dim mt-0.5">
              Admin
            </span>
          </div>

          <nav className="flex flex-col gap-0">
            {NAV.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={active === item.id}
                onClick={() => setActive(item.id)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-hairline">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold/15 text-gold-bright flex items-center justify-center font-mono text-[12px]">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-ui text-[12px] text-bone truncate">{user?.username}</div>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-bone-faint">
                  Signed In
                </div>
              </div>
            </div>
            <Link
              to="/lobby"
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-bone-dim hover:text-gold-bright transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to App
            </Link>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-bg/85 backdrop-blur-md"
              onClick={() => setNavOpen(false)}
            >
              <motion.div
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="surface mt-16 mx-4 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActive(item.id);
                      setNavOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 font-mono text-[12px] tracking-[0.18em] uppercase border-b border-hairline last:border-b-0',
                      active === item.id ? 'text-gold-bright' : 'text-bone-dim'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar (desktop) */}
          <header className="hidden md:flex sticky top-0 z-20 items-center justify-between border-b border-hairline px-8 h-[64px] bg-bg/70 backdrop-blur-md">
            <div className="flex items-center gap-6 min-w-0">
              <div
                className="flex items-center gap-3 px-3 py-2 border border-hairline w-[420px] max-w-full text-bone-faint"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  placeholder="Search the house"
                  className="bg-transparent border-0 outline-none font-mono text-[11px] tracking-[0.12em] uppercase text-bone-dim placeholder:text-bone-faint w-full"
                  readOnly
                />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-bone-faint shrink-0">
                  Soon
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="text-bone-dim">
                  <path
                    d="M8 1.5C5.2 1.5 3 3.7 3 6.5V9.7C3 10.3 2.8 10.9 2.4 11.4L1 13H15L13.6 11.4C13.2 10.9 13 10.3 13 9.7V6.5C13 3.7 10.8 1.5 8 1.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path d="M6 14.5C6 15.6 6.9 16.5 8 16.5C9.1 16.5 10 15.6 10 14.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-gold-bright" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-hairline">
                <div className="w-6 h-6 rounded-full bg-gold/15 text-gold-bright flex items-center justify-center font-mono text-[10px]">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-bone-dim">
                  {user?.username}
                </span>
              </div>
            </div>
          </header>

          <main className="px-5 md:px-10 py-8 md:py-10 max-w-[1280px]">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Section</Eyebrow>
                <h1
                  className="font-display text-bone mt-2"
                  style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {NAV.find((n) => n.id === active)?.label}
                </h1>
              </div>
            </div>

            {active === 'overview' && <Overview />}
            {active === 'users' && <Users />}
            {active === 'tables' && <Tables />}
            {active === 'games' && <Games />}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full text-left py-3 font-mono text-[11px] tracking-[0.24em] uppercase border-b border-hairline transition-colors',
        active ? 'text-gold-bright' : 'text-bone-dim hover:text-bone'
      )}
    >
      <span className="flex items-center justify-between">
        {item.label}
        <span
          className={cn(
            'font-mono text-[9px] tracking-[0.18em]',
            active ? 'text-gold-bright/70' : 'text-bone-faint'
          )}
        >
          {item.mono}
        </span>
      </span>
      {active && (
        <motion.span
          layoutId="admin-underline"
          className="absolute left-0 right-0 -bottom-px h-[2px] bg-gold-bright"
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        />
      )}
    </button>
  );
}
