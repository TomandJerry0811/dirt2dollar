import { useDashboard } from './useDashboard';

export function useAnalytics() {
  const { metrics, churnRiskChart, revenueChart, healthDistribution, isLoading, isError, errorMessage, refetch } = useDashboard();

  return {
    metrics,
    churnRiskChart,
    revenueChart,
    healthDistribution,
    isLoading,
    isError,
    errorMessage,
    refetch,
  };
}