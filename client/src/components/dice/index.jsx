import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const PIP_LAYOUTS = {
  1: [{ row: 1, col: 1 }],
  2: [{ row: 0, col: 2 }, { row: 2, col: 0 }],
  3: [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
  4: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  5: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  6: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
};

function DieFace({ value, size = 56 }) {
  const pips = PIP_LAYOUTS[value] || [];
  const pipSize = Math.floor(size * 0.18);

  return (
    <div
      className="grid grid-cols-3 grid-rows-3 items-center justify-items-center w-full h-full p-[14%]"
      style={{ width: size, height: size }}
    >
      {[0, 1, 2].map(row =>
        [0, 1, 2].map(col => {
          const hasPip = pips.some(p => p.row === row && p.col === col);
          return (
            <div
              key={`${row}-${col}`}
              className={cn(
                'rounded-full transition-all duration-200',
                hasPip ? 'bg-void' : 'bg-transparent'
              )}
              style={{ width: pipSize, height: pipSize }}
            />
          );
        })
      )}
    </div>
  );
}

export function Die({ value, isLocked = false, isRolling = false, delay = 0, size = 56, showValue = true }) {
  const [displayRolling, setDisplayRolling] = useState(isRolling);
  const [randomFace, setRandomFace] = useState(1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRolling) {
      setDisplayRolling(true);
      // Rapidly cycle through random faces
      intervalRef.current = setInterval(() => {
        setRandomFace(Math.floor(Math.random() * 6) + 1);
      }, 80);

      // Stop after delay + duration
      const timeout = setTimeout(() => {
        clearInterval(intervalRef.current);
        setDisplayRolling(false);
      }, delay + 600 + Math.random() * 400);

      return () => {
        clearTimeout(timeout);
        clearInterval(intervalRef.current);
      };
    } else {
      setDisplayRolling(false);
    }
  }, [isRolling, delay]);

  const displayValue = displayRolling ? randomFace : value;
  const isThree = value === 3 && !displayRolling;

  return (
    <motion.div
      className={cn(
        'relative',
        displayRolling && 'animate-dice-tumble'
      )}
      initial={false}
      animate={{
        scale: isThree ? 0.92 : 1,
        rotateZ: displayRolling ? [0, 15, -15, 10, -5, 0] : 0,
      }}
      transition={{
        scale: { type: 'spring', damping: 15, stiffness: 300 },
        rotateZ: { duration: 0.6, delay: delay / 1000 },
      }}
      style={{ width: size, height: size }}
    >
      {/* Die face */}
      <div
        className={cn(
          'rounded-lg border-2 flex items-center justify-center transition-all duration-300',
          isThree
            ? 'bg-loss/30 border-loss/60 shadow-inner red-glow'
            : 'bg-dice border-gold/20',
          displayRolling && 'border-gold/40'
        )}
        style={{ width: size, height: size }}
      >
        {showValue && displayValue && (
          <DieFace value={displayValue} size={size} />
        )}
      </div>

      {/* Lock icon for 3s */}
      {isThree && !displayRolling && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-loss rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </motion.div>
      )}

      {/* Winner glow */}
      {!isThree && !displayRolling && value && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ boxShadow: '0 0 0 rgba(200, 134, 42, 0)' }}
          animate={{
            boxShadow: [
              '0 0 0 rgba(200, 134, 42, 0)',
              '0 0 15px rgba(200, 134, 42, 0.3)',
              '0 0 0 rgba(200, 134, 42, 0)',
            ],
          }}
          transition={{ duration: 1, delay: delay / 1000 + 0.6 }}
        />
      )}
    </motion.div>
  );
}

export function DiceRow({ dice, isRolling = false, size = 56, className }) {
  if (!dice || dice.length === 0) {
    // Empty dice slots
    return (
      <div className={cn('flex gap-2', className)}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-dashed border-txt-faint/30 bg-void/50"
            style={{ width: size, height: size }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 flex-wrap justify-center', className)}>
      {dice.map((value, i) => (
        <Die
          key={i}
          value={value}
          isLocked={value === 3}
          isRolling={isRolling}
          delay={i * 80}
          size={size}
        />
      ))}
    </div>
  );
}

export function ScoreDisplay({ score, isLoser, isWinner, animate = false }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animate || score == null) {
      setDisplayScore(score);
      return;
    }

    // Odometer effect
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 20));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);

    return () => clearInterval(interval);
  }, [score, animate]);

  return (
    <motion.span
      className={cn(
        'font-mono text-2xl font-bold tabular-nums',
        isLoser && 'text-loss',
        isWinner && 'text-gold-bright',
        !isLoser && !isWinner && 'text-txt-primary'
      )}
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12 }}
    >
      {displayScore ?? '-'}
    </motion.span>
  );
}
