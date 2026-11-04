import type { Client } from '@/types';

// ============================================================
// Clients Seed Data — Exclusively Yardworx Land Management
// ============================================================

export const SEED_CLIENTS: Client[] = [
  {
    id: 'yardworx',
    name: 'Yardworx Land Management',
    industry: 'Landscaping',
    tier: 'growth',
    status: 'at-risk',
    riskLevel: 'critical',
    churnProbability: 80,
    healthScore: 20,
    mrr: 12000,
    arr: 144000,
    contractValue: 144000,
    contractStartDate: '2024-01-01T00:00:00Z',
    contractEndDate: '2025-01-01T23:59:59Z',
    lastActivityDate: '2026-08-21T18:24:25Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-21T18:24:25Z',
    contact: {
      name: 'Primary Lead',
      email: 'contact@yardworx.com',
      role: 'Operations Manager',
      isPrimary: true,
    },
    address: { country: 'USA', city: 'Dallas', state: 'TX' },
    tags: ['Active Campaign', 'Landscaping'],
    accountManager: 'Sarah Jenkins',
    campaign: 'Q3 Retention Drive',
    program: 'Enterprise Success Plan',
    workflowStatus: 'completed',
  },
];
