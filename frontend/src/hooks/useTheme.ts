import { useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/store';
import type { Theme } from '@/types';

// ============================================================
// Theme Hook
// ============================================================

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useSettingsStore();

  // Apply theme on mount
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // Listen to system preference changes when theme = 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme('system');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, setTheme]);

  const isDark = useCallback((): boolean => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const cycle: Theme[] = ['light', 'dark', 'system'];
    const idx = cycle.indexOf(theme);
    const next = cycle[(idx + 1) % cycle.length];
    setTheme(next);
  }, [theme, setTheme]);

  return {
    theme,
    isDark: isDark(),
    setTheme,
    toggleTheme,
    cycleTheme,
  };
}
