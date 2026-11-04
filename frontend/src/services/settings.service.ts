import apiClient from './api/axios.instance';
import type { Report } from '@/types';
import { API_ENDPOINTS } from '@/constants';

// ============================================================
// Settings Service
// ============================================================

export const settingsService = {
  getUserSettings: () =>
    apiClient.get(API_ENDPOINTS.SETTINGS.USER),

  updateUserSettings: (data: Record<string, unknown>) =>
    apiClient.patch(API_ENDPOINTS.SETTINGS.USER, data),

  getAppSettings: () =>
    apiClient.get(API_ENDPOINTS.SETTINGS.APP),

  updateAppSettings: (data: Record<string, unknown>) =>
    apiClient.patch(API_ENDPOINTS.SETTINGS.APP, data),

  getNotificationSettings: () =>
    apiClient.get(API_ENDPOINTS.SETTINGS.NOTIFICATIONS),

  updateNotificationSettings: (data: Record<string, unknown>) =>
    apiClient.patch(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, data),

  getIntegrations: () =>
    apiClient.get(API_ENDPOINTS.SETTINGS.INTEGRATIONS),
};

