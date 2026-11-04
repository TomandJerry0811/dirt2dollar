import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import type { ClientHealthBreakdown } from '../dashboard.types';
import { PLACEHOLDER_HEALTH } from '../dashboard.data';

// ============================================================
// Client Health Overview
// ============================================================

interface HealthTier {
  key: keyof Omit<ClientHealthBreakdown, 'total'>;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

const TIERS: HealthTier[] = [
  { key: 'healthy',  label: 'Healthy',  color: '#22C55E', bgColor: 'bg-success/10',     textColor: 'text-success' },
  { key: 'medium',   label: 'Medium',   color: '#F59E0B', bgColor: 'bg-warning/10',     textColor: 'text-warning' },
  { key: 'high',     label: 'High Risk',color: '#EF4444', bgColor: 'bg-destructive/10', textColor: 'text-destructive' },
  { key: 'critical', label: 'Critical', color: '#991B1B', bgColor: 'bg-rose-950/10',    textColor: 'text-rose-800' },
];

/** Safe percentage: returns 0 instead of NaN when total is 0/undefined. */
function safePct(value: number, total: number): number {
  if (!total || !Number.isFinite(total) || total <= 0) return 0;
  const pct = (value / total) * 100;
  return Number.isFinite(pct) ? pct : 0;
}

interface HealthBarProps {
  tier: HealthTier;
  value: number;
  total: number;
  index: number;
}

function HealthBar({ tier, value, total, index }: HealthBarProps) {
  const pct = Math.round(safePct(value, total));

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="flex items-center gap-4"
    >
      {/* Legend */}
      <div className="flex items-center gap-2 w-24 flex-shrink-0">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: tier.color }}
          aria-hidden="true"
        />
        <span className="text-[12.5px] text-muted-foreground">{tier.label}</span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.2 + index * 0.07, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: tier.color }}
        />
      </div>

      {/* Count + percent */}
      <div className="flex items-center gap-2 w-20 flex-shrink-0 justify-end">
        <span className={cn('text-[12.5px] font-semibold', tier.textColor)}>{value}</span>
        <span className="text-[11.5px] text-muted-foreground">({pct}%)</span>
      </div>
    </motion.div>
  );
}

interface ClientHealthOverviewProps {
  health?: ClientHealthBreakdown;
  className?: string;
}

export function ClientHealthOverview({ health = PLACEHOLDER_HEALTH, className }: ClientHealthOverviewProps) {
  const { total, ...tiers } = health;
  const healthyPct = Math.round(safePct(tiers.healthy, total));

  return (
    <div className={cn('section-card p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Client Health Overview</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{total} clients across all segments</p>
        </div>
        {/* Summary donut */}
        <div className="flex items-center gap-1">
          <span className="text-[22px] font-bold text-foreground">{healthyPct}%</span>
          <span className="text-[12px] text-muted-foreground leading-tight text-right">
            <br />healthy
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {TIERS.map((tier, i) => (
          <HealthBar
            key={tier.key}
            tier={tier}
            value={tiers[tier.key]}
            total={total}
            index={i}
          />
        ))}
      </div>

      {/* Stacked bar */}
      <div className="mt-5 flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
        {TIERS.map((tier) => {
          const pct = safePct(tiers[tier.key], total);
          return (
            <motion.div
              key={tier.key}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: tier.color }}
              title={`${tier.label}: ${tiers[tier.key]} (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
}