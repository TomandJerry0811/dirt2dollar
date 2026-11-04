import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { WorkflowStep, WorkflowStepStatus } from '../dashboard.types';
import { PLACEHOLDER_WORKFLOW } from '../dashboard.data';

// ============================================================
// Step status config
// ============================================================

const STATUS_CONFIG: Record<
  WorkflowStepStatus,
  { icon: React.ElementType; iconClass: string; lineClass: string; labelClass: string }
> = {
  completed: { icon: CheckCircle2, iconClass: 'text-success',           lineClass: 'bg-success',            labelClass: 'text-foreground' },
  running:   { icon: Loader2,      iconClass: 'text-primary animate-spin', lineClass: 'bg-primary/30',      labelClass: 'text-primary font-semibold' },
  pending:   { icon: Circle,       iconClass: 'text-border',             lineClass: 'bg-border',             labelClass: 'text-muted-foreground' },
  failed:    { icon: XCircle,      iconClass: 'text-destructive',        lineClass: 'bg-destructive',        labelClass: 'text-destructive' },
};

// ============================================================
// WorkflowStatusCard
// ============================================================

interface WorkflowStatusCardProps {
  steps?: WorkflowStep[];
  runId?: string;
  className?: string;
}

export function WorkflowStatusCard({
  steps = PLACEHOLDER_WORKFLOW,
  runId = 'run-20240806-089',
  className,
}: WorkflowStatusCardProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalCount = steps.length;
  const currentStep = steps.find((s) => s.status === 'running');

  return (
    <div className={cn('section-card p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Workflow Pipeline</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Run ID: <code className="text-[11px] bg-secondary px-1 py-0.5 rounded">{runId}</code>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11.5px] font-semibold text-foreground">{completedCount}/{totalCount}</p>
          <p className="text-[11px] text-muted-foreground">steps done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Pipeline steps */}
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const cfg = STATUS_CONFIG[step.status];
          const Icon = cfg.icon;
          const isLast = i === steps.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="flex items-start gap-3"
            >
              {/* Icon + connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card border-2 border-border">
                  <Icon className={cn('h-3.5 w-3.5', cfg.iconClass)} strokeWidth={2} />
                </div>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 my-0.5', cfg.lineClass, 'min-h-[16px]')} />
                )}
              </div>

              {/* Label + duration */}
              <div className={cn('flex items-center justify-between flex-1 pb-3', isLast && 'pb-0')}>
                <p className={cn('text-[12.5px]', cfg.labelClass)}>{step.name}</p>
                {step.duration && (
                  <span className="text-[11px] text-muted-foreground">{step.duration}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current step label */}
      {currentStep && (
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          <span className="text-[12px] text-muted-foreground">
            Running: <span className="font-semibold text-foreground">{currentStep.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}
