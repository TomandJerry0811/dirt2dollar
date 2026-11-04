import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import type { DashboardRecommendation, RecommendationPriority } from '../dashboard.types';
import { PLACEHOLDER_RECOMMENDATIONS } from '../dashboard.data';

// ============================================================
// Priority config
// ============================================================

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { variant: 'danger' | 'warning' | 'info' | 'default'; label: string; borderColor: string }
> = {
  critical: { variant: 'danger',   label: 'Critical', borderColor: 'border-l-destructive' },
  high:     { variant: 'danger',   label: 'High',     borderColor: 'border-l-destructive/60' },
  medium:   { variant: 'warning',  label: 'Medium',   borderColor: 'border-l-warning' },
  low:      { variant: 'default',  label: 'Low',      borderColor: 'border-l-border' },
};

// ============================================================
// RecommendationCard
// ============================================================

function RecommendationCard({ rec, index }: { rec: DashboardRecommendation; index: number }) {
  const cfg = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
      className={cn(
        'section-card p-4 border-l-4 group',
        cfg.borderColor,
        'hover:shadow-sm hover:border-l-4 transition-all'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
          <span className="text-[11px] text-muted-foreground">{rec.category}</span>
        </div>
        <span className="text-[11px] text-muted-foreground flex-shrink-0">
          {(rec.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      {/* Icon + Title */}
      <div className="flex gap-2.5 mb-1.5">
        <Lightbulb
          className={cn(
            'h-4 w-4 mt-0.5 flex-shrink-0',
            rec.priority === 'critical' || rec.priority === 'high'
              ? 'text-destructive'
              : 'text-warning'
          )}
          strokeWidth={1.75}
        />
        <p className="text-[13px] font-semibold text-foreground leading-snug">{rec.title}</p>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {rec.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] text-primary font-medium">{rec.client}</p>
        <Link
          to={`/recommendations`}
          className="flex items-center gap-1 text-[12px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
        >
          View details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// ============================================================
// RecentRecommendations
// ============================================================

interface RecentRecommendationsProps {
  items?: DashboardRecommendation[];
  isLoading?: boolean;
  className?: string;
}

export function RecentRecommendations({
  items = PLACEHOLDER_RECOMMENDATIONS,
  isLoading = false,
  className,
}: RecentRecommendationsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[14px] font-semibold text-foreground">Recent Recommendations</p>
        <Link to="/recommendations" className="text-[12.5px] text-primary font-medium hover:underline">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="section-card p-4 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-10 bg-muted/60 rounded w-full" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="section-card p-6 text-center text-muted-foreground text-sm">
          No pending recommendations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.slice(0, 3).map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
