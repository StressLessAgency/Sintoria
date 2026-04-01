'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Instagram, Mail, Phone } from 'lucide-react'

const LINKS = [
  { label: 'Treatments', href: '#treatments' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Book a Session', href: '#book' },
]
const SOCIAL = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Mail, href: 'mailto:hello@sintoniabodywork.com', label: 'Email' },
  { icon: Phone, href: 'tel:+15550000000', label: 'Phone' },
]

export default function Footer() {
  return (
    <footer
      style={{ background: '#141210', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Logo size={24} className="text-[#b55a3a]" />
            <span className="heading-serif text-lg" style={{ color: '#e8e2d9' }}>Sintonia</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#6e665e', maxWidth: '26ch' }}>
            Therapeutic bodywork rooted in presence, touch, and attunement.
          </p>
        </div>

        {/* Nav */}
        <nav aria-label="Footer navigation">
          <p className="text-xs tracking-[0.12em] uppercase mb-4 font-medium" style={{ color: '#4d4740' }}>
            Navigate
          </p>
          <ul className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm transition-colors duration-200 hover:text-[#b55a3a]"
                  style={{ color: '#6e665e' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <p className="text-xs tracking-[0.12em] uppercase mb-4 font-medium" style={{ color: '#4d4740' }}>
            Connect
          </p>
          <ul className="flex flex-col gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-[#b55a3a]"
                  style={{ color: '#6e665e' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#4d4740' }}
      >
        <span>© 2026 Sintonia Bodywork. All rights reserved.</span>
        <span>St. Petersburg, FL</span>
      </div>
    </footer>
  )
}
