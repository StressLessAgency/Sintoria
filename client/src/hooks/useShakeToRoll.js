import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'threes:shake:permission';
const SHAKE_THRESHOLD = 22; // m/s², feels like an intentional shake
const REARM_MS = 800;
const WINDOW_MS = 250;

function readPersistedPermission() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function writePersistedPermission(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore quota / private mode errors
  }
}

/**
 * Detect a phone shake and call `onShake` when one happens.
 *
 *  - iOS Safari (DeviceMotionEvent.requestPermission exists): caller must call
 *    `requestPermission()` from a user gesture handler. Once granted the
 *    listener auto-attaches and the grant is cached in localStorage.
 *  - Android Chrome / desktop browsers with DeviceMotionEvent: listener
 *    attaches immediately.
 *  - No DeviceMotionEvent (older Safari, most desktops): does nothing.
 */
export function useShakeToRoll({ enabled, onShake }) {
  const supported =
    typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';
  const requiresPrompt =
    supported && typeof window.DeviceMotionEvent.requestPermission === 'function';

  const [permissionState, setPermissionState] = useState(() => {
    if (!supported) return 'unsupported';
    if (!requiresPrompt) return 'granted';
    return readPersistedPermission() || 'idle';
  });

  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const lastFireRef = useRef(0);
  const windowRef = useRef({ min: Infinity, max: -Infinity, start: 0 });

  const handleMotion = useCallback((event) => {
    const accel = event.accelerationIncludingGravity || event.acceleration;
    if (!accel) return;
    const { x = 0, y = 0, z = 0 } = accel;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    const now = performance.now();
    if (now - windowRef.current.start > WINDOW_MS) {
      windowRef.current = { min: magnitude, max: magnitude, start: now };
    } else {
      if (magnitude < windowRef.current.min) windowRef.current.min = magnitude;
      if (magnitude > windowRef.current.max) windowRef.current.max = magnitude;
    }

    const swing = windowRef.current.max - windowRef.current.min;
    if (swing >= SHAKE_THRESHOLD && now - lastFireRef.current >= REARM_MS) {
      lastFireRef.current = now;
      windowRef.current = { min: magnitude, max: magnitude, start: now };
      onShakeRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    if (permissionState !== 'granted') return undefined;

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, permissionState, handleMotion]);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported';
    if (!requiresPrompt) {
      setPermissionState('granted');
      writePersistedPermission('granted');
      return 'granted';
    }
    try {
      const result = await window.DeviceMotionEvent.requestPermission();
      setPermissionState(result);
      if (result === 'granted') writePersistedPermission('granted');
      else if (result === 'denied') writePersistedPermission('denied');
      return result;
    } catch {
      setPermissionState('denied');
      writePersistedPermission('denied');
      return 'denied';
    }
  }, [supported, requiresPrompt]);

  return {
    supported,
    permissionState,
    needsPermission:
      requiresPrompt && permissionState !== 'granted' && permissionState !== 'denied',
    requestPermission,
  };
}
