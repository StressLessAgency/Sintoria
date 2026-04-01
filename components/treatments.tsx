'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SERVICES = [
  {
    icon: '◈',
    name: 'The 10-Series',
    duration: '10 sessions',
    desc: 'The complete arc of structural integration. Each session addresses a distinct layer — sleeve, core, and integration — systematically unwinding compensation patterns and restoring your body\'s relationship with gravity.',
    cta: 'Begin the series',
  },
  {
    icon: '◇',
    name: 'Single Integration Session',
    duration: '75 – 90 min',
    desc: 'A focused session for those already familiar with SI work, or exploring the approach. We assess your structure, address the most pressing patterns, and map a path forward.',
    cta: 'Book a session',
  },
  {
    icon: '◉',
    name: 'Movement Assessment',
    duration: '60 min',
    desc: 'A detailed functional movement screen — how you stand, walk, breathe, and load your joints. We identify where your body compensates and what\'s driving it, before hands ever meet tissue.',
    cta: 'Assess your movement',
  },
  {
    icon: '✦',
    name: 'Athletic Performance Series',
    duration: '4 – 6 sessions',
    desc: 'Built for runners, cyclists, and field athletes hitting structural ceilings. We address the fascial restrictions and postural patterns limiting your efficiency, power transfer, and recovery.',
    cta: 'Elevate your training',
  },
  {
    icon: '◎',
    name: 'Desk Worker Reset',
    duration: '3-session series',
    desc: 'For those whose bodies have adapted — and protested — to years of seated work. Chronic neck tension, rounded shoulders, compressed hip flexors: we address the root, not the symptom.',
    cta: 'Reset your posture',
  },
  {
    icon: '⬡',
    name: 'Post-Injury Restoration',
    duration: 'Custom series',
    desc: 'After injury, the body protects itself — often long after it needs to. We gently release the guarding, address the compensatory patterns that formed around the wound, and restore full function.',
    cta: 'Restore your body',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 200 } },
}
const blurUp = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 14 },
  show: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = (d = 0.08) => ({ hidden: {}, show: { transition: { staggerChildren: d, delayChildren: 0.1 } } })

function ServiceCard({ s, i }: { s: typeof SERVICES[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'show' : 'hidden'} variants={fadeUp}
      transition={{ delay: i * 0.07 }} whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}>
      <Card className="flex flex-col gap-4 h-full cursor-default">
        <div className="flex items-start justify-between">
          <span className="text-2xl leading-none" style={{ color: '#b55a3a' }}>{s.icon}</span>
          <span className="text-[11px] tracking-wide uppercase font-medium px-2.5 py-1 rounded-full border"
            style={{ color: 'var(--color-text-faint)', background: 'rgba(181,90,58,0.06)', borderColor: 'rgba(181,90,58,0.14)' }}>
            {s.duration}
          </span>
        </div>
        <CardTitle className="heading-serif">{s.name}</CardTitle>
        <Separator />
        <CardDescription className="flex-1 text-sm leading-relaxed">{s.desc}</CardDescription>
        <motion.a href="#book" initial={{ opacity: 0.6, x: -4 }} whileHover={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs font-medium" style={{ color: '#b55a3a' }}>
          {s.cta} <ArrowRight size={12} />
        </motion.a>
      </Card>
    </motion.div>
  )
}

export default function Treatments() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="treatments" className="section" style={{ background: 'transparent' }}>
      <div className="container-default">
        <motion.div ref={ref} variants={stagger(0.1)} initial="hidden" animate={inView ? 'show' : 'hidden'} className="mb-16 max-w-xl">
          <motion.div variants={fadeUp} className="mb-4"><Badge>The Work</Badge></motion.div>
          <motion.h2 variants={blurUp} className="heading-display mb-4"
            style={{ fontSize: 'clamp(34px, 5vw, 62px)', color: 'var(--color-text)' }}>
            How We Work Together
          </motion.h2>
          <motion.p variants={fadeUp} className="body-text" style={{ fontSize: '16px', maxWidth: '55ch' }}>
            Structural integration is cumulative, intentional work. Each session builds on the last —
            addressing deeper layers of fascia, posture, and movement as your body becomes ready to change.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => <ServiceCard key={s.name} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}
