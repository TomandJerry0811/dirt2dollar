import * as React from 'react';
import { ContentWrapper } from '@/components/common/PageHeader';
import { PageHeader, SectionHeader } from '@/components/common/PageHeader';
import { SectionCard, MetricCard } from '@/components/common/MetricCard';
import { ErrorState } from '@/components/common/EmptyState';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingDown, Users, DollarSign, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export function AnalyticsPage() {
  const { metrics, churnRiskChart, revenueChart, healthDistribution, isLoading, isError, errorMessage, refetch } = useAnalytics();

  if (isError && !isLoading) {
    return (
      <ContentWrapper className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Couldn't load analytics"
          description={errorMessage ?? 'Something went wrong while fetching your analytics data.'}
          onRetry={refetch}
        />
      </ContentWrapper>
    );
  }

  // Mapped Values
  const avgChurn = metrics?.avgChurnProbability ?? 0;
  const atRiskMRR = (Number(metrics?.atRiskClients) || 0) * 10000;
  const growth = metrics?.activeGrowth ?? 0;
  const avgHealth = metrics?.avgHealthScore ?? 0;

  return (
    <ContentWrapper>
      <PageHeader
        title="Portfolio Analytics"
        description="Deep-dive analytics across churn trends, revenue projections, and client health distributions."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Avg Churn Risk" 
          value={isLoading ? "—" : `${avgChurn}%`} 
          description="Average client risk" 
          icon={TrendingDown} 
          iconColor="danger" 
          isLoading={isLoading} 
        />
        <MetricCard 
          title="At-Risk Revenue (MRR)" 
          value={isLoading ? "—" : `$${atRiskMRR.toLocaleString()}`} 
          description="Accounts with high churn risk" 
          icon={DollarSign} 
          iconColor="warning" 
          isLoading={isLoading} 
        />
        <MetricCard 
          title="Active Growth" 
          value={isLoading ? "—" : `+${growth}%`} 
          description="Month-over-month growth" 
          icon={Users} 
          iconColor="success" 
          isLoading={isLoading} 
        />
        <MetricCard 
          title="Avg Health Score" 
          value={isLoading ? "—" : `${avgHealth}/100`} 
          description="Overall portfolio health" 
          icon={Activity} 
          iconColor="info" 
          isLoading={isLoading} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Revenue Forecast Area Chart */}
        <SectionCard>
          <SectionHeader title="Revenue Trend" description="12-Month MRR projections based on contract lifecycle" />
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" name="MRR" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Churn Risk Bar Chart */}
        <SectionCard>
          <SectionHeader title="Churn Risk Distribution" description="Client distribution by risk category" />
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churnRiskChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" name="Clients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

      </div>
    </ContentWrapper>
  );
}

export default AnalyticsPage;