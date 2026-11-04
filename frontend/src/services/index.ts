// ============================================================
// Services Barrel Export
// ============================================================

export { default as apiClient } from './api/axios.instance';
export { ClientService } from './client.service';
export { dashboardService } from './dashboard.service';
export { workflowService } from './workflow.service';
export { recommendationService } from './recommendation.service';
export { analyticsService } from './analytics.service';
export { settingsService } from './settings.service';
export * from './report.service';
export { authService, AUTHORIZED_PERSONNEL } from './auth.service';
export { errorLogsService } from './errorLogs.service';
