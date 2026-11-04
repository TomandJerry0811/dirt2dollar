import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, Slack, Database, Brain, ArrowDown, FileText } from 'lucide-react';
import { cn } from '@/utils';

// ============================================================
// WorkflowTab
// ============================================================

const WORKFLOW_STEPS = [
  { id: '1', title: 'Slack Trigger Received', status: 'completed', icon: Slack, time: '02:00:01 AM', dur: '0.1s' },
  { id: '2', title: 'Client Data Retrieval', status: 'completed', icon: Database, time: '02:00:03 AM', dur: '1.8s' },
  { id: '3', title: 'Vector Embedding Generation', status: 'completed', icon: Brain, time: '02:00:07 AM', dur: '3.4s' },
  { id: '4', title: 'Historical Similarity Search', status: 'completed', icon: SearchIcon, time: '02:00:09 AM', dur: '2.1s' },
  { id: '5', title: 'Groq Llama-3 Analysis', status: 'running', icon: Brain, time: 'Running...', dur: '-' },
  { id: '6', title: 'Action Recommendation', status: 'pending', icon: FileText, time: '-', dur: '-' },
  { id: '7', title: 'Analysis Completed', status: 'pending', icon: CheckCircle2, time: '-', dur: '-' },
];

function SearchIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

export function WorkflowTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="section-card p-6 border-l-4 border-l-primary bg-primary/5">
        <h2 className="text-[16px] font-bold text-foreground mb-1">Execution Pipeline</h2>
        <p className="text-[13px] text-muted-foreground">
          Visualizing the backend RAG pipeline triggered by Slack integration. Run ID: <code className="bg-secondary px-1 py-0.5 rounded text-[11px]">wkf_89x2q</code>
        </p>
      </div>

      <div className="section-card p-8">
        <div className="flex flex-col relative">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isLast = idx === WORKFLOW_STEPS.length - 1;
            const Icon = step.icon;
            
            let statusColor = 'text-muted-foreground';
            let bgClass = 'bg-secondary border-border';
            let pulse = false;

            if (step.status === 'completed') {
              statusColor = 'text-success';
              bgClass = 'bg-success/10 border-success/20';
            } else if (step.status === 'running') {
              statusColor = 'text-primary';
              bgClass = 'bg-primary/10 border-primary/30';
              pulse = true;
            }

            return (
              <div key={step.id} className="flex flex-col relative">
                <div className="flex items-start gap-4 relative z-10">
                  {/* Node */}
                  <div className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative bg-card",
                    bgClass,
                    pulse && "shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  )}>
                    {step.status === 'running' ? (
                      <Loader2 className={cn("h-5 w-5 animate-spin", statusColor)} />
                    ) : (
                      <Icon className={cn("h-5 w-5", statusColor)} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className={cn("text-[14.5px] font-bold", step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground')}>
                          {step.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11.5px] font-medium text-muted-foreground uppercase tracking-wider">{step.status}</span>
                          <span className="text-[11px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">Dur: {step.dur}</span>
                        </div>
                      </div>
                      <span className="text-[12px] text-muted-foreground font-mono">{step.time}</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 bottom-2 w-0.5 -ml-[1px]">
                    <div className={cn(
                      "w-full h-full",
                      step.status === 'completed' ? 'bg-success' : 'bg-border'
                    )} />
                    <div className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center bg-card",
                      step.status === 'completed' ? 'text-success' : 'text-border'
                    )}>
                      <ArrowDown className="h-3 w-3" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
