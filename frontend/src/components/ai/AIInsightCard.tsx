import * as React from 'react';
import { cn } from '@/utils';
import { Bot, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

// ============================================================
// AIInsightCard Component
// ============================================================

export type InsightType = 'prediction' | 'recommendation' | 'alert' | 'summary';

interface AIInsightCardProps {
  type: InsightType;
  title: string;
  content: string;
  confidence?: number;
  timestamp?: string;
  className?: string;
}

const insightConfig: Record<InsightType, { icon: typeof Bot; colorClass: string; bgClass: string; label: string }> = {
  prediction: { icon: TrendingUp, colorClass: 'text-primary', bgClass: 'bg-primary/10', label: 'Prediction' },
  recommendation: { icon: Lightbulb, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10', label: 'Recommendation' },
  alert: { icon: AlertTriangle, colorClass: 'text-destructive', bgClass: 'bg-destructive/10', label: 'Alert' },
  summary: { icon: Bot, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', label: 'AI Summary' },
};

export function AIInsightCard({
  type,
  title,
  content,
  confidence,
  timestamp,
  className,
}: AIInsightCardProps) {
  const config = insightConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 space-y-3', className)}>
      <div className="flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', config.bgClass)}>
          <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
        </div>
        <span className={cn('text-xs font-semibold uppercase tracking-wide', config.colorClass)}>
          {config.label}
        </span>
        {confidence !== undefined && (
          <span className="ml-auto text-xs text-muted-foreground">
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
      </div>

      {timestamp && (
        <p className="text-[10px] text-muted-foreground/60">{timestamp}</p>
      )}
    </div>
  );
}

// ============================================================
// PredictionCard
// ============================================================

interface PredictionCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  confidence?: number;
  className?: string;
}

export function PredictionCard({ label, value, unit = '%', confidence, className }: PredictionCardProps) {
  return (
    <div className={cn('metric-card text-center', className)}>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold text-foreground">
        {value.toFixed(1)}
        <span className="text-lg text-muted-foreground">{unit}</span>
      </p>
      {confidence !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">
          {(confidence * 100).toFixed(0)}% confidence
        </p>
      )}
    </div>
  );
}

export default AIInsightCard;
