import * as React from 'react';
import { cn } from '@/utils';
import type { Workflow } from '@/types';

// ============================================================
// WorkflowStatus Component
// ============================================================

interface WorkflowStatusProps {
  status: Workflow['status'];
  className?: string;
}

const statusConfig: Record<Workflow['status'], { dot: string; label: string }> = {
  active: { dot: 'bg-green-500', label: 'Active' },
  paused: { dot: 'bg-yellow-500', label: 'Paused' },
  failed: { dot: 'bg-red-500', label: 'Failed' },
  draft: { dot: 'bg-gray-500', label: 'Draft' },
  completed: { dot: 'bg-blue-500', label: 'Completed' },
  cancelled: { dot: 'bg-gray-400', label: 'Cancelled' },
};

export function WorkflowStatus({ status, className }: WorkflowStatusProps) {
  const config = statusConfig[status];
  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      <span className="text-foreground font-medium">{config.label}</span>
    </div>
  );
}

// ============================================================
// ExecutionLog Component (stub)
// ============================================================

export function ExecutionLog({ executionId }: { executionId: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs text-muted-foreground">
      <p className="text-foreground font-semibold mb-2">Execution Log — {executionId}</p>
      <p>Logs will be streamed here during implementation.</p>
    </div>
  );
}

export default WorkflowStatus;
