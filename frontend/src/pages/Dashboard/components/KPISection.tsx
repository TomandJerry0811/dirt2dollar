import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, AlertTriangle, XOctagon, Cpu, FileBarChart } from 'lucide-react';
import { cn } from '@/utils';
import type { DashboardKPI } from '../dashboard.types';
import { PLACEHOLDER_KPIS } from '../dashboard.data';

// ============================================================
// Mini Sparkline (SVG — no deps)
// ============================================================

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 28;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ============================================================
// Icon + color mapping
// ============================================================

const KPI_ICONS: Record<string, React.ElementType> = {
  total_clients:   Users,
  healthy:         Shield,
  medium_risk:     AlertTriangle,
  high_risk:       XOctagon,
  ai_predictions:  Cpu,
  reports:         FileBarChart,
};

const SPARKLINE_COLORS: Record<DashboardKPI['iconColor'], string> = {
  primary: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  info:    '#0EA5E9',
};

const ICON_BG: Record<DashboardKPI['iconColor'], string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-destructive/10 text-destructive',
  info:    'bg-info/10 text-info',
};

const TREND_COLOR: Record<string, string> = {
  up:      'text-success',
  down:    'text-destructive',
  neutral: 'text-muted-foreground',
};

const TREND_ARROW: Record<string, string> = {
  up: '↑', down: '↓', neutral: '→',
};

// ============================================================
// AnimatedNumber — count-up on mount
// ============================================================

function AnimatedNumber({ value }: { value: string | number }) {
  const numericValue = typeof value === 'number' ? value : 0;
  // Formatted strings (such as 32% and currency) must keep their units.
  const isNumeric = typeof value === 'number' && Number.isFinite(value);

  const [displayed, setDisplayed] = React.useState(isNumeric ? 0 : value);

  React.useEffect(() => {
    if (!isNumeric) { setDisplayed(value); return; }
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, isNumeric, value]);

  return <>{displayed}</>;
}

// ============================================================
// KPICard
// ============================================================

function KPICard({ kpi, index }: { kpi: DashboardKPI; index: number }) {
  const Icon = KPI_ICONS[kpi.id] ?? Users;
  const sparkColor = SPARKLINE_COLORS[kpi.iconColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="metric-card group cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-muted-foreground leading-tight">{kpi.label}</p>
        <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', ICON_BG[kpi.iconColor])}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>

      {/* Value */}
      <p className="text-[28px] font-bold text-foreground tracking-tight leading-none mb-2">
        <AnimatedNumber value={kpi.value} />
      </p>

      {/* Trend + sparkline */}
      <div className="flex items-center justify-between">
        <p className={cn('text-[11.5px] font-semibold', TREND_COLOR[kpi.trend.direction])}>
          {TREND_ARROW[kpi.trend.direction]}
          {' '}
          {kpi.trend.percent > 0 ? `${kpi.trend.percent}%` : '—'}
          <span className="text-muted-foreground font-normal ml-1">{kpi.trend.period}</span>
        </p>
        {kpi.sparkline && (
          <Sparkline data={kpi.sparkline} color={sparkColor} />
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// KPISection — 6-card row
// ============================================================

interface KPISectionProps {
  kpis?: DashboardKPI[];
}

export function KPISection({ kpis = PLACEHOLDER_KPIS }: KPISectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => (
        <KPICard key={kpi.id} kpi={kpi} index={i} />
      ))}
    </div>
  );
}
