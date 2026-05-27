import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setM(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return m;
}

export default function Landing() {
  const [ready, setReady] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-screen overflow-hidden bg-black"
      style={{ height: '100dvh', minHeight: '100svh' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 2.6, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute inset-0"
      >
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          pixelDensity={isMobile ? 0.75 : 1}
        >
          <ShaderGradient
            animate="on"
            type="waterPlane"
            shader="defaults"
            bgColor1="#000000"
            bgColor2="#000000"
            color1="#fff082"
            color2="#ff9142"
            color3="#ffffff"
            brightness={0.4}
            envPreset="city"
            lightType="env"
            reflection={0.1}
            cAzimuthAngle={-168}
            cDistance={isMobile ? 4.6 : 3.89}
            cPolarAngle={isMobile ? 72 : 65}
            cameraZoom={1}
            fov={40}
            positionX={0}
            positionY={isMobile ? 1.2 : 0.9}
            positionZ={-0.3}
            rotationX={45}
            rotationY={0}
            rotationZ={0}
            uAmplitude={0}
            uDensity={1.2}
            uFrequency={0}
            uSpeed={0.2}
            uStrength={3.4}
            uTime={0}
            grain="off"
            wireframe={false}
          />
        </ShaderGradientCanvas>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_50%,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_45%,transparent_78%)] sm:bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_45%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,transparent_22%,transparent_58%,rgba(0,0,0,0.82)_100%)] pointer-events-none" />
      </motion.div>

      <div className="absolute inset-0 grain opacity-50 pointer-events-none" />

      <header
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-mono text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-bone/85"
        >
          Threes
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="font-mono text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-bone/65"
        >
          <span className="hidden xs:inline">Closed Beta · </span>2026
        </motion.div>
      </header>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 24, letterSpacing: '0.02em' }}
          animate={{
            opacity: ready ? 1 : 0,
            y: 0,
            letterSpacing: '-0.045em',
          }}
          transition={{ duration: 2.2, delay: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display select-none text-center"
          style={{
            fontSize: 'clamp(64px, 24vw, 320px)',
            lineHeight: 0.88,
            fontWeight: 500,
            color: '#F5ECD4',
            textShadow:
              '0 0 1px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.55), 0 24px 60px rgba(0,0,0,0.75), 0 0 120px rgba(0,0,0,0.5)',
          }}
        >
          THR
          <span
            className="font-display-italic"
            style={{
              color: '#FFE08A',
              textShadow:
                '0 0 24px rgba(255,208,106,0.55), 0 2px 0 rgba(0,0,0,0.7), 0 24px 60px rgba(0,0,0,0.75)',
            }}
          >
            3
          </span>
          ES
        </motion.h1>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 z-20 px-5 sm:px-8 flex flex-col items-center gap-5 sm:gap-6"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.75rem)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1.6 }}
          className="font-mono text-[9px] sm:text-[10px] tracking-[0.24em] sm:tracking-[0.36em] uppercase text-bone/60 text-center max-w-[20rem] sm:max-w-none"
        >
          {isMobile ? 'Lowest takes the pot' : 'Five dice. Lowest takes the pot.'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          transition={{ duration: 1.4, delay: 1.9 }}
          className="pointer-events-auto"
        >
          <Link
            to="/login"
            className="group relative inline-flex items-center gap-3 px-2 py-3 font-mono text-[11px] sm:text-[11px] tracking-[0.26em] sm:tracking-[0.28em] uppercase text-bone hover:text-gold-bright active:text-gold-bright transition-colors"
          >
            <span>Enter the Room</span>
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
            <span className="absolute left-2 right-2 bottom-1.5 h-px bg-bone/30 group-hover:bg-gold-bright transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
