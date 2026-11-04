import * as React from 'react';
import { ArrowLeft, Sparkles, Download, RefreshCw, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RiskBadge, HealthScore } from '@/pages/Clients/components/ClientTableBlocks';
import type { Client } from '@/types';

// ============================================================
// ClientHero
// ============================================================

export function ClientHero({ client }: { client: Client }) {
  return (
    <div className="section-card p-6 bg-card border-b border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
      
      {/* Decorative gradient background (Enterprise touch) */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-primary/[0.03] to-transparent pointer-events-none" />

      {/* Left: Info */}
      <div className="flex items-start gap-4">
        <Link to="/clients" className="mt-2 text-muted-foreground hover:text-foreground transition-colors mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar name={client.name} size="xl" className="rounded-xl shadow-sm border border-border bg-card text-lg" />
        
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{client.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full border border-border bg-secondary text-[11.5px] font-medium text-muted-foreground">
              {client.status.toUpperCase()}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Industry</span>
              <span className="text-[13px] font-medium text-foreground">{client.industry}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Campaign</span>
              <span className="text-[13px] font-medium text-foreground">{client.campaign || 'None'}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Owner</span>
              <span className="text-[13px] font-medium text-foreground">{client.accountManager || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: AI & Health Snapshot */}
      <div className="flex items-center gap-8 px-6 border-l border-r border-border/50">
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">Health Score</span>
          <HealthScore score={client.healthScore} />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">AI Risk</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[18px] font-bold text-foreground leading-none">{client.churnProbability}%</span>
            <RiskBadge level={client.riskLevel} />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col gap-2 min-w-[200px] z-10">
        <Button variant="primary" className="w-full justify-between" leftIcon={<Sparkles className="h-4 w-4" />} rightIcon={<ChevronDown className="h-4 w-4 opacity-50" />}>
          Run AI Analysis
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="w-full" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export
          </Button>
        </div>
        <p className="text-[10.5px] text-muted-foreground text-center mt-1">
          Last analysis: 2 hrs ago
        </p>
      </div>

    </div>
  );
}
