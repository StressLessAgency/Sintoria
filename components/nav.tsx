'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Treatments', href: '#treatments' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('sintonia-theme')
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const initial = (saved as 'light' | 'dark') ?? (mq.matches ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('sintonia-theme', next)
  }, [theme])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled && 'backdrop-blur-md border-b border-[var(--color-border)] shadow-sm'
      )}
      style={{ background: scrolled ? 'rgba(248,243,236,0.9)' : 'transparent' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Sintonia Bodywork home">
          <Logo
            size={27}
            className="text-terra transition-transform duration-300 group-hover:rotate-12"
          />
          <span className="heading-serif text-xl tracking-wide" style={{ color: 'var(--color-text)' }}>
            Sintonia
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors duration-200 hover:text-terra"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-lg">
            <Link href="#book">Book a Session</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border-0"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg border-0"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden border-t border-[var(--color-border)]"
            style={{ background: 'var(--color-bg)' }}
          >
            <nav className="px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm font-medium py-1"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild className="justify-center">
                <Link href="#book" onClick={() => setMobileOpen(false)}>
                  Book a Session
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
