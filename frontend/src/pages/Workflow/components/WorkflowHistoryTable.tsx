import * as React from 'react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, ChevronRight, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import type { ExecutionStatus, WorkflowExecution } from '@/types';

function getStatusBadge(status: ExecutionStatus) {
  switch (status) {
    case 'completed': return <Badge variant="success" dot>Completed</Badge>;
    case 'failed': return <Badge variant="danger" dot>Failed</Badge>;
    case 'running': return <Badge variant="primary" dot>Running</Badge>;
    default: return <Badge variant="default" dot>{status}</Badge>;
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

export function WorkflowHistoryTable() {
  const { history, isLoadingHistory, isHistoryError, historyErrorMessage, refetchHistory } = useWorkflowMonitor();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredHistory = history.filter(exec => 
    exec.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exec.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="history-section" className="section-card noPad">
      {/* Header */}
      <div className="section-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border p-6">
        <div>
          <h3 className="text-heading-4">Execution History</h3>
          <p className="text-caption text-muted-foreground mt-1">Recent workflow executions and their outcomes.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search ID or Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-60 pl-9 pr-3 text-sm rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button variant="outline" size="icon" title="Filter Options">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold">Execution ID</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold">Client</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold">Started</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold">Duration</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold">Status</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold text-center">Stages</th>
              <th className="px-6 py-3 text-label text-muted-foreground font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingHistory ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-6 py-4"><div className="skeleton h-5 w-24 rounded" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-32 rounded" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-24 rounded" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded mx-auto" /></td>
                  <td className="px-6 py-4 text-right"><div className="skeleton h-8 w-8 rounded-lg ml-auto" /></td>
                </tr>
              ))
            ) : isHistoryError ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Couldn't load execution history</p>
                    <p className="text-sm text-muted-foreground mb-3 max-w-xs">
                      {historyErrorMessage ?? 'Something went wrong while fetching execution history.'}
                    </p>
                    <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetchHistory()}>
                      Try again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No execution history found.
                </td>
              </tr>
            ) : (
              filteredHistory.map((exec: WorkflowExecution) => (
                <tr key={exec.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                    {exec.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-body-sm text-foreground">
                    {exec.clientName || exec.clientId || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(exec.startedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {exec.duration ? `${exec.duration}s` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(exec.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium bg-secondary px-2 py-1 rounded">
                      {exec.successCount || 0}/{exec.stageCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}