'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewClient() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <section id="book" ref={ref}
      style={{ background: 'linear-gradient(135deg, #b55a3a 0%, #9a4a2e 100%)', color: '#f8f0e8' }}
      className="relative overflow-hidden" aria-labelledby="new-client-heading">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-[0.18em] uppercase mb-6 font-medium" style={{ color: 'rgba(248,240,232,0.55)' }}>
          New Clients
        </motion.p>

        <motion.h2 id="new-client-heading" initial={{ opacity: 0, y: 26 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="heading-display mb-5"
          style={{ fontSize: 'clamp(30px, 6vw, 64px)', color: '#f8f0e8', fontWeight: 400 }}>
          Let&rsquo;s Assess<br /><em>Your Structure</em>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.22, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="body-text mb-10"
          style={{ color: 'rgba(248,240,232,0.72)', maxWidth: '46ch', margin: '0 auto 40px' }}>
          Your first session begins with a full structural and movement assessment — no hands-on work until
          we both understand what your body is doing and why. New clients receive 20% off their first session.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-4">
          <Link href="tel:+1-555-000-0000">
            <button className="flex items-center gap-2 px-7 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: '#f8f0e8', color: '#9a4a2e' }} aria-label="Call to book">
              Call to Book <ArrowRight size={14} />
            </button>
          </Link>
          <Button variant="ghost" asChild
            className="border border-[rgba(248,240,232,0.3)] text-[#f8f0e8] hover:bg-[rgba(248,240,232,0.1)]">
            <Link href="mailto:hello@sintoniabodywork.com">Email Us</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
