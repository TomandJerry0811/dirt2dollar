import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Activity, Target, Workflow, History, Sparkles } from 'lucide-react';
import { SEED_TIMELINE } from '../client-details.data';

// ============================================================
// ActivityTab
// ============================================================

export function ActivityTab() {
  const events = [...SEED_TIMELINE, ...SEED_TIMELINE].map((e, i) => ({ ...e, id: `${e.id}-${i}` })); // Mock more data

  const getIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <Workflow className="h-4 w-4" />;
      case 'recommendation': return <Sparkles className="h-4 w-4 text-warning" />;
      case 'kpi': return <Activity className="h-4 w-4 text-info" />;
      case 'campaign': return <Target className="h-4 w-4 text-primary" />;
      case 'analysis': return <Brain className="h-4 w-4 text-primary" />;
      default: return <Shield className="h-4 w-4 text-success" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto space-y-4"
    >
      <div className="section-card p-6">
        <h2 className="text-[15px] font-semibold text-foreground mb-6">Comprehensive Activity Log</h2>
        
        <div className="relative border-l-2 border-border ml-4 space-y-8">
          {events.map((event) => (
            <div key={event.id} className="relative pl-8 group">
              <div className="absolute -left-[17px] top-0.5 h-8 w-8 rounded-full border-4 border-card bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {getIcon(event.type)}
              </div>
              
              <div className="bg-secondary/20 border border-border p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-[14px] font-semibold text-foreground">{event.title}</h4>
                  <span className="text-[12px] font-mono text-muted-foreground bg-card px-2 py-1 rounded">
                    {new Date(event.date).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{event.description}</p>
                {event.author && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center">
                      {event.author.charAt(0)}
                    </div>
                    <span className="text-[11.5px] font-medium text-foreground">{event.author}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
