import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Button
export function Button({ children, variant = 'primary', className, disabled, onClick, loading, ...props }) {
  return (
    <button
      className={cn(
        variant === 'primary' ? 'btn-primary' : 'btn-ghost',
        loading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
}

// Input
export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm text-txt-muted font-body">{label}</label>
      )}
      <input className={cn('input-field', error && 'border-loss/50', className)} {...props} />
      {error && <p className="text-xs text-loss">{error}</p>}
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
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
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={cn('relative bg-elevated border border-gold/15 p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto', className)}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display text-gold">{title}</h2>
                <button onClick={onClose} className="text-txt-muted hover:text-txt-primary transition-colors text-xl">
                  &#215;
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

// Badge
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-txt-faint/20 text-txt-muted',
    micro: 'badge-micro',
    low: 'badge-low',
    mid: 'badge-mid',
    high: 'badge-high',
    success: 'bg-win/20 text-win',
    danger: 'bg-loss/20 text-loss',
    gold: 'bg-gold/20 text-gold',
    pulse: 'bg-win/20 text-win',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {variant === 'pulse' && (
        <span className="w-1.5 h-1.5 bg-win rounded-full mr-1.5 animate-pulse" />
      )}
      {children}
    </span>
  );
}

// Toast system
let toastId = 0;
const toastListeners = new Set();

export function toast(message, type = 'info') {
  const id = ++toastId;
  toastListeners.forEach(fn => fn({ id, message, type }));
  return id;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 4000);
    };
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);

  const colors = {
    info: 'border-gold/30 bg-elevated',
    success: 'border-win/30 bg-win/10',
    error: 'border-loss/30 bg-loss/10',
    warning: 'border-gold/30 bg-gold/10',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn('p-4 border font-body text-sm text-txt-primary', colors[t.type])}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Skeleton loader
export function Skeleton({ className }) {
  return <div className={cn('skeleton h-4', className)} />;
}

// Tooltip
export function Tooltip({ children, text }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-elevated border border-gold/15 text-xs text-txt-primary font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-elevated" />
      </div>
    </div>
  );
}
