// Synthesized percussion via Web Audio. No assets, no decoding, no pop on
// startup. Every sound is built from oscillators and noise bursts shaped by
// short envelopes — adds ~3 KB to the bundle and sounds in the right tier:
// crisp, dry, room-of-stone rather than cartoon clack.
//
// Browsers gate AudioContext.start() behind a user gesture. We lazily create
// the context on first `play()` call (which is itself triggered by a user
// action — rolling, locking, etc.) and resume it if it's suspended.

const STORAGE_KEY = 'threes:sound:muted';

let ctx = null;
let masterGain = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
}

let muted = readMuted();
const listeners = new Set();

export function isMuted() {
  return muted;
}

export function setMuted(next) {
  muted = !!next;
  writeMuted(muted);
  listeners.forEach((fn) => fn(muted));
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

export function subscribeMuted(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function noiseBuffer(duration) {
  const c = getCtx();
  if (!c) return null;
  const length = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * Bone die hitting felt. Bright transient (filtered noise) under a short
 * pitched ping. ~80ms total.
 */
function clack({ velocity = 1, pitch = 720 } = {}) {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;

  // Filtered noise burst — the "smack."
  const buf = noiseBuffer(0.08);
  if (!buf) return;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2400;
  bp.Q.value = 1.3;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.32 * velocity, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  noise.connect(bp).connect(ng).connect(masterGain);
  noise.start(t);
  noise.stop(t + 0.08);

  // Pitched ping — the "bone."
  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, t + 0.09);
  const og = c.createGain();
  og.gain.setValueAtTime(0.14 * velocity, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(og).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.11);
}

/**
 * Lock — die sliding into the locked tray. Softer, lower, with a tail.
 */
function thunk() {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.24, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.18);
}

/**
 * Gold chime — small positive moment (your turn, hand complete).
 */
function chime() {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;
  const freqs = [880, 1320]; // perfect fifth, bright but not saccharine
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = c.createGain();
    const start = t + i * 0.04;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
    osc.connect(g).connect(masterGain);
    osc.start(start);
    osc.stop(start + 0.6);
  });
}

/**
 * Win peal — three rising tones, slightly detuned for warmth.
 */
function peal() {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;
  const notes = [
    { f: 660, dt: 0 },
    { f: 880, dt: 0.13 },
    { f: 1320, dt: 0.28 },
  ];
  notes.forEach(({ f, dt }) => {
    [0, +2].forEach((cents, k) => {
      const osc = c.createOscillator();
      osc.type = k === 0 ? 'triangle' : 'sine';
      osc.frequency.value = f * Math.pow(2, cents / 1200);
      const g = c.createGain();
      const start = t + dt;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(k === 0 ? 0.22 : 0.1, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
      osc.connect(g).connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  });
}

/**
 * "Shooting the Moon" — a brighter, longer peal with shimmer.
 */
function moon() {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;
  const notes = [880, 1175, 1320, 1760];
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = c.createGain();
    const start = t + i * 0.09;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, start + 1.4);
    osc.connect(g).connect(masterGain);
    osc.start(start);
    osc.stop(start + 1.5);
  });
}

/**
 * Soft loss tone — single low fall, brief.
 */
function fall() {
  const c = getCtx();
  if (!c || muted) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.45);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g).connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.55);
}

const sounds = {
  clack: () => clack(),
  clackBright: () => clack({ pitch: 880, velocity: 1.05 }),
  thunk,
  chime,
  peal,
  moon,
  fall,
};

export function play(name) {
  if (muted) return;
  const fn = sounds[name];
  if (fn) fn();
}

/**
 * Single die impact with optional pitch. Used by each <Die> when it lands.
 * Randomizes pitch by default so a row of 5 doesn't sound like a snare roll.
 */
export function playClack({ pitch, velocity } = {}) {
  if (muted) return;
  clack({
    pitch: pitch ?? 620 + Math.random() * 260,
    velocity: velocity ?? 0.9 + Math.random() * 0.2,
  });
}

/**
 * Stagger N clacks for a multi-die landing. spacingMs controls separation
 * between each die's impact; jitter randomizes pitch slightly so it doesn't
 * sound like a snare roll.
 */
export function playDiceLanding(count, { spacingMs = 70, baseDelayMs = 0 } = {}) {
  if (muted || count <= 0) return;
  for (let i = 0; i < count; i++) {
    const pitch = 660 + Math.random() * 220;
    setTimeout(() => {
      if (!muted) clack({ pitch, velocity: 0.9 + Math.random() * 0.2 });
    }, baseDelayMs + i * spacingMs);
  }
}
