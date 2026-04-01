'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function NewClient() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="book"
      ref={ref}
      style={{ background: 'linear-gradient(135deg, #b55a3a 0%, #9a4a2e 100%)', color: '#f8f0e8' }}
      className="relative overflow-hidden"
      aria-labelledby="new-client-heading"
    >
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-7"
        >
          <span className="terra-badge" style={{ background: 'rgba(248,240,232,0.18)', color: '#f8f0e8', border: '1px solid rgba(248,240,232,0.25)' }}>
            New Client Offer
          </span>
        </motion.div>

        <motion.h2
          id="new-client-heading"
          initial={{ opacity: 0, y: 26 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="heading-display mb-5"
          style={{ fontSize: 'clamp(30px, 6vw, 64px)', color: '#f8f0e8', fontWeight: 400 }}
        >
          Your First Session,<br />
          <em>20% Off</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="body-text mb-10"
          style={{ color: 'rgba(248,240,232,0.75)', maxWidth: '42ch', margin: '0 auto 40px' }}
        >
          Experience what Sintonia Bodywork is about. Your first 60- or 90-minute session comes
          with a welcome discount — no code needed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="tel:+1-555-000-0000">
            <button
              className="flex items-center gap-2 px-7 py-3 rounded-lg font-medium text-sm transition-all duration-200"
              style={{ background: '#f8f0e8', color: '#9a4a2e' }}
              aria-label="Call to book"
            >
              Call to Book <ArrowRight size={14} />
            </button>
          </Link>
          <Button variant="ghost" asChild className="border border-[rgba(248,240,232,0.3)] text-[#f8f0e8] hover:bg-[rgba(248,240,232,0.1)]">
            <Link href="mailto:hello@sintonibodywork.com">Email Us</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
