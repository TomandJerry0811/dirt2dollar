import * as React from 'react';
import { cn } from '@/utils';
import { useClientStore } from '@/store/client.store';
import { X, Filter } from 'lucide-react';
import type { RiskLevel, ClientStatus } from '@/types';

// ============================================================
// FilterChip
// ============================================================

interface FilterChipProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterChip({ label, value, options, onChange }: FilterChipProps) {
  return (
    <div className="relative group">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none pl-3 pr-8 py-1.5 rounded-full border text-[12.5px] font-medium transition-colors cursor-pointer outline-none',
          value
            ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/15'
            : 'bg-card border-border text-muted-foreground hover:bg-secondary'
        )}
      >
        <option value="" className="bg-card text-foreground">{label}: All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-muted-foreground">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// ClientFilters
// ============================================================

const RISK_OPTIONS = [
  { value: 'critical', label: 'Critical Risk' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'healthy', label: 'Healthy' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'new', label: 'New' },
  { value: 'churned', label: 'Churned' },
];

const INDUSTRY_OPTIONS = [
  { value: 'SaaS', label: 'SaaS' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'E-Commerce', label: 'E-Commerce' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Landscaping', label: 'Landscaping' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Professional Services', label: 'Professional Services' },
];

const CAMPAIGN_OPTIONS = [
  { value: 'Q3 Retention Drive', label: 'Q3 Retention Drive' },
  { value: 'Active Campaign', label: 'Active Campaign' },
  { value: 'Enterprise Renewal', label: 'Enterprise Renewal' },
];

export function ClientFilters() {
  const { filters, updateFilter, resetFilters } = useClientStore();

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.industry ||
    filters.campaign ||
    filters.program ||
    filters.riskLevel ||
    filters.status ||
    filters.accountManager
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 mr-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-[13px] font-medium">Filters:</span>
      </div>

      <FilterChip
        label="Industry"
        value={filters.industry}
        options={INDUSTRY_OPTIONS}
        onChange={(v) => updateFilter('industry', v)}
      />
      <FilterChip
        label="Risk Level"
        value={filters.riskLevel}
        options={RISK_OPTIONS}
        onChange={(v) => updateFilter('riskLevel', v as RiskLevel)}
      />
      <FilterChip
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => updateFilter('status', v as ClientStatus)}
      />
      <FilterChip
        label="Campaign"
        value={filters.campaign}
        options={CAMPAIGN_OPTIONS}
        onChange={(v) => updateFilter('campaign', v)}
      />

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="ml-2 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear All
        </button>
      )}
    </div>
  );
}
