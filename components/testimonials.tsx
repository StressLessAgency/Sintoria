'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TESTIMONIALS = [
  {
    quote: 'I\'d seen three physical therapists, two chiropractors, and a sports medicine doctor for my hip. Nothing stuck. After the 10-series with Sintonia, I understand what was actually happening — and my body finally feels organized.',
    name: 'M.R.',
    label: 'Runner · completed 10-series',
  },
  {
    quote: 'I was skeptical of anything that wasn\'t evidence-based. What I found was someone who understood anatomy better than most clinicians I\'d seen — and whose hands actually changed things. The work is real.',
    name: 'D.K.',
    label: 'Physician · desk worker series',
  },
  {
    quote: 'I came in guarded and left feeling like something I\'d been carrying for years had been quietly returned. That first session — I cried on the table. Not from pain. From release.',
    name: 'A.T.',
    label: 'Yoga practitioner · post-injury restoration',
  },
]

function TestiCard({ t, i }: { t: typeof TESTIMONIALS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.12, type: 'spring', damping: 22, stiffness: 130 }}>
      <Card className="flex flex-col gap-4 h-full">
        <div className="flex gap-1">
          {[...Array(5)].map((_, k) => (
            <svg key={k} width="13" height="13" viewBox="0 0 24 24" fill="#b55a3a">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="flex-1" style={{ fontFamily: 'var(--font-cormorant,"Cormorant Garamond",Georgia,serif)', fontSize: 'clamp(16px,1.4vw,18px)', fontStyle: 'italic', lineHeight: 1.68, color: 'var(--color-text)' }}>
          &ldquo;{t.quote}&rdquo;
        </p>
        <Separator />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#b55a3a,#d4745a)' }}>
            {t.name[0]}
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>{t.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{t.label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }
  return (
    <section id="testimonials" className="section" style={{ background: 'transparent' }}>
      <div className="container-default">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className="mb-14 text-center">
          <motion.div variants={fadeUp} className="flex justify-center mb-4"><Badge>Client Stories</Badge></motion.div>
          <motion.h2 variants={fadeUp} className="heading-display mb-3" style={{ fontSize: 'clamp(30px, 4.5vw, 54px)', color: 'var(--color-text)' }}>
            What the Work Feels Like
          </motion.h2>
          <motion.p variants={fadeUp} className="body-text mx-auto" style={{ fontSize: '15px', maxWidth: '46ch' }}>
            Structural integration is felt before it's understood. These are some of the ways clients have put it into words.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => <TestiCard key={i} t={t} i={i} />)}
        </div>
      </div>
    </section>
  )
}
