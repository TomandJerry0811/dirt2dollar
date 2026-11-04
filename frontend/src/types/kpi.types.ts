// ============================================================
// KPI Types
// ============================================================

export type KPICategory =
  | 'engagement'
  | 'financial'
  | 'support'
  | 'product'
  | 'relationship'
  | 'risk';

export type KPIStatus = 'improving' | 'declining' | 'stable' | 'critical';

export interface KPIThreshold {
  min?: number;
  max?: number;
  target?: number;
  critical?: number;
  warning?: number;
}

export interface KPI {
  id: string;
  clientId: string;
  name: string;
  category: KPICategory;
  value: number;
  previousValue?: number;
  unit: string;
  formattedValue: string;
  status: KPIStatus;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  threshold?: KPIThreshold;
  description?: string;
  lastUpdated: string;
}

export interface KPIGroup {
  category: KPICategory;
  label: string;
  kpis: KPI[];
  avgScore: number;
}

// ============================================================
// Risk Analysis Types
// ============================================================

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'improving' | 'worsening' | 'stable';
}

export interface RiskAnalysis {
  clientId: string;
  overallScore: number;
  riskLevel: import('./client.types').RiskLevel;
  churnProbability: number;
  confidence: number;
  factors: RiskFactor[];
  primaryDriver: string;
  lastAnalyzedAt: string;
  nextReviewDate: string;
  modelVersion: string;
}

// ============================================================
// Historical Client Types
// ============================================================

export interface HistoricalDataPoint {
  date: string;
  healthScore: number;
  churnProbability: number;
  mrr: number;
  engagementScore?: number;
  supportTickets?: number;
}

export interface HistoricalClient {
  clientId: string;
  clientName: string;
  period: string;
  dataPoints: HistoricalDataPoint[];
  churnEvent?: {
    date: string;
    reason: string;
    lostRevenue: number;
  };
  retentionEvent?: {
    date: string;
    action: string;
    savedRevenue: number;
  };
}
