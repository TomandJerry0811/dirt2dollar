import { test as base, expect } from '@playwright/test';

// Each test uses a fresh context and real UI login; backend requests are isolated.
export const test = base.extend<{ apiIsolation: void }>({
  apiIsolation: [async ({ context, page }, use, testInfo) => {
    const errors: string[] = [];
    const unexpectedRequests: string[] = [];
    page.on('pageerror', error => errors.push(`PAGE ERROR: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`CONSOLE: ${message.text()}`);
    });
    await context.route(url => /^\/api\/v1(?:\/|$)/.test(url.pathname), async route => {
      unexpectedRequests.push(`${route.request().method()} ${route.request().url()}`);
      await route.fulfill({
        status: 501,
        json: { detail: 'Unmocked API request in a frontend-only test.' },
      });
    });
    await use();
    if (errors.length) await testInfo.attach('browser-errors', {
      body: errors.join('\n'), contentType: 'text/plain',
    });
    expect(unexpectedRequests, 'Every API request must have an explicit mock').toEqual([]);
  }, { auto: true }],
});
export { expect };
