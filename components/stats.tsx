'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: '8+', label: 'Years of practice' },
  { value: '4,200+', label: 'Sessions completed' },
  { value: '100%', label: 'Organic botanicals' },
  { value: '97%', label: 'Client return rate' },
]

export default function Stats() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <section ref={ref} style={{ background: '#1e1916', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,80px)' }}>
      <div className="container-default grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.09, type: 'spring', damping: 28, stiffness: 200 }} className="text-center">
            <p className="heading-display" style={{ fontSize: 'clamp(30px, 4vw, 50px)', color: '#d4745a', lineHeight: 1 }}>
              {s.value}
            </p>
            <p className="text-xs tracking-wider uppercase font-medium mt-2" style={{ color: '#4a3f38' }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
