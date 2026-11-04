import * as React from 'react';
import { Search, Filter, RotateCw, X, AlertTriangle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedWorkflow: string;
  onWorkflowChange: (value: string) => void;
  selectedNode: string;
  onNodeChange: (value: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  onTriggerTest: () => void;
  isRefreshing: boolean;
  isTriggering: boolean;
  availableWorkflows: string[];
  availableNodes: string[];
}

export function ErrorFilters({
  search,
  onSearchChange,
  selectedWorkflow,
  onWorkflowChange,
  selectedNode,
  onNodeChange,
  onReset,
  onRefresh,
  onTriggerTest,
  isRefreshing,
  isTriggering,
  availableWorkflows,
  availableNodes,
}: ErrorFiltersProps) {
  const hasActiveFilters = Boolean(
    search.trim() || selectedWorkflow !== 'all' || selectedNode !== 'all'
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search errors, failed steps, messages..."
          className="w-full h-9 rounded-lg bg-secondary/50 border border-border pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Workflow Dropdown */}
        <div className="relative">
          <select
            value={selectedWorkflow}
            onChange={(e) => onWorkflowChange(e.target.value)}
            className="h-9 rounded-lg bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none pr-8"
          >
            <option value="all">All Workflows</option>
            {availableWorkflows.map((wf) => (
              <option key={wf} value={wf}>
                {wf}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        {/* Step Dropdown */}
        <div className="relative">
          <select
            value={selectedNode}
            onChange={(e) => onNodeChange(e.target.value)}
            className="h-9 rounded-lg bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer appearance-none pr-8 max-w-[200px] truncate"
          >
            <option value="all">All Steps</option>
            {availableNodes.map((node) => (
              <option key={node} value={node}>
                Step: {node}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 text-xs gap-1.5"
          title="Refresh error logs from Supabase"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>

        {/* Test Simulate Error button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onTriggerTest}
          disabled={isTriggering}
          className="h-9 text-xs gap-1.5 border border-destructive/20 text-destructive hover:bg-destructive/10"
          title="Simulate a test workflow error and persist it to Supabase"
        >
          <Bug className="h-3.5 w-3.5" />
          <span>{isTriggering ? 'Simulating...' : 'Simulate Error'}</span>
        </Button>
      </div>
    </div>
  );
}

export default ErrorFilters;
