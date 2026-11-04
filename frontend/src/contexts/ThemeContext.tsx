import * as React from 'react';
import { useSettingsStore } from '@/store';
import type { Theme } from '@/types';

// ============================================================
// Theme Context
// ============================================================

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => undefined,
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useSettingsStore();

  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  React.useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return React.useContext(ThemeContext);
}
