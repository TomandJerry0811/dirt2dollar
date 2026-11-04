import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  Clock,
  Terminal,
  Hash,
  GitBranch,
  ShieldAlert,
  Code2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { WorkflowErrorLog } from '@/types';

interface ErrorDetailModalProps {
  log: WorkflowErrorLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorDetailModal({ log, isOpen, onClose }: ErrorDetailModalProps) {
  const [copiedStack, setCopiedStack] = React.useState(false);
  const [copiedMsg, setCopiedMsg] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'stack' | 'json'>('stack');

  if (!isOpen || !log) return null;

  const handleCopyStack = () => {
    if (!log.error_stack) return;
    navigator.clipboard.writeText(log.error_stack);
    setCopiedStack(true);
    toast.success('Stack trace copied to clipboard');
    setTimeout(() => setCopiedStack(false), 2000);
  };

  const handleCopyMsg = () => {
    if (!log.error_message) return;
    navigator.clipboard.writeText(log.error_message);
    setCopiedMsg(true);
    toast.success('Error message copied');
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const formattedDate = log.created_at
    ? new Date(log.created_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : 'Unknown timestamp';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    Incident #{log.id}
                  </h2>
                  <Badge variant="danger" size="sm" dot>
                    Step Failed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recorded in <span className="font-mono text-foreground/80">public.workflow_error_logs</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Failed Step Callout */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                      Step Where Error Occurred
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-foreground font-mono flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {log.failed_node || 'Unknown Step / Pipeline Level'}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  What the Error Was (Error Message)
                </label>
                <button
                  onClick={handleCopyMsg}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {copiedMsg ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedMsg ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-3.5 text-sm font-mono text-destructive/90 break-words whitespace-pre-wrap select-text leading-relaxed">
                {log.error_message || 'No error message string logged.'}
              </div>
            </div>

            {/* Context Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-3 w-3 text-primary" />
                  Workflow Name
                </span>
                <p className="text-xs font-semibold text-foreground truncate" title={log.workflow_name || 'N/A'}>
                  {log.workflow_name || 'Unspecified Workflow'}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3 text-primary" />
                  Execution ID
                </span>
                <p className="text-xs font-mono font-medium text-foreground truncate" title={log.execution_id || 'N/A'}>
                  {log.execution_id || 'None'}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" />
                  Workflow ID
                </span>
                <p className="text-xs font-mono font-medium text-foreground truncate" title={log.workflow_id || 'N/A'}>
                  {log.workflow_id || 'None'}
                </p>
              </div>
            </div>

            {/* Tab switch for Stack Trace vs Raw JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('stack')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'stack'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    Stack Trace (Traceback)
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'json'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    Raw JSON Record
                  </button>
                </div>

                {activeTab === 'stack' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyStack}
                    className="h-7 text-xs gap-1"
                  >
                    {copiedStack ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedStack ? 'Copied' : 'Copy Traceback'}</span>
                  </Button>
                )}
              </div>

              {activeTab === 'stack' ? (
                <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-72 select-text">
                  <pre className="whitespace-pre leading-relaxed">
                    {log.error_stack || 'No stack trace captured.'}
                  </pre>
                </div>
              ) : (
                <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-72 select-text">
                  <pre className="whitespace-pre leading-relaxed">
                    {JSON.stringify(log, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card/60">
            <span className="text-xs text-muted-foreground">
              Incident ID: <strong className="text-foreground">{log.id}</strong>
            </span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ErrorDetailModal;
