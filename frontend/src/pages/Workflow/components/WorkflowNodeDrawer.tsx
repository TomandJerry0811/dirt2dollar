import * as React from 'react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';
import { X, Clock, Terminal, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

export function WorkflowNodeDrawer() {
  const { selectedNode, isNodeDrawerOpen, setIsNodeDrawerOpen } = useWorkflowMonitor();

  if (!isNodeDrawerOpen || !selectedNode) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-card border-l border-border shadow-xl z-50 flex flex-col animate-[slide-in-right_0.25s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-heading-4">{selectedNode.data.label}</h3>
          <p className="text-caption text-muted-foreground mt-1">Node Details</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsNodeDrawerOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary p-4 rounded-xl">
            <span className="text-caption text-muted-foreground block mb-1">Status</span>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-semibold capitalize">{selectedNode.status || 'Pending'}</span>
            </div>
          </div>
          <div className="bg-secondary p-4 rounded-xl">
            <span className="text-caption text-muted-foreground block mb-1">Duration</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="font-semibold">{selectedNode.duration ? `${selectedNode.duration}s` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        {(selectedNode.startedAt || selectedNode.completedAt) && (
          <div className="border border-border rounded-xl p-4 space-y-3">
            {selectedNode.startedAt && (
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-muted-foreground">Started At</span>
                <span className="font-mono">{new Date(selectedNode.startedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {selectedNode.completedAt && (
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-muted-foreground">Completed At</span>
                <span className="font-mono">{new Date(selectedNode.completedAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Details */}
        {selectedNode.error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
              <AlertTriangle className="h-4 w-4" />
              Execution Error
            </div>
            <p className="text-body-sm text-destructive">{selectedNode.error}</p>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-body-sm font-semibold">Input Payload</h4>
          </div>
          <div className="bg-foreground text-background p-4 rounded-xl overflow-x-auto text-xs font-mono">
            <pre>
              {selectedNode.input 
                ? JSON.stringify(selectedNode.input, null, 2) 
                : '// No inputs provided'}
            </pre>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-body-sm font-semibold">Output Payload</h4>
          </div>
          <div className="bg-foreground text-background p-4 rounded-xl overflow-x-auto text-xs font-mono">
            <pre>
              {selectedNode.output 
                ? JSON.stringify(selectedNode.output, null, 2) 
                : '// Waiting for execution...'}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
