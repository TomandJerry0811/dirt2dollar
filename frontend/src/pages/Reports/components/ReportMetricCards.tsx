import * as React from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { FileText, Calendar, Clock, AlertCircle, CalendarDays } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

export function ReportMetricCards() {
  const { stats, isLoadingStats } = useReports();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard 
        title="Total Reports" 
        value={stats?.totalReports ?? '—'} 
        icon={FileText} 
        iconColor="primary" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Generated This Month" 
        value={stats?.generatedThisMonth ?? '—'} 
        icon={Calendar} 
        iconColor="success" 
        isLoading={isLoadingStats}
        trend={{ value: 12, percent: 12, direction: 'up', period: 'vs last month' }}
      />
      <MetricCard 
        title="Scheduled Reports" 
        value={stats?.scheduledReports ?? '—'} 
        icon={CalendarDays} 
        iconColor="warning" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Pending Reports" 
        value={stats?.pendingReports ?? '—'} 
        icon={Clock} 
        iconColor="info" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Failed Reports" 
        value={stats?.failedReports ?? '—'} 
        icon={AlertCircle} 
        iconColor="danger" 
        isLoading={isLoadingStats} 
      />
    </div>
  );
}
