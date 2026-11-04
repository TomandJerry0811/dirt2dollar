import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { mockClients } from './helpers/api';
import { clientSummary, clientRecommendation, historicalClient } from './helpers/extended-data';
const metric = (page: import('@playwright/test').Page, title: string) => page.locator('.metric-card').filter({ has: page.getByText(title, { exact: true }) });
test.beforeEach(async ({ page }) => { await mockClients(page); });
test('selected client health score and MRR match its API record', async ({ page }) => {
  await login(page, '/client/test-1');
  await expect(metric(page, 'Health Score')).toContainText('40/100');
  await expect(metric(page, 'Revenue (MRR)')).toContainText('$2.0k');
});
test('selected client churn probability matches its API record', async ({ page }) => {
  await login(page, '/client/test-2');
  await expect(metric(page, 'Churn Probability')).toContainText('15%');
  await expect(page.getByRole('heading', { level: 1, name: 'Test Client 02' })).toBeVisible();
});
test('KPI Analytics displays selected-client API values', async ({ page }) => {
  test.fixme(true, 'KPIAnalyticsTab still uses SEED_KPI_TREND; no selected-client API wiring.');
  await page.route(/\/clients\/test-1\/kpis$/, route => route.fulfill({ json: [{ name: 'Controlled Engagement', value: 47 }] }));
  await login(page, '/client/test-1');
  await page.getByRole('button', { name: 'KPI Analytics', exact: true }).click();
  await expect(page.getByText('Controlled Engagement', { exact: true })).toBeVisible();
  await expect(page.getByText('47', { exact: true })).toBeVisible();
});
test('overview summary comes from the selected client', async ({ page }) => {
  test.fixme(true, 'OverviewTab renders a hardcoded executive summary.');
  await page.route(/\/api\/v1\/clients\/test-1$/, async route => route.fulfill({ json: { ...(await import('./helpers/data')).clients[0], metadata: { summary: clientSummary } } }));
  await login(page, '/client/test-1');
  await expect(page.getByText(clientSummary, { exact: true })).toBeVisible();
});
test('history displays selected-client API matches', async ({ page }) => {
  test.fixme(true, 'HistoricalSimilarityTab renders SEED_HISTORICAL_CLIENTS.');
  await page.route(/\/clients\/test-1\/history$/, route => route.fulfill({ json: [{ id: 'history-1', name: historicalClient, industry: 'SaaS', similarityScore: 87, outcome: 'retained' }] }));
  await login(page, '/client/test-1');
  await page.getByRole('button', { name: 'Historical Similarity', exact: true }).click();
  await expect(page.getByText(historicalClient, { exact: true })).toBeVisible();
  await expect(page.getByText('87%', { exact: true })).toBeVisible();
});
test('recommendations belong to the selected client', async ({ page }) => {
  test.fixme(true, 'RecommendationsTab renders SEED_RECOMMENDATIONS; API action_items are not wired.');
  await page.route(/\/clients\/test-1\/analysis$/, route => route.fulfill({ json: { data: { clientId: 'test-1', actionItems: [clientRecommendation] } } }));
  await login(page, '/client/test-1');
  await page.getByRole('button', { name: 'Recommendations', exact: true }).click();
  await expect(page.getByText(clientRecommendation, { exact: true })).toBeVisible();
});
