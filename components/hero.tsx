'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const blurUp = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 14 },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}
const stagger = (delay = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
})

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
      style={{ paddingTop: '80px', background: 'transparent' }}
      aria-label="Hero"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-8"
        >
          <Badge>Certified Organic Botanicals</Badge>
        </motion.div>

        {/* Title — clip reveal */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: '105%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="heading-display"
            style={{
              fontSize: 'clamp(52px, 11vw, 130px)',
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
            }}
          >
            Sintonia
          </motion.h1>
        </div>

        {/* Subtitle — blur stagger */}
        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-x-3 mb-8"
          style={{ marginTop: '6px' }}
        >
          {['Therapeutic', 'Bodywork'].map((word, i) => (
            <motion.span
              key={i}
              variants={blurUp}
              className="heading-display"
              style={{
                fontSize: 'clamp(22px, 3.8vw, 40px)',
                color: 'var(--color-terra)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="body-text mx-auto mb-10"
          style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', maxWidth: '50ch' }}
        >
          Sintonia — <em>attunement</em> in Portuguese — is the art of coming back into
          harmony with yourself. Every session is crafted to bring you home.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href="#book">
            <button className="btn-gradient" aria-label="Book a session">
              Book a Session
              <ArrowRight size={15} />
            </button>
          </a>
          <Button variant="ghost" size="lg" asChild>
            <Link href="#treatments">Explore Treatments</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span
          className="text-[10px] tracking-[0.12em] uppercase font-medium"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Scroll
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-terra)" strokeWidth="1.6">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
