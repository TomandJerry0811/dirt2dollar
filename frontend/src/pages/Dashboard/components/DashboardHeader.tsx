import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/utils';
import { Avatar } from '@/components/ui/Avatar';

// ============================================================
// DashboardHeader — Welcome Banner
// ============================================================

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface DashboardHeaderProps {
  userName?: string;
  userRole?: string;
  company?: string;
  systemStatus?: 'operational' | 'degraded' | 'outage';
  className?: string;
}

export function DashboardHeader({
  userName = 'Alex Johnson',
  userRole = 'Admin',
  company = 'Customer Churn Predictor',
  systemStatus = 'operational',
  className,
}: DashboardHeaderProps) {
  const greeting = getGreeting();
  const date = formatDate();

  const statusConfig = {
    operational: { label: 'All Systems Operational', color: 'text-success' },
    degraded:    { label: 'Partial Degradation',      color: 'text-warning' },
    outage:      { label: 'System Outage',            color: 'text-destructive' },
  };

  const status = statusConfig[systemStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'section-card p-6 flex items-center justify-between gap-6',
        'border-l-4 border-l-primary',
        className
      )}
    >
      {/* Left — greeting */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
            <Zap className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11.5px] font-semibold text-primary uppercase tracking-widest">
            AI-Powered Client Intelligence Platform
          </span>
        </div>

        <h1 className="text-[22px] font-bold text-foreground leading-tight tracking-tight">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>

        <p className="text-[13px] text-muted-foreground mt-0.5">{date}</p>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 mt-3">
          <CheckCircle2 className={cn('h-3.5 w-3.5', status.color)} strokeWidth={2} />
          <span className={cn('text-[12px] font-medium', status.color)}>{status.label}</span>
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[12px] text-muted-foreground">Last refresh: just now</span>
        </div>
      </div>

      {/* Right — user card */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-[13.5px] font-semibold text-foreground leading-tight">{userName}</p>
          <p className="text-[12px] text-muted-foreground">{userRole}</p>
          <p className="text-[11.5px] text-primary/80 font-medium mt-0.5">{company}</p>
        </div>
        <Avatar name={userName} size="xl" />
      </div>
    </motion.div>
  );
}
