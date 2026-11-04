import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { PlayCircle, RefreshCw, History } from 'lucide-react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';

export function WorkflowHeader() {
  const { runWorkflow, refresh, isRunning } = useWorkflowMonitor();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-heading-2">Workflow Monitor</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Monitor AI client intelligence workflow executions and backend processing pipelines.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" leftIcon={<History className="h-4 w-4" />} onClick={() => {
          document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          View History
        </Button>
        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
          Refresh
        </Button>
        <Button variant="primary" leftIcon={<PlayCircle className="h-4 w-4" />} onClick={runWorkflow} isLoading={isRunning}>
          Run Workflow
        </Button>
      </div>
    </div>
  );
}
