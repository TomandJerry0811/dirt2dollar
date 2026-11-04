import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workflowService } from '@/services/workflow.service';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';
import { Terminal, Info, CheckCircle2, AlertTriangle, XCircle, Copy, Trash2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/utils/errors';
import { cn } from '@/utils';
import { toast } from 'sonner';

// The backend endpoint (/workflows/executions/{id}/logs) currently returns
// {timestamp, level, message} rather than the richer
// {id, startedAt, severity, nodeName, message, duration} shape this
// component was designed around. Rather than assume either shape, we
// normalize defensively so a backend response in either form (or a
// partially-filled one) renders correctly instead of showing "undefined"
// or throwing when a field is accessed.
interface NormalizedLogEntry {
  id: string;
  startedAt: string | null;
  severity: string;
  nodeName: string;
  message: string;
  duration?: number;
}

function normalizeLog(raw: any, index: number): NormalizedLogEntry {
  return {
    id: raw?.id != null ? String(raw.id) : `log-${index}`,
    startedAt: raw?.startedAt ?? raw?.timestamp ?? null,
    severity: (raw?.severity ?? mapLevelToSeverity(raw?.level)) || 'info',
    nodeName: raw?.nodeName ?? raw?.node ?? 'Workflow',
    message: raw?.message ?? '',
    duration: raw?.duration,
  };
}

function mapLevelToSeverity(level: unknown): string {
  if (typeof level !== 'string') return 'info';
  const normalized = level.toLowerCase();
  if (normalized === 'error') return 'error';
  if (normalized === 'warning' || normalized === 'warn') return 'warning';
  if (normalized === 'success') return 'success';
  return 'info';
}

function formatLogTime(startedAt: string | null): string {
  if (!startedAt) return '—';
  const date = new Date(startedAt);
  if (isNaN(date.getTime())) {
    // Not a parseable date — likely already a plain "HH:MM:SS" string
    // (as the current backend sends), so show it as-is rather than "Invalid Date".
    return startedAt;
  }
  return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function WorkflowExecutionLogs() {
  const { activeExecution } = useWorkflowMonitor();
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: rawLogs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['workflow', 'logs', activeExecution?.id],
    queryFn: () => workflowService.getExecutionLogs(activeExecution!.id).then(r => r.data),
    enabled: !!activeExecution?.id,
  });

  const logs = React.useMemo(
    () => (Array.isArray(rawLogs) ? rawLogs.map(normalizeLog) : []),
    [rawLogs]
  );

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.severity !== filter) return false;
    const query = searchTerm.toLowerCase();
    if (query && !log.message.toLowerCase().includes(query) && !log.nodeName.toLowerCase().includes(query)) return false;
    return true;
  });

  const copyLogs = () => {
    try {
      const text = filteredLogs
        .map(l => `[${formatLogTime(l.startedAt)}] [${l.severity.toUpperCase()}] [${l.nodeName}] ${l.message}`)
        .join('\n');
      navigator.clipboard.writeText(text);
      toast.success('Logs copied to clipboard');
    } catch (err) {
      console.error('Failed to copy logs:', err);
      toast.error('Failed to copy logs to clipboard');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info className="h-4 w-4 text-info" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Terminal className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!activeExecution) return null;

  return (
    <div className="section-card flex flex-col h-[500px]">
      {/* Log Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="text-heading-4">Execution Logs</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-40 pl-8 pr-3 text-sm rounded-md border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 px-2 text-sm rounded-md border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <Button variant="outline" size="sm" onClick={copyLogs} title="Copy Logs">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" title="Clear Logs">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 overflow-y-auto bg-foreground rounded-xl p-4 custom-scrollbar font-mono text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading logs...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <ErrorState
              title="Couldn't load logs"
              description={getApiErrorMessage(error)}
              onRetry={refetch}
            />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No logs found matching criteria
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1 group hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                <span className="text-muted-foreground w-20 flex-shrink-0">
                  {formatLogTime(log.startedAt)}
                </span>
                <div className="mt-0.5 flex-shrink-0">
                  {getSeverityIcon(log.severity)}
                </div>
                <div className="flex-1 break-words">
                  <span className={cn(
                    "font-semibold mr-2",
                    log.severity === 'info' && "text-info",
                    log.severity === 'success' && "text-success",
                    log.severity === 'warning' && "text-warning",
                    log.severity === 'error' && "text-destructive"
                  )}>
                    [{log.nodeName}]
                  </span>
                  <span className="text-background/90">{log.message}</span>
                  {log.duration && (
                    <span className="text-muted-foreground ml-2">({log.duration}s)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}