import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// Tailwind className merger (shadcn/ui standard)
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Date Formatters
// ============================================================

export function formatDate(
  date: string | Date,
  format: 'display' | 'short' | 'iso' | 'timestamp' | 'relative' = 'display'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  switch (format) {
    case 'relative':
      return formatRelativeTime(d);
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    case 'iso':
      return d.toISOString().split('T')[0];
    case 'timestamp':
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'display':
    default:
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
  }
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d, 'display');
}

// ============================================================
// Currency Formatters
// ============================================================

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  compact: boolean = false
): string {
  if (compact) {
    return formatCompactCurrency(value, currency);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency: string = 'USD'): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const symbol = currency === 'USD' ? '$' : currency;

  if (absValue >= 1_000_000_000) {
    return `${sign}${symbol}${(absValue / 1_000_000_000).toFixed(1)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${symbol}${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${symbol}${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}${symbol}${absValue.toFixed(0)}`;
}

// ============================================================
// Number & Percentage Formatters
// ============================================================

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, compact: boolean = false): string {
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  }
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatScore(value: number, max: number = 100): string {
  return `${Math.round(value)}/${max}`;
}

// ============================================================
// Status Helpers
// ============================================================

export type RiskLevelType = 'critical' | 'high' | 'medium' | 'low' | 'healthy';

export function getRiskLevelFromScore(score: number): RiskLevelType {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.2) return 'low';
  return 'healthy';
}

export function getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
}

export function getTrendIcon(direction: 'up' | 'down' | 'neutral'): '↑' | '↓' | '→' {
  switch (direction) {
    case 'up': return '↑';
    case 'down': return '↓';
    default: return '→';
  }
}

// ============================================================
// Chart Helpers
// ============================================================

export function normalizeChartData<T extends Record<string, unknown>>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T
): Array<{ name: string; value: number }> {
  return data.map((item) => ({
    name: String(item[labelKey]),
    value: Number(item[valueKey]),
  }));
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================
// String Helpers
// ============================================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(capitalize)
    .join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
