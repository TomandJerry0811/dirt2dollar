// ============================================================
// Theme & Color Constants
// ============================================================

export const THEME_COLORS = {
  brand: {
    primary: 'hsl(217 91% 60%)',
    secondary: 'hsl(224 76% 48%)',
    light: 'hsl(213 100% 97%)',
    dark: 'hsl(224 64% 33%)',
  },
  risk: {
    critical: 'hsl(0 84% 60%)',
    high: 'hsl(21 90% 55%)',
    medium: 'hsl(45 93% 47%)',
    low: 'hsl(188 78% 41%)',
    healthy: 'hsl(142 71% 45%)',
  },
  status: {
    active: 'hsl(142 71% 45%)',
    atRisk: 'hsl(21 90% 55%)',
    churned: 'hsl(0 84% 60%)',
    new: 'hsl(217 91% 60%)',
    retained: 'hsl(271 81% 56%)',
  },
} as const;

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  muted: '#6b7280',
  palette: [
    '#3b82f6',
    '#8b5cf6',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#f97316',
    '#ec4899',
    '#14b8a6',
    '#a855f7',
  ],
  riskPalette: {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#06b6d4',
    healthy: '#22c55e',
  },
} as const;

// ============================================================
// Risk Level Constants
// ============================================================

export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  HEALTHY: 'healthy',
} as const;

export const RISK_LEVEL_CONFIG = {
  critical: {
    label: 'Critical',
    color: CHART_COLORS.danger,
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-500',
    borderClass: 'border-red-500/30',
    minScore: 0.8,
    maxScore: 1,
  },
  high: {
    label: 'High',
    color: CHART_COLORS.warning,
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-500',
    borderClass: 'border-orange-500/30',
    minScore: 0.6,
    maxScore: 0.8,
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-500',
    borderClass: 'border-yellow-500/30',
    minScore: 0.4,
    maxScore: 0.6,
  },
  low: {
    label: 'Low',
    color: CHART_COLORS.info,
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-500',
    borderClass: 'border-cyan-500/30',
    minScore: 0.2,
    maxScore: 0.4,
  },
  healthy: {
    label: 'Healthy',
    color: CHART_COLORS.success,
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-500',
    borderClass: 'border-green-500/30',
    minScore: 0,
    maxScore: 0.2,
  },
} as const;

// ============================================================
// Other Constants
// ============================================================

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  SHORT: 'MM/DD/YYYY',
  ISO: 'YYYY-MM-DD',
  TIMESTAMP: 'MMM DD, YYYY HH:mm',
} as const;

export const QUERY_STALE_TIME = {
  SHORT: 30 * 1000,       // 30 seconds
  MEDIUM: 5 * 60 * 1000,  // 5 minutes
  LONG: 30 * 60 * 1000,   // 30 minutes
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  DEFAULT: 4000,
  LONG: 7000,
} as const;
