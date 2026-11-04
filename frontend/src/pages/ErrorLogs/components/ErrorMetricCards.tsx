import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Layers, GitBranch, Clock } from 'lucide-react';
import type { WorkflowErrorStats } from '@/types';

interface ErrorMetricCardsProps {
  stats?: WorkflowErrorStats;
  total: number;
}

export function ErrorMetricCards({ stats, total }: ErrorMetricCardsProps) {
  const cards = [
    {
      title: 'Total Errors Logged',
      value: stats?.totalErrors ?? total ?? 0,
      subtext: 'Persistent in Supabase workflow_error_logs',
      icon: ShieldAlert,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10 border-destructive/20',
    },
    {
      title: 'Top Failing Step',
      value: stats?.topFailedNode && stats.topFailedNode !== 'None' ? stats.topFailedNode : 'N/A',
      subtext: stats?.topFailedNodeCount
        ? `${stats.topFailedNodeCount} failures at this step`
        : 'No step failures recorded',
      icon: Layers,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10 border-warning/20',
      isStep: true,
    },
    {
      title: 'Most Affected Workflow',
      value: stats?.topWorkflow && stats.topWorkflow !== 'None' ? stats.topWorkflow : 'N/A',
      subtext: stats?.topWorkflowCount
        ? `${stats.topWorkflowCount} incidents logged`
        : 'All workflows healthy',
      icon: GitBranch,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/20',
    },
    {
      title: 'Latest Incident',
      value: stats?.latestErrorAt
        ? new Date(stats.latestErrorAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'None',
      subtext: stats?.latestErrorAt ? 'Latest timestamp recorded' : 'Clean status',
      icon: Clock,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-secondary border-border',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{c.title}</span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${c.bgColor}`}>
              <c.icon className={`h-4 w-4 ${c.iconColor}`} />
            </div>
          </div>

          <div className="mt-3">
            <p
              className={`text-xl font-bold tracking-tight text-foreground truncate ${
                c.isStep ? 'font-mono text-base' : ''
              }`}
              title={typeof c.value === 'string' ? c.value : undefined}
            >
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{c.subtext}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ErrorMetricCards;
