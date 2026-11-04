import { test, expect } from './helpers/fixtures';
import { login } from './helpers/auth';
import { mockReports } from './helpers/extended-api';
import { report } from './helpers/extended-data';
import { readFile } from 'node:fs/promises';
test('report library displays API report metadata', async ({ page }) => {
  await mockReports(page);
  await login(page, '/reports');
  const row = page.getByRole('row').filter({ hasText: report.name });
  await expect(row).toContainText(report.clientName);
  await expect(row).toContainText('Ready');
  await expect(row).toContainText('PDF');
});
test('report generation posts selected configuration and adds the returned report', async ({ page }) => {
  await mockReports(page, []);
  let generated = false;
  const configs: Record<string, unknown>[] = [];
  await page.route(/\/api\/v1\/reports$/, async route => {
    if (route.request().method() === 'POST') {
      configs.push(route.request().postDataJSON()); generated = true;
      await route.fulfill({ json: report });
    } else await route.fulfill({ json: generated ? [report] : [] });
  });
  await login(page, '/reports');
  await page.getByRole('heading', { name: 'Client Intelligence', exact: true }).locator('..').getByRole('button', { name: 'Generate', exact: true }).click();
  await page.getByRole('combobox').filter({ has: page.getByRole('option', { name: 'Select Client...', exact: true }) }).selectOption('Yardworx Land Management');
  await page.getByRole('button', { name: 'Generate', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Report Ready', exact: true })).toBeVisible();
  expect(configs).toHaveLength(1);
  expect(configs[0]).toMatchObject({ reportType: 'Client Intelligence', clientName: 'Yardworx Land Management', format: 'PDF' });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: report.name })).toContainText(report.clientName);
});
test('report download creates a file with the expected contents', async ({ page }) => {
  test.fixme(true, 'ReportPreview Download has no handler; Export Data only shows a toast. The real backend TXT download is tested separately.');
  await mockReports(page, [{ ...report, downloadUrl: '/api/v1/reports/report-controlled-1/download' }]);
  await page.route(/\/reports\/report-controlled-1\/download$/, route => route.fulfill({
    contentType: 'application/pdf', headers: { 'Content-Disposition': 'attachment; filename=controlled-report.pdf' },
    body: '%PDF-1.4\nControlled report fixture\n%%EOF',
  }));
  await login(page, '/reports');
  const row = page.getByRole('row').filter({ hasText: report.name });
  await row.hover();
  await row.getByTitle('Preview', { exact: true }).click();
  // Activate this test once the UI connects its download control to the backend.
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
  const download = await downloadEvent;
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(download.suggestedFilename()).toBe('controlled-report.pdf');
  expect((await readFile(path!, 'utf8'))).toContain('%PDF-1.4');
});
