import * as React from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { Activity, CheckCircle, Clock, GitBranch, XCircle } from 'lucide-react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';

export function WorkflowMetricCards() {
  const { stats, isLoadingStats } = useWorkflowMonitor();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard 
        title="Total Executions" 
        value={stats?.total ?? '—'} 
        icon={GitBranch} 
        iconColor="primary" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Successful" 
        value={stats?.successRatePercent ? `${stats.successRatePercent}%` : '—'} 
        icon={CheckCircle} 
        iconColor="success" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Running Active" 
        value={stats?.active ?? '—'} 
        icon={Activity} 
        iconColor="info" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Failed" 
        value={stats?.failed ?? '—'} 
        icon={XCircle} 
        iconColor="danger" 
        isLoading={isLoadingStats} 
      />
      <MetricCard 
        title="Avg Execution Time" 
        value={stats?.averageExecutionTime ? `${stats.averageExecutionTime}s` : '—'} 
        icon={Clock} 
        iconColor="warning" 
        isLoading={isLoadingStats} 
        trend={{ value: -2.4, percent: -2.4, direction: 'down', period: 'vs last week' }}
      />
    </div>
  );
}
