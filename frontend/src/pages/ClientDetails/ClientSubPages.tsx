import * as React from 'react';
import { useParams } from 'react-router-dom';
import { SectionHeader } from '@/components/common/PageHeader';
import { useClient } from '@/hooks/useClients';
import { PageLoader } from '@/components/ui/Loader';
import { KPIAnalyticsTab } from './components/KPIAnalyticsTab';
import { RecommendationsTab } from './components/RecommendationsTab';

// ============================================================
// Client KPI Tab
// ============================================================

export function ClientKPIPage() {
  const { id } = useParams<{ id: string }>();
  const { client, isLoading } = useClient(id ?? '');

  if (isLoading) return <PageLoader label="Loading KPIs…" />;

  return (
    <div className="space-y-6">
      <KPIAnalyticsTab client={client} />
    </div>
  );
}

// ============================================================
// Client Analysis Tab
// ============================================================

export function ClientAnalysisPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <SectionHeader title="AI Risk Analysis" description="Powered by machine learning" className="mb-4" />
        <p className="text-sm text-muted-foreground">Risk analysis module — live in Client Intelligence Workspace.</p>
      </div>
    </div>
  );
}

// ============================================================
// Client History Tab
// ============================================================

export function ClientHistoryPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <SectionHeader title="Historical Data" description="Health score & churn trend over time" className="mb-4" />
        <p className="text-sm text-muted-foreground">Historical data telemetry loaded via vector similarities.</p>
      </div>
    </div>
  );
}

// ============================================================
// Client Recommendations Tab
// ============================================================

export function ClientRecommendationsPage() {
  const { id } = useParams<{ id: string }>();
  const { client, isLoading } = useClient(id ?? '');

  if (isLoading) return <PageLoader label="Loading Recommendations…" />;

  return (
    <div className="space-y-6">
      <RecommendationsTab client={client} />
    </div>
  );
}
