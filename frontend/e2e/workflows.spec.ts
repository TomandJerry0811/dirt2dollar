import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { mockWorkflows } from './helpers/extended-api';
import { execution } from './helpers/extended-data';
test('Run Workflow sends one POST to the selected execution endpoint', async ({ page }) => {
  await mockWorkflows(page, []);
  const calls: { method: string; path: string; body: string | null }[] = [];
  await page.route(/\/workflows\/w-101\/execute$/, async route => {
    calls.push({ method: route.request().method(), path: new URL(route.request().url()).pathname, body: route.request().postData() });
    await route.fulfill({ json: execution });
  });
  await login(page, '/workflow');
  await page.getByRole('button', { name: 'Run Workflow', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'AI Workflow Execution', exact: true })).toBeVisible();
  expect(calls).toEqual([{ method: 'POST', path: '/api/v1/workflows/w-101/execute', body: null }]);
});
for (const status of ['completed', 'failed'] as const) {
  test(`execution response displays ${status}`, async ({ page }) => {
    await mockWorkflows(page, []);
    await page.route(/\/workflows\/w-101\/execute$/, route => route.fulfill({ json: { ...execution, status, successCount: status === 'completed' ? 2 : 1, failureCount: status === 'failed' ? 1 : 0 } }));
    await login(page, '/workflow');
    await page.getByRole('button', { name: 'Run Workflow', exact: true }).click();
    const banner = page.getByRole('heading', { name: 'AI Workflow Execution', exact: true }).locator('..');
    await expect(banner).toContainText(status === 'completed' ? 'Completed' : 'Failed');
    await expect(banner).toContainText(execution.id);
  });
}
test('execution history shows API records and supports search', async ({ page }) => {
  await mockWorkflows(page, [execution, { ...execution, id: 'exec-controlled-failed', clientName: 'Other Client', status: 'failed' }]);
  await login(page, '/workflow');
  const history = page.locator('#history-section');
  await expect(history.locator('tbody tr')).toHaveCount(2);
  await expect(history.locator('tbody')).toContainText('exec-controlled-failed');
  await expect(history.locator('tbody')).toContainText('Failed');
  await page.getByPlaceholder('Search ID or Client...').fill('exec-controlled-101');
  await expect(history.locator('tbody tr')).toHaveCount(1);
  await expect(history.locator('tbody')).toContainText('Test Client 01');
});
