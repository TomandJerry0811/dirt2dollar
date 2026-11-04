import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, HelpCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/utils';
import { SIDEBAR_NAV, SIDEBAR_FOOTER, type SidebarNavItem } from '@/constants';
import { useSettingsStore } from '@/store';

// ============================================================
// Nav Item
// ============================================================

interface NavItemProps {
  item: SidebarNavItem;
  collapsed: boolean;
}

function NavItem({ item, collapsed }: NavItemProps) {
  const location = useLocation();
  const isActive =
    item.href === '/'
      ? location.pathname === '/'
      : location.pathname === item.href ||
        location.pathname.startsWith(item.href + '/');

  return (
    <NavLink
      to={item.href}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={cn(
        'nav-item group select-none',
        isActive && 'active',
        collapsed && 'justify-center px-0'
      )}
    >
      {/* Icon */}
      <item.icon
        className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
        strokeWidth={isActive ? 2 : 1.75}
        aria-hidden="true"
      />

      {/* Label */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <span className="whitespace-nowrap text-[13.5px]">{item.label}</span>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      {!collapsed && item.badge && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5',
            'text-[10px] font-bold leading-none',
            item.badgeVariant === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          )}
        >
          {item.badge}
        </motion.span>
      )}
    </NavLink>
  );
}

// ============================================================
// Nav Group
// ============================================================

interface NavGroupProps {
  group: { id: string; label?: string; items: SidebarNavItem[] };
  collapsed: boolean;
}

function NavGroup({ group, collapsed }: NavGroupProps) {
  return (
    <div className="space-y-0.5">
      <AnimatePresence initial={false}>
        {!collapsed && group.label && (
          <motion.p
            key={group.id + '-label'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 mb-1 mt-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/60 select-none"
          >
            {group.label}
          </motion.p>
        )}
      </AnimatePresence>

      {group.items.map((item) => (
        <NavItem key={item.id} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

// ============================================================
// Sidebar Footer
// ============================================================

function SidebarFooterContent({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-3 py-3 border-t border-sidebar-border',
        collapsed && 'items-center px-2'
      )}
    >
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="footer-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {/* Support link */}
            <a
              href={SIDEBAR_FOOTER.supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px]',
                'text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors',
                'cursor-pointer'
              )}
            >
              <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Help & Support</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </a>

            {/* Version + Company */}
            <div className="px-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/50">
                {SIDEBAR_FOOTER.company}
              </span>
              <span className="text-[11px] text-muted-foreground/40">
                v{SIDEBAR_FOOTER.version}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed: just support icon */}
      {collapsed && (
        <button
          className="icon-btn"
          title="Help & Support"
          aria-label="Help & Support"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Sidebar
// ============================================================

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 280 }}
      transition={{ duration: 0.25, ease: [0.25, 0, 0, 1] }}
      className="sidebar-shell relative z-30"
      aria-label="Sidebar navigation"
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-4 border-b border-sidebar-border flex-shrink-0',
          sidebarCollapsed && 'justify-center px-2'
        )}
      >
        {/* Logo mark */}
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
            'bg-primary shadow-primary'
          )}
        >
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>

        {/* Brand name */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-[13.5px] font-bold text-foreground leading-tight whitespace-nowrap tracking-tight">
                Customer Churn Predictor
              </p>
              <p className="text-[11px] text-muted-foreground whitespace-nowrap leading-tight">
                Client Intelligence & Risk AI
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4',
          sidebarCollapsed ? 'px-2' : 'px-3'
        )}
        aria-label="Main navigation"
      >
        {SIDEBAR_NAV.map((group) => (
          <NavGroup key={group.id} group={group} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* ── Footer ── */}
      <SidebarFooterContent collapsed={sidebarCollapsed} />

      {/* ── Collapse Toggle ── */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-sidebar-border',
          'text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary',
          'transition-colors cursor-pointer select-none'
        )}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </motion.aside>
  );
}

export default Sidebar;
