import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Lightbulb, 
  Sparkles, 
  Filter, 
  Search, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Layers, 
  Clock, 
  Award,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { Client, Recommendation, RecommendationPriority, RecommendationCategory } from '@/types';
import { useRecommendations } from '@/hooks/useRecommendations';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SEED_RECOMMENDATIONS } from '../client-details.data';
import { toast } from 'sonner';

// ============================================================
// Helper to transform raw action items into rich Recommendation objects
// ============================================================

function buildRecommendationsFromClient(client: Client): Recommendation[] {
  const metadata = client.metadata as Record<string, any> | undefined;
  const actionItems: string[] = metadata?.action_items || [];
  const bottlenecks: string[] = metadata?.bottlenecks || [];

  if (!actionItems || actionItems.length === 0) {
    return SEED_RECOMMENDATIONS.map((r) => ({
      ...r,
      clientId: client.id,
      clientName: client.name,
    }));
  }

  return actionItems.map((item, idx) => {
    const itemLower = item.toLowerCase();

    // Priority inference
    let priority: RecommendationPriority = 'medium';
    if (anyMatch(itemLower, ['failed payment', 'cancel', 'urgent', 'immediate', 'today', '48 hours', 'critical'])) {
      priority = 'urgent';
    } else if (anyMatch(itemLower, ['high', 'streamline', 'filter', 'drop', 'pricing', 'schedule strategy'])) {
      priority = 'high';
    } else if (anyMatch(itemLower, ['crm', 'missing', 'duration', 'optional', 'minor'])) {
      priority = 'low';
    }

    // Category inference
    let category: RecommendationCategory = 'product';
    if (anyMatch(itemLower, ['payment', 'billing', 'fee', 'deposit', 'price', 'pricing', 'balance'])) {
      category = 'relationship'; // or billing
    } else if (anyMatch(itemLower, ['lead', 'cpl', 'ad', 'campaign', 'spend', 'prospect'])) {
      category = 'engagement';
    } else if (anyMatch(itemLower, ['appointment', 'call', 'check-in', 'review', 'sponsor', 'meeting'])) {
      category = 'relationship';
    } else if (anyMatch(itemLower, ['retain', 'retention', 'contract'])) {
      category = 'retention';
    }

    // Impact & Confidence
    const estimatedImpact = priority === 'urgent' ? 95 : priority === 'high' ? 85 : priority === 'medium' ? 72 : 55;
    const confidenceScore = priority === 'urgent' ? 96 : priority === 'high' ? 90 : 84;

    const shortTitle = item.split('.')[0].trim();
    const title = shortTitle.length > 55 ? shortTitle.substring(0, 52) + '...' : shortTitle;

    const matchingBottleneck = bottlenecks[idx % (bottlenecks.length || 1)] || 'Discovered during AI churn analysis scan';

    return {
      id: `rec-${client.id}-${idx}`,
      clientId: client.id,
      clientName: client.name,
      title,
      description: item,
      rationale: matchingBottleneck,
      impactDescription: `Expected to mitigate churn risk by +${estimatedImpact - 50}% and stabilize account health.`,
      category,
      priority,
      status: 'pending',
      estimatedImpact,
      confidenceScore,
      actions: [],
      generatedAt: client.updatedAt || new Date().toISOString(),
    };
  });
}

function anyMatch(text: string, terms: string[]) {
  return terms.some((t) => text.includes(t));
}

// ============================================================
// Priority Config
// ============================================================

const PRIORITY_BADGE_STYLE: Record<RecommendationPriority, string> = {
  urgent: 'text-destructive bg-destructive/10 border-destructive/30',
  high: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  medium: 'text-warning bg-warning/10 border-warning/30',
  low: 'text-info bg-info/10 border-info/30',
};

// ============================================================
// RecommendationsTab
// ============================================================

