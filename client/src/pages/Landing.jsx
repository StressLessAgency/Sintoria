import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from 'framer-motion';
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

const SILK = [0.2, 0.7, 0.2, 1];

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [rolling, setRolling] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const coneShift = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { damping: 22, stiffness: 80 });
  const sy = useSpring(mouseY, { damping: 22, stiffness: 80 });

  useEffect(() => {
    api.get('/rooms/stats/live').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setRolling(true);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % HERO_ROLLS.length);
        setRolling(false);
      }, 700);
    }, 5600);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  const dice = HERO_ROLLS[heroIdx];

  return (
    <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
      <motion.div
        style={{ y: coneShift }}
        className="absolute inset-x-0 top-0 pointer-events-none z-0"
      >
        <div className="overhead-cone cone-warmup" />
      </motion.div>
      <div className="felt-pool" />

      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.7, ease: SILK }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <Link to="/" className="inline-flex items-baseline gap-2">
          <span className="font-display text-[22px] font-medium tracking-[0.14em] text-bone">
            THR<span className="font-display-italic text-red-hot">3</span>ES
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
      </motion.nav>

      <motion.main
        ref={heroRef}
        style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-16"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.8 }}
          className="eyebrow mb-12"
        >
          A street game · since forever
        </motion.div>

        <div className="mb-16 will-change-transform">
          <HeroDice dice={dice} heroIdx={heroIdx} rolling={rolling} sx={sx} sy={sy} />
        </div>

        <Wordmark />

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.9, ease: SILK }}
          className="my-7 h-px w-12 bg-gold/40 origin-center"
        />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.7, ease: SILK }}
          className="font-ui text-[17px] text-bone-dim max-w-md text-center leading-relaxed text-balance"
        >
          Five dice. Lowest total takes the pot. The threes are worth nothing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.7, ease: SILK }}
          className="mt-12 flex items-center gap-4"
        >
          <MagneticLink
            to={isAuthenticated ? '/lobby' : '/register'}
            className="btn-primary warm-pulse"
          >
            {isAuthenticated ? 'Enter the Table' : 'Sit Down'}
          </MagneticLink>
          <a href="#rules" className="btn-ghost">
            How it plays
          </a>
        </motion.div>

        {stats && <LiveStats stats={stats} />}
      </motion.main>

      <RulesSection />
      <MoonSection />
      <Footer />
    </div>
  );
}

function HeroDice({ dice, heroIdx, rolling, sx, sy }) {
  return (
    <div
      style={{ perspective: 1200 }}
      className="flex justify-center gap-3"
    >
      {dice.map((v, i) => (
        <HeroDie
          key={`${heroIdx}-${i}`}
          value={v}
          rolling={rolling}
          idx={i}
          sx={sx}
          sy={sy}
        />
      ))}
    </div>
  );
}

function HeroDie({ value, rolling, idx, sx, sy }) {
  const offset = (idx - 2) * 0.4;
  const tiltX = useTransform(sy, [-1, 1], [10, -10]);
  const tiltY = useTransform(sx, [-1, 1], [-12 + offset * 4, 12 + offset * 4]);
  const driftX = useTransform(sx, [-1, 1], [-6 + offset * 2, 6 - offset * 2]);
  const driftY = useTransform(sy, [-1, 1], [-4, 4]);

  return (
    <motion.div
      initial={{ y: -260, opacity: 0, rotateZ: -45 + idx * 12 }}
      animate={{ y: 0, opacity: 1, rotateZ: 0 }}
      transition={{
        type: 'spring',
        damping: 14,
        stiffness: 180,
        mass: 0.9,
        delay: 0.35 + idx * 0.11,
      }}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        x: driftX,
        y: driftY,
        transformStyle: 'preserve-3d',
      }}
    >
      <Die value={value} rolling={rolling} delay={idx * 70} size={72} />
    </motion.div>
  );
}

