import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Sparkles, Activity, FileText, Brain, BarChart2, Lightbulb, ArrowRight } from 'lucide-react';
import { useClientStore } from '@/store/client.store';
import { useClientDetailsStore } from '@/store/client-details.store';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { HealthScore, RiskBadge, WorkflowBadge } from './ClientTableBlocks';

// ============================================================
// ClientQuickView
// ============================================================

export function ClientQuickView() {
  const { selectedClient, setSelectedClient } = useClientStore();
  const { setActiveTab } = useClientDetailsStore();
  const navigate = useNavigate();

  const actionItems: string[] = (selectedClient?.metadata as any)?.action_items || [];
  const satScore = (selectedClient?.metadata as any)?.satisfaction_score;

  const navigateToTab = (tab: 'overview' | 'analytics' | 'recommendations') => {
    if (!selectedClient) return;
    setActiveTab(tab);
    navigate(`/client/${selectedClient.id}`);
    setSelectedClient(null);
  };

  return (
    <AnimatePresence>
      {selectedClient && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedClient(null)}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:static top-0 right-0 bottom-0 z-50 w-full max-w-sm lg:w-96 bg-card border-l border-border shadow-2xl lg:shadow-none flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar name={selectedClient.name} size="lg" className="rounded-lg shadow-sm" />
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground leading-tight">{selectedClient.name}</h2>
                  <p className="text-[12px] text-muted-foreground">{selectedClient.industry} · {selectedClient.tier}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                aria-label="Close panel"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1" 
                  rightIcon={<ExternalLink className="h-3 w-3" />}
                  onClick={() => navigateToTab('overview')}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  leftIcon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
                  onClick={() => {
                    navigate(`/ai-analysis?query=${encodeURIComponent(`give me churn analysis for ${selectedClient.name}`)}&run=true`);
                    setSelectedClient(null);
                  }}
                >
                  Run AI
                </Button>
              </div>

              {/* Direct Tab Short-cuts */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigateToTab('analytics')}
                  className="p-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center gap-2 text-left"
                >
                  <BarChart2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-bold text-foreground block leading-tight">KPI Charts</span>
                    <span className="text-[10px] text-muted-foreground">Historical curves</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('recommendations')}
                  className="p-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center gap-2 text-left"
                >
                  <Lightbulb className="h-4 w-4 text-warning flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-bold text-foreground block leading-tight">Action Plan</span>
                    <span className="text-[10px] text-muted-foreground">{actionItems.length || 5} recs available</span>
                  </div>
                </button>
              </div>

              {/* Health & Risk */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <p className="text-[11.5px] font-medium text-muted-foreground mb-2">Health Score</p>
                  <HealthScore score={selectedClient.healthScore} />
                </div>
                <div className="p-4 rounded-xl border border-border bg-secondary/30">
                  <p className="text-[11.5px] font-medium text-muted-foreground mb-2">Churn Risk</p>
                  <div className="flex flex-col gap-1">
                    <span className="text-[20px] font-bold text-foreground">{selectedClient.churnProbability}%</span>
                    <RiskBadge level={selectedClient.riskLevel} />
                  </div>
                </div>
              </div>

              {/* Top AI Action Recommendation */}
              {actionItems.length > 0 && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Top AI Recommendation
                    </span>
                    <button
                      onClick={() => navigateToTab('recommendations')}
                      className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5"
                    >
                      View All <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <p className="text-[12px] text-foreground font-medium leading-relaxed">
                    {actionItems[0]}
                  </p>
                </div>
              )}

              {/* Details List */}
              <div className="space-y-4">
                <h3 className="text-[13px] font-semibold text-foreground border-b border-border pb-2">Account Details</h3>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[11.5px] text-muted-foreground mb-1">MRR</p>
                    <p className="text-[13px] font-medium text-foreground">${(selectedClient.mrr / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-muted-foreground mb-1">Account Manager</p>
                    <p className="text-[13px] font-medium text-foreground">{selectedClient.accountManager || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-muted-foreground mb-1">Campaign</p>
                    <p className="text-[13px] font-medium text-foreground">{selectedClient.campaign || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-[11.5px] text-muted-foreground mb-1">Satisfaction Score</p>
                    <p className="text-[13px] font-medium text-foreground">{satScore ? `${satScore}/100` : '85/100'}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Status */}
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold text-foreground border-b border-border pb-2">Recent Activity</h3>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-[12.5px] font-medium text-foreground">AI Analysis</span>
                  </div>
                  <WorkflowBadge status={selectedClient.workflowStatus} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-info" />
                    <span className="text-[12.5px] font-medium text-foreground">KPI Telemetry Sync</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-success" />
                    <span className="text-[12.5px] font-medium text-foreground">Retention Report</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">Generated</span>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
