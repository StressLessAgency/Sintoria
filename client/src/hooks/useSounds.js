import { useCallback, useEffect, useState } from 'react';
import { isMuted, setMuted, subscribeMuted, toggleMuted, play, playDiceLanding } from '../lib/sounds';

export function useSoundMuted() {
  const [muted, setLocal] = useState(() => isMuted());
  useEffect(() => subscribeMuted(setLocal), []);

  const toggle = useCallback(() => toggleMuted(), []);
  const set = useCallback((value) => setMuted(value), []);

  return { muted, toggle, setMuted: set };
}

export { play, playDiceLanding };
