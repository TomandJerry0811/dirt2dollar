import apiClient from './api/axios.instance';
import { API_ENDPOINTS } from '@/constants';

// ============================================================
// Analytics Service
// ============================================================

export const analyticsService = {
  getChurnTrends: (params?: Record<string, unknown>) =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.CHURN_TRENDS, { params }),

  getKPIBenchmarks: (clientId?: string) =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.KPI_BENCHMARKS, { params: { clientId } }),

  getCohortAnalysis: (params?: Record<string, unknown>) =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.COHORT_ANALYSIS, { params }),

  getSegmentAnalysis: () =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.SEGMENT_ANALYSIS),

  getRevenueForecast: (months?: number) =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.REVENUE_FORECAST, { params: { months } }),

  getRiskHeatmap: () =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.RISK_HEATMAP),
};
