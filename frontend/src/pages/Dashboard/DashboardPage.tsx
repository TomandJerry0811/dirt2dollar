import * as React from 'react';
import { motion } from 'framer-motion';
import { ContentWrapper } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/EmptyState';

// ── Dashboard feature components ──────────────────────────────
import { DashboardHeader }         from './components/DashboardHeader';
import { QuickActionBar }          from './components/QuickActionBar';
import { KPISection }              from './components/KPISection';
import { ClientHealthOverview }    from './components/ClientHealthOverview';
import { RiskDistributionChart, ChurnTrendChart } from './components/DashboardCharts';
import { HighRiskClientsTable }    from './components/HighRiskClientsTable';
import { RecentActivityTimeline }  from './components/RecentActivityTimeline';
import { WorkflowStatusCard }      from './components/WorkflowStatusCard';
import { RecentRecommendations }   from './components/RecentRecommendations';
import { useDashboard }            from '@/hooks/useDashboard';
import { useRecommendations }      from '@/hooks/useRecommendations';
import { useClients }              from '@/hooks/useClients';

const RISK_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#3B82F6',
  Healthy: '#10B981',
};

export function DashboardPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const {
    metrics,
    churnRiskChart,
    churnTrend,
    revenueChart,
    healthDistribution,
    recentActivity,
    isLoading,
    isError,
    errorMessage,
    refetch: refetchDashboard,
  } = useDashboard();

  const {
    recommendations,
    isLoading: isRecsLoading,
    refetch: refetchRecs,
  } = useRecommendations();

  const {
    clients,
    refetch: refetchClients,
  } = useClients();

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
    refetchDashboard();
    refetchRecs();
    refetchClients();
  }, [refetchDashboard, refetchRecs, refetchClients]);

  // Create KPI array mapped dynamically from metrics
  const kpiData = React.useMemo(() => {
    if (!metrics) return undefined;
    return [
      {
        id: 'total_clients',
        label: 'Total Clients',
        value: metrics.totalClients,
        trend: {
          direction: 'neutral' as const,
          percent: 0,
          period: 'current',
        },
        iconColor: 'primary' as const,
      },
      {
        id: 'active_clients',
        label: 'Active Clients',
        value: metrics.activeClients,
        trend: {
          direction: metrics.activeGrowth >= 0 ? ('up' as const) : ('down' as const),
          percent: Math.abs(metrics.activeGrowth),
          period: 'vs previous period',
        },
        iconColor: 'success' as const,
      },
      {
        id: 'at_risk_clients',
        label: 'At Risk Clients',
        value: metrics.atRiskClients,
        trend: {
          direction: metrics.riskGrowth >= 0 ? ('up' as const) : ('down' as const),
          percent: Math.abs(metrics.riskGrowth),
          period: 'vs previous period',
        },
        iconColor: 'warning' as const,
      },
      {
        id: 'churn_probability',
        label: 'Avg Churn Probability',
        value: `${metrics.avgChurnProbability}%`,
        trend: {
          direction: 'neutral' as const,
          percent: 0,
          period: 'current',
        },
        iconColor: 'danger' as const,
      },
      {
        id: 'health_score',
        label: 'Avg Health Score',
        value: metrics.avgHealthScore,
        trend: {
          direction: metrics.healthGrowth >= 0 ? ('up' as const) : ('down' as const),
          percent: Math.abs(metrics.healthGrowth),
          period: 'vs previous period',
        },
        iconColor: 'info' as const,
      },
      {
        id: 'total_mrr',
        label: 'Total MRR',
        value: `₹${metrics.totalMRR.toLocaleString('en-IN')}`,
        trend: {
          direction: metrics.mrrGrowth >= 0 ? ('up' as const) : ('down' as const),
          percent: Math.abs(metrics.mrrGrowth),
          period: 'vs previous period',
        },
        iconColor: 'primary' as const,
      },
    ];
  }, [metrics]);

  // Dynamic Health Breakdown
  const healthBreakdown = React.useMemo(() => {
    if (!healthDistribution || healthDistribution.length === 0) return undefined;
    const getName = (p: any) => p.name ?? p.label;
    return {
      healthy:
        (healthDistribution.find((p) => getName(p) === '90-100')?.value ?? 0) +
        (healthDistribution.find((p) => getName(p) === '70-89')?.value ?? 0),
      medium: healthDistribution.find((p) => getName(p) === '50-69')?.value ?? 0,
      high: healthDistribution.find((p) => getName(p) === '30-49')?.value ?? 0,
      critical: healthDistribution.find((p) => getName(p) === '0-29')?.value ?? 0,
      total: healthDistribution.reduce((sum, p) => sum + p.value, 0),
    };
  }, [healthDistribution]);

  // Dynamic Churn Risk Distribution (Pie Chart)
  const riskDistribution = React.useMemo(() => {
    if (!churnRiskChart || churnRiskChart.length === 0) return undefined;
    return churnRiskChart.map((point) => {
      const name = (point.name ?? point.label ?? 'Other') as string;
      return {
        name,
        value: point.value,
        color: RISK_COLORS[name] ?? '#64748B',
      };
    });
  }, [churnRiskChart]);

  // Dynamic Monthly Churn Trend (Area Chart)
  const churnTrendData = React.useMemo(() => {
    if (!churnTrend || churnTrend.length === 0) return undefined;
    return churnTrend.map((point) => ({
      month: point.month,
      churnRate: point.churnRate,
      predicted: point.predicted,
    }));
  }, [churnTrend]);

  // Dynamic Recommendations
  const dashboardRecommendations = React.useMemo(() => {
    if (!recommendations || recommendations.length === 0) return undefined;

    return recommendations.map((rec: any) => {
      const rawPriority = (rec.priority || 'medium').toLowerCase();
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      if (rawPriority === 'urgent' || rawPriority === 'critical') priority = 'critical';
      else if (rawPriority === 'high') priority = 'high';
      else if (rawPriority === 'low') priority = 'low';

      let confidence = 0.85;
      if (typeof rec.confidenceScore === 'number') {
        confidence = rec.confidenceScore > 1 ? rec.confidenceScore / 100 : rec.confidenceScore;
      } else if (typeof rec.confidence === 'number') {
        confidence = rec.confidence > 1 ? rec.confidence / 100 : rec.confidence;
      }

      const category = rec.category
        ? rec.category.charAt(0).toUpperCase() + rec.category.slice(1)
        : 'Retention';

      return {
        id: String(rec.id),
        title: rec.title,
        description: rec.description,
        client: rec.clientName || rec.client || 'Client Account',
        priority,
        confidence,
        category,
      };
    });
  }, [recommendations]);

  // Dynamic High Risk Clients
  const highRiskClients = React.useMemo(() => {
    if (!clients || clients.length === 0) return undefined;
    return clients
      .filter((c: any) => {
        const riskLevel = String(c.riskLevel ?? c.risk_level ?? '').toLowerCase();
        return riskLevel === 'critical' || riskLevel === 'high';
      })
      .sort((a: any, b: any) => (b.churnProbability ?? 0) - (a.churnProbability ?? 0))
      .slice(0, 5)
      .map((c: any) => ({
        id: String(c.id),
        name: c.name,
        industry: c.industry || 'General',
        healthScore: c.healthScore ?? 50,
        churnProbability: c.churnProbability ?? 50,
        trend: (c.churnProbability > 50 ? 'down' : 'up') as 'down' | 'up' | 'neutral',
        riskLevel: c.riskLevel,
        mrr: c.mrr ?? 0,
      }));
  }, [clients]);

  // Dynamic Recent Activity
  const dynamicActivity = React.useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) return undefined;
    return recentActivity.map((act: any) => ({
      id: String(act.id),
      type: (act.type === 'workflow' ? 'workflow_executed' : act.type) as any,
      title: act.title,
      description: act.description,
      client: act.client || act.author,
      timestamp: act.timestamp
        ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recently',
      isNew: true,
    }));
  }, [recentActivity]);

  if (isLoading) {
    return (
      <ContentWrapper>
        <div role="status" aria-label="Loading dashboard" className="section-card p-8">
          Loading dashboard…
        </div>
      </ContentWrapper>
    );
  }

  if (isError && !isLoading) {
    return (
      <ContentWrapper className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Couldn't load your dashboard"
          description={errorMessage ?? 'Something went wrong while fetching your metrics.'}
          onRetry={handleRefresh}
        />
      </ContentWrapper>
    );
  }

  if (metrics?.totalClients === 0) {
    return (
      <ContentWrapper className="space-y-5">
        <h1 className="text-heading-2">No client data yet</h1>
        <p className="text-muted-foreground">Add client data to see portfolio insights.</p>
        <section aria-label="Key Performance Indicators">
          <KPISection kpis={kpiData} />
        </section>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="space-y-5">
      {/* ── 1. Welcome Banner ── */}
      <DashboardHeader
        userName="Alex Johnson"
        userRole="Admin"
        company="Customer Churn Predictor"
        systemStatus="operational"
      />

      {/* ── 2. Quick Actions ── */}
      <QuickActionBar onRefresh={handleRefresh} />

      {/* ── 3. KPI Cards ── */}
      <section aria-label="Key Performance Indicators">
        <KPISection kpis={kpiData} />
      </section>

      {/* ── 4. Health + Distribution (2-col) ── */}
      <section
        aria-label="Client Health and Risk Distribution"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <ClientHealthOverview health={healthBreakdown} className="lg:col-span-2" />
        <RiskDistributionChart data={riskDistribution} />
      </section>

      {/* ── 5. Churn Trend Chart ── */}
      <section aria-label="Monthly Churn Trend">
        <ChurnTrendChart data={churnTrendData} />
      </section>

      {/* ── 6. High Risk Table ── */}
      <section aria-label="High Risk Clients">
        <HighRiskClientsTable clients={highRiskClients} />
      </section>

      {/* ── 7. Activity + Workflow (2-col) ── */}
      <section
        aria-label="Activity and Workflow"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <RecentActivityTimeline items={dynamicActivity} className="lg:col-span-2" />
        <WorkflowStatusCard />
      </section>

      {/* ── 8. Recent Recommendations ── */}
      <section aria-label="Recent Recommendations">
        <RecentRecommendations items={dashboardRecommendations} isLoading={isRecsLoading} />
      </section>

      {/* ── 9. Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between py-4 border-t border-border"
      >
        <p className="text-[11.5px] text-muted-foreground">
          © 2025 Customer Churn Predictor · All rights reserved
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">Support</a>
        </div>
      </motion.footer>

    </ContentWrapper>
  );
}

export default DashboardPage;