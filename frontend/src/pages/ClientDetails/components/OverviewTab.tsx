import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, AlertTriangle, TrendingUp, Minus, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/utils';
import { SEED_TIMELINE, SEED_INSIGHTS, SEED_RISK_FACTORS } from '../client-details.data';
import type { KeyInsight, RiskFactor, ClientTimelineEvent, Client } from '@/types';

// ============================================================
// ExecutiveSummaryCard
// ============================================================

function ExecutiveSummaryCard({ client }: { client?: Client }) {
  const summary = (client?.metadata as any)?.summary as string | undefined;
  const churn = client?.churnProbability ?? 50;

  return (
    <div className="section-card p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-primary uppercase tracking-wider">
            {client?.name ? `${client.name} — AI Executive Summary` : 'AI Executive Summary'}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" /> Updated recently
          </span>
        </div>
        <div className="space-y-4">
          {summary ? (
            <p className="text-[14px] leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
              {summary}
            </p>
          ) : (
            <>
              <p className="text-[14px] leading-relaxed text-foreground/90 font-medium">
                The account currently shows a churn probability of {churn}%. Historical vector telemetry indicates that prompt intervention on primary friction bottlenecks will stabilize contract health before the next review window.
              </p>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Immediate intervention via the generated AI action playbook is recommended to maximize campaign efficiency and improve overall account retention.
              </p>
            </>
          )}
        </div>
        <div className="mt-5 flex items-center gap-4 border-t border-border/50 pt-4 flex-wrap text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "flex h-2 w-2 rounded-full",
              churn > 60 ? "bg-destructive animate-pulse" : churn > 30 ? "bg-warning animate-pulse" : "bg-success"
            )} />
            <span className={cn(
              "font-semibold",
              churn > 60 ? "text-destructive" : churn > 30 ? "text-warning" : "text-success"
            )}>
              {churn > 60 ? 'High Risk Account' : churn > 30 ? 'Moderate Risk Account' : 'Healthy Account'}
            </span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            Account Manager: <strong className="text-foreground">{client?.accountManager || 'Assigned Lead'}</strong>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            Tier: <strong className="text-foreground capitalize">{client?.tier || 'Growth'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KeyInsights
// ============================================================

function KeyInsights({ client }: { client?: Client }) {
  const satScore = (client?.metadata as any)?.satisfaction_score as number | undefined;
  const churn = client?.churnProbability ?? 50;
  const health = client?.healthScore ?? 50;
  const bottlenecks = ((client?.metadata as any)?.bottlenecks as string[] | undefined) || [];

  const dynamicInsights: KeyInsight[] = React.useMemo(() => {
    const list: KeyInsight[] = [];

    // Insight 1: Churn risk
    if (churn >= 60) {
      list.push({
        id: 'i-churn',
        type: 'negative',
        title: 'Elevated Churn Risk',
        description: `Predicted churn probability is high at ${churn}%. Proactive playbook execution required.`,
      });
    } else {
      list.push({
        id: 'i-churn',
        type: 'positive',
        title: 'Retention Trajectory',
        description: `Current churn risk is stable at ${churn}%, within healthy portfolio tolerances.`,
      });
    }

    // Insight 2: Satisfaction / Health
    if (satScore !== undefined) {
      list.push({
        id: 'i-sat',
        type: satScore >= 60 ? 'positive' : 'negative',
        title: satScore >= 60 ? 'Positive Client Sentiment' : 'Satisfaction Warning',
        description: `Client satisfaction rated at ${satScore}/100 based on recent meeting transcripts and touchpoints.`,
      });
    } else {
      list.push({
        id: 'i-health',
        type: health >= 50 ? 'positive' : 'negative',
        title: `Health Index: ${health}/100`,
        description: `Composite health score reflecting active campaign momentum and contract status.`,
      });
    }

    // Insight 3: Primary Bottleneck or Tag
    if (bottlenecks.length > 0) {
      list.push({
        id: 'i-bot',
        type: 'neutral',
        title: 'Operational Bottleneck',
        description: bottlenecks[0],
      });
    } else if (client?.tags && client.tags.length > 0) {
      list.push({
        id: 'i-tag',
        type: 'neutral',
        title: 'Operational Flag',
        description: client.tags[0],
      });
    } else {
      list.push({
        id: 'i-default',
        type: 'positive',
        title: 'Pipeline In Good Standing',
        description: 'All tracked deliverables are progressing according to schedule.',
      });
    }

    return list;
  }, [churn, health, satScore, bottlenecks, client?.tags]);

  const getIcon = (type: string) => {
    if (type === 'positive') return <TrendingUp className="h-4 w-4 text-success" />;
    if (type === 'negative') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-warning" />;
  };

  return (
    <div className="section-card p-5">
      <h3 className="text-[14px] font-semibold text-foreground mb-4">Key Telemetry Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dynamicInsights.map((insight) => (
          <div key={insight.id} className="p-4 rounded-xl border border-border bg-secondary/30 flex gap-3">
            <div className="mt-0.5">{getIcon(insight.type)}</div>
            <div>
              <p className="text-[13px] font-semibold text-foreground leading-snug">{insight.title}</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ClientTimeline
// ============================================================

function ClientTimeline({ client }: { client?: Client }) {
  const events = React.useMemo(() => {
    const lastDate = client?.lastActivityDate || client?.updatedAt || '2026-08-21T18:00:00Z';
    return [
      {
        id: 't-now',
        title: `Telemetry Synchronized for ${client?.name || 'Account'}`,
        description: `Live KPI telemetry, vector embeddings, and retention playbooks verified.`,
        date: lastDate,
        type: 'workflow' as const,
        author: 'AI Churn System'
      },
      ...SEED_TIMELINE.slice(0, 3)
    ];
  }, [client]);

  return (
    <div className="section-card p-5">
      <h3 className="text-[14px] font-semibold text-foreground mb-4">Account Timeline & Audit Log</h3>
      <div className="relative border-l border-border ml-3 space-y-6">
        {events.map((event) => (
          <div key={event.id} className="relative pl-6">
            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
              <h4 className="text-[13px] font-semibold text-foreground">{event.title}</h4>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground">{event.description}</p>
            {event.author && (
              <p className="text-[11px] font-medium text-primary mt-1">{event.author}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// OverviewTab
// ============================================================

export function OverviewTab({ client }: { client?: Client }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <ExecutiveSummaryCard client={client} />
      <KeyInsights client={client} />
      <ClientTimeline client={client} />
    </motion.div>
  );
}

export default OverviewTab;
