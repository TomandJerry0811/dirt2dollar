import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, TrendingUp, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import type { HighRiskClientRow } from '../dashboard.types';

// ============================================================
// Health Score Bar
// ============================================================

function HealthScoreBar({ value }: { value: number }) {
  const color =
    value >= 70 ? '#22C55E' :
    value >= 50 ? '#F59E0B' :
    value >= 30 ? '#EF4444' : '#991B1B';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden w-16">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

// ============================================================
// Risk Badge
// ============================================================

const RISK_BADGE_VARIANT: Record<HighRiskClientRow['riskLevel'], 'danger' | 'warning' | 'success' | 'info'> = {
  critical: 'danger',
  high:     'danger',
  medium:   'warning',
  low:      'info',
  healthy:  'success',
};

// ============================================================
// Trend Icon
// ============================================================

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'down') return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  if (direction === 'up')   return <TrendingUp   className="h-3.5 w-3.5 text-success" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

// ============================================================
// HighRiskClientsTable
// ============================================================

interface HighRiskClientsTableProps {
  clients?: HighRiskClientRow[];
  className?: string;
}

export function HighRiskClientsTable({
  clients = [],
  className,
}: HighRiskClientsTableProps) {
  return (
    <div className={cn('section-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">High Risk Clients</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Clients requiring immediate attention</p>
        </div>
        <Link
          to="/clients"
          className="flex items-center gap-1 text-[12.5px] text-primary font-medium hover:underline transition-colors"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/40">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Industry</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Health</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Churn %</th>
              <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Trend</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, i) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/40 transition-colors group"
              >
                {/* Client */}
                <td className="px-5 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground leading-snug">{client.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      ${(client.mrr / 1000).toFixed(1)}k MRR
                    </p>
                  </div>
                </td>

                {/* Industry */}
                <td className="px-3 py-3 hidden sm:table-cell">
                  <span className="text-[12.5px] text-muted-foreground">{client.industry}</span>
                </td>

                {/* Health bar */}
                <td className="px-3 py-3">
                  <HealthScoreBar value={client.healthScore} />
                </td>

                {/* Churn probability */}
                <td className="px-3 py-3 text-right">
                  <span
                    className={cn(
                      'text-[13px] font-bold tabular-nums',
                      client.churnProbability >= 80 ? 'text-destructive' :
                      client.churnProbability >= 65 ? 'text-warning' :
                      'text-foreground'
                    )}
                  >
                    {client.churnProbability}%
                  </span>
                </td>

                {/* Trend */}
                <td className="px-3 py-3 hidden md:table-cell text-center">
                  <TrendIcon direction={client.trend} />
                </td>

                {/* Status Badge */}
                <td className="px-3 py-3">
                  <Badge variant={RISK_BADGE_VARIANT[client.riskLevel]} dot size="sm">
                    {client.riskLevel.charAt(0).toUpperCase() + client.riskLevel.slice(1)}
                  </Badge>
                </td>

                {/* Action */}
                <td className="px-3 py-3 text-right">
                  <Link
                    to={`/client/${client.id}`}
                    className={cn(
                      'inline-flex items-center gap-1 text-[12px] font-medium text-primary',
                      'opacity-0 group-hover:opacity-100 transition-opacity',
                      'hover:underline'
                    )}
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
