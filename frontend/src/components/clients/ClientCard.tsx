import * as React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '@/utils';
import { RiskBadge, HealthGauge } from '@/components/common/RiskBadge';
import { Avatar } from '@/components/ui/Avatar';
import type { Client } from '@/types';
import { buildClientRoute } from '@/constants/routes.constants';

// ============================================================
// ClientCard Component
// ============================================================

interface ClientCardProps {
  client: Client;
  className?: string;
}

export function ClientCard({ client, className }: ClientCardProps) {
  return (
    <div
      className={cn(
        'metric-card group cursor-pointer',
        'hover:border-primary/30 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={client.name} size="md" />
        <div className="flex-1 min-w-0">
          <Link
            to={buildClientRoute.detail(client.id)}
            className="font-semibold text-foreground hover:text-primary transition-colors truncate block text-sm"
          >
            {client.name}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{client.industry}</p>
        </div>
        <RiskBadge level={client.riskLevel} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">MRR</p>
          <p className="text-sm font-semibold text-foreground">{formatCurrency(client.mrr, 'USD', true)}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs text-muted-foreground">Churn Risk</p>
          <p className="text-sm font-semibold text-foreground">
            {formatPercentage(client.churnProbability)}
          </p>
        </div>
        <HealthGauge score={client.healthScore} size="sm" />
      </div>

      <Link
        to={buildClientRoute.detail(client.id)}
        className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View details <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}

// ============================================================
// ClientSummary — used in client detail header
// ============================================================

interface ClientSummaryProps {
  client: Client;
  className?: string;
}

export function ClientSummary({ client, className }: ClientSummaryProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Avatar name={client.name} size="lg" />
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm text-muted-foreground">{client.industry}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground capitalize">{client.tier}</span>
          <RiskBadge level={client.riskLevel} size="sm" />
        </div>
      </div>
    </div>
  );
}

export default ClientCard;
