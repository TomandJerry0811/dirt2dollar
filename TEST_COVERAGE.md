# Test coverage

| Suite | Scenarios | Executable now | Pending |
| --- | ---: | ---: | ---: |
| Authentication | 10 | 10 | 0 |
| AI Analysis | 5 | 5 | 0 |
| Clients, mocked API | 8 | 8 | 0 |
| Client Details | 6 | 2 | 4 |
| Dashboard | 4 | 4 | 0 |
| Workflows | 4 | 4 | 0 |
| Reports, mocked API | 3 | 2 | 1 |
| Real FastAPI integration | 10 | 10 | 0 |
| Total | 50 | 45 | 5 |

## Client Details

1. Health score and MRR match selected-client API values.
2. Churn probability and identity match a different selected client.
3. KPI Analytics values come from the selected client — pending: uses seeded trends.
4. Summary comes from selected-client metadata — pending: hardcoded overview summary.
5. History renders selected-client similarity records — pending: seeded history list.
6. Recommendations match selected-client action items — pending: seeded recommendations.

## Dashboard

1. All six metrics match a controlled API response, including formatted percentage and currency.
2. Loading status remains visible until the metrics response completes.
3. Zero clients show an empty state with zero-valued metrics.
4. API failure displays its message, and retry restores metrics.

## Workflows

1. Run Workflow sends exactly one POST to /workflows/w-101/execute.
2. Completed execution response displays completion.
3. Failed execution response displays failure.
4. History shows API records and search selects the right execution.

These cover frontend request/response behavior. They do not verify live monitor execution/history persistence; the analysis integration test covers the real AI pipeline through its analysis endpoint.

## Reports

1. Library displays API report name, client, status and format.
2. Generation posts selected configuration and refreshes the library with the returned report.
3. Actual browser download and file content — pending: UI download control is not connected.

The report-generation frontend test uses mocked responses. The existing real ReportsController requires clientId, whereas the generation form currently chooses clientName only; therefore successful real report generation through that form remains a product gap. Generation currently returns report metadata without durable report storage. This was not hidden by counting mocked tests as backend integration.

## Real FastAPI integration

1. Full analysis: real HTTP endpoint, all workflow stages, browser display and persisted final result.
2. Empty query rejected with 400 before provider calls.
3. Missing required query field rejected with 422.
4. Controlled external provider failure reaches the browser as 502.
5. Real clients endpoint search.
6. Real clients endpoint risk filter.
7. Real clients endpoint status filter.
8. Real clients endpoint combined filters.
9. Browser list/search/filter behavior through the real API with controlled repository data.
10. Existing backend report download endpoint returns a TXT attachment with selected-client content.

No API routes are intercepted in these tests. Provider adapters use an in-memory database and controlled AI/embedding/Google Sheets responses. The API response, persistence and provider activity are independently asserted.

The authentication, AI analysis, and clients tests remain included. The generated Playwright website sample is excluded. This suite does not cover the newer floating AI assistant chat endpoint.
