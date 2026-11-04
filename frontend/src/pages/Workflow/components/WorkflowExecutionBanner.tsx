import * as React from 'react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';
import { Activity, Clock, Shield, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';
import type { ExecutionStatus } from '@/types';

function getStatusBadge(status: ExecutionStatus) {
  switch (status) {
    case 'running': return <Badge variant="primary" dot>Running</Badge>;
    case 'completed': return <Badge variant="success" dot>Completed</Badge>;
    case 'failed': return <Badge variant="danger" dot>Failed</Badge>;
    case 'warning': return <Badge variant="warning" dot>Warning</Badge>;
    default: return <Badge variant="default" dot>Pending</Badge>;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return '—';
  }
}

export function WorkflowExecutionBanner() {
  const { activeExecution, isLoadingExecution } = useWorkflowMonitor();

  if (isLoadingExecution) {
    return <div className="section-card h-32 skeleton" />;
  }

  if (!activeExecution) {
    return null;
  }

  // Calculate progress percentage
  const totalStages = activeExecution.stageCount || 1;
  const completedStages = (activeExecution.successCount || 0) + (activeExecution.failureCount || 0);
  const progressPercent = Math.min(100, Math.round((completedStages / totalStages) * 100));

  // Find current running stage
  const currentRunningNode = activeExecution.nodes?.find(n => n.status === 'running') || activeExecution.nodes?.find(n => n.status === 'pending');
  const currentStageName = currentRunningNode?.data.label || (activeExecution.status === 'completed' ? 'All stages completed' : 'Unknown');

  return (
    <div className={cn(
      "section-card p-6 border-l-4 transition-colors",
      activeExecution.status === 'running' ? 'border-l-primary' : 
      activeExecution.status === 'completed' ? 'border-l-success' : 
      activeExecution.status === 'failed' ? 'border-l-danger' : 'border-l-border'
    )}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-heading-4">AI Workflow Execution</h2>
            {getStatusBadge(activeExecution.status)}
            <span className="text-caption font-mono bg-secondary px-2 py-1 rounded">
              {activeExecution.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <span className="text-caption block mb-1">Client</span>
              <div className="flex items-center gap-1.5 text-body-sm font-semibold">
                <Shield className="h-4 w-4 text-primary" />
                {activeExecution.clientName || activeExecution.clientId}
              </div>
            </div>
            <div>
              <span className="text-caption block mb-1">Started</span>
              <div className="flex items-center gap-1.5 text-body-sm font-semibold">
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                {formatDate(activeExecution.startedAt)}
              </div>
            </div>
            <div>
              <span className="text-caption block mb-1">Elapsed Time</span>
              <div className="flex items-center gap-1.5 text-body-sm font-semibold">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {activeExecution.duration ? `${activeExecution.duration.toFixed(1)}s` : 'Running...'}
              </div>
            </div>
            <div>
              <span className="text-caption block mb-1">Current Stage</span>
              <div className="flex items-center gap-1.5 text-body-sm font-semibold text-primary">
                <Activity className="h-4 w-4" />
                {currentStageName}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Progress */}
        <div className="w-full lg:w-72 flex-shrink-0 bg-secondary rounded-xl p-4 border border-border">
          <div className="flex justify-between items-end mb-2">
            <span className="text-caption font-medium">Progress</span>
            <span className="text-body-sm font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border/50">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                activeExecution.status === 'failed' ? 'bg-destructive' : 
                activeExecution.status === 'completed' ? 'bg-success' : 'bg-primary relative'
              )}
              style={{ width: `${progressPercent}%` }}
            >
              {activeExecution.status === 'running' && (
                <div className="absolute inset-0 bg-white/20 animate-skeleton-shimmer" />
              )}
            </div>
          </div>
          <p className="text-caption mt-2 text-right">
            {completedStages} of {totalStages} stages completed
          </p>
        </div>
      </div>
    </div>
  );
}
