import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui/index';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);
  const [form, setForm] = useState({
    email: '', username: '', password: '', confirmPassword: '', dateOfBirth: '', terms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.terms) return setError('You must accept the terms');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');

    // Age check
    const dob = new Date(form.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / 31557600000);
    if (age < 18) return setError('You must be 18 or older to register');

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="card max-w-md w-full text-center space-y-4"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-gold text-5xl">&#9993;</div>
          <h2 className="font-display text-2xl text-gold">Check your email</h2>
          <p className="text-txt-muted font-body">
            We sent a verification link. Click it to activate your account.
          </p>
          <Link to="/login" className="btn-ghost inline-block mt-4">Go to Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface items-center justify-center p-12 border-r border-gold/5">
        <div className="max-w-md">
          <h1 className="font-display text-5xl text-gold mb-4">THREES</h1>
          <p className="text-txt-muted font-body text-lg leading-relaxed mb-6">
            Join the table. Real wagers, real payouts, real competition.
          </p>
          <div className="space-y-3 text-sm text-txt-muted font-body">
            <p>&#10003; Server-authoritative dice rolls (crypto-random)</p>
            <p>&#10003; Instant payouts to your wallet</p>
            <p>&#10003; 2-6 player tables from $0.25 to $500</p>
            <p>&#10003; Responsible gambling controls built in</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="font-display text-3xl text-gold block text-center mb-8 lg:hidden">THREES</Link>
          <h2 className="font-display text-2xl text-gold mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-loss/10 border border-loss/20 text-loss text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              required
              minLength={3}
              maxLength={20}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            <Input
              label="Date of birth"
              type="date"
              value={form.dateOfBirth}
              onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
              required
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={e => setForm({ ...form, terms: e.target.checked })}
                className="accent-gold mt-1"
              />
              <span className="text-xs text-txt-muted">
                I am 18 years or older, I accept the Terms of Service and Privacy Policy, and I acknowledge that real money is at risk.
              </span>
            </label>

            <Button variant="primary" className="w-full" loading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-txt-muted">
            Already playing?{' '}
            <Link to="/login" className="text-gold hover:text-gold-bright transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
