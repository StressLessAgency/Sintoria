import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Landing() {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 28, stiffness: 90, mass: 0.6 });
  const sy = useSpring(my, { damping: 28, stiffness: 90, mass: 0.6 });
  const heroX = useTransform(sx, (v) => v * -14);
  const heroY = useTransform(sy, (v) => v * -10);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      className="relative w-screen h-screen overflow-hidden bg-bg"
    >
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1.04, opacity: ready ? 1 : 0 }}
        transition={{ duration: 2.4, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ x: heroX, y: heroY }}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src="/hero-dice.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_30%,rgba(0,0,0,0.55)_85%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,10,0.55)_0%,transparent_30%,transparent_60%,rgba(7,6,10,0.78)_100%)]" />
      </motion.div>

      <div className="absolute inset-0 grain opacity-60 pointer-events-none" />

      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-mono text-[10px] tracking-[0.32em] uppercase text-bone/80"
        >
          Threes
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-mono text-[10px] tracking-[0.32em] uppercase text-bone/60"
        >
          Closed Beta · 2026
        </motion.div>
      </header>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 24, letterSpacing: '0.02em' }}
          animate={{
            opacity: ready ? 1 : 0,
            y: 0,
            letterSpacing: '-0.05em',
          }}
          transition={{ duration: 2.2, delay: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display text-bone select-none"
          style={{
            fontSize: 'clamp(120px, 22vw, 320px)',
            lineHeight: 0.85,
            fontWeight: 400,
            textShadow: '0 18px 60px rgba(0,0,0,0.45)',
          }}
        >
          THR<span className="font-display-italic text-gold-bright">3</span>ES
        </motion.h1>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-20 pb-10 px-8 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1.6 }}
          className="font-mono text-[10px] tracking-[0.36em] uppercase text-bone/55"
        >
          Five dice. Lowest takes the pot.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.4, delay: 1.9 }}
          className="pointer-events-auto"
        >
          <Link
            to="/login"
            className="group relative inline-flex items-center gap-3 px-1 py-2 font-mono text-[11px] tracking-[0.28em] uppercase text-bone hover:text-gold-bright transition-colors"
          >
            <span>Enter the Room</span>
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
            <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-bone/30 group-hover:bg-gold-bright transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
