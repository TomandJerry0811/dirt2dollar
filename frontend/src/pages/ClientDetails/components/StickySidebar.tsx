import * as React from 'react';
import { Shield, Brain, Activity, Target, Workflow, History, Sparkles } from 'lucide-react';
import { useClientDetailsStore, type DetailsTab } from '@/store/client-details.store';
import { cn } from '@/utils';
import { HealthScore, RiskBadge, WorkflowBadge } from '@/pages/Clients/components/ClientTableBlocks';
import type { Client } from '@/types';
import { Button } from '@/components/ui/Button';

// ============================================================
// StickySidebar
// ============================================================

const TABS: { id: DetailsTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',        label: 'Overview',              icon: Target },
  { id: 'analytics',       label: 'KPI Analytics',         icon: Activity },
  { id: 'analysis',        label: 'AI Analysis',           icon: Brain },
  { id: 'similarity',      label: 'Historical Similarity', icon: History },
  { id: 'recommendations', label: 'Recommendations',       icon: Sparkles },
  { id: 'workflow',        label: 'Workflow Pipeline',     icon: Workflow },
  { id: 'activity',        label: 'Activity Timeline',     icon: Shield },
];

export function StickySidebar({ client }: { client: Client }) {
  const { activeTab, setActiveTab } = useClientDetailsStore();

  return (
    <aside className="w-full xl:w-64 flex-shrink-0 flex flex-col gap-4">
      {/* Tab Navigation */}
      <nav className="section-card p-2 flex flex-row xl:flex-col gap-1 overflow-x-auto xl:overflow-visible">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap xl:whitespace-normal',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Persistent Status Panel (Hidden on Mobile) */}
      <div className="hidden xl:flex section-card p-4 flex-col gap-4">
        <h3 className="text-[12.5px] font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          Live Status
        </h3>
        
        <div className="flex flex-col gap-1">
          <span className="text-[11.5px] text-muted-foreground font-medium">Health</span>
          <HealthScore score={client.healthScore} />
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[11.5px] text-muted-foreground font-medium">AI Churn Risk</span>
          <RiskBadge level={client.riskLevel} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11.5px] text-muted-foreground font-medium">Active Workflow</span>
          <WorkflowBadge status={client.workflowStatus} />
        </div>

        <div className="pt-2">
          <Button variant="primary" size="sm" className="w-full">
            Generate Brief
          </Button>
        </div>
      </div>
    </aside>
  );
}
