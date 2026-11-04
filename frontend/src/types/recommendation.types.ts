// ============================================================
// Recommendation Types
// ============================================================

export type RecommendationPriority = 'urgent' | 'high' | 'medium' | 'low';
export type RecommendationCategory =
  | 'engagement'
  | 'support'
  | 'upsell'
  | 'retention'
  | 'onboarding'
  | 'product'
  | 'relationship';

export type RecommendationStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'dismissed'
  | 'snoozed';

export interface RecommendationAction {
  id: string;
  label: string;
  description?: string;
  type: 'email' | 'call' | 'meeting' | 'task' | 'workflow' | 'note';
  url?: string;
}

export interface Recommendation {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  description: string;
  rationale: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  estimatedImpact: number;
  impactDescription: string;
  confidenceScore: number;
  actions: RecommendationAction[];
  dueDate?: string;
  snoozedUntil?: string;
  completedAt?: string;
  generatedAt: string;
  aiModel?: string;
}

export interface RecommendationSummary {
  total: number;
  urgent: number;
  completed: number;
  inProgress: number;
  dismissed: number;
  avgImpactScore: number;
}

