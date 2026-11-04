// ============================================================
// Dashboard Types
// ============================================================

export interface MetricTrend {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  period: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  formattedValue: string;
  trend?: MetricTrend;
  description?: string;
  icon?: string;
}

export interface ChurnRiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  healthy: number;
  total: number;
}

export interface RevenueAtRisk {
  amount: number;
  percentage: number;
  clientCount: number;
}

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  churnedClients: number;
  avgHealthScore: number;
  avgChurnProbability: number;
  totalMRR: number;
  totalARR: number;
  mrrGrowth: number;
  healthGrowth: number;
  riskGrowth: number;
  activeGrowth: number;
  recentAlerts: DashboardAlert[];
}

export interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  clientId: string;
  clientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  date?: string;
  [key: string]: string | number | undefined;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChurnTrendDataPoint {
  month: string;
  churnRate: number;
  predicted?: number;
}

export interface TokenBreakdownItem {
  date?: string;
  week?: string;
  month?: string;
  label: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
}

export interface TokenPeriodMetrics {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  periodLabel: string;
  growthPercent: number;
  breakdown: TokenBreakdownItem[];
}

export interface TokenNodeBreakdown {
  nodeName: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
}

export interface TokenClientBreakdown {
  clientName: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  request_count: number;
}

export interface TokenLogItem {
  id: number;
  nodeName: string;
  clientName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  executionId: string;
  createdAt: string;
  timestamp: string;
}

export interface TokenConsumptionData {
  perDay: TokenPeriodMetrics;
  perWeek: TokenPeriodMetrics;
  perMonth: TokenPeriodMetrics;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalRequests: number;
  nodeBreakdown: TokenNodeBreakdown[];
  clientBreakdown: TokenClientBreakdown[];
  recentLogs: TokenLogItem[];
  tableName: string;
}

