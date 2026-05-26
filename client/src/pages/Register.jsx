import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Eyebrow } from '../components/ui/index';
import { Die } from '../components/dice/index';

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    terms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.terms) return setError('You must accept the terms.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    const dob = new Date(form.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / 31557600000);
    if (age < 18) return setError('You must be 18 or older to register.');

    setIsLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
        <div className="overhead-cone" />
        <div className="felt-pool" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex-1 flex items-center justify-center px-4"
        >
          <div className="surface max-w-md w-full px-10 py-12 text-center">
            <Eyebrow>Sent</Eyebrow>
            <h2
              className="font-display text-bone mt-2 mb-4"
              style={{ fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em' }}
            >
              Check your email.
            </h2>
            <p className="font-ui text-[14px] text-bone-dim mb-8 max-w-xs mx-auto">
              We sent a verification link. Click it to activate your seat at the table.
            </p>
            <Link to="/login" className="btn-ghost inline-block">
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
      <div className="overhead-cone" />
      <div className="felt-pool" />

      <header className="relative z-10 px-8 py-6">
        <Link to="/" className="inline-flex items-baseline gap-2">
          <span className="font-display text-[20px] tracking-[0.14em] text-bone">
            THR<span className="font-display-italic text-red-hot">3</span>ES
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 grid lg:grid-cols-2 items-center px-6 pb-12 max-w-6xl mx-auto w-full gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="hidden lg:flex flex-col"
        >
          <Eyebrow>New Seat</Eyebrow>
          <h1
            className="font-display text-bone mt-3 mb-6"
            style={{ fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
          >
            Pull up a chair.
          </h1>
          <ul className="space-y-3 font-ui text-[15px] text-bone-dim">
            <li className="flex items-baseline gap-3">
              <span className="text-gold-bright">·</span> Server-authoritative rolls (crypto-random, never tampered).
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-gold-bright">·</span> Instant payouts on every settled hand.
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-gold-bright">·</span> Tables from $0.25 ante to $500.
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-gold-bright">·</span> Real responsible-play controls baked in.
            </li>
          </ul>
          <div className="mt-12 flex gap-2">
            {[6, 6, 6, 6, 6].map((v, i) => (
              <Die key={i} value={v} size={48} delay={i * 60} />
            ))}
          </div>
          <div className="eyebrow mt-3">Shoot the moon — five sixes, instant win.</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          <Eyebrow>Create Account</Eyebrow>
          <h2
            className="font-display text-bone mt-2 mb-8"
            style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            Sit down.
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 border border-red-hot/40 bg-red-hot/10 text-red-hot text-[13px] font-ui"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@table.com"
            />
            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })
              }
              required
              minLength={3}
              maxLength={20}
              placeholder="ace_high"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              placeholder="8+ characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              placeholder="••••••••"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              required
              max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
            />

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="accent-gold-bright mt-1 shrink-0"
              />
              <span className="font-ui text-[12px] text-bone-dim leading-relaxed">
                I’m 18+, accept the Terms and Privacy Policy, and understand real money is at risk.
              </span>
            </label>

            <Button loading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center font-ui text-[14px] text-bone-dim">
            Already playing?{' '}
            <Link to="/login" className="text-gold-bright hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-hairline px-8 py-5 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
        18+ Only · Gamble Responsibly
      </footer>
    </div>
  );
}
