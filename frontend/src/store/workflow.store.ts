import { create } from 'zustand';
import type { Workflow, WorkflowExecution, WorkflowStats, WorkflowNode, WorkflowFilters, ExecutionLogEntry } from '@/types';

// ============================================================
// Workflow Store
// ============================================================

interface WorkflowStore {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  
  // Execution Monitoring
  currentExecution: WorkflowExecution | null;
  executions: WorkflowExecution[];
  stats: WorkflowStats | null;
  executionLogs: ExecutionLogEntry[];
  
  // UI State
  selectedNode: WorkflowNode | null;
  isNodeDrawerOpen: boolean;
  isRetryDialogOpen: boolean;
  filters: WorkflowFilters;
  
  // Network State
  isLoading: boolean;
  isExecuting: boolean;

  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  setExecutions: (executions: WorkflowExecution[]) => void;
  setStats: (stats: WorkflowStats) => void;
  setExecutionLogs: (logs: ExecutionLogEntry[]) => void;
  
  setSelectedNode: (node: WorkflowNode | null) => void;
  setIsNodeDrawerOpen: (isOpen: boolean) => void;
  setIsRetryDialogOpen: (isOpen: boolean) => void;
  setFilters: (filters: Partial<WorkflowFilters>) => void;
  
  setIsLoading: (loading: boolean) => void;
  setIsExecuting: (executing: boolean) => void;
  updateWorkflowStatus: (id: string, status: Workflow['status']) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  selectedWorkflow: null,
  
  currentExecution: null,
  executions: [],
  stats: null,
  executionLogs: [],
  
  selectedNode: null,
  isNodeDrawerOpen: false,
  isRetryDialogOpen: false,
  filters: {},
  
  isLoading: false,
  isExecuting: false,

  setWorkflows: (workflows) => set({ workflows }),
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  setExecutions: (executions) => set({ executions }),
  setStats: (stats) => set({ stats }),
  setExecutionLogs: (executionLogs) => set({ executionLogs }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  setIsNodeDrawerOpen: (isOpen) => set({ isNodeDrawerOpen: isOpen }),
  setIsRetryDialogOpen: (isOpen) => set({ isRetryDialogOpen: isOpen }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),

  updateWorkflowStatus: (id, status) =>
    set({
      workflows: get().workflows.map((w) =>
        w.id === id ? { ...w, status } : w
      ),
    }),
}));
