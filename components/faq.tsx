'use client'
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const FAQS = [
  {
    q: 'Is this like massage?',
    a: 'Structural integration and massage share the same medium — hands on tissue — but the intention is different. Massage primarily addresses muscle tension and promotes relaxation. Structural integration works with fascia to change the body\'s postural organization and movement patterns. The effects tend to be more cumulative and structural in nature.',
  },
  {
    q: 'How many sessions do I need?',
    a: 'The classic model is a 10-series: ten sessions that systematically address the whole body from the surface layers inward, then integrate the changes. Some people come for a single session or a shorter series to address a specific area. We\'ll discuss what makes sense for your body and goals at your first appointment.',
  },
  {
    q: 'Does it hurt?',
    a: 'Structural integration can involve intense sensation — particularly in areas of long-held tension or restriction. The work is paced to stay within a "productive discomfort" range: enough input to create change, never so much that your nervous system guards. You always have input into the depth and pace.',
  },
  {
    q: 'How is this different from chiropractic?',
    a: 'Chiropractic focuses primarily on joint alignment and spinal manipulation. Structural integration works with the soft tissue — fascia, muscle, and connective tissue — that determines how your skeleton is held and how you move. The approaches address different layers of the same problem and can be complementary.',
  },
  {
    q: 'What should I expect in the first session?',
    a: 'We begin with a postural and movement assessment — watching how you stand, walk, and breathe. This gives us a structural map before any hands-on work begins. The hands-on work itself is focused, quiet, and paced to your body\'s responses. Most clients describe leaving feeling taller and more at ease than when they arrived.',
  },
  {
    q: 'What should I wear?',
    a: 'Minimal clothing allows the most accurate assessment and the most direct tissue access — underwear is typical, or athletic shorts and a sports bra. Comfort matters: if you\'d prefer to keep more clothing on, we\'ll work with that. Communication throughout is encouraged.',
  },
  {
    q: 'Who is this work for?',
    a: 'Anyone whose body has been compensating — which is most of us. Runners and athletes hitting performance ceilings, desk workers with chronic neck and shoulder tension, people post-injury whose patterns never quite reset, and movement practitioners who want deeper access to their own structure. If you feel like something is "off," this work is likely for you.',
  },
]

function FAQItem({ item, i }: { item: typeof FAQS[0]; i: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="border-b" style={{ borderColor: 'var(--color-border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        style={{ color: 'var(--color-text)' }}
      >
        <span className="heading-serif font-medium" style={{ fontSize: 'clamp(16px,1.4vw,18px)' }}>
          {item.q}
        </span>
        <motion.span animate={{ rotate: open ? 0 : 0 }} className="flex-shrink-0 mt-0.5" style={{ color: '#b55a3a' }}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '68ch' }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="faq" className="section" style={{ background: 'transparent' }}>
      <div className="container-default">
        <div className="grid md:grid-cols-[280px_1fr] gap-16 items-start">
          {/* Left label */}
          <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }} className="md:sticky md:top-28">
            <Badge className="mb-5">FAQ</Badge>
            <h2 className="heading-display mb-4" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', color: 'var(--color-text)' }}>
              Common Questions
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '28ch' }}>
              Structural integration is unfamiliar territory for most people.
              Here's what comes up most.
            </p>
          </motion.div>
          {/* Accordion */}
          <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
            {FAQS.map((item, i) => <FAQItem key={i} item={item} i={i} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
