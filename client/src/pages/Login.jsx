import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Eyebrow } from '../components/ui/index';
import { Die } from '../components/dice/index';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
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
      const code = err.response?.data?.code;
      const msg = err.response?.data?.error || 'Login failed';
      setError(code === 'EMAIL_NOT_VERIFIED' ? 'Check your email to verify your account first.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
    } finally {
      setForgotSent(true);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-bone overflow-hidden">
      <div className="overhead-cone" />
      <div className="felt-pool" />

      <header className="relative z-10 px-8 py-6">
        <Link to="/" className="inline-flex items-baseline gap-2 group">
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
          <Eyebrow>Welcome Back</Eyebrow>
          <h1
            className="font-display text-bone mt-3 mb-6"
            style={{ fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
          >
            The table is set.
          </h1>
          <p className="font-ui text-[16px] text-bone-dim leading-relaxed max-w-md">
            Five dice. Lowest score wins. The threes are worth nothing. Sit down and play.
          </p>
          <div className="mt-12 flex gap-2">
            {[1, 3, 5, 6, 3].map((v, i) => (
              <Die key={i} value={v} size={56} delay={i * 60} />
            ))}
          </div>
          <div className="eyebrow mt-4">Sample roll · score 12</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          {forgotMode ? (
            <ForgotForm
              sent={forgotSent}
              email={forgotEmail}
              onEmail={setForgotEmail}
              onSubmit={handleForgot}
              onBack={() => {
                setForgotMode(false);
                setForgotSent(false);
              }}
            />
          ) : (
            <>
              <Eyebrow>Sign In</Eyebrow>
              <h2
                className="font-display text-bone mt-2 mb-8"
                style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}
              >
                Take your seat.
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

              <form onSubmit={handleLogin} className="space-y-7">
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  placeholder="you@table.com"
                />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="font-mono text-[11px] tracking-[0.16em] uppercase text-bone-dim hover:text-gold-bright transition-colors"
                  >
                    Forgot password
                  </button>
                </div>
                <Button loading={isLoading} className="w-full" size="lg">
                  Sign In
                </Button>
              </form>

              <p className="mt-8 text-center font-ui text-[14px] text-bone-dim">
                No account?{' '}
                <Link to="/register" className="text-gold-bright hover:underline underline-offset-4">
                  Create one
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-hairline px-8 py-5 text-center font-mono text-[10px] tracking-[0.18em] uppercase text-bone-faint">
        18+ Only · Gamble Responsibly
      </footer>
    </div>
  );
}

function ForgotForm({ sent, email, onEmail, onSubmit, onBack }) {
  if (sent) {
    return (
      <div>
        <Eyebrow>Sent</Eyebrow>
        <h2
          className="font-display text-bone mt-2 mb-4"
          style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          Check your inbox.
        </h2>
        <p className="font-ui text-[14px] text-bone-dim mb-8">
          If an account exists, we sent a reset link to that address.
        </p>
        <button onClick={onBack} className="btn-ghost w-full">
          Back to sign in
        </button>
      </div>
    );
  }
  return (
    <div>
      <Eyebrow>Reset</Eyebrow>
      <h2
        className="font-display text-bone mt-2 mb-8"
        style={{ fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}
      >
        Forgot it.
      </h2>
      <form onSubmit={onSubmit} className="space-y-7">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          required
          placeholder="you@table.com"
        />
        <Button className="w-full" size="lg">
          Send Reset Link
        </Button>
      </form>
      <button onClick={onBack} className="mt-6 w-full text-center font-mono text-[11px] tracking-[0.16em] uppercase text-bone-dim hover:text-gold-bright transition-colors">
        Back to sign in
      </button>
    </div>
  );
}
