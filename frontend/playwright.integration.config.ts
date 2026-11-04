import { defineConfig } from '@playwright/test';
import frontendConfig from './playwright.config';

export default defineConfig({
  ...frontendConfig,
  testDir: './e2e/integration',
  outputDir: './test-results-integration',
  testMatch: '**/*.spec.ts',
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-integration', open: 'never' }]],
  webServer: [
    {
      command: `"${process.env.PLAYWRIGHT_PYTHON ?? 'python'}" -m uvicorn tests.playwright_backend:app --host 127.0.0.1 --port 8002`,
      cwd: '..', url: 'http://127.0.0.1:8002/', reuseExistingServer: false, timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host localhost --port 3000 --strictPort',
      url: 'http://localhost:3000', reuseExistingServer: false, timeout: 120_000,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:8002/api/v1' },
    },
  ],
});
