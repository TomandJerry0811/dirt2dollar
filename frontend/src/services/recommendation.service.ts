import apiClient from './api/axios.instance';
import type { Recommendation, RecommendationSummary } from '@/types';
import { API_ENDPOINTS } from '@/constants';

// ============================================================
// Recommendation Service
// ============================================================

export const recommendationService = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Recommendation[]>(API_ENDPOINTS.RECOMMENDATIONS.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Recommendation>(API_ENDPOINTS.RECOMMENDATIONS.DETAIL(id)),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(API_ENDPOINTS.RECOMMENDATIONS.UPDATE_STATUS(id), { status }),

  dismiss: (id: string, reason?: string) =>
    apiClient.post(API_ENDPOINTS.RECOMMENDATIONS.DISMISS(id), { reason }),

  complete: (id: string, notes?: string) =>
    apiClient.post(API_ENDPOINTS.RECOMMENDATIONS.COMPLETE(id), { notes }),

  generate: (clientId?: string) =>
    apiClient.post<Recommendation[]>(API_ENDPOINTS.RECOMMENDATIONS.GENERATE, { clientId }),

  getSummary: () =>
    apiClient.get<RecommendationSummary>(`${API_ENDPOINTS.RECOMMENDATIONS.LIST}/summary`),
};