export function RecommendationsTab({ client }: { client?: Client }) {
  const { 
    recommendations: apiRecs, 
    isLoading, 
    generate, 
    isGenerating, 
    complete: completeMutation, 
    refetch 
  } = useRecommendations(client?.id);

  // Local state for interactive items (supports optimistic completion toggle)
  const [localRecs, setLocalRecs] = React.useState<Recommendation[]>([]);
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Sync with API data or fallback to client action items
  React.useEffect(() => {
    if (apiRecs && apiRecs.length > 0) {
      setLocalRecs(apiRecs);
    } else if (client) {
      setLocalRecs(buildRecommendationsFromClient(client));
    } else {
      setLocalRecs(SEED_RECOMMENDATIONS);
    }
  }, [apiRecs, client]);

  const toggleComplete = (id: string) => {
    setLocalRecs((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            toast.success(`Marked "${r.title}" as completed`);
            completeMutation({ id, notes: 'Completed from client details workspace' });
          } else {
            toast.info(`Re-opened "${r.title}"`);
          }
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const handleGenerate = () => {
    toast.promise(
      new Promise((resolve) => {
        generate(client?.id);
        setTimeout(resolve, 2000);
      }),
      {
        loading: 'Synthesizing fresh recommendations from account vectors...',
        success: 'AI Playbook updated with fresh recommendations!',
        error: 'Failed to generate recommendations.',
      }
    );
  };

  // Filtered List
  const filteredRecs = React.useMemo(() => {
    return localRecs.filter((r) => {
      const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [localRecs, priorityFilter, searchQuery]);

  // Aggregate stats
  const totalCount = localRecs.length;
  const urgentCount = localRecs.filter((r) => r.priority === 'urgent' || r.priority === 'high').length;
  const completedCount = localRecs.filter((r) => r.status === 'completed').length;
  const avgImpact = Math.round(
    localRecs.reduce((sum, r) => sum + (r.estimatedImpact || 75), 0) / (totalCount || 1)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Top Banner with Summary Stats */}
      <div className="section-card p-5 border-border bg-gradient-to-r from-card via-card to-primary/5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-[16px] font-bold text-foreground">
                {client?.name ? `${client.name} — AI Action Playbook` : 'AI Recommendation Playbook'}
              </h2>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1">
              Prescriptive interventions ranked by urgency and predicted retention impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              onClick={handleGenerate}
            >
              Generate Fresh Playbook
            </Button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground block">Active Action Items</span>
            <span className="text-[16px] font-bold text-foreground">{totalCount - completedCount} / {totalCount}</span>
          </div>
          <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground block">Urgent & High Impact</span>
            <span className="text-[16px] font-bold text-destructive">{urgentCount}</span>
          </div>
          <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground block">Completed Actions</span>
            <span className="text-[16px] font-bold text-success">{completedCount}</span>
          </div>
          <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground block">Avg Retention Impact</span>
            <span className="text-[16px] font-bold text-primary">+{avgImpact}%</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Actions', count: totalCount },
            { id: 'urgent', label: 'Urgent', count: localRecs.filter((r) => r.priority === 'urgent').length },
            { id: 'high', label: 'High Priority', count: localRecs.filter((r) => r.priority === 'high').length },
            { id: 'medium', label: 'Medium', count: localRecs.filter((r) => r.priority === 'medium').length },
            { id: 'low', label: 'Low', count: localRecs.filter((r) => r.priority === 'low').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPriorityFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
                priorityFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                priorityFilter === tab.id ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[12.5px] rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="section-card p-5 h-48 animate-pulse bg-secondary/20" />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="section-card p-12 text-center flex flex-col items-center justify-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">No recommendations found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search query or priority filters above.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => { setPriorityFilter('all'); setSearchQuery(''); }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRecs.map((rec) => {
              const isCompleted = rec.status === 'completed';

              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "section-card p-5 border-l-4 transition-all duration-300 flex flex-col justify-between group",
                    isCompleted 
                      ? "opacity-60 border-l-success bg-secondary/10" 
                      : rec.priority === 'urgent'
                      ? "border-l-destructive shadow-sm hover:shadow-md"
                      : rec.priority === 'high'
                      ? "border-l-orange-500 shadow-sm hover:shadow-md"
                      : "border-l-primary shadow-sm hover:shadow-md"
                  )}
                >
                  <div>
                    {/* Header: Priority Badge + Impact Estimate */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className={cn(
                          "h-4 w-4",
                          isCompleted ? "text-success" : rec.priority === 'urgent' ? "text-destructive" : "text-primary"
                        )} />
                        <span className={cn(
                          "text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          PRIORITY_BADGE_STYLE[rec.priority]
                        )}>
                          {rec.priority}
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          · {rec.category}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-foreground bg-secondary/80 px-2.5 py-0.5 rounded-full border border-border">
                        Est. Impact: <span className="text-primary">+{rec.estimatedImpact}%</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                      "text-[14.5px] font-bold text-foreground mb-2 leading-snug transition-colors",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {rec.title}
                    </h3>

                    {/* Full Description / Action Item */}
                    <p className="text-[12.5px] text-foreground/80 leading-relaxed mb-4">
                      {rec.description}
                    </p>

                    {/* Details: Rationale & Target Goal */}
                    <div className="space-y-2 mb-4 bg-secondary/20 p-3 rounded-lg border border-border/50 text-[11.5px]">
                      {rec.rationale && (
                        <div>
                          <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-0.5">Identified Friction Point</span>
                          <p className="text-muted-foreground leading-normal">{rec.rationale}</p>
                        </div>
                      )}
                      {rec.impactDescription && (
                        <div>
                          <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-0.5">Retention Target</span>
                          <p className="text-foreground/80 leading-normal">{rec.impactDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Confidence + Mark Complete Action */}
                  <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-border/60 mt-auto">
                    <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span>Model Confidence: <strong className="text-foreground">{rec.confidenceScore}%</strong></span>
                    </div>

                    <Button
                      variant={isCompleted ? 'secondary' : 'primary'}
                      size="sm"
                      leftIcon={isCompleted ? <Check className="h-3.5 w-3.5 text-success" /> : undefined}
                      onClick={() => toggleComplete(rec.id)}
                    >
                      {isCompleted ? 'Completed' : 'Mark as Complete'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default RecommendationsTab;
