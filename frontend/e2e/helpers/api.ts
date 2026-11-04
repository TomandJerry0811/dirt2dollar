import type { Page, Route } from '@playwright/test';
import { clients } from './data';

export function deferred() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

export async function mockClients(page: Page, gate?: ReturnType<typeof deferred>) {
  const requested: URL[] = [];
  await page.route(/\/api\/v1\/clients(?:\?|$)/, async route => {
    const url = new URL(route.request().url());
    requested.push(url);
    if (gate) await gate.promise;
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const risk = url.searchParams.get('riskLevel');
    const status = url.searchParams.get('status');
    // Simulated API contract, NOT a test of backend filtering implementation.
    const data = clients.filter(client =>
      (!search || [client.name, client.industry, client.accountManager ?? ''].some(value => value.toLowerCase().includes(search))) &&
      (!risk || client.riskLevel === risk) && (!status || client.status === status)
    );
    await route.fulfill({ json: data });
  });
  await page.route(/\/api\/v1\/clients\/test-\d+$/, async route => {
    const id = new URL(route.request().url()).pathname.split('/').pop();
    const client = clients.find(item => item.id === id);
    await route.fulfill({ status: client ? 200 : 404, json: client ?? { detail: 'Client not found' } });
  });
  return requested;
}

export const analysisEndpoint = /\/api\/v1\/client-analysis(?:\?|$)/;
export async function providerError(route: Route) {
  await route.fulfill({ status: 502, json: {
    error: 'upstream_provider_error', detail: 'AI provider temporarily unavailable.',
  } });
}
