import * as React from 'react';
import { cn } from '@/utils';
import { RISK_LEVEL_CONFIG } from '@/constants';
import type { RiskLevel } from '@/types';

// ============================================================
// RiskBadge Component
// ============================================================

interface RiskBadgeProps {
  level: RiskLevel;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1',
};

export function RiskBadge({ level, showDot = true, size = 'md', className }: RiskBadgeProps) {
  const config = RISK_LEVEL_CONFIG[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0')}
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}

// ============================================================
// HealthGauge Component
// ============================================================

interface HealthGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'hsl(142 71% 45%)';
  if (score >= 60) return 'hsl(188 78% 41%)';
  if (score >= 40) return 'hsl(45 93% 47%)';
  if (score >= 20) return 'hsl(21 90% 55%)';
  return 'hsl(0 84% 60%)';
}

const gaugeSizes = {
  sm: { outer: 48, stroke: 4, fontSize: 10 },
  md: { outer: 64, stroke: 5, fontSize: 13 },
  lg: { outer: 88, stroke: 6, fontSize: 18 },
};

export function HealthGauge({ score, maxScore = 100, size = 'md', showLabel = true, className }: HealthGaugeProps) {
  const { outer, stroke, fontSize } = gaugeSizes[size];
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalizedScore / maxScore) * 100;
  const radius = (outer - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getHealthColor(percentage);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={outer} height={outer} className="-rotate-90">
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center rotate-0">
          <span className="font-bold text-foreground" style={{ fontSize }}>
            {Math.round(percentage)}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ProgressRing Component
// ============================================================

interface ProgressRingProps {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function ProgressRing({
  value,
  max = 100,
  color = 'hsl(217 91% 60%)',
  size = 56,
  strokeWidth = 4,
  className,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
      )}
    </div>
  );
}

export default RiskBadge;
