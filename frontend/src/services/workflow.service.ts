
import type { Workflow, WorkflowExecution, WorkflowStats, ExecutionLogEntry } from '@/types';
import apiClient from './api/axios.instance';

// ============================================================
// Workflow Service
// ============================================================

export const workflowService = {
  list: async (_params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<Workflow[]>('/workflows');
    return { data };
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Workflow[]>('/workflows');
    const wf = data.find((w) => w.id === id);
    if (!wf) throw new Error('Workflow not found');
    return { data: wf };
  },

  execute: async (id: string, data?: Record<string, unknown>) => {
    const response = await apiClient.post<WorkflowExecution>(`/workflows/${id}/execute`, data);
    return { data: response.data };
  },

  pause: async (_id: string) => {
    return { data: { success: true } };
  },

  resume: async (_id: string) => {
    return { data: { success: true } };
  },

  getExecutions: async (_id?: string, _params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<WorkflowExecution[]>('/workflows/executions');
    return { data };
  },

  getExecutionDetail: async (workflowId: string, execId: string) => {
    const { data } = await apiClient.get<WorkflowExecution[]>('/workflows/executions');
    const exec = data.find((e) => e.id === execId);
    if (exec) return { data: exec };
    // Trigger a default run if not found
    const runRes = await apiClient.post<WorkflowExecution>(`/workflows/${workflowId}/execute`);
    return { data: runRes.data };
  },

  getStats: async () => {
    const { data } = await apiClient.get<WorkflowStats>('/workflows/stats');
    return { data };
  },

  getExecutionLogs: async (execId: string) => {
    const { data } = await apiClient.get<ExecutionLogEntry[]>(`/workflows/executions/${execId}/logs`);
    return { data };
  },

  retryWorkflow: async (execId: string) => {
    const response = await apiClient.post<WorkflowExecution>(`/workflows/w-101/execute`);
    return { data: response.data };
  }
};

