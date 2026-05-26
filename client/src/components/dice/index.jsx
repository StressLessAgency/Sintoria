import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const PIPS = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export function Die({
  value,
  rolling = false,
  delay = 0,
  size = 60,
  selected = false,
  locked = false,
  onClick,
}) {
  const [face, setFace] = useState(value ?? 1);
  const [tumbling, setTumbling] = useState(false);
  const intRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      setTumbling(true);
      intRef.current = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 55);
      timeoutRef.current = setTimeout(() => {
        clearInterval(intRef.current);
        setFace(value ?? 1);
        setTumbling(false);
      }, 600 + delay + Math.random() * 200);
      return () => {
        clearInterval(intRef.current);
        clearTimeout(timeoutRef.current);
      };
    }
    setFace(value ?? 1);
    setTumbling(false);
  }, [rolling, value, delay]);

  const isThree = face === 3 && !tumbling;
  const pips = PIPS[face] || [];
  const r = Math.max(4, size * 0.16);
  const pipSize = Math.max(4, size * 0.14);

  const interactive = !!onClick && !locked;

  return (
    <motion.button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      initial={{ opacity: 0, y: 16, scale: 0.7 }}
      animate={{
        opacity: 1,
        y: selected ? -10 : 0,
        scale: isThree ? 0.92 : 1,
        rotate: tumbling ? [0, 14, -10, 6, 0] : 0,
      }}
      transition={{
        opacity: { duration: 0.3, delay: delay / 1000 },
        y: { type: 'spring', damping: 16, stiffness: 220, delay: delay / 1000 },
        scale: { type: 'spring', damping: 14 },
        rotate: { duration: 0.42, delay: delay / 1000 },
      }}
      whileHover={interactive ? { y: -6 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      style={{ width: size, height: size }}
      className={cn(
        'relative shrink-0 p-0 bg-transparent border-0',
        interactive ? 'cursor-pointer' : 'cursor-default',
        !interactive && 'pointer-events-none'
      )}
      aria-label={`Die showing ${face}${selected ? ', selected' : ''}${locked ? ', locked' : ''}`}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -4,
          left: '12%',
          right: '12%',
          height: 7,
          background: 'rgba(0,0,0,0.55)',
          borderRadius: '50%',
          filter: 'blur(5px)',
          opacity: isThree ? 0.28 : selected ? 0.75 : 0.6,
          transition: 'opacity 200ms',
        }}
      />

      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: r,
          background: isThree
            ? 'linear-gradient(155deg, #2A0E12 0%, #150708 100%)'
            : 'linear-gradient(155deg, #F1ECDB 0%, #DDD4BD 48%, #C7BCA0 100%)',
          border: isThree
            ? '1.5px solid rgba(232, 75, 59, 0.42)'
            : '1px solid rgba(170, 158, 130, 0.45)',
          boxShadow: isThree
            ? '0 2px 10px rgba(232, 75, 59, 0.18), inset 0 1px 0 rgba(255, 80, 80, 0.06), inset 0 -1px 2px rgba(0,0,0,0.4)'
            : selected
              ? '0 0 0 1.5px rgba(255, 208, 106, 0.7), 0 0 26px rgba(255, 208, 106, 0.35), 0 6px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.08)'
              : '0 4px 12px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          padding: '18%',
          position: 'relative',
          transition: 'box-shadow 220ms cubic-bezier(0.2, 0.7, 0.2, 1)',
        }}
      >
        {[0, 1, 2].flatMap((row) =>
          [0, 1, 2].map((col) => {
            const has = pips.some(([pr, pc]) => pr === row && pc === col);
            return (
              <div
                key={`${row}-${col}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {has && (
                  <div
                    style={{
                      width: pipSize,
                      height: pipSize,
                      borderRadius: '50%',
                      background: isThree
                        ? 'radial-gradient(circle at 40% 35%, #FF5C4A, #8A1A1A)'
                        : 'radial-gradient(circle at 40% 35%, #3A362C, #15130E)',
                      boxShadow: isThree
                        ? '0 0 4px rgba(232, 75, 59, 0.35), inset 0 -1px 1px rgba(0,0,0,0.25)'
                        : 'inset 0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {locked && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: r + 4,
            border: '1px dashed rgba(195, 149, 72, 0.35)',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  );
}

export function DiceTray({ dice, rolling = false, size = 60, className }) {
  if (!dice) {
    return (
      <div className={cn('flex justify-center gap-2', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ width: size, height: size, borderRadius: size * 0.16 }}
            className="border border-hairline opacity-25"
          />
        ))}
      </div>
    );
  }
  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {dice.map((v, i) => (
        <Die key={i} value={v} rolling={rolling} delay={i * 70} size={size} />
      ))}
    </div>
  );
}

export function LockedRow({ dice = [], size = 28, total = 5 }) {
  return (
    <div className="flex items-end gap-1.5">
      {dice.map((v, i) => (
        <Die key={i} value={v} size={size} locked />
      ))}
      {Array.from({ length: Math.max(0, total - dice.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          style={{ width: size, height: size, borderRadius: size * 0.16 }}
          className="border border-dashed border-bone-faint/30"
        />
      ))}
    </div>
  );
}

export function ScoreDisplay({ score, tone = 'neutral', size = 'md' }) {
  if (score == null) return null;
  const sizes = { sm: 16, md: 22, lg: 36, xl: 56 };
  const colors = {
    neutral: 'var(--bone)',
    win: 'var(--gold-bright)',
    lose: 'var(--red-hot)',
    dim: 'var(--bone-dim)',
  };
  return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 200 }}
      className="font-mono"
      style={{
        fontSize: sizes[size],
        fontWeight: 600,
        color: colors[tone] || colors.neutral,
        letterSpacing: '-0.02em',
        textShadow: tone === 'win' ? '0 0 20px rgba(255, 208, 106, 0.35)' : 'none',
      }}
    >
      {score}
    </motion.span>
  );
}
