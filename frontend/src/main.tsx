/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';

// ============================================================
// Initialize theme on first load (avoid flash of wrong theme)
// ============================================================

function initTheme() {
  try {
    const stored = localStorage.getItem('d2d-settings-storage');
    const parsed = stored ? JSON.parse(stored) : null;
    const theme: string = parsed?.state?.theme ?? 'light';

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  } catch {
    // Default to light if storage is unavailable
    document.documentElement.classList.remove('dark');
  }
}

initTheme();

// ============================================================
// Mount App
// ============================================================

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('[Customer Churn Predictor] #root element not found in DOM.');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
