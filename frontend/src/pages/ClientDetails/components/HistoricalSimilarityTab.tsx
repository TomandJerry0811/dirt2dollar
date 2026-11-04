import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, ArrowRight, X } from 'lucide-react';
import { SEED_HISTORICAL_CLIENTS } from '../client-details.data';
import type { HistoricalSimilarClient } from '@/types';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';
import { useClientDetailsStore } from '@/store/client-details.store';

// ============================================================
// HistoricalClientDrawer
// ============================================================

function HistoricalClientDrawer({ client, onClose }: { client: HistoricalSimilarClient; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-50 flex justify-end backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-card border-l border-border shadow-2xl h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-[16px] font-bold text-foreground">{client.name}</h2>
              <p className="text-[12px] text-muted-foreground">{client.industry} · Similarity: {client.similarityScore}%</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Outcome</span>
              <p className={cn(
                "text-[15px] font-bold mt-1 capitalize",
                client.outcome === 'churned' ? 'text-destructive' : 'text-success'
              )}>
                {client.outcome}
              </p>
            </div>

            {client.reasonForChurn && (
              <div>
                <h3 className="text-[13px] font-semibold text-foreground border-b border-border pb-2 mb-3">Reason for Churn</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                  {client.reasonForChurn}
                </p>
              </div>
            )}

            {client.lessonsLearned && (
              <div>
                <h3 className="text-[13px] font-semibold text-foreground border-b border-border pb-2 mb-3">Lessons Learned</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed bg-info/5 p-3 rounded-lg border border-info/10">
                  {client.lessonsLearned}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// HistoricalSimilarityTab
// ============================================================

export function HistoricalSimilarityTab() {
  const { historicalDrawerOpen, selectedHistoricalClient, setHistoricalDrawer } = useClientDetailsStore();
  const clients = SEED_HISTORICAL_CLIENTS;

  const activeClient = clients.find(c => c.id === selectedHistoricalClient) || clients[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="section-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Vector Search Results</h2>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1">Retrieved using Embedding Similarity against the historical churn database.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Similarity</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Outcome</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: HistoricalSimilarClient) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">{c.industry}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${c.similarityScore}%` }} />
                      </div>
                      <span className="text-[12px] font-semibold">{c.similarityScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[11.5px] font-semibold uppercase px-2.5 py-0.5 rounded-full border",
                      c.outcome === 'churned' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-success bg-success/10 border-success/20'
                    )}>
                      {c.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                      onClick={() => setHistoricalDrawer(true, c.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {historicalDrawerOpen && (
        <HistoricalClientDrawer client={activeClient} onClose={() => setHistoricalDrawer(false)} />
      )}
    </motion.div>
  );
}
