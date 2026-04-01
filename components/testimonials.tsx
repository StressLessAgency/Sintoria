'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const TESTIMONIALS = [
  { quote: 'I walked in carrying the invisible weight of months of chronic tension. I left feeling like something had been gently handed back to me. The work here goes beyond technique — it is pure intuition.', name: 'A.M.', label: 'Regular client' },
  { quote: 'Two years of chronic back pain — gone after three sessions. I have no other word for it: healing.', name: 'T.B.', label: 'New client' },
  { quote: 'We did the couples session for our anniversary. Most restorative evening of our marriage. Already rebooked.', name: 'R. & J.K.', label: 'Couples Session' },
]

const blurUp = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 14 },
  show: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = (d = 0.1) => ({ hidden: {}, show: { transition: { staggerChildren: d, delayChildren: 0.1 } } })

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
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
  return (
    <section id="testimonials" className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container-default">
        <motion.div ref={ref} variants={stagger()} initial="hidden" animate={inView ? 'show' : 'hidden'} className="mb-14 text-center">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex justify-center mb-4">
            <Badge>Client Voices</Badge>
          </motion.div>
          <motion.h2 variants={blurUp} className="heading-display" style={{ fontSize: 'clamp(30px, 4.5vw, 54px)', color: 'var(--color-text)' }}>
            What clients say
          </motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => <TestiCard key={i} t={t} i={i} />)}
        </div>
      </div>
    </section>
  )
}
