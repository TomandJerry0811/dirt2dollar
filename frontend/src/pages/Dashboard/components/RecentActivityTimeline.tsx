import * as React from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  FileText,
  Brain,
  GitBranch,
  Lightbulb,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/utils';
import type { ActivityItem, ActivityType } from '../dashboard.types';
import { PLACEHOLDER_ACTIVITY } from '../dashboard.data';

// ============================================================
// Activity type config
// ============================================================

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  client_updated:      { icon: User,        iconClass: 'text-primary',     bgClass: 'bg-primary/10' },
  report_generated:    { icon: FileText,    iconClass: 'text-success',     bgClass: 'bg-success/10' },
  ai_analysis:         { icon: Brain,       iconClass: 'text-info',        bgClass: 'bg-info/10' },
  workflow_executed:   { icon: GitBranch,   iconClass: 'text-warning',     bgClass: 'bg-warning/10' },
  recommendation_sent: { icon: Lightbulb,  iconClass: 'text-primary',     bgClass: 'bg-primary/10' },
  alert_triggered:     { icon: AlertCircle,iconClass: 'text-destructive',  bgClass: 'bg-destructive/10' },
};

// ============================================================
// RecentActivityTimeline
// ============================================================

interface RecentActivityTimelineProps {
  items?: ActivityItem[];
  className?: string;
}

export function RecentActivityTimeline({ items = PLACEHOLDER_ACTIVITY, className }: RecentActivityTimelineProps) {
  return (
    <div className={cn('section-card p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Recent Activity</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Latest platform events</p>
        </div>
        <button className="icon-btn" aria-label="Refresh activity">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-3 bottom-3 w-px bg-border" aria-hidden="true" />

        <div className="space-y-4">
          {items.map((item, i) => {
            const cfg = ACTIVITY_CONFIG[item.type];
            const Icon = cfg.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="flex gap-3 items-start relative pl-1"
              >
                {/* Icon node */}
                <div
                  className={cn(
                    'relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-card',
                    cfg.bgClass
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', cfg.iconClass)} strokeWidth={1.75} />
                  {item.isNew && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground leading-snug">{item.title}</p>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  {item.client && (
                    <p className="text-[11.5px] text-primary font-medium mt-0.5">{item.client}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* View all */}
      <div className="mt-4 pt-3 border-t border-border text-center">
        <button className="text-[12.5px] text-primary font-medium hover:underline transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}
