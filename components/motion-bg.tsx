'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LIGHT_BLOBS = [
  { color: 'radial-gradient(ellipse, rgba(196,102,58,0.38) 0%, rgba(196,102,58,0) 68%)', w: '75vw', h: '70vw', kx: ['-10%','6%','-14%','-10%'], ky: ['-14%','6%','-6%','-14%'], dur: 20 },
  { color: 'radial-gradient(ellipse, rgba(108,132,104,0.30) 0%, rgba(108,132,104,0) 68%)', w: '60vw', h: '55vw', kx: ['52%','62%','46%','52%'], ky: ['-10%','8%','-4%','-10%'], dur: 27 },
  { color: 'radial-gradient(ellipse, rgba(224,178,110,0.42) 0%, rgba(224,178,110,0) 68%)', w: '65vw', h: '60vw', kx: ['18%','30%','10%','18%'], ky: ['26%','42%','18%','26%'], dur: 23 },
  { color: 'radial-gradient(ellipse, rgba(178,84,46,0.28) 0%, rgba(178,84,46,0) 68%)', w: '50vw', h: '46vw', kx: ['60%','72%','54%','60%'], ky: ['50%','64%','44%','50%'], dur: 19 },
  { color: 'radial-gradient(ellipse, rgba(200,152,88,0.34) 0%, rgba(200,152,88,0) 68%)', w: '55vw', h: '50vw', kx: ['-6%','10%','-10%','-6%'], ky: ['58%','72%','50%','58%'], dur: 17 },
  { color: 'radial-gradient(ellipse, rgba(162,120,72,0.22) 0%, rgba(162,120,72,0) 68%)', w: '42vw', h: '38vw', kx: ['35%','45%','28%','35%'], ky: ['70%','82%','64%','70%'], dur: 31 },
]

const DARK_BLOBS = [
  { color: 'radial-gradient(ellipse, rgba(160,72,38,0.42) 0%, rgba(160,72,38,0) 70%)', w: '70vw', h: '65vw', kx: ['-8%','4%','-12%','-8%'], ky: ['-12%','4%','-4%','-12%'], dur: 22 },
  { color: 'radial-gradient(ellipse, rgba(52,72,48,0.45) 0%, rgba(52,72,48,0) 70%)', w: '55vw', h: '50vw', kx: ['55%','62%','50%','55%'], ky: ['-8%','6%','-2%','-8%'], dur: 28 },
  { color: 'radial-gradient(ellipse, rgba(100,60,28,0.50) 0%, rgba(100,60,28,0) 70%)', w: '60vw', h: '55vw', kx: ['20%','30%','14%','20%'], ky: ['28%','40%','22%','28%'], dur: 25 },
  { color: 'radial-gradient(ellipse, rgba(140,60,30,0.36) 0%, rgba(140,60,30,0) 70%)', w: '45vw', h: '42vw', kx: ['62%','70%','58%','62%'], ky: ['52%','62%','46%','52%'], dur: 20 },
  { color: 'radial-gradient(ellipse, rgba(70,38,18,0.46) 0%, rgba(70,38,18,0) 70%)', w: '50vw', h: '48vw', kx: ['-4%','8%','-8%','-4%'], ky: ['60%','70%','55%','60%'], dur: 18 },
]

const BASE_LIGHT_STOPS = [
  'linear-gradient(145deg, #f5ede0 0%, #f0e4d0 35%, #e8d8bc 65%, #f2e6d4 100%)',
]
const BASE_DARK = '#110e0b'

export default function MotionBackground() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const read = () => {
      const t = document.documentElement.getAttribute('data-theme') as 'light'|'dark'|null
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
      style={{ zIndex: -1, transition: 'background 0.8s ease',
        background: theme === 'dark' ? BASE_DARK : BASE_LIGHT_STOPS[0] }}
    >
      {/* Animated base gradient shimmer (light only) */}
      {theme === 'light' && (
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(135deg, rgba(224,178,110,0.18) 0%, rgba(196,102,58,0.12) 30%, rgba(108,132,104,0.10) 60%, rgba(224,178,110,0.15) 100%)',
            backgroundSize: '200% 200%',
          }}
        />
      )}

      {/* Blobs */}
      {blobs.map((b, i) => (
        <motion.div
          key={`${theme}-${i}`}
          animate={{ x: b.kx, y: b.ky }}
          transition={{ duration: b.dur, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: b.w, height: b.h,
            background: b.color,
            filter: `blur(${theme === 'light' ? '80px' : '72px'})`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* Grain */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
        opacity: theme === 'dark' ? 0.055 : 0.045,
        mixBlendMode: 'multiply',
        transition: 'opacity 0.7s ease',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: theme === 'dark'
          ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,5,3,0.55) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(160,110,70,0.14) 100%)',
        transition: 'background 0.7s ease',
      }} />
    </div>
  )
}
