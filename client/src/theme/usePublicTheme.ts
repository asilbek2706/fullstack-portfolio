import { useEffect, useState } from 'react';
export type ThemeMode = 'light' | 'dark' | 'system';
export function usePublicTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('portfolio-public-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system')
        return saved;
    } catch {
      /* Storage can be unavailable. */
    }
    return 'system';
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-public-theme', mode);
    } catch {
      /* Theme still works without storage. */
    }
  }, [mode]);
  return {
    mode,
    setMode,
    resolved: mode === 'system' ? (systemDark ? 'dark' : 'light') : mode,
  };
}
