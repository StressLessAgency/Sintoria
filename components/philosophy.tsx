'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  { label: 'Structure', body: 'Pain and restriction are rarely local. A tight hip often speaks of a compensating shoulder, a guarded breath, a pelvis that stopped trusting itself years ago. We look at the whole.' },
  { label: 'Fascia', body: 'Your fascial network wraps every muscle, bone, and organ in continuous webbing. When one region tightens — from injury, posture, emotion, or repetition — the tension travels. We work with fascia to release what the body has been holding.' },
  { label: 'Gravity', body: 'A body in alignment moves through gravity with ease. When structure is off, every movement costs more than it should. Our work is to restore that ease — not temporarily, but systemically.' },
]

export default function Philosophy() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="philosophy" ref={ref} style={{ background: '#1c1a16', color: '#e8e2d9' }}
      className="relative overflow-hidden" aria-labelledby="philosophy-heading">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-36">

        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0, duration: 0.6 }}
            className="text-xs tracking-[0.18em] uppercase mb-6 font-medium" style={{ color: '#9c8f7e' }}>
            The Philosophy
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: '#b55a3a', height: '1px', transformOrigin: 'left', marginBottom: '28px' }} />
          <motion.h2 id="philosophy-heading" initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="heading-display" style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', fontStyle: 'italic', color: '#f0e8dc', fontWeight: 400, lineHeight: 1.15 }}>
            "The body is not a collection of parts that hurt. It is a system that adapted — and can adapt again."
          </motion.h2>
        </div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-12">
          {PILLARS.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
              <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: '#b55a3a', height: '1px', transformOrigin: 'left', marginBottom: '20px', width: '40px' }} />
              <h3 className="heading-serif mb-3" style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', color: '#d4c8bc', letterSpacing: '0.04em' }}>
                {p.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7a6e66' }}>{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* About the practitioner */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 pt-16 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs tracking-[0.14em] uppercase mb-5 font-medium" style={{ color: '#9c8f7e' }}>
            About the Practitioner
          </p>
          <p className="leading-relaxed mb-5" style={{ fontFamily: 'var(--font-cormorant,"Cormorant Garamond",Georgia,serif)', fontSize: 'clamp(17px, 1.6vw, 20px)', color: '#c4b8ae', fontStyle: 'italic' }}>
            Trained in Kinesis Myofascial Integration (KMI), ATSI, and independent structural integration,
            with additional background in functional movement, breath work, and somatic education.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#7a6e66' }}>
            This isn't massage — though tissue work is central to it. It isn't chiropractic — though
            structural alignment is the goal. Structural integration occupies its own category: slow,
            cumulative, fascial re-patterning that treats the whole person, not the presenting complaint.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
