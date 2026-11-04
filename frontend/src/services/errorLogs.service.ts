import type { WorkflowErrorResponse, WorkflowErrorLog } from '@/types';
import apiClient from './api/axios.instance';
import { API_ENDPOINTS } from '@/constants/api.constants';

// ============================================================
// Workflow Error Logs Service
// ============================================================

export interface GetErrorsParams {
  limit?: number;
  workflow_name?: string;
  failed_node?: string;
  search?: string;
}

export const errorLogsService = {
  getErrors: async (params?: GetErrorsParams): Promise<WorkflowErrorResponse> => {
    const { data } = await apiClient.get<WorkflowErrorResponse>(
      API_ENDPOINTS.ERROR_LOGS.LIST,
      { params }
    );
    return data;
  },

  getErrorById: async (id: number | string): Promise<WorkflowErrorLog> => {
    const { data } = await apiClient.get<WorkflowErrorLog>(
      API_ENDPOINTS.ERROR_LOGS.DETAIL(id)
    );
    return data;
  },

  triggerTestError: async (payload?: {
    workflow_name?: string;
    failed_node?: string;
    error_message?: string;
    execution_id?: string;
  }): Promise<{ success: boolean; message: string; data: WorkflowErrorLog[] }> => {
    const { data } = await apiClient.post(API_ENDPOINTS.ERROR_LOGS.TEST, payload ?? {});
    return data;
  },
};

export default errorLogsService;
