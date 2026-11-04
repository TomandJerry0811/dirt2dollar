import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { clients } from './helpers/data';
import { deferred, mockClients } from './helpers/api';
import type { Page } from '@playwright/test';

const rows = (page: Page) => page.locator('table tbody tr');
// Filter selects currently have no accessible labels. Scope by their option text.
const riskSelect = (page: Page) => page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Risk Level', exact: true }) });
const statusSelect = (page: Page) => page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Status', exact: true }) });
const search = (page: Page) => page.getByPlaceholder('Search by Client Name, Industry, or Account Manager...');
async function expectNames(page: Page, expected: string[]) {
  await expect(rows(page)).toHaveCount(expected.length);
  await expect(rows(page).locator('td:nth-child(2)')).toHaveText(expected.map(name => new RegExp(name)));
}

test('client list displays the first page of API data', async ({ page }) => {
  await mockClients(page);
  await login(page, '/clients');
  await expectNames(page, clients.slice(0, 20).map(client => client.name));
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible();
});

test('list loading skeleton is replaced by client rows', async ({ page }) => {
  const gate = deferred();
  await mockClients(page, gate);
  try {
    await login(page, '/clients');
    // Skeleton.tsx uses aria-hidden placeholders and exposes no loading role.
    await expect(page.locator('main .skeleton').first()).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
  } finally { gate.release(); }
  await expect(rows(page)).toHaveCount(20);
  await expect(page.locator('main .skeleton')).toHaveCount(0);
});

test('search sends the query and shows matching API results', async ({ page }) => {
  const requests = await mockClients(page);
  await login(page, '/clients');
  await expect(rows(page)).toHaveCount(20);
  await search(page).fill('Test Client 03');
  await expectNames(page, ['Test Client 03']);
  expect(requests.some(url => url.searchParams.get('search') === 'Test Client 03')).toBe(true);
});

test('risk filter sends high risk and renders only the filtered response', async ({ page }) => {
  const requests = await mockClients(page);
  await login(page, '/clients');
  await expect(rows(page)).toHaveCount(20);
  await riskSelect(page).selectOption('high');
  await expectNames(page, clients.filter(client => client.riskLevel === 'high').map(client => client.name));
  expect(requests.some(url => url.searchParams.get('riskLevel') === 'high')).toBe(true);
});

test('status filter sends at-risk and renders only the filtered response', async ({ page }) => {
  const requests = await mockClients(page);
  await login(page, '/clients');
  await expect(rows(page)).toHaveCount(20);
  await statusSelect(page).selectOption('at-risk');
  await expectNames(page, clients.filter(client => client.status === 'at-risk').map(client => client.name));
  expect(requests.some(url => url.searchParams.get('status') === 'at-risk')).toBe(true);
});

test('combined filters and Clear All update the list', async ({ page }) => {
  const requests = await mockClients(page);
  await login(page, '/clients');
  await expect(rows(page)).toHaveCount(20);
  await riskSelect(page).selectOption('high');
  await expect(rows(page)).toHaveCount(13);
  await statusSelect(page).selectOption('at-risk');
  await expectNames(page, clients.filter(client => client.riskLevel === 'high' && client.status === 'at-risk').map(client => client.name));
  expect(requests.some(url => url.searchParams.get('riskLevel') === 'high' && url.searchParams.get('status') === 'at-risk')).toBe(true);
  await page.getByRole('button', { name: 'Clear All', exact: true }).click();
  await expectNames(page, clients.slice(0, 20).map(client => client.name));
  await expect(riskSelect(page)).toHaveValue('');
  await expect(statusSelect(page)).toHaveValue('');
});

test('pagination changes rows and page size resets to the first page', async ({ page }) => {
  await mockClients(page);
  await login(page, '/clients');
  await expectNames(page, clients.slice(0, 20).map(client => client.name));
  // Pagination has two unlabeled icon buttons; scope to its Page text.
  const pager = page.getByText(/^Page \d+ of \d+$/).locator('..');
  await expect(pager.getByRole('button').nth(0)).toBeDisabled();
  await pager.getByRole('button').nth(1).click();
  await expectNames(page, clients.slice(20).map(client => client.name));
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
  await expect(pager.getByRole('button').nth(1)).toBeDisabled();
  await page.getByRole('combobox').filter({ has: page.getByRole('option', { name: '20', exact: true }) }).selectOption('10');
  await expectNames(page, clients.slice(0, 10).map(client => client.name));
  await expect(page.getByText('Page 1 of 3', { exact: true })).toBeVisible();
});

test('selecting a client opens quick view and the correct detail page', async ({ page }) => {
  await mockClients(page);
  await login(page, '/clients');
  await expect(rows(page)).toHaveCount(20);
  await rows(page).filter({ hasText: 'Test Client 01' }).click();
  await expect(page.getByRole('heading', { name: 'Test Client 01', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/\/client\/test-1$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Test Client 01', exact: true })).toBeVisible();
});
