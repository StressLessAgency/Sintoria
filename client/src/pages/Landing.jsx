import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function Landing() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 2.6, ease: [0.2, 0.7, 0.2, 1] }}
        className="absolute inset-0"
      >
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          pixelDensity={1}
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
            cDistance={3.89}
            cPolarAngle={65}
            cameraZoom={1}
            fov={40}
            positionX={0}
            positionY={0.9}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,transparent_25%,rgba(0,0,0,0.55)_85%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_30%,transparent_55%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      </motion.div>

      <div className="absolute inset-0 grain opacity-50 pointer-events-none" />

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

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
        <motion.h1
          initial={{ opacity: 0, y: 24, letterSpacing: '0.02em' }}
          animate={{
            opacity: ready ? 1 : 0,
            y: 0,
            letterSpacing: '-0.05em',
          }}
          transition={{ duration: 2.2, delay: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-display text-bone select-none text-center"
          style={{
            fontSize: 'clamp(120px, 22vw, 320px)',
            lineHeight: 0.85,
            fontWeight: 400,
            textShadow: '0 18px 60px rgba(0,0,0,0.55)',
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
