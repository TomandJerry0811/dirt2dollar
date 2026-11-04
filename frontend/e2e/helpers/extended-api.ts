import type { Page } from '@playwright/test';
import { metrics, execution, report } from './extended-data';
import type { WorkflowExecution, Report } from '../../src/types';
export async function mockDashboard(page: Page) {
  await page.route(/\/api\/v1\/dashboard\//, async route => {
    const endpoint = new URL(route.request().url()).pathname.split('/').pop();
    const data = endpoint === 'metrics' ? metrics : endpoint === 'health-distribution'
      ? [{ label: '70-89', value: 37 }] : endpoint === 'token-consumption'
      ? { totalTokens: 0, totalPromptTokens: 0, totalCompletionTokens: 0, totalRequests: 0,
          nodeBreakdown: [], clientBreakdown: [], recentLogs: [],
          perDay: {}, perWeek: {}, perMonth: {} } : [];
    await route.fulfill({ json: data });
  });
}
export async function mockWorkflows(page: Page, history: WorkflowExecution[] = [execution]) {
  await page.route(/\/api\/v1\/workflows(?:\/|\?|$)/, async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/logs')) return route.fulfill({ json: [{ timestamp: '10:00:00', level: 'info', message: 'Controlled workflow log' }] });
    if (path.endsWith('/stats')) return route.fulfill({ json: { total: 1, active: 1, paused: 0, failed: 0, executionsToday: 1, successRatePercent: 100, averageExecutionTime: 12 } });
    if (path.endsWith('/executions')) return route.fulfill({ json: history });
    if (path.endsWith('/execute')) return route.fulfill({ json: execution });
    return route.fulfill({ json: [] });
  });
}
export async function mockReports(page: Page, reports: Report[] = [report]) {
  await page.route(/\/api\/v1\/reports(?:\?|$)/, route => route.fulfill({ json: reports }));
}
