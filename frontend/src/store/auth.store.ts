import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { User, AuthTokens, LoginCredentials } from '@/types';

import { authService } from '@/services/auth.service';

// ============================================================
// Auth Store
// ============================================================

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * localStorage can throw in private-browsing mode, when storage is full,
 * or when third-party storage is disabled. Auth should still work for the
 * current session even if we can't persist tokens across reloads.
 *
 * This wraps EVERY storage operation Zustand's `persist` middleware makes
 * internally (triggered automatically by any `set()` call), not just our
 * own manual localStorage calls below. Without this, a storage failure
 * during persist's own automatic write would throw synchronously out of
 * `set()` and crash whatever action called it (login, logout, etc.) —
 * which is exactly what our own try/catch around the manual calls could
 * not protect against, since that write happens inside `set()` itself.
 */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (err) {
      console.warn(`[authStore] Unable to read "${name}" from localStorage:`, err);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      console.warn(`[authStore] Unable to persist "${name}" to localStorage:`, err);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (err) {
      console.warn(`[authStore] Unable to remove "${name}" from localStorage:`, err);
    }
  },
};

/**
 * Same protection for the separate, non-Zustand token keys (access_token /
 * refresh_token) that axios.instance.ts reads directly — these aren't
 * managed by Zustand's persist, so they need their own guard.
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[authStore] Unable to persist "${key}" to localStorage:`, err);
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[authStore] Unable to remove "${key}" from localStorage:`, err);
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) => {
        set({ tokens });
        if (tokens) {
          safeSetItem('access_token', tokens.accessToken);
          safeSetItem('refresh_token', tokens.refreshToken);
        } else {
          safeRemoveItem('access_token');
          safeRemoveItem('refresh_token');
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          if (response.tokens) {
            safeSetItem('access_token', response.tokens.accessToken);
            safeSetItem('refresh_token', response.tokens.refreshToken);
          }
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, tokens: null, isAuthenticated: false });
        safeRemoveItem('access_token');
        safeRemoveItem('refresh_token');
      },

      refreshUser: async () => {
        // Implementation deferred — wired in auth module
      },
    }),
    {
      name: 'd2d-auth-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    }
  )
);