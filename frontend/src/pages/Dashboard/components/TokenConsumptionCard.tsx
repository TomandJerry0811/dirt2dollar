import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Calendar,
  CalendarDays,
  CalendarRange,
  Zap,
  Cpu,
  Database,
  Sparkles
} from 'lucide-react';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import type { TokenConsumptionData } from '@/types';

// ============================================================
// Mini Sparkline / Bar Chart
// ============================================================

interface TokenBarProps {
  label: string;
  total: number;
  prompt: number;
  completion: number;
  maxTotal: number;
}

function TokenBar({ label, total, prompt, completion, maxTotal }: TokenBarProps) {
  const percent = maxTotal > 0 ? Math.min(Math.round((total / maxTotal) * 100), 100) : 0;
  const promptPercent = total > 0 ? Math.round((prompt / total) * 100) : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="font-medium text-foreground truncate max-w-[140px]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-muted-foreground">
            {prompt.toLocaleString()} p / {completion.toLocaleString()} c
          </span>
          <span className="font-semibold text-foreground">{total.toLocaleString()} tokens</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-all duration-500 flex overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${promptPercent}%` }}
            title={`Prompt: ${prompt}`}
          />
          <div
            className="h-full bg-info"
            style={{ width: `${100 - promptPercent}%` }}
            title={`Completion: ${completion}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TokenConsumptionCard Component
// ============================================================

interface TokenConsumptionCardProps {
  data: TokenConsumptionData;
  isLoading?: boolean;
  className?: string;
}

export function TokenConsumptionCard({ data, isLoading, className }: TokenConsumptionCardProps) {
  const [activeTab, setActiveTab] = React.useState<'day' | 'week' | 'month'>('day');

  const activePeriodMetrics = React.useMemo(() => {
    switch (activeTab) {
      case 'day':
        return {
          title: 'Daily Consumption',
          metrics: data.perDay,
          icon: Calendar,
          accent: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/20',
        };
      case 'week':
        return {
          title: 'Weekly Consumption',
          metrics: data.perWeek,
          icon: CalendarDays,
          accent: 'text-info',
          bg: 'bg-info/10',
          border: 'border-info/20',
        };
      case 'month':
        return {
          title: 'Monthly Consumption',
          metrics: data.perMonth,
          icon: CalendarRange,
          accent: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success/20',
        };
    }
  }, [activeTab, data]);

  const maxBreakdownValue = React.useMemo(() => {
    const breakdown = activePeriodMetrics.metrics?.breakdown ?? [];
    if (!breakdown.length) return 1;
    return Math.max(...breakdown.map((b) => b.total_tokens), 1);
  }, [activePeriodMetrics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className={cn('section-card p-6 border border-border/80 shadow-sm relative overflow-hidden', className)}
    >
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                LLM Token Consumption
              </h2>
              <Badge variant="outline" size="sm" className="gap-1 border-primary/30 text-primary bg-primary/5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Supabase Connected
              </Badge>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Live token monitoring from <span className="font-mono text-foreground/80">llm_usage_logs</span>
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center rounded-lg bg-secondary/50 p-1 border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('day')}
            className={cn(
              'px-3 py-1 text-[11.5px] font-medium rounded-md transition-all flex items-center gap-1.5',
              activeTab === 'day'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-3 w-3" />
            Per Day
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('week')}
            className={cn(
              'px-3 py-1 text-[11.5px] font-medium rounded-md transition-all flex items-center gap-1.5',
              activeTab === 'week'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="h-3 w-3" />
            Per Week
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('month')}
            className={cn(
              'px-3 py-1 text-[11.5px] font-medium rounded-md transition-all flex items-center gap-1.5',
              activeTab === 'month'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarRange className="h-3 w-3" />
            Per Month
          </button>
        </div>
      </div>

      {/* 3 Overview Metric Cards: Per Day | Per Week | Per Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* 1. Daily Card */}
        <div
          onClick={() => setActiveTab('day')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
            activeTab === 'day'
              ? 'border-primary/50 bg-primary/5 shadow-xs'
              : 'border-border/60 bg-card/50 hover:border-border hover:bg-card'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Per Day
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono">
              {data.perDay.periodLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[26px] font-bold text-foreground tracking-tight">
              {data.perDay.totalTokens.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">tokens</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
            <span>Prompt: {data.perDay.promptTokens.toLocaleString()}</span>
            <span>Comp: {data.perDay.completionTokens.toLocaleString()}</span>
            <span className="font-semibold text-foreground/80">{data.perDay.requestCount} reqs</span>
          </div>
        </div>

        {/* 2. Weekly Card */}
        <div
          onClick={() => setActiveTab('week')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
            activeTab === 'week'
              ? 'border-info/50 bg-info/5 shadow-xs'
              : 'border-border/60 bg-card/50 hover:border-border hover:bg-card'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-info" />
              Per Week
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono">
              {data.perWeek.periodLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[26px] font-bold text-foreground tracking-tight">
              {data.perWeek.totalTokens.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">tokens</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
            <span>Prompt: {data.perWeek.promptTokens.toLocaleString()}</span>
            <span>Comp: {data.perWeek.completionTokens.toLocaleString()}</span>
            <span className="font-semibold text-foreground/80">{data.perWeek.requestCount} reqs</span>
          </div>
        </div>

        {/* 3. Monthly Card */}
        <div
          onClick={() => setActiveTab('month')}
          className={cn(
            'p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
            activeTab === 'month'
              ? 'border-success/50 bg-success/5 shadow-xs'
              : 'border-border/60 bg-card/50 hover:border-border hover:bg-card'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarRange className="h-3.5 w-3.5 text-success" />
              Per Month
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono">
              {data.perMonth.periodLabel}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[26px] font-bold text-foreground tracking-tight">
              {data.perMonth.totalTokens.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">tokens</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
            <span>Prompt: {data.perMonth.promptTokens.toLocaleString()}</span>
            <span>Comp: {data.perMonth.completionTokens.toLocaleString()}</span>
            <span className="font-semibold text-foreground/80">{data.perMonth.requestCount} reqs</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown & Workflow Node Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-border/70">
        {/* Left: Time Period Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12.5px] font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-warning" />
              {activePeriodMetrics.title} Timeline
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {activePeriodMetrics.metrics.breakdown.length} intervals recorded
            </span>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {activePeriodMetrics.metrics.breakdown.length > 0 ? (
              activePeriodMetrics.metrics.breakdown.map((item, i) => (
                <TokenBar
                  key={i}
                  label={item.label}
                  total={item.total_tokens}
                  prompt={item.prompt_tokens}
                  completion={item.completion_tokens}
                  maxTotal={maxBreakdownValue}
                />
              ))
            ) : (
              <p className="text-[12px] text-muted-foreground italic py-3 text-center">
                No consumption logged for this period yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Workflow Node / Pipeline Distribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[12.5px] font-semibold text-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              Tokens by Workflow Node
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {data.nodeBreakdown?.length ?? 0} active nodes
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {data.nodeBreakdown && data.nodeBreakdown.length > 0 ? (
              data.nodeBreakdown.map((node, i) => {
                const percentOfTotal = data.totalTokens > 0
                  ? Math.round((node.total_tokens / data.totalTokens) * 100)
                  : 0;
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-[11.5px]">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">{node.nodeName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-muted-foreground font-mono">{node.total_tokens.toLocaleString()} tok</span>
                      <Badge variant="outline" size="sm" className="text-[10px] px-1.5 py-0 h-4.5">
                        {percentOfTotal}%
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[12px] text-muted-foreground italic py-3 text-center">
                No node executions recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3 text-primary" />
            Total Lifetime Tokens: <strong className="text-foreground ml-0.5">{data.totalTokens.toLocaleString()}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-warning" />
            Total Executions: <strong className="text-foreground ml-0.5">{data.totalRequests}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10.5px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-xs bg-primary inline-block" /> Prompt Tokens ({data.totalPromptTokens.toLocaleString()})
          </span>
          <span className="flex items-center gap-1 ml-2">
            <span className="h-2 w-2 rounded-xs bg-info inline-block" /> Completion Tokens ({data.totalCompletionTokens.toLocaleString()})
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default TokenConsumptionCard;
