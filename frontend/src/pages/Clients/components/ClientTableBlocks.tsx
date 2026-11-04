import * as React from 'react';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import type { RiskLevel, ClientWorkflowStatus } from '@/types';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

// ============================================================
// HealthScore
// ============================================================

export function HealthScore({ score }: { score: number }) {
  let color = '#22C55E';
  if (score < 70) color = '#F59E0B';
  if (score < 50) color = '#EF4444';
  if (score < 30) color = '#991B1B';

  const radius = 12;
  const circ = 2 * Math.PI * radius;
  const strokePct = ((100 - score) * circ) / 100;

  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
        <circle
          cx="14" cy="14" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={strokePct}
          transform="rotate(-90 14 14)"
        />
      </svg>
      <span className="text-[12px] font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}

// ============================================================
// RiskBadge
// ============================================================

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { variant: any; label: string }> = {
    critical: { variant: 'danger',  label: 'Critical' },
    high:     { variant: 'danger',  label: 'High' },
    medium:   { variant: 'warning', label: 'Medium' },
    low:      { variant: 'info',    label: 'Low' },
    healthy:  { variant: 'success', label: 'Healthy' },
  };
  const cfg = map[level];
  return <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>;
}

// ============================================================
// WorkflowBadge
// ============================================================

export function WorkflowBadge({ status }: { status?: ClientWorkflowStatus }) {
  if (!status) return <span className="text-[12px] text-muted-foreground">—</span>;

  const map: Record<ClientWorkflowStatus, { icon: any; colorClass: string; label: string }> = {
    pending:   { icon: Circle,       colorClass: 'text-muted-foreground', label: 'Pending' },
    running:   { icon: Loader2,      colorClass: 'text-primary animate-spin', label: 'Running' },
    completed: { icon: CheckCircle2, colorClass: 'text-success',          label: 'Completed' },
    failed:    { icon: XCircle,      colorClass: 'text-destructive',      label: 'Failed' },
  };

  const cfg = map[status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('h-3.5 w-3.5', cfg.colorClass)} />
      <span className={cn('text-[12px] font-medium', cfg.colorClass !== 'text-primary animate-spin' && cfg.colorClass)}>
        {cfg.label}
      </span>
    </div>
  );
}

// ============================================================
// ClientAvatar
// ============================================================

export function ClientAvatar({ name, tier }: { name: string; tier: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" className="rounded-md" />
      <div>
        <p className="text-[13px] font-semibold text-foreground leading-snug">{name}</p>
        <p className="text-[11px] text-muted-foreground capitalize">{tier}</p>
      </div>
    </div>
  );
}
