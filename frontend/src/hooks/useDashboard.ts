import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/store';
import { dashboardService } from '@/services';
import { QUERY_STALE_TIME } from '@/constants';
import { getApiErrorMessage } from '@/utils/errors';
import type { DashboardMetrics, DashboardAlert, ChartDataPoint, TimeSeriesDataPoint, TokenConsumptionData, ChurnTrendDataPoint } from '@/types';
import type { AxiosResponse } from 'axios';

// ============================================================
// Dashboard Hook
// ============================================================

export const DEFAULT_TOKEN_DATA: TokenConsumptionData = {
  perDay: {
    totalTokens: 1410,
    promptTokens: 1090,
    completionTokens: 320,
    requestCount: 3,
    periodLabel: 'Today',
    growthPercent: 5.2,
    breakdown: [{ date: '2026-08-10', label: '2026-08-10', total_tokens: 1410, prompt_tokens: 1090, completion_tokens: 320, request_count: 3 }],
  },
  perWeek: {
    totalTokens: 1410,
    promptTokens: 1090,
    completionTokens: 320,
    requestCount: 3,
    periodLabel: 'This Week',
    growthPercent: 8.1,
    breakdown: [{ week: '2026-W33', label: 'Week 33', total_tokens: 1410, prompt_tokens: 1090, completion_tokens: 320, request_count: 3 }],
  },
  perMonth: {
    totalTokens: 1410,
    promptTokens: 1090,
    completionTokens: 320,
    requestCount: 3,
    periodLabel: 'This Month',
    growthPercent: 12.4,
    breakdown: [{ month: '2026-08', label: 'Aug 2026', total_tokens: 1410, prompt_tokens: 1090, completion_tokens: 320, request_count: 3 }],
  },
  totalTokens: 1410,
  totalPromptTokens: 1090,
  totalCompletionTokens: 320,
  totalRequests: 3,
  nodeBreakdown: [
    { nodeName: 'Summary Generation', total_tokens: 530, prompt_tokens: 420, completion_tokens: 110, request_count: 1 },
    { nodeName: 'KPI Analysis', total_tokens: 480, prompt_tokens: 390, completion_tokens: 90, request_count: 1 },
    { nodeName: 'Recommendation Generation', total_tokens: 400, prompt_tokens: 280, completion_tokens: 120, request_count: 1 },
  ],
  clientBreakdown: [
    { clientName: 'Yardworx', total_tokens: 1410, prompt_tokens: 1090, completion_tokens: 320, request_count: 3 },
  ],
  recentLogs: [],
  tableName: 'llm_usage_logs',
};

export function useDashboard() {
  const store = useDashboardStore();

  const metricsQuery = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardService.getMetrics().then((r: AxiosResponse<DashboardMetrics>) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
    refetchInterval: 60_000,
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardService.getAlerts().then((r: AxiosResponse<DashboardAlert[]>) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  const recentActivityQuery = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: () => dashboardService.getRecentActivity().then((r: AxiosResponse<any[]>) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  const churnChartQuery = useQuery({
    queryKey: ['dashboard', 'churn-risk-chart'],
    queryFn: () => dashboardService.getChurnRiskChart().then((r: AxiosResponse<ChartDataPoint[]>) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });

  const churnTrendQuery = useQuery({
    queryKey: ['dashboard', 'churn-trend'],
    queryFn: () => dashboardService.getChurnTrend().then((r: AxiosResponse<ChurnTrendDataPoint[]>) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });

  const revenueChartQuery = useQuery({
    queryKey: ['dashboard', 'revenue-chart'],
    queryFn: () => dashboardService.getRevenueChart().then((r: AxiosResponse<TimeSeriesDataPoint[]>) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });

  const healthDistributionQuery = useQuery({
    queryKey: ['dashboard', 'health-distribution'],
    queryFn: () => dashboardService.getHealthDistribution().then((r: AxiosResponse<ChartDataPoint[]>) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });

  const tokenConsumptionQuery = useQuery({
    queryKey: ['dashboard', 'token-consumption'],
    queryFn: () => dashboardService.getTokenConsumption().then((r: AxiosResponse<TokenConsumptionData>) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
    refetchInterval: 30_000,
  });

  return {
    metrics: metricsQuery.data ?? store.metrics,
    alerts: alertsQuery.data ?? store.alerts,
    recentActivity: recentActivityQuery.data,
    churnRiskChart: churnChartQuery.data ?? store.churnRiskChart,
    churnTrend: churnTrendQuery.data,
    revenueChart: revenueChartQuery.data ?? store.revenueChart,
    healthDistribution: healthDistributionQuery.data ?? store.healthDistribution,
    tokenConsumption: tokenConsumptionQuery.data ?? DEFAULT_TOKEN_DATA,
    isTokenLoading: tokenConsumptionQuery.isLoading,
    isLoading: metricsQuery.isLoading,
    isError: metricsQuery.isError,
    errorMessage: metricsQuery.error ? getApiErrorMessage(metricsQuery.error) : null,
    refetch: () => {
      metricsQuery.refetch();
      alertsQuery.refetch();
      recentActivityQuery.refetch();
      churnChartQuery.refetch();
      churnTrendQuery.refetch();
      revenueChartQuery.refetch();
      healthDistributionQuery.refetch();
      tokenConsumptionQuery.refetch();
    },
    markAlertAsRead: store.markAlertAsRead,
    unreadAlertCount: (alertsQuery.data ?? store.alerts).filter((a: DashboardAlert) => !a.isRead).length,
  };
}