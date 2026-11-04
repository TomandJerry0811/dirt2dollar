import * as React from 'react';
import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// SectionCard — main content panel wrapper
// ============================================================

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function SectionCard({ children, className, noPad }: SectionCardProps) {
  return (
    <div className={cn('section-card', !noPad && 'p-5', className)}>
      {children}
    </div>
  );
}

// ============================================================
// MetricCard — KPI tile
// ============================================================

interface MetricTrend {
  value: number;        // absolute change
  percent: number;      // % change
  direction: 'up' | 'down' | 'neutral';
  period?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: MetricTrend;
  isLoading?: boolean;
  className?: string;
}

const iconColorMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-destructive/10 text-destructive',
  info:    'bg-info/10 text-info',
};

const trendColorMap: Record<string, string> = {
  up:      'text-success',
  down:    'text-destructive',
  neutral: 'text-muted-foreground',
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'primary',
  trend,
  isLoading,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn('metric-card', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-32 rounded mb-2" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className={cn('metric-card group', className)}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[12.5px] font-medium text-muted-foreground leading-tight">{title}</p>
        {Icon && (
          <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', iconColorMap[iconColor])}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-[26px] font-bold text-foreground tracking-tight leading-none mb-1.5">
        {value}
      </p>

      {/* Trend */}
      {trend ? (
        <p className={cn('text-[12px] font-medium', trendColorMap[trend.direction])}>
          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
          {' '}{Math.abs(trend.percent).toFixed(1)}%
          {trend.period && (
            <span className="text-muted-foreground font-normal ml-1">{trend.period}</span>
          )}
        </p>
      ) : description ? (
        <p className="text-[12px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

// ============================================================
// StatCard — compact key-value pair
// ============================================================

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[11.5px] text-muted-foreground font-medium">{label}</span>
      <span className="text-[14px] font-semibold text-foreground">{value}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

export default SectionCard;
