import type {
  KPI,
  Recommendation,
  HistoricalSimilarClient,
  RiskFactor,
  KeyInsight,
  TrendInterpretation,
  ClientTimelineEvent
} from '@/types';

// ============================================================
// Client Details Seed Data — Placeholder for UI dev
// ============================================================

export const SEED_KPIS: (KPI & { history: any[] })[] = [
  { id: 'k1', clientId: 'c-101', name: 'Product Adoption', category: 'product', value: 85, formattedValue: '85%', unit: '%', trend: 5, trendDirection: 'up', status: 'improving', lastUpdated: '2024-08-01', history: [{ date: 'Jan', value: 75 }, { date: 'Feb', value: 80 }, { date: 'Mar', value: 85 }] },
  { id: 'k2', clientId: 'c-101', name: 'Support Tickets', category: 'support', value: 12, formattedValue: '12', unit: 'open', trend: -3, trendDirection: 'down', status: 'improving', lastUpdated: '2024-08-01', history: [{ date: 'Jan', value: 20 }, { date: 'Feb', value: 15 }, { date: 'Mar', value: 12 }] },
  { id: 'k3', clientId: 'c-101', name: 'Executive Engagement', category: 'engagement', value: 45, formattedValue: '45/100', unit: '/100', trend: 15, trendDirection: 'down', status: 'declining', lastUpdated: '2024-08-01', history: [{ date: 'Jan', value: 65 }, { date: 'Feb', value: 50 }, { date: 'Mar', value: 45 }] },
  { id: 'k4', clientId: 'c-101', name: 'License Utilization', category: 'product', value: 92, formattedValue: '92%', unit: '%', trend: 2, trendDirection: 'up', status: 'improving', lastUpdated: '2024-08-01', history: [{ date: 'Jan', value: 88 }, { date: 'Feb', value: 90 }, { date: 'Mar', value: 92 }] },
];

export const SEED_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    clientId: 'c-101',
    title: 'Schedule Executive Business Review',
    priority: 'urgent',
    description: 'Schedule a sync with the exec sponsor.',
    rationale: 'Executive engagement has dropped 15% in the last quarter.',
    impactDescription: 'Re-align on strategic goals and demonstrate ROI.',
    category: 'relationship',
    status: 'pending',
    estimatedImpact: 85,
    confidenceScore: 90,
    actions: [],
    generatedAt: '2024-08-01T10:00:00Z',
  },
  {
    id: 'r2',
    clientId: 'c-101',
    title: 'Offer Advanced Training for New Module',
    priority: 'high',
    description: 'Provide training to increase adoption.',
    rationale: 'Adoption for the new Analytics module is stalled at 20%.',
    impactDescription: 'Increase stickiness and user value realization.',
    category: 'product',
    status: 'pending',
    estimatedImpact: 72,
    confidenceScore: 88,
    actions: [],
    generatedAt: '2024-08-03T14:30:00Z',
  },
  {
    id: 'r3',
    clientId: 'c-101',
    title: 'Send KPI Performance Report',
    priority: 'medium',
    description: 'Send a report of current metrics.',
    rationale: 'Client requested monthly update.',
    impactDescription: 'Maintain transparency.',
    category: 'relationship',
    status: 'completed',
    completedAt: '2024-08-04T10:00:00Z',
    estimatedImpact: 95,
    confidenceScore: 99,
    actions: [],
    generatedAt: '2024-07-28T09:00:00Z',
  },
];

export const SEED_HISTORICAL_CLIENTS: HistoricalSimilarClient[] = [
  { id: 'hc1', name: 'Vanguard Tech', industry: 'SaaS', similarityScore: 92, outcome: 'churned', healthAtTime: 30, reasonForChurn: 'Lack of perceived ROI after 12 months. Executive sponsor left.', lessonsLearned: 'Ensure multi-threading of executive relationships.' },
  { id: 'hc2', name: 'DataFlow Inc', industry: 'SaaS', similarityScore: 88, outcome: 'retained', healthAtTime: 35, lessonsLearned: 'Intervened early with an on-site workshop which realigned goals.' },
  { id: 'hc3', name: 'CloudScale', industry: 'Cloud Infrastructure', similarityScore: 76, outcome: 'churned', healthAtTime: 42, reasonForChurn: 'Competitor undercut pricing during renewal.', lessonsLearned: 'Lock in multi-year contracts earlier.' },
];

export const SEED_RISK_FACTORS: RiskFactor[] = [
  { id: 'rf1', name: 'Executive Sponsor Departure', impact: 'high', weight: 45, score: 90, trend: 'worsening', description: 'The primary champion left the company 2 weeks ago.' },
  { id: 'rf2', name: 'Declining Login Frequency', impact: 'high', weight: 30, score: 70, trend: 'worsening', description: 'Daily active users dropped by 22% this month.' },
  { id: 'rf3', name: 'Open Support Escalation', impact: 'medium', weight: 15, score: 50, trend: 'stable', description: 'A Sev-1 ticket has been open for 4 days.' },
  { id: 'rf4', name: 'Upcoming Renewal', impact: 'medium', weight: 10, score: 30, trend: 'stable', description: 'Contract expires in 90 days.' },
];

export const SEED_INSIGHTS: KeyInsight[] = [
  { id: 'i1', type: 'negative', title: 'Engagement Drop', description: 'C-level engagement down 15% WoW.' },
  { id: 'i2', type: 'positive', title: 'High Utilization', description: 'Core product usage remains very high (92%).' },
  { id: 'i3', type: 'neutral', title: 'Support Volume Steady', description: 'Ticket volume is flat month over month.' },
];

export const SEED_TREND: TrendInterpretation = {
  detectedTrend: 'Diverging Usage and Sentiment',
  confidence: 88,
  businessInterpretation: 'While frontline users are highly active in the tool, executive buyers are disengaging, which historically precedes a budget-driven churn event.',
  possibleCauses: ['Lack of executive reporting', 'Champion departure', 'Perceived lack of ROI at the macro level'],
  historicalComparison: 'Matches the pattern seen in Vanguard Tech (churned Q1 2023).',
};

export const SEED_TIMELINE: ClientTimelineEvent[] = [
  { id: 't1', title: 'Workflow Executed: Churn Analysis', description: 'System ran the nightly AI analysis.', date: '2024-08-05T02:00:00Z', type: 'workflow' },
  { id: 't2', title: 'Recommendation Generated', description: 'AI suggested "Schedule Executive Business Review".', date: '2024-08-05T02:05:00Z', type: 'recommendation' },
  { id: 't3', title: 'KPI Updated', description: 'Support tickets metric dropped to 12.', date: '2024-08-04T10:00:00Z', type: 'kpi' },
  { id: 't4', title: 'Q3 Retention Campaign Started', description: 'Client added to marketing retention drip.', date: '2024-07-15T09:00:00Z', type: 'campaign', author: 'Marketing Team' },
  { id: 't5', title: 'Client Onboarded', description: 'Account created and initial setup complete.', date: '2023-01-10T14:00:00Z', type: 'creation', author: 'System' },
];
