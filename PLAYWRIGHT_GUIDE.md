# Dirt2Dollar Playwright: full 50-scenario suite

This branch adds the complete earlier suite to the latest repository source: **40 frontend scenarios (35 executable, 5 pending)** plus **10 controlled FastAPI integration scenarios**. See TEST_COVERAGE.md for scope and limitations.

## Frontend setup (PowerShell)

Use Node.js 20 or newer. From the project root:

```powershell
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e:typecheck
npm run test:e2e:headed
npm run test:e2e:report
```

Playwright starts its own Vite server on localhost:3000 with VITE_API_BASE_URL=/api/v1. Close existing servers on port 3000 first. The browser uses the actual UI and demo login. Responses under /api/v1 are mocked; no real backend or API keys are required. The fixture fails unexpected API requests and allows Vite source modules to load normally.

## Controlled backend integration setup (PowerShell)

From the frontend folder:

```powershell
cd ..
python -m venv .venv-playwright
.\.venv-playwright\Scripts\python.exe -m pip install -r requirements-playwright.txt
cd frontend
$env:PLAYWRIGHT_PYTHON = (Resolve-Path "..\.venv-playwright\Scripts\python.exe").Path
npm run test:integration -- --headed
```

Ports 3000 and 8002 must be free. The integration config starts the dedicated loopback FastAPI entrypoint and frontend automatically. Actual FastAPI routes, controllers, repositories, and analysis workflow execute; only external Supabase, Groq, Google Sheets, and embedding provider boundaries use controlled replacements. No real credentials or production data are needed.

`tests/playwright_backend.py` is for local testing only; never deploy that entrypoint. Production `src.main:app` has no test endpoints. The existing newer AI assistant and its route remain present; these 50 scenarios do not test that chat feature.

## Commands

```powershell
npm run test:e2e
npm run test:e2e:ui
npm run test:integration
npm run test:all
npx playwright show-report playwright-report-integration
```

`test:all` executes frontend first, then integration. Set PLAYWRIGHT_PYTHON in that terminal before running it. Frontend and integration have separate report and test-output directories. Traces and screenshots are retained on failure. Generated output, credentials, and virtual environments are not committed.

PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH optionally selects a compatible existing browser. Normally leave it unset and install Playwright's Chromium.

## Files

- frontend/e2e/auth.spec.ts: 10 authentication scenarios.
- frontend/e2e/ai-analysis.spec.ts: 5 analysis frontend scenarios.
- frontend/e2e/clients.spec.ts: 8 client-list frontend scenarios.
- frontend/e2e/client-details.spec.ts: 2 executable and 4 pending scenarios.
- frontend/e2e/dashboard.spec.ts: 4 dashboard scenarios.
- frontend/e2e/workflows.spec.ts: 4 workflow frontend scenarios.
- frontend/e2e/reports.spec.ts: 2 executable and 1 pending scenario.
- frontend/e2e/integration/backend.spec.ts: 10 controlled real-backend scenarios.
- frontend/e2e/helpers/: common fixtures, login, API mocks, and test data.
- frontend/playwright.config.ts and playwright.integration.config.ts: suite configuration.
- tests/playwright_backend.py and requirements-playwright.txt: integration harness and Python dependencies.

## Minimal application changes

Latest application changes are preserved. This transfer adds accessible labels to client controls, explicit dashboard loading/empty states, preservation of formatted percentage strings, real client query filters, and a lazy SentenceTransformer import so controlled tests need not install/download that model. The existing client scope and production provider behavior remain intact. Stale AI assistant, backend entrypoint, and KPI-node files from the uploaded ZIP are not copied over the current repository.

## Five pending scenarios

These are written but marked test.fixme: selected-client KPI Analytics, overview summary, historical similarity, recommendations, and frontend report file download. Those product areas still use seeded/hardcoded content or lack a download handler. Skipped tests are not passing tests. Backend TXT attachment retrieval is separately executable. The mocked PDF-generation UI test does not prove live report generation or PDF download.
