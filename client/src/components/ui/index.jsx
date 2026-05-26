import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  className,
  disabled,
  onClick,
  loading,
  pulse = false,
  size = 'md',
  ...props
}) {
  const sizes = {
    sm: { padding: '10px 18px', fontSize: 12 },
    md: { padding: '14px 28px', fontSize: 13 },
    lg: { padding: '18px 40px', fontSize: 14 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={sizes[size]}
      className={cn(
        variant === 'primary' ? 'btn-primary' : 'btn-ghost',
        pulse && variant === 'primary' && 'warm-pulse',
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="field-label">{label}</label>}
      <input
        className={cn('field', error && '!border-red-hot', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-hot font-mono mt-1">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-bg/85 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'surface relative w-full max-w-md max-h-[85vh] overflow-y-auto p-8',
              className
            )}
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          >
            {title && (
              <div className="flex items-center justify-between mb-7">
                <div>
                  <div className="eyebrow mb-1">Threes</div>
                  <h2 className="font-display text-2xl text-bone">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-bone-dim hover:text-bone-bright transition-colors w-8 h-8 flex items-center justify-center"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1L13 13M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-ash text-bone-dim',
    gold: 'text-gold-bright',
    success: 'text-green',
    danger: 'text-red-hot',
    pulse: 'text-green',
  };
  const borders = {
    default: 'border border-hairline',
    gold: 'border border-hairline-hi',
    success: 'border border-green/30',
    danger: 'border border-red-hot/30',
    pulse: 'border border-green/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 font-mono uppercase tracking-[0.16em] text-[10px] font-medium',
        variants[variant],
        borders[variant],
        className
      )}
    >
      {variant === 'pulse' && (
        <span className="w-1 h-1 bg-green rounded-full animate-pulse" />
      )}
      {children}
    </span>
  );
}

let toastId = 0;
const toastListeners = new Set();

export function toast(message, type = 'info') {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ id, message, type }));
  return id;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);

  const tone = {
    info: 'border-hairline-hi',
    success: 'border-green/40',
    error: 'border-red-hot/40',
    warning: 'border-gold/40',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className={cn('surface px-4 py-3 text-sm text-bone', tone[t.type] || tone.info)}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'h-4 bg-gradient-to-r from-ash via-bone-faint/50 to-ash bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function Tooltip({ children, text }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 surface text-[11px] text-bone font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </div>
    </div>
  );
}

export function Eyebrow({ children, className }) {
  return <div className={cn('eyebrow', className)}>{children}</div>;
}

export function Divider({ className }) {
  return <div className={cn('h-px w-full bg-hairline', className)} />;
}
