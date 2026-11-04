import type { WorkflowExecution, WorkflowStats, Workflow, WorkflowNode, ExecutionLogEntry } from '@/types';

export const MOCK_WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'trigger',
    data: { label: 'Scheduled Trigger', description: 'Runs daily at 2:00 AM' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:12Z',
    completedAt: '2024-05-21T10:42:12Z',
    duration: 0.1,
    output: { trigger_type: 'cron', cron_expression: '0 2 * * *' }
  },
  {
    id: 'node-2',
    type: 'client_retrieval',
    data: { label: 'Client Retrieval', description: 'Fetches CRM & telemetry data' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:12Z',
    completedAt: '2024-05-21T10:42:14Z',
    duration: 2.3,
    input: { client_id: 'c-101', fetch_telemetry: true },
    output: { records_found: 14500, mrr: 25000, active_users: 142 }
  },
  {
    id: 'node-3',
    type: 'summary_generation',
    data: { label: 'Summary Generation', description: 'LLM generates executive summary' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:14Z',
    completedAt: '2024-05-21T10:42:17Z',
    duration: 3.1,
    input: { context_length: 14500, model: 'llama-3-70b-instruct' },
    output: { tokens_used: 1250, summary_length: 350 }
  },
  {
    id: 'node-4',
    type: 'kpi_analysis',
    data: { label: 'KPI Analysis', description: 'Calculates health and churn vectors' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:17Z',
    completedAt: '2024-05-21T10:42:21Z',
    duration: 4.2,
    input: { metrics: ['adoption', 'support_tickets', 'engagement'] },
    output: { health_score: 82, churn_probability: 14 }
  },
  {
    id: 'node-5',
    type: 'trend_interpretation',
    data: { label: 'Trend Interpretation', description: 'Identifies anomalies in usage' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:21Z',
    completedAt: '2024-05-21T10:42:25Z',
    duration: 3.8,
    input: { lookback_days: 30, sensitivity: 0.8 },
    output: { trends_detected: 2, anomalies: 0 }
  },
  {
    id: 'node-6',
    type: 'embedding_generation',
    data: { label: 'Embedding Generation', description: 'Vectorizes client profile' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:25Z',
    completedAt: '2024-05-21T10:42:28Z',
    duration: 3.0,
    input: { model: 'text-embedding-3-large', dimensions: 3072 },
    output: { embedding_id: 'emb_98234x' }
  },
  {
    id: 'node-7',
    type: 'similarity_search',
    data: { label: 'Similarity Search', description: 'Finds historically similar clients' },
    status: 'completed',
    startedAt: '2024-05-21T10:42:28Z',
    completedAt: '2024-05-21T10:42:29Z',
    duration: 1.5,
    input: { vector_id: 'emb_98234x', top_k: 5, min_score: 0.85 },
    output: { matches_found: 3, top_match: 'Vanguard Tech' }
  },
  {
    id: 'node-8',
    type: 'ai_churn_analysis',
    data: { label: 'AI Churn Analysis', description: 'Finalizes churn risk score' },
    status: 'running',
    startedAt: '2024-05-21T10:42:29Z',
    input: { factors: 12, historical_matches: 3, model: 'ensemble-xgb-nn' },
  },
  {
    id: 'node-9',
    type: 'recommendation_generation',
    data: { label: 'Recommendation Generation', description: 'Generates prescriptive actions' },
    status: 'pending',
  },
  {
    id: 'node-10',
    type: 'result_persistence',
    data: { label: 'Result Persistence', description: 'Saves analysis to Postgres' },
    status: 'pending',
  },
];

export const MOCK_EXECUTION_LOGS: ExecutionLogEntry[] = [
  { id: 'log-1', executionId: 'wf_1234567890', nodeId: 'node-1', nodeName: 'Scheduled Trigger', status: 'completed', severity: 'info', startedAt: '2024-05-21T10:42:12Z', duration: 0.1, message: 'Workflow started automatically by cron trigger.' },
  { id: 'log-2', executionId: 'wf_1234567890', nodeId: 'node-2', nodeName: 'Client Retrieval', status: 'completed', severity: 'success', startedAt: '2024-05-21T10:42:12Z', duration: 2.3, message: 'Successfully retrieved 14,500 CRM records and telemetry data.' },
  { id: 'log-3', executionId: 'wf_1234567890', nodeId: 'node-3', nodeName: 'Summary Generation', status: 'completed', severity: 'success', startedAt: '2024-05-21T10:42:14Z', duration: 3.1, message: 'LLM generated 350-word executive summary using 1250 tokens.' },
  { id: 'log-4', executionId: 'wf_1234567890', nodeId: 'node-4', nodeName: 'KPI Analysis', status: 'completed', severity: 'success', startedAt: '2024-05-21T10:42:17Z', duration: 4.2, message: 'Computed core KPIs. Health Score: 82.' },
  { id: 'log-5', executionId: 'wf_1234567890', nodeId: 'node-5', nodeName: 'Trend Interpretation', status: 'completed', severity: 'info', startedAt: '2024-05-21T10:42:21Z', duration: 3.8, message: 'Detected 2 minor anomalies in usage trends over the last 30 days.' },
  { id: 'log-6', executionId: 'wf_1234567890', nodeId: 'node-6', nodeName: 'Embedding Generation', status: 'completed', severity: 'info', startedAt: '2024-05-21T10:42:25Z', duration: 3.0, message: 'Generated 3072-dimensional embedding array.' },
  { id: 'log-7', executionId: 'wf_1234567890', nodeId: 'node-7', nodeName: 'Similarity Search', status: 'completed', severity: 'success', startedAt: '2024-05-21T10:42:28Z', duration: 1.5, message: 'Found 3 historical clients with >85% similarity.' },
  { id: 'log-8', executionId: 'wf_1234567890', nodeId: 'node-8', nodeName: 'AI Churn Analysis', status: 'running', severity: 'info', startedAt: '2024-05-21T10:42:29Z', message: 'Analyzing risk factors using ensemble model. Currently processing tree splits...' },
];

export const MOCK_ACTIVE_EXECUTION: WorkflowExecution = {
  id: 'wf_1234567890',
  workflowId: 'w-101',
  workflowName: 'Nightly Client Intelligence Sync',
  status: 'running',
  startedAt: '2024-05-21T10:42:12Z',
  duration: 18.4,
  triggerSource: 'Cron Schedule',
  workflowVersion: 'v2.4.1',
  stageCount: 10,
  successCount: 7,
  failureCount: 0,
  clientId: 'yardworx',
  clientName: 'Yardworx Land Management',
  nodes: MOCK_WORKFLOW_NODES,
  logs: MOCK_EXECUTION_LOGS,
};

export const MOCK_EXECUTIONS_HISTORY: WorkflowExecution[] = [
  MOCK_ACTIVE_EXECUTION,
  {
    id: 'wf_0987654321',
    workflowId: 'w-101',
    workflowName: 'Nightly Client Intelligence Sync',
    status: 'completed',
    startedAt: '2024-05-20T10:42:12Z',
    duration: 23.4,
    triggerSource: 'Manual',
    workflowVersion: 'v2.4.1',
    stageCount: 10,
    successCount: 10,
    failureCount: 0,
    clientId: 'yardworx',
    clientName: 'Yardworx Land Management',
    nodes: [],
    logs: [],
  },
];

export const MOCK_WORKFLOW_STATS: WorkflowStats = {
  total: 142,
  active: 3,
  paused: 1,
  failed: 4,
  executionsToday: 28,
  successRatePercent: 96.5,
  averageExecutionTime: 42.8,
};

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'w-101',
    name: 'Nightly Client Intelligence Sync',
    description: 'Runs full pipeline analysis on all Tier 1 clients nightly.',
    status: 'active',
    trigger: 'cron',
    nodes: [],
    connections: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    executionCount: 1450,
    successCount: 1400,
    failureCount: 50,
    createdBy: 'system',
    tags: ['core', 'nightly'],
  }
];
