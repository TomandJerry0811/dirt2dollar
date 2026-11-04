// ============================================================
// Dashboard Feature Types
// ============================================================

import type { RiskLevel, Client } from '@/types';

// ── KPI Metric ──────────────────────────────────────────────

export interface DashboardKPI {
  id: string;
  label: string;
  value: string | number;
  trend: {
    direction: 'up' | 'down' | 'neutral';
    percent: number;
    period: string;
  };
  sparkline?: number[];  // last N values for mini trend
  iconColor: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

// ── AI Summary ───────────────────────────────────────────────

export interface AISummary {
  headline: string;
  body: string;
  confidence: number;
  generatedAt: string;
  flags: string[];
}

// ── Client Health ─────────────────────────────────────────────

export interface ClientHealthBreakdown {
  healthy: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}

// ── Chart Data ────────────────────────────────────────────────

export interface ChurnTrendPoint {
  month: string;
  churnRate: number;
  predicted?: number;
}

export interface RiskDistributionSlice {
  name: string;
  value: number;
  color: string;
}

// ── Activity ──────────────────────────────────────────────────

export type ActivityType =
  | 'client_updated'
  | 'report_generated'
  | 'ai_analysis'
  | 'workflow_executed'
  | 'recommendation_sent'
  | 'alert_triggered';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  client?: string;
  timestamp: string;
  isNew?: boolean;
}

// ── Workflow Pipeline ─────────────────────────────────────────

export type WorkflowStepStatus = 'completed' | 'running' | 'pending' | 'failed';

export interface WorkflowStep {
  id: string;
  name: string;
  status: WorkflowStepStatus;
  duration?: string;
  icon?: string;
}

// ── High-risk client row ──────────────────────────────────────

export interface HighRiskClientRow {
  id: string;
  name: string;
  industry: string;
  healthScore: number;
  churnProbability: number;
  trend: 'up' | 'down' | 'neutral';
  riskLevel: RiskLevel;
  mrr: number;
}

// ── Recommendation ────────────────────────────────────────────

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface DashboardRecommendation {
  id: string;
  title: string;
  description: string;
  client: string;
  priority: RecommendationPriority;
  confidence: number;
  category: string;
}

// ── Quick Action ──────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'default';
  href?: string;
  onClick?: () => void;
}