function Wordmark() {
  const letters = ['T', 'H', 'R', '3', 'E', 'S'];
  return (
    <h1
      aria-label="THREES"
      className="font-display text-bone text-center flex items-baseline justify-center"
      style={{
        fontSize: 'clamp(64px, 11vw, 156px)',
        lineHeight: 0.9,
        letterSpacing: '-0.02em',
        fontWeight: 400,
      }}
    >
      {letters.map((ch, i) => {
        const isThree = ch === '3';
        return (
          <span key={i} className="letter-mask">
            <motion.span
              initial={{ y: '110%', rotateX: -40, opacity: 0 }}
              animate={{ y: 0, rotateX: 0, opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: 1.2 + i * 0.08,
                ease: SILK,
              }}
              style={{
                display: 'inline-block',
                color: isThree ? 'var(--red-hot)' : undefined,
                fontStyle: isThree ? 'italic' : 'normal',
                fontWeight: isThree ? 300 : 400,
                fontFamily: isThree ? 'Fraunces, Georgia, serif' : undefined,
                textShadow: isThree
                  ? '0 0 28px rgba(232, 75, 59, 0.35)'
                  : 'none',
              }}
            >
              {ch}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}

function MagneticLink({ to, children, className, radius = 100, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 18, stiffness: 240 });
  const sy = useSpring(y, { damping: 18, stiffness: 240 });

  useEffect(() => {
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [radius, strength, x, y]);

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} className="inline-block">
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

function LiveStats({ stats }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.7, duration: 0.7 }}
      className="mt-20 flex items-center gap-12 border-t border-hairline pt-6"
    >
      <Stat label="Tables" end={stats.activeRooms ?? 0} inView={inView} />
      <div className="w-px h-8 bg-hairline" />
      <Stat label="Players" end={stats.totalPlayers ?? 0} inView={inView} />
      <div className="w-px h-8 bg-hairline" />
      <Stat label="In Play" end={(stats.totalInPlayCents ?? 0) / 100} inView={inView} money />
    </motion.div>
  );
}

function Stat({ label, end, inView, money = false }) {
  const value = useCountUp(end, inView, 1600);
  return (
    <div className="text-center">
      <div className="font-mono text-2xl text-bone font-medium tabular-nums">
        {money ? formatMoney(Math.round(value * 100)) : value}
      </div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}

function useCountUp(end, active, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(end * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return Math.round(val * 100) / 100;
}

function RulesSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-100px' });

  return (
    <section
      id="rules"
      ref={sectionRef}
      className="relative z-10 border-t border-hairline px-6 py-28"
    >
      <div className="max-w-5xl mx-auto">
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-3"
          >
            The Rules
          </motion.div>
          <h2
            className="font-display text-bone"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            <SplitReveal
              text="Older than the rooms it's played in."
              inView={titleInView}
              delay={0.15}
            />
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
          <RuleCard
            step="01"
            title="Ante"
            desc="Every player drops one unit in the pot. Five dice come out."
            delay={0}
          />
          <RuleCard
            step="02"
            title="Set aside"
            desc="Up to five rolls. After each, lock at least one die. Threes count as zero."
            delay={0.12}
          />
          <RuleCard
            step="03"
            title="Lowest wins"
            desc="Sum the kept dice. Lowest takes the pot. Five sixes on a single throw ends it on the spot."
            delay={0.24}
          />
        </div>
      </div>
    </section>
  );
}

function RuleCard({ step, title, desc, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8, ease: SILK }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: delay + 0.2, duration: 0.7, ease: SILK }}
          className="origin-left h-px w-8 bg-gold/50"
        />
        <div className="font-mono text-[11px] tracking-[0.22em] text-gold">{step}</div>
      </div>
      <h3 className="font-display text-3xl text-bone mb-3" style={{ letterSpacing: '-0.01em' }}>
        <SplitReveal text={title} inView={inView} delay={delay + 0.1} />
      </h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.5, duration: 0.6 }}
        className="font-ui text-[15px] text-bone-dim leading-relaxed"
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}

function SplitReveal({ text, inView, delay = 0, stagger = 0.018 }) {
  const chars = [...text];
  return (
    <span aria-label={text} className="inline">
      {chars.map((ch, i) => (
        <span key={i} className="letter-mask">
          <motion.span
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: delay + i * stagger,
              ease: SILK,
            }}
            style={{ display: 'inline-block' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function MoonSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const [sweepKey, setSweepKey] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setSweepKey(1), 950);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative z-10 px-6 py-24 border-t border-hairline"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-4"
        >
          Shoot the Moon
        </motion.div>
        <p
          className="font-display-italic text-bone text-balance"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.15 }}
        >
          <SplitReveal
            text='"Roll five sixes in one breath and the table is yours, no further play."'
            inView={inView}
            delay={0.15}
            stagger={0.014}
          />
        </p>
        <div className="relative mt-8 flex justify-center gap-2">
          <div
            key={sweepKey}
            className={sweepKey ? 'gold-sweep relative' : 'relative'}
            style={{ display: 'flex', gap: 8 }}
          >
            {[6, 6, 6, 6, 6].map((v, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, opacity: 0, rotateZ: -45 }}
                animate={inView ? { y: 0, opacity: 1, rotateZ: 0 } : {}}
                transition={{
                  type: 'spring',
                  damping: 13,
                  stiffness: 180,
                  delay: 0.3 + i * 0.08,
                }}
              >
                <Die value={v} size={48} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const phrase = '18+ ONLY · GAMBLE RESPONSIBLY · ';
  return (
    <footer className="relative z-10 border-t border-hairline overflow-hidden">
      <div className="px-8 py-5 flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase text-bone-faint">
        <span>THR3ES</span>
        <div className="hidden md:block flex-1 mx-12 overflow-hidden">
          <div className="marquee text-bone-faint/60">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="px-4">
                {phrase}
              </span>
            ))}
          </div>
        </div>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
