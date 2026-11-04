// ============================================================
// Workflow Types
// ============================================================

export type WorkflowNodeType =
  | 'trigger'
  | 'client_retrieval'
  | 'summary_generation'
  | 'kpi_analysis'
  | 'trend_interpretation'
  | 'embedding_generation'
  | 'similarity_search'
  | 'ai_churn_analysis'
  | 'recommendation_generation'
  | 'result_persistence';

export type WorkflowStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'warning'
  | 'cancelled';

export type LogSeverity = 'info' | 'success' | 'warning' | 'error';

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface WorkflowNodeData {
  label: string;
  description?: string;
  config?: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position?: WorkflowNodePosition; // Made optional for pure vertical pipeline
  data: WorkflowNodeData;
  status?: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in seconds
  error?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  createdBy: string;
  tags: string[];
}

export interface ExecutionLogEntry {
  id: string;
  executionId: string;
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  severity: LogSeverity;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  message: string;
  error?: string;
  output?: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggerSource?: string;
  workflowVersion?: string;
  stageCount?: number;
  successCount?: number;
  failureCount?: number;
  triggerData?: Record<string, unknown>;
  logs: ExecutionLogEntry[];
  clientId?: string;
  clientName?: string;
  nodes: WorkflowNode[]; // Represents the state of the nodes for this specific execution
}

export interface WorkflowStats {
  total: number;
  active: number;
  paused: number;
  failed: number;
  executionsToday: number;
  successRatePercent: number;
  averageExecutionTime: number; // in seconds
}

export interface WorkflowFilters {
  status?: string[];
  client?: string[];
  dateRange?: { start: string; end: string };
  search?: string;
}

export interface WorkflowErrorLog {
  id: number;
  workflow_name: string | null;
  failed_node: string | null;
  error_message: string | null;
  execution_id: string | null;
  workflow_id: string | null;
  error_stack: string | null;
  created_at: string | null;
}

export interface WorkflowErrorStats {
  totalErrors: number;
  topFailedNode: string;
  topFailedNodeCount: number;
  topWorkflow: string;
  topWorkflowCount: number;
  latestErrorAt: string | null;
  availableWorkflows: string[];
  availableNodes: string[];
}

export interface WorkflowErrorResponse {
  total: number;
  stats: WorkflowErrorStats;
  logs: WorkflowErrorLog[];
}
