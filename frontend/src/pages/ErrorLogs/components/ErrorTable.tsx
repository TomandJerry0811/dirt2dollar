import * as React from 'react';
import {
  Layers,
  AlertTriangle,
  GitBranch,
  Hash,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { WorkflowErrorLog } from '@/types';

interface ErrorTableProps {
  logs: WorkflowErrorLog[];
  onSelectLog: (log: WorkflowErrorLog) => void;
  isLoading: boolean;
}

export function ErrorTable({ logs, onSelectLog, isLoading }: ErrorTableProps) {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const handleCopyMessage = (e: React.MouseEvent, log: WorkflowErrorLog) => {
    e.stopPropagation();
    if (!log.error_message) return;
    navigator.clipboard.writeText(log.error_message);
    setCopiedId(log.id);
    toast.success('Error message copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
        <p className="text-sm font-medium text-foreground">Loading error telemetry from Supabase...</p>
        <p className="text-xs text-muted-foreground mt-1">Fetching records from public.workflow_error_logs</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center shadow-sm">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No Error Logs Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          No workflow errors match your current search or filter criteria. All steps are either running smoothly or no records match.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Table Header Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <span className="text-xs font-semibold text-foreground">
            Error Incident Registry
          </span>
          <span className="text-xs text-muted-foreground">
            ({logs.length} incidents logged)
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Click any row to inspect failed step & full stack trace
        </span>
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-border">
        {logs.map((log) => {
          const formattedDate = log.created_at
            ? new Date(log.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Unknown';

          return (
            <div
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="p-4 sm:p-5 hover:bg-secondary/40 cursor-pointer transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Failed Step + Error Message */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Meta line: Incident ID + Step Name + Workflow */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    #{log.id}
                  </span>

                  {/* PROMINENT STEP INDICATOR */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold font-mono">
                    <Layers className="h-3 w-3" />
                    <span>Step: {log.failed_node || 'General / Orchestration'}</span>
                  </div>

                  {log.workflow_name && (
                    <Badge variant="outline" size="sm" className="text-muted-foreground border-border text-[11px]">
                      <GitBranch className="h-2.5 w-2.5 mr-1 text-primary" />
                      {log.workflow_name}
                    </Badge>
                  )}

                  {log.execution_id && (
                    <Badge variant="secondary" size="sm" className="font-mono text-[10px] text-muted-foreground">
                      <Hash className="h-2.5 w-2.5 mr-0.5" />
                      {log.execution_id}
                    </Badge>
                  )}
                </div>

                {/* PROMINENT ERROR MESSAGE */}
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 select-text group-hover:text-destructive transition-colors font-mono">
                    {log.error_message || 'No explicit error message recorded.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Timestamp & Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleCopyMessage(e, log)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Copy Error Message"
                  >
                    {copiedId === log.id ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 group-hover:border-primary group-hover:text-primary transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ErrorTable;
