import type { DashboardMetrics, Report, WorkflowExecution } from '../../src/types';
export const metrics: DashboardMetrics = {
  totalClients: 37, activeClients: 29, atRiskClients: 6, churnedClients: 2,
  avgHealthScore: 68, avgChurnProbability: 32, totalMRR: 123456, totalARR: 1481472,
  mrrGrowth: 4, healthGrowth: -2, riskGrowth: 1, activeGrowth: 3, recentAlerts: [],
};
export const execution: WorkflowExecution = {
  id: 'exec-controlled-101', workflowId: 'w-101', workflowName: 'Controlled AI workflow',
  clientId: 'test-1', clientName: 'Test Client 01', status: 'completed',
  startedAt: '2026-01-02T10:00:00Z', completedAt: '2026-01-02T10:00:12Z', duration: 12,
  stageCount: 2, successCount: 2, failureCount: 0, logs: [], nodes: [],
};
export const report: Report = {
  id: 'report-controlled-1', name: 'Controlled Client Intelligence Report',
  type: 'Client Intelligence', clientId: 'test-1', clientName: 'Test Client 01',
  status: 'ready', format: 'PDF', sizeBytes: 2048, generatedBy: 'Test Analyst',
  createdAt: '2026-01-02T10:00:00Z', updatedAt: '2026-01-02T10:00:00Z',
  sections: ['Executive Summary', 'AI Churn Analysis'], version: 1,
};
export const clientSummary = 'Selected client summary from the controlled API.';
export const clientRecommendation = 'Call the selected client to review declining engagement.';
export const historicalClient = 'Controlled Historical Client';
