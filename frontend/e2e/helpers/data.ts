import type { Client, ClientAnalysisResponse } from '../../src/types/client.types';

export const clients: Client[] = Array.from({ length: 25 }, (_, i) => ({
  id: `test-${i + 1}`,
  name: `Test Client ${String(i + 1).padStart(2, '0')}`,
  industry: i % 2 === 0 ? 'SaaS' : 'FinTech',
  tier: 'growth',
  status: i % 3 === 0 ? 'at-risk' : 'active',
  riskLevel: i % 2 === 0 ? 'high' : 'low',
  churnProbability: i % 2 === 0 ? 75 : 15,
  healthScore: i % 2 === 0 ? 40 : 90,
  mrr: 2000, arr: 24000, contractValue: 24000,
  contractStartDate: '2026-01-01', contractEndDate: '2026-12-31',
  lastActivityDate: '2026-10-01', createdAt: '2026-01-01', updatedAt: '2026-10-01',
  contact: { name: 'Test Contact', email: `contact${i + 1}@example.com`, role: 'Owner', isPrimary: true },
  address: { country: 'India' }, tags: [],
  accountManager: i % 2 === 0 ? 'Test Manager A' : 'Test Manager B',
  campaign: 'Test Campaign', program: 'Test Program', workflowStatus: 'completed',
  metadata: {},
}));

export const query = 'Give me churn analysis for Test Client 01';
export const analysis: ClientAnalysisResponse = {
  status: 'success',
  client: { id: 'test-1', name: 'Test Client 01', program_type: 'Test Program', campaign_status: 'Active' },
  summary: { text: 'Test summary: engagement declined and retention outreach is recommended.', satisfaction_score: 4 },
  kpi: { interpretation: {} },
  historical_context: { historical_matches: [] },
  churn: { probability: 75, risk_level: 'high', analysis: 'Engagement declined.', red_flags: ['Declining engagement'], bottlenecks: [] },
  recommendations: ['Schedule a retention call.'],
};
