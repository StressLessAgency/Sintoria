import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui/index';
import { toast } from '../components/ui/index';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const from = location.state?.from?.pathname || '/lobby';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Check your email to verify your account first.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch {
      setForgotSent(true); // Don't reveal if email exists
    }
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="font-display text-3xl text-gold block text-center mb-8">THREES</Link>

          {forgotSent ? (
            <div className="card text-center space-y-4">
              <div className="text-gold text-4xl">&#9993;</div>
              <h2 className="font-display text-xl text-gold">Check your email</h2>
              <p className="text-txt-muted text-sm">If an account exists, we sent a reset link.</p>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="text-sm text-gold hover:text-gold-bright transition-colors">
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="card space-y-6">
              <h2 className="font-display text-xl text-gold">Reset password</h2>
              <form onSubmit={handleForgot} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
                <Button variant="primary" className="w-full">Send Reset Link</Button>
              </form>
              <button onClick={() => setForgotMode(false)} className="text-sm text-txt-muted hover:text-gold transition-colors block text-center w-full">
                Back to sign in
              </button>
            </div>
          )}
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
          <p className="text-txt-muted font-body text-lg leading-relaxed">
            Six dice. One rule. The lowest score loses everything.
            Every three you roll is a zero. Roll all threes and you're out instantly.
          </p>
          <div className="mt-8 flex gap-3">
            {[3, 3, 5, 6, 3, 1].map((v, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-sm
                  ${v === 3 ? 'border-loss/40 bg-loss/10 text-loss' : 'border-gold/20 bg-dice text-void'}`}
              >
                {v}
              </div>
            ))}
          </div>
          <p className="text-xs text-txt-faint font-mono mt-3">Score: 12 (three 3s = 0)</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="font-display text-3xl text-gold block text-center mb-8 lg:hidden">THREES</Link>
          <h2 className="font-display text-2xl text-gold mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-loss/10 border border-loss/20 text-loss text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-xs text-txt-muted hover:text-gold transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button variant="primary" className="w-full" loading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-txt-muted">
            No account?{' '}
            <Link to="/register" className="text-gold hover:text-gold-bright transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
