'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SERVICES = [
  { icon: '◈', name: 'Hot Stone Ritual', duration: '90 min', desc: 'Heated basalt stones melt tension at the cellular level while grounding your energy in deep, meditative warmth.' },
  { icon: '◇', name: 'Swedish Massage', duration: '60 / 90 min', desc: 'Long, flowing strokes orchestrated to ease tension, improve circulation, and invite profound rest into every layer of your being.' },
  { icon: '◉', name: 'Deep Tissue', duration: '75 / 90 min', desc: 'Targeted, intentional pressure that reaches deep muscle strata — breaking adhesions and releasing patterns your body has held for years.' },
  { icon: '✦', name: 'Aromatherapy', duration: '60 min', desc: 'Curated organic essential oils and gentle techniques for a full sensory journey — calming mind, body, and the spaces in between.' },
  { icon: '◎', name: 'Prenatal', duration: '60 min', desc: 'Specialist techniques honoring the sacred journey of pregnancy — gentle, supportive, and tailored to each trimester.' },
  { icon: '⬡', name: 'Couples Session', duration: '90 min', desc: 'Two therapists, one tranquil room — a shared ritual of healing designed to restore harmony between two people.' },
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
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={fadeUp}
      transition={{ delay: i * 0.07 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
    >
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
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xs font-medium"
          style={{ color: '#b55a3a' }}
        >
          Book this treatment <ArrowRight size={12} />
        </motion.div>
      </Card>
    </motion.div>
  )
}

export default function Treatments() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="treatments" className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container-default">
        <motion.div ref={ref} variants={stagger(0.1)} initial="hidden" animate={inView ? 'show' : 'hidden'} className="mb-16 max-w-xl">
          <motion.div variants={fadeUp} className="mb-4"><Badge>Treatments</Badge></motion.div>
          <motion.h2 variants={blurUp} className="heading-display mb-4" style={{ fontSize: 'clamp(34px, 5vw, 62px)', color: 'var(--color-text)' }}>
            The Treatments
          </motion.h2>
          <motion.p variants={fadeUp} className="body-text" style={{ fontSize: '16px', maxWidth: '52ch' }}>
            Therapeutic bodywork rooted in intention. Each session is a conversation between skilled hands and your body&apos;s own wisdom.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => <ServiceCard key={s.name} s={s} i={i} />)}
        </div>
      </div>
    </section>
  )
}
