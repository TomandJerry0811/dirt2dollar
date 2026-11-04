// ============================================================
// Application Route Constants
// ============================================================

export const ROUTES = {
  // Top level
  ROOT: '/',
  DASHBOARD: '/',

  // Clients
  CLIENTS: '/clients',
  AI_ANALYSIS: '/ai-analysis',
  AI_USAGE: '/ai-usage',

  // Client detail sub-routes
  CLIENT_DETAIL: '/client/:id',
  CLIENT_KPI: '/client/:id/kpi',
  CLIENT_ANALYSIS: '/client/:id/analysis',
  CLIENT_HISTORY: '/client/:id/history',
  CLIENT_RECOMMENDATIONS: '/client/:id/recommendations',

  // Other modules
  ANALYTICS: '/analytics',
  WORKFLOW: '/workflow',
  ERROR_LOGS: '/error-logs',
  RECOMMENDATIONS: '/recommendations',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USERS: '/users',

  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
} as const;

// Helper to build client route with actual id
export const buildClientRoute = {
  detail: (id: string) => `/client/${id}`,
  kpi: (id: string) => `/client/${id}/kpi`,
  analysis: (id: string) => `/client/${id}/analysis`,
  history: (id: string) => `/client/${id}/history`,
  recommendations: (id: string) => `/client/${id}/recommendations`,
};

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
