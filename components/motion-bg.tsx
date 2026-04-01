'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

/* ─── Blob definitions ──────────────────────────────────────────── */

const LIGHT_BLOBS = [
  // large terracotta — top-left
  {
    color: 'radial-gradient(ellipse, rgba(196,102,58,0.28) 0%, rgba(196,102,58,0) 70%)',
    w: '70vw', h: '65vw',
    keyframes: { x: ['-8%', '4%', '-12%', '-8%'], y: ['-12%', '4%', '-4%', '-12%'] },
    duration: 22,
  },
  // sage green — top-right
  {
    color: 'radial-gradient(ellipse, rgba(118,138,112,0.22) 0%, rgba(118,138,112,0) 70%)',
    w: '55vw', h: '50vw',
    keyframes: { x: ['55%', '62%', '50%', '55%'], y: ['-8%', '6%', '-2%', '-8%'] },
    duration: 28,
  },
  // warm sand — center
  {
    color: 'radial-gradient(ellipse, rgba(224,185,130,0.32) 0%, rgba(224,185,130,0) 70%)',
    w: '60vw', h: '55vw',
    keyframes: { x: ['20%', '30%', '14%', '20%'], y: ['28%', '40%', '22%', '28%'] },
    duration: 25,
  },
  // burnt sienna — bottom-right
  {
    color: 'radial-gradient(ellipse, rgba(178,84,46,0.18) 0%, rgba(178,84,46,0) 70%)',
    w: '45vw', h: '42vw',
    keyframes: { x: ['62%', '70%', '58%', '62%'], y: ['52%', '62%', '46%', '52%'] },
    duration: 20,
  },
  // clay dust — bottom-left
  {
    color: 'radial-gradient(ellipse, rgba(206,160,98,0.20) 0%, rgba(206,160,98,0) 70%)',
    w: '50vw', h: '48vw',
    keyframes: { x: ['-4%', '8%', '-8%', '-4%'], y: ['60%', '70%', '55%', '60%'] },
    duration: 18,
  },
]

const DARK_BLOBS = [
  // deep terracotta — top-left
  {
    color: 'radial-gradient(ellipse, rgba(160,72,38,0.40) 0%, rgba(160,72,38,0) 70%)',
    w: '70vw', h: '65vw',
    keyframes: { x: ['-8%', '4%', '-12%', '-8%'], y: ['-12%', '4%', '-4%', '-12%'] },
    duration: 22,
  },
  // dark forest sage — top-right
  {
    color: 'radial-gradient(ellipse, rgba(52,72,48,0.45) 0%, rgba(52,72,48,0) 70%)',
    w: '55vw', h: '50vw',
    keyframes: { x: ['55%', '62%', '50%', '55%'], y: ['-8%', '6%', '-2%', '-8%'] },
    duration: 28,
  },
  // smoked amber — center
  {
    color: 'radial-gradient(ellipse, rgba(100,60,28,0.50) 0%, rgba(100,60,28,0) 70%)',
    w: '60vw', h: '55vw',
    keyframes: { x: ['20%', '30%', '14%', '20%'], y: ['28%', '40%', '22%', '28%'] },
    duration: 25,
  },
  // rust ember — bottom-right
  {
    color: 'radial-gradient(ellipse, rgba(140,60,30,0.35) 0%, rgba(140,60,30,0) 70%)',
    w: '45vw', h: '42vw',
    keyframes: { x: ['62%', '70%', '58%', '62%'], y: ['52%', '62%', '46%', '52%'] },
    duration: 20,
  },
  // espresso — bottom-left
  {
    color: 'radial-gradient(ellipse, rgba(70,38,18,0.45) 0%, rgba(70,38,18,0) 70%)',
    w: '50vw', h: '48vw',
    keyframes: { x: ['-4%', '8%', '-8%', '-4%'], y: ['60%', '70%', '55%', '60%'] },
    duration: 18,
  },
]

/* ─── Base backgrounds ─────────────────────────────────────────── */
const BASE = {
  light: '#f5ede0',  // warm linen
  dark:  '#110e0b',  // espresso black
}

/* ─── Component ────────────────────────────────────────────────── */
export default function MotionBackground() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Sync with data-theme attribute changes
  useEffect(() => {
    const read = () => {
      const t = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null
      setTheme(t ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const blobs = theme === 'dark' ? DARK_BLOBS : LIGHT_BLOBS

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: -1,
        background: BASE[theme],
        transition: 'background 0.7s ease',
      }}
    >
      {/* Animated blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={`${theme}-${i}`}
          animate={{ x: blob.keyframes.x, y: blob.keyframes.y }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: blob.w,
            height: blob.h,
            background: blob.color,
            filter: 'blur(72px)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: theme === 'dark' ? 0.055 : 0.04,
          mixBlendMode: 'multiply',
          transition: 'opacity 0.7s ease',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,5,3,0.55) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(180,140,100,0.12) 100%)',
          transition: 'background 0.7s ease',
        }}
      />
    </div>
  )
}
