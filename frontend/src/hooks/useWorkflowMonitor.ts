import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkflowStore } from '@/store/workflow.store';
import { workflowService } from '@/services/workflow.service';
import { QUERY_STALE_TIME } from '@/constants';
import { getApiErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';
import { useEffect } from 'react';

// ============================================================
// Workflow Monitor Hook
// ============================================================

export function useWorkflowMonitor() {
  const store = useWorkflowStore();
  const queryClient = useQueryClient();

  // 1. Fetch Stats
  const statsQuery = useQuery({
    queryKey: ['workflow', 'stats'],
    queryFn: () => workflowService.getStats().then((res) => res.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  // 2. Fetch Executions History
  const historyQuery = useQuery({
    queryKey: ['workflow', 'executions'],
    queryFn: () => workflowService.getExecutions().then((res) => res.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  // 3. Fetch Active Execution Details (if we have an ID)
  // Fetch the latest execution from history instead of triggering a new run
  const executionQuery = useQuery({
    queryKey: ['workflow', 'execution', 'active'],
    queryFn: () => workflowService.getExecutions().then((res) => {
      if (res.data && res.data.length > 0) {
        return res.data[0];
      }
      return null;
    }),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  // Sync with store
  useEffect(() => {
    if (statsQuery.data) store.setStats(statsQuery.data);
  }, [statsQuery.data]);

  useEffect(() => {
    if (historyQuery.data) store.setExecutions(historyQuery.data);
  }, [historyQuery.data]);

  useEffect(() => {
    if (executionQuery.data && !store.currentExecution) {
      store.setCurrentExecution(executionQuery.data);
    }
  }, [executionQuery.data]);

  // Mutations
  const runWorkflowMutation = useMutation({
    mutationFn: (id: string) => workflowService.execute(id),
    onSuccess: (res) => {
      store.setCurrentExecution(res.data);
      queryClient.invalidateQueries({ queryKey: ['workflow', 'executions'] });
      toast.success('Workflow execution started');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const retryWorkflowMutation = useMutation({
    mutationFn: (execId: string) => workflowService.retryWorkflow(execId),
    onSuccess: (res) => {
      store.setCurrentExecution(res.data);
      store.setIsRetryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workflow', 'executions'] });
      toast.success('Workflow retry initiated');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
      store.setIsRetryDialogOpen(false);
    },
  });

  return {
    // Data
    stats: statsQuery.data ?? store.stats,
    history: historyQuery.data ?? store.executions,
    activeExecution: store.currentExecution,
    selectedNode: store.selectedNode,
    filters: store.filters,

    // Loading States
    isLoadingStats: statsQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isLoadingExecution: executionQuery.isLoading,
    isRunning: runWorkflowMutation.isPending || retryWorkflowMutation.isPending,

    // Error States
    isHistoryError: historyQuery.isError,
    historyErrorMessage: historyQuery.error ? getApiErrorMessage(historyQuery.error) : null,
    isStatsError: statsQuery.isError,
    refetchHistory: historyQuery.refetch,

    // Actions
    runWorkflow: () => runWorkflowMutation.mutate('w-101'),
    retryWorkflow: (id: string) => retryWorkflowMutation.mutate(id),
    refresh: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['workflow'] });
        toast.success('Data refreshed');
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    },

    // UI Actions
    setSelectedNode: store.setSelectedNode,
    setIsNodeDrawerOpen: store.setIsNodeDrawerOpen,
    isNodeDrawerOpen: store.isNodeDrawerOpen,
    setIsRetryDialogOpen: store.setIsRetryDialogOpen,
    isRetryDialogOpen: store.isRetryDialogOpen,
    setFilters: store.setFilters,
  };
}