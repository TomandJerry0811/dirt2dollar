import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingAIAssistant } from '@/components/layout/FloatingAIAssistant';
import { useSettingsStore } from '@/store';
import { cn } from '@/utils';

// ============================================================
// Mobile Overlay — closes sidebar when tapping outside
// ============================================================

function MobileOverlay() {
  const { setSidebarMobileOpen } = useSettingsStore();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm md:hidden"
      onClick={() => setSidebarMobileOpen(false)}
      aria-hidden="true"
    />
  );
}

// ============================================================
// App Layout
// ============================================================

export function AppLayout() {
  const { sidebarMobileOpen } = useSettingsStore();
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <>
            <MobileOverlay />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.25, 0, 0, 1] }}
              className="fixed inset-y-0 left-0 z-30 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="main-content">
        {/* Sticky Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="page-root" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Floating AI Assistant ── */}
      <FloatingAIAssistant />

      {/* ── Toast Notifications ── */}
      <Toaster
        position="bottom-right"
        offset={80}
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            fontSize: '13px',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
        richColors
        closeButton
        expand={false}
        gap={8}
      />
    </div>
  );
}

export default AppLayout;
