import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { deferred } from './helpers/api';
import { metrics } from './helpers/extended-data';
import { mockDashboard } from './helpers/extended-api';
const card = (page: import('@playwright/test').Page, label: string) => page.getByRole('region', { name: 'Key Performance Indicators', exact: true }).locator('.metric-card').filter({ has: page.getByText(label, { exact: true }) });
test.beforeEach(async ({ page }) => { await mockDashboard(page); });
test('all six dashboard metrics match API values', async ({ page }) => {
  await login(page, '/');
  for (const [label, value] of [['Total Clients','37'], ['Active Clients','29'], ['At Risk Clients','6'], ['Avg Churn Probability','32%'], ['Avg Health Score','68'], ['Total MRR','₹1,23,456']]) {
    await expect(card(page, label)).toContainText(value);
  }
});
test('dashboard displays a loading state while metrics are pending', async ({ page }) => {
  const gate = deferred();
  await page.route(/\/dashboard\/metrics$/, async route => { await gate.promise; await route.fulfill({ json: metrics }); });
  try { await login(page, '/'); await expect(page.getByRole('status', { name: /loading dashboard/i })).toBeVisible(); }
  finally { gate.release(); }
  await expect(card(page, 'Total Clients')).toContainText('37');
});
test('zero-client API response renders zero metrics without invented counts', async ({ page }) => {
  await page.route(/\/dashboard\/metrics$/, route => route.fulfill({ json: { ...metrics, totalClients: 0, activeClients: 0, atRiskClients: 0, churnedClients: 0, avgHealthScore: 0, avgChurnProbability: 0, totalMRR: 0, totalARR: 0 } }));
  await login(page, '/');
  await expect(card(page, 'Total Clients')).toContainText('0');
  await expect(page.getByRole('heading', { name: 'No client data yet' })).toBeVisible();
  await expect(card(page, 'Total MRR')).toContainText('₹0');
  await expect(card(page, 'Avg Churn Probability')).toContainText('0%');
});
test('dashboard API failure shows the server error and retry recovers', async ({ page }) => {
  let failed = true;
  await page.route(/\/dashboard\/metrics$/, route => route.fulfill(failed ? { status: 500, json: { detail: 'Controlled dashboard failure' } } : { json: metrics }));
  await login(page, '/');
  await expect(page.getByText("Couldn't load your dashboard", { exact: true })).toBeVisible();
  await expect(page.getByText('Controlled dashboard failure', { exact: true })).toBeVisible();
  failed = false;
  await page.getByRole('button', { name: /try again/i }).click();
  await expect(card(page, 'Total Clients')).toContainText('37');
});
