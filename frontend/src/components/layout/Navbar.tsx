import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Keyboard,
  ShieldCheck,
  CheckCheck,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';
import { useSettingsStore, useAuthStore } from '@/store';
import { SIDEBAR_NAV } from '@/constants';

// ============================================================
// SearchBar
// ============================================================

interface SearchBarProps {
  className?: string;
}

function SearchBar({ className }: SearchBarProps) {
  const [focused, setFocused] = React.useState(false);
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && focused) {
        inputRef.current?.blur();
        setValue('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focused]);

  return (
    <div
      className={cn(
        'search-bar max-w-xs w-full cursor-text',
        focused && 'max-w-sm',
        'transition-all duration-200',
        className
      )}
      onClick={() => inputRef.current?.focus()}
      role="search"
    >
      <Search
        className={cn(
          'h-4 w-4 flex-shrink-0 transition-colors',
          focused ? 'text-primary' : 'text-muted-foreground'
        )}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search clients, workflows…"
        aria-label="Search"
        className="flex-1 bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none min-w-0"
      />
      {!focused && !value && (
        <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">K</kbd>
        </div>
      )}
      {value && (
        <button
          className="ml-auto flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); setValue(''); }}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Theme Toggle
// ============================================================

function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();

  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Theme: ${theme}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.15 }}
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -30 }}
            transition={{ duration: 0.15 }}
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ============================================================
// Notification Dropdown
// ============================================================

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'High Churn Risk Detected', message: 'Yardworx Land Management requires immediate attention', time: '2m ago', read: false, type: 'alert' },
  { id: '2', title: 'AI Analysis Complete', message: 'Account analysis completed for Yardworx Land Management', time: '18m ago', read: false, type: 'success' },
  { id: '3', title: 'Workflow Completed', message: 'Intelligence pipeline execution finished successfully', time: '1h ago', read: true, type: 'info' },
];

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'alert') return <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
  if (type === 'success') return <CheckCheck className="h-4 w-4 text-success flex-shrink-0" />;
  return <Info className="h-4 w-4 text-info flex-shrink-0" />;
}

function NotificationDropdown() {
  const [open, setOpen] = React.useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="icon-btn relative"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white leading-none">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="dropdown-panel absolute right-0 top-full mt-2 w-80 z-50"
          >
            {/* Header */}
            <div className="section-header flex items-center justify-between">
              <span className="text-[13px] font-semibold text-foreground">Notifications</span>
              {unread > 0 && (
                <span className="badge badge-primary">{unread} new</span>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer',
                    !n.read && 'bg-primary/[0.03]'
                  )}
                >
                  <div className="mt-0.5">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[12.5px] font-medium leading-snug', !n.read ? 'text-foreground' : 'text-muted-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border">
              <button className="w-full text-[12px] text-primary hover:text-primary/80 font-medium transition-colors text-center">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// User / Profile Dropdown
// ============================================================

function UserDropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();

  const user = {
    name: authUser?.name || 'User',
    email: authUser?.email || 'admin@email.com',
    initials: authUser?.name
      ? authUser.name
          .split(' ')
          .map((n) => n[0])
          .join('')
      : 'U',
  };

  const handleSignOut = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const menuItems = [
    { icon: User, label: 'Profile', href: '/settings' },
    { icon: ShieldCheck, label: 'Users & Access', href: '/users' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Keyboard, label: 'Keyboard Shortcuts', href: '#' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-1',
          'hover:bg-secondary transition-colors select-none',
          open && 'bg-secondary'
        )}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="avatar h-7 w-7 text-[11px]">
          {user.initials}
        </div>
        <div className="hidden md:block text-left max-w-[130px]">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{user.name}</p>
          <p className="text-[11px] text-muted-foreground leading-tight truncate">{user.email}</p>
        </div>
        <ChevronDown
          className={cn(
            'hidden md:block h-3.5 w-3.5 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="dropdown-panel absolute right-0 top-full mt-2 w-56 z-50 py-1"
          >
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <p className="text-[13px] font-semibold text-foreground">{user.name}</p>
              <p className="text-[11.5px] text-muted-foreground truncate">{user.email}</p>
            </div>

            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-secondary transition-colors"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            ))}

            <div className="border-t border-border mt-1 pt-1">
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-destructive/5 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================================
// Breadcrumb (inside Navbar)
// ============================================================

function NavBreadcrumb() {
  const location = useLocation();
  const allItems = SIDEBAR_NAV.flatMap((g) => g.items);

  // Build crumb trail from pathname
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let current = '';
  for (const seg of segments) {
    current += '/' + seg;
    const match = allItems.find((i) => i.href === current || i.href === '/' + seg);
    crumbs.push({
      label: match ? match.label : seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: current,
    });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-[12.5px]" aria-label="Breadcrumb">
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground capitalize">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors capitalize">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================
// Navbar
// ============================================================

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useSettingsStore();

  return (
    <header className={cn('navbar-shell gap-3', className)} role="banner">
      {/* Mobile menu toggle */}
      <button
        className="icon-btn md:hidden"
        onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
        aria-label={sidebarMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarMobileOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </button>

      {/* Breadcrumb — desktop */}
      <div className="hidden md:flex items-center">
        <NavBreadcrumb />
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Search */}
        <SearchBar className="mr-1" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="divider mx-1" />

        {/* User */}
        <UserDropdown />
      </div>
    </header>
  );
}

export default Navbar;
