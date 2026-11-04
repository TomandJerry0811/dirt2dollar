/// <reference types="vite/client" />

// ============================================================
// API Endpoint Constants
// ============================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Dashboard
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    ALERTS: '/dashboard/alerts',
    RECENT_ACTIVITY: '/dashboard/activity',
    CHURN_RISK_CHART: '/dashboard/churn-risk',
    CHURN_TREND: '/dashboard/churn-trend',
    REVENUE_CHART: '/dashboard/revenue',
    HEALTH_DISTRIBUTION: '/dashboard/health-distribution',
    TOKEN_CONSUMPTION: '/dashboard/token-consumption',
  },

  // Clients
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    DETAIL: (id: string) => `/clients/${id}`,
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
    KPIS: (id: string) => `/clients/${id}/kpis`,
    ANALYSIS: (id: string) => `/clients/${id}/analysis`,
    HISTORY: (id: string) => `/clients/${id}/history`,
    RECOMMENDATIONS: (id: string) => `/clients/${id}/recommendations`,
    HEALTH_SCORE: (id: string) => `/clients/${id}/health-score`,
    RISK_FACTORS: (id: string) => `/clients/${id}/risk-factors`,
    EXPORT: (id: string) => `/clients/${id}/export`,
  },

  // Analytics
  ANALYTICS: {
    CHURN_TRENDS: '/analytics/churn-trends',
    KPI_BENCHMARKS: '/analytics/kpi-benchmarks',
    COHORT_ANALYSIS: '/analytics/cohort',
    SEGMENT_ANALYSIS: '/analytics/segments',
    REVENUE_FORECAST: '/analytics/revenue-forecast',
    RISK_HEATMAP: '/analytics/risk-heatmap',
  },

  // Workflow
  WORKFLOW: {
    LIST: '/workflows',
    CREATE: '/workflows',
    DETAIL: (id: string) => `/workflows/${id}`,
    UPDATE: (id: string) => `/workflows/${id}`,
    DELETE: (id: string) => `/workflows/${id}`,
    EXECUTE: (id: string) => `/workflows/${id}/execute`,
    PAUSE: (id: string) => `/workflows/${id}/pause`,
    RESUME: (id: string) => `/workflows/${id}/resume`,
    EXECUTIONS: (id: string) => `/workflows/${id}/executions`,
    EXECUTION_DETAIL: (workflowId: string, execId: string) =>
      `/workflows/${workflowId}/executions/${execId}`,
    STATS: '/workflows/stats',
    ERRORS: '/workflows/errors',
  },

  // Error Logs
  ERROR_LOGS: {
    LIST: '/error-logs',
    DETAIL: (id: string | number) => `/error-logs/${id}`,
    TEST: '/error-logs/test',
  },

  // Recommendations
  RECOMMENDATIONS: {
    LIST: '/recommendations',
    DETAIL: (id: string) => `/recommendations/${id}`,
    UPDATE_STATUS: (id: string) => `/recommendations/${id}/status`,
    DISMISS: (id: string) => `/recommendations/${id}/dismiss`,
    COMPLETE: (id: string) => `/recommendations/${id}/complete`,
    GENERATE: '/recommendations/generate',
  },

  // Reports
  REPORTS: {
    LIST: '/reports',
    CREATE: '/reports',
    DETAIL: (id: string) => `/reports/${id}`,
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
    DELETE: (id: string) => `/reports/${id}`,
    SCHEDULE: (id: string) => `/reports/${id}/schedule`,
  },

  // Settings
  SETTINGS: {
    USER: '/settings/user',
    APP: '/settings/app',
    NOTIFICATIONS: '/settings/notifications',
    INTEGRATIONS: '/settings/integrations',
  },

  // AI
  AI: {
    CHAT: '/ai/chat',
    INSIGHTS: '/ai/insights',
    SUMMARY: (clientId: string) => `/ai/summary/${clientId}`,
    PREDICT: '/ai/predict',
  },
} as const;
