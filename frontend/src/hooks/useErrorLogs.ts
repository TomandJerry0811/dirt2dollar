import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { errorLogsService, type GetErrorsParams } from '@/services/errorLogs.service';
import { getApiErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

// ============================================================
// Workflow Error Logs Hook
// ============================================================

export function useErrorLogs(params?: GetErrorsParams) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['error-logs', params?.workflow_name, params?.failed_node, params?.search],
    queryFn: () => errorLogsService.getErrors(params),
    staleTime: 10000,
  });

  const testMutation = useMutation({
    mutationFn: (payload?: {
      workflow_name?: string;
      failed_node?: string;
      error_message?: string;
    }) => errorLogsService.triggerTestError(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast.success(res.message || 'Simulated error logged to Supabase');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  return {
    data: query.data,
    logs: query.data?.logs ?? [],
    stats: query.data?.stats,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error ? getApiErrorMessage(query.error) : null,
    refetch: query.refetch,
    triggerTestError: testMutation.mutate,
    isTriggeringTest: testMutation.isPending,
  };
}

export default useErrorLogs;
