import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Theme, UserSettings, AppSettings } from '@/types';

// ============================================================
// Settings Store
// ============================================================

interface SettingsStore {
  theme: Theme;
  userSettings: UserSettings | null;
  appSettings: AppSettings | null;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  compactMode: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setUserSettings: (settings: UserSettings) => void;
  setAppSettings: (settings: AppSettings) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setCompactMode: (compact: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      userSettings: null,
      appSettings: null,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      compactMode: false,

      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else if (theme === 'light') {
          root.classList.remove('dark');
          root.classList.add('light');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const current = get().theme;
        const next: Theme = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setUserSettings: (userSettings) => set({ userSettings }),
      setAppSettings: (appSettings) => set({ appSettings }),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),

      setCompactMode: (compactMode) => set({ compactMode }),
    }),
    {
      name: 'd2d-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        compactMode: state.compactMode,
      }),
    }
  )
);
