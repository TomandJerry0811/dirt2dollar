// Deliberately imports Playwright directly: no page.route/context.route/API isolation.
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';
const backend = 'http://127.0.0.1:8002';
test.beforeEach(async ({ request }) => {
  const response = await request.post(`${backend}/__test__/reset`, { data: {} });
  expect(response.ok()).toBe(true);
});

test('complete analysis uses real FastAPI, all workflow stages and controlled persistence', async ({ page, request }) => {
  await login(page, '/ai-analysis');
  await page.getByPlaceholder('e.g. Give me churn analysis for Yardworx Land Management').fill('Give me churn analysis for Yardworx Controlled Client');
  const responseEvent = page.waitForResponse(response => response.url().endsWith('/api/v1/client-analysis') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Analyze Risk', exact: true }).click();
  const response = await responseEvent;
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.client).toMatchObject({ id: 'integration-1', name: 'Yardworx Controlled Client' });
  expect(result.summary.text).toBe('Controlled generated summary: client engagement declined.');
  expect(result.churn).toMatchObject({ probability: 80, risk_level: 'High' });
  expect(result.recommendations).toEqual(['Schedule a controlled retention call.']);
  await expect(page.getByRole('heading', { name: 'Yardworx Controlled Client', exact: true })).toBeVisible();
  await expect(page.getByText('80%', { exact: true })).toBeVisible();
  const state = await (await request.get(`${backend}/__test__/state`)).json();
  const stored = state.tables.client_updates.find((row: { client_id: string }) => row.client_id === 'integration-1');
  expect(stored.churn_probability).toBe(80);
  expect(stored.summary).toBe(result.summary.text);
  expect(stored.action_items).toEqual(result.recommendations);
  expect(state.calls.filter((call: { provider: string }) => call.provider === 'llm')).toHaveLength(5);
  expect(state.calls.filter((call: { provider: string }) => call.provider === 'embedding')).toHaveLength(2);
  expect(state.calls.filter((call: { operation?: string }) => call.operation === 'rpc')).toHaveLength(2);
  expect(state.tables.client_summary_embeddings).toHaveLength(1);
  expect(state.tables.client_kpi_embeddings).toHaveLength(1);
});

test('real FastAPI rejects an empty analysis query before invoking providers', async ({ request }) => {
  const response = await request.post(`${backend}/api/v1/client-analysis`, { data: { user_query: ' ' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ detail: 'user_query must not be empty.' });
  const state = await (await request.get(`${backend}/__test__/state`)).json();
  expect(state.calls).toEqual([]);
});

test('real FastAPI rejects a missing required analysis field', async ({ request }) => {
  const response = await request.post(`${backend}/api/v1/client-analysis`, { data: {} });
  expect(response.status()).toBe(422);
});

test('real provider failure propagates as 502 through FastAPI to the browser', async ({ page, request }) => {
  await request.post(`${backend}/__test__/reset`, { data: { fail_llm: true } });
  await login(page, '/ai-analysis');
  await page.getByPlaceholder('e.g. Give me churn analysis for Yardworx Land Management').fill('Give me churn analysis for Yardworx Controlled Client');
  const responseEvent = page.waitForResponse(response => response.url().endsWith('/api/v1/client-analysis'));
  await page.getByRole('button', { name: 'Analyze Risk', exact: true }).click();
  expect((await responseEvent).status()).toBe(502);
  await expect(page.getByRole('heading', { name: 'Analysis Failed' })).toBeVisible();
  await expect(page.getByText('Controlled provider outage', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze Risk', exact: true })).toBeEnabled();
});

const filterScenarios: { title: string; params: Record<string, string>; count: number }[] = [
  { title: 'search', params: { search: 'Yardworx Control 03' }, count: 1 },
  { title: 'risk', params: { riskLevel: 'high' }, count: 13 },
  { title: 'status', params: { status: 'active' }, count: 12 },
  { title: 'combined search/risk/status', params: { search: 'Yardworx Control 03', riskLevel: 'high', status: 'at-risk' }, count: 1 },
];
for (const scenario of filterScenarios) {
  test(`real clients endpoint applies ${scenario.title} filtering`, async ({ request }) => {
    const response = await request.get(`${backend}/api/v1/clients`, { params: scenario.params });
    expect(response.status()).toBe(200);
    const clients = await response.json();
    expect(clients).toHaveLength(scenario.count);
    for (const client of clients) {
      if ('search' in scenario.params) expect(client.name).toContain(scenario.params.search);
      if ('riskLevel' in scenario.params) expect(client.riskLevel).toBe(scenario.params.riskLevel);
      if ('status' in scenario.params) expect(client.status).toBe(scenario.params.status);
    }
  });
}

test('browser search and filters work through the real clients API', async ({ page }) => {
  await login(page, '/clients');
  await expect(page.locator('table tbody tr')).toHaveCount(20);
  await page.getByPlaceholder('Search by Client Name, Industry, or Account Manager...').fill('Yardworx Control 03');
  await page.getByRole('combobox', { name: 'Risk Level', exact: true }).selectOption('high');
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('at-risk');
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  await expect(page.locator('table tbody')).toContainText('Yardworx Control 03');
});

test('backend report endpoint supplies an actual attachment with controlled client data', async ({ request }) => {
  const reports = await (await request.get(`${backend}/api/v1/reports`)).json();
  expect(reports.length).toBeGreaterThan(0);
  const response = await request.get(`${backend}/api/v1/reports/${reports[0].id}/download`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-disposition']).toContain('attachment; filename=report-');
  expect(response.headers()['content-type']).toContain('text/plain');
  expect(await response.text()).toContain(reports[0].clientName);
  expect(await response.text()).toContain('CHURN PREDICTOR AUDIT REPORT');
});
