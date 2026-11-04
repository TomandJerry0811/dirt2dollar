import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { analysis, query } from './helpers/data';
import { analysisEndpoint, deferred, providerError } from './helpers/api';

const input = (page: import('@playwright/test').Page) => page.getByPlaceholder('e.g. Give me churn analysis for Yardworx Land Management');
const run = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Analyze Risk', exact: true });

async function expectSuccess(page: import('@playwright/test').Page) {
  await expect(page.getByRole('heading', { name: 'Test Client 01', exact: true })).toBeVisible();
  await expect(page.getByText(analysis.summary.text!, { exact: true })).toBeVisible();
  await expect(page.getByText('75%', { exact: true })).toBeVisible();
  await expect(page.getByText('high', { exact: true })).toBeVisible();
  await expect(page.getByText('Schedule a retention call.', { exact: true })).toBeVisible();
}

test('successful analysis displays the client, score, summary and recommendation', async ({ page }) => {
  await page.route(analysisEndpoint, route => route.fulfill({ json: analysis }));
  await login(page);
  await input(page).fill(query);
  await run(page).click();
  await expectSuccess(page);
});

test('analysis sends the correct POST payload exactly once', async ({ page }) => {
  const requests: { method: string; body: unknown }[] = [];
  await page.route(analysisEndpoint, async route => {
    requests.push({ method: route.request().method(), body: route.request().postDataJSON() });
    await route.fulfill({ json: analysis });
  });
  await login(page);
  await input(page).fill(query);
  await run(page).click();
  await expectSuccess(page);
  expect(requests).toEqual([{ method: 'POST', body: { user_query: query } }]);
});

test('pending analysis shows loading and disables duplicate submission', async ({ page }) => {
  const gate = deferred();
  const requests: string[] = [];
  await page.route(analysisEndpoint, async route => {
    requests.push(route.request().method());
    await gate.promise;
    await route.fulfill({ json: analysis });
  });
  try {
    await login(page);
    await input(page).fill(query);
    await run(page).click();
    await expect(page.getByRole('heading', { name: 'RAG Pipeline Active' })).toBeVisible();
    await expect(input(page)).toBeDisabled();
    await expect(run(page)).toBeDisabled();
    await expect(run(page)).toHaveAttribute('aria-busy', 'true');
    await expect.poll(() => requests).toEqual(['POST']);
  } finally { gate.release(); }
  await expectSuccess(page);
  await expect(run(page)).toBeEnabled();
  await expect(input(page)).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'RAG Pipeline Active' })).toHaveCount(0);
});

test('provider error is displayed and the controls recover', async ({ page }) => {
  await page.route(analysisEndpoint, providerError);
  await login(page);
  await input(page).fill(query);
  await run(page).click();
  await expect(page.getByRole('heading', { name: 'Analysis Failed' })).toBeVisible();
  await expect(page.getByText('AI provider temporarily unavailable.', { exact: true })).toBeVisible();
  await expect(run(page)).toBeEnabled();
  await expect(input(page)).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Test Client 01', exact: true })).toHaveCount(0);
});

test('retry after a provider error succeeds and clears the error', async ({ page }) => {
  const payloads: unknown[] = [];
  await page.route(analysisEndpoint, async route => {
    payloads.push(route.request().postDataJSON());
    if (payloads.length === 1) await providerError(route);
    else await route.fulfill({ json: analysis });
  });
  await login(page);
  await input(page).fill(query);
  await run(page).click();
  await expect(page.getByRole('heading', { name: 'Analysis Failed' })).toBeVisible();
  await run(page).click();
  await expectSuccess(page);
  await expect(page.getByRole('heading', { name: 'Analysis Failed' })).toHaveCount(0);
  expect(payloads).toEqual([{ user_query: query }, { user_query: query }]);
});
