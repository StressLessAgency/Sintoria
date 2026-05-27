import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REQUIRED_CODE = (import.meta.env.VITE_ACCESS_CODE || '').trim();

export default function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => !REQUIRED_CODE);

  if (unlocked) return children;

  return <LockScreen onUnlock={() => setUnlocked(true)} />;
}

function LockScreen({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 1600);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || submitting) return;
    setSubmitting(true);

    setTimeout(() => {
      if (value.trim() === REQUIRED_CODE) {
        onUnlock();
      } else {
        setError(true);
        setShaking(true);
        setSubmitting(false);
        setTimeout(() => setShaking(false), 440);
      }
    }, 320);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-bone flex items-center justify-center px-6">
      <div className="overhead-cone cone-warmup" />
      <div className="felt-pool" />
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div className="absolute inset-0 grain pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-display gold-text inline-block"
            style={{
              fontSize: 'clamp(96px, 14vw, 160px)',
              lineHeight: 0.92,
              fontWeight: 400,
              letterSpacing: '-0.04em',
            }}
          >
            <span className="font-display-italic">3</span>
          </motion.div>
          <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-bone-dim mt-4">
            Invite Only
          </div>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.44 }}
          className="relative"
        >
          <label
            className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-3 transition-colors"
            style={{ color: error ? 'var(--red-hot)' : 'var(--bone-dim)' }}
          >
            {error ? 'Wrong key — try again' : 'Enter access key'}
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(false);
              }}
              autoComplete="off"
              spellCheck={false}
              disabled={submitting}
              className="w-full bg-transparent border-0 border-b text-bone font-display text-[28px] tracking-[0.04em] py-3 outline-none transition-colors disabled:opacity-50"
              style={{
                borderBottomColor: error
                  ? 'var(--red-hot)'
                  : value
                    ? 'var(--gold-bright)'
                    : 'var(--hairline-hi)',
                caretColor: 'var(--gold-bright)',
              }}
            />
            <AnimatePresence>
              {value && (
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  disabled={submitting}
                  className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.22em] uppercase text-gold-bright hover:text-bone transition-colors disabled:opacity-40"
                  aria-label="Submit access key"
                >
                  {submitting ? '...' : 'Enter →'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gold-bright/60" />
              <span className="w-1 h-1 rounded-full bg-gold-bright/30" />
              <span className="w-1 h-1 rounded-full bg-gold-bright/15" />
            </div>
            <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-bone-faint">
              Closed beta · 2026
            </div>
          </div>
        </motion.form>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.22em] uppercase text-bone-faint/70">
        threes — for those who already know
      </div>
    </div>
  );
}
