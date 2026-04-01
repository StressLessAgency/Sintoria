'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <section
      id="philosophy"
      ref={ref}
      style={{ background: '#1c1a16', color: '#e8e2d9' }}
      className="relative overflow-hidden"
      aria-labelledby="philosophy-heading"
    >
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-36 text-center">
        {/* Label */}
        <motion.p
          {...fadeUp(0)}
          className="text-xs tracking-[0.18em] uppercase mb-8 font-medium"
          style={{ color: '#9c8f7e' }}
        >
          Our Philosophy
        </motion.p>

        {/* Animated line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: '#b55a3a', height: '1px', transformOrigin: 'left', marginBottom: '40px' }}
        />

        {/* Quote — word stagger */}
        <motion.h2
          id="philosophy-heading"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="heading-display mb-6"
          style={{ fontSize: 'clamp(26px, 4.5vw, 50px)', lineHeight: 1.15, fontStyle: 'italic', color: '#f0e8dc', fontWeight: 400 }}
        >
          "The body holds every story the mind forgets — Sintonia is the act of listening."
        </motion.h2>

        {/* Animated line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: '#b55a3a', height: '1px', transformOrigin: 'right', marginBottom: '36px', marginTop: '36px' }}
        />

        <motion.p
          {...fadeUp(0.65)}
          className="body-text"
          style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: '#9c8f7e', maxWidth: '52ch', margin: '0 auto' }}
        >
          Every session at Sintonia Bodywork is a dialogue between the therapist's hands and the
          body's wisdom. We don't fix — we listen, attune, and let the body lead.
        </motion.p>
      </div>
    </section>
  )
}
