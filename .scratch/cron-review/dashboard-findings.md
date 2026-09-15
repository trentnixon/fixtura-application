# What the scraper dashboard counts

Reviewed 13 September 2026 against local source. Production figures supplied by the owner: 3,285 jobs, 3,271 completed, five failed, nine in progress, mean duration 6m 17s. The 333 Account Health rows are a separate count of parent workflow runs.

## Verified accounting behaviour

The top strip calls useScraperLogs with pageSize=1 and no scope or date filter. The backend loads the latest 10,000 matching log entries, groups them by jobId, calculates totals across those groups, then slices the displayed page. It does not count cron invocations or parent workflow runs. The sample is limited by event count, not a defined time interval. More heartbeat events can shorten the represented time span.

The All Scopes request has no scope restriction, so it includes logged scopes beyond the six named UI tabs. Each scope tab also has its own independently capped sample. Adding the six tab totals is not a reliable reconciliation of the All Scopes total.

The upper strip does not receive the lower table's date filters. The label "completed in current window" does not name a time window. The backend returns meta.dateRange, which can identify the observed sample span. The lower date inputs generate UTC day boundaries, not Sydney day boundaries.

Average duration is the mean of each grouped job's first-to-last loaded log timestamps. It is not measured CPU time. A truncated event history can also truncate that duration.

Source locations:

- Admin/fixtura-admin/src/app/dashboard/data/components/ScraperOperationsStrip.tsx
- Admin/fixtura-admin/src/app/dashboard/data/components/ScraperLogsSection.tsx
- Admin/fixtura-admin/src/hooks/data-collection/useScraperLogs.ts
- Backend/src/api/fixtura-scraper-log/controllers/handlers/ListScraperLogs.js

## Dashboard-generated traffic

The hook polls every ten seconds when its summary has any in_progress jobs. The strip and table use different query keys because they request different page sizes. With both reporting active work, they issue two independent reads per ten seconds per mounted dashboard, subject to browser/query scheduling.

Each read asks for up to 10,000 event rows including payload, groups them, computes summary and chart buckets, and returns the requested page. A one-job summary request does not reduce database input to one job. This produces monitoring traffic without starting scrapes.

For scopes other than result_run_v2, the status resolver uses the latest loaded event directly. An old job without a terminal log can remain in_progress and keep polling enabled. Thus the nine active entries are not, by themselves, proof of nine live worker processes. Their latest timestamps and queue states are needed.

Source: Backend/src/api/fixtura-scraper-log/controllers/handlers/resolveEffectiveJobStatus.js.

## Current producers that can create scraper volume

| Producer                                           | Scope and selection                                                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Monthly organisation discovery, 1st 11:30 Sydney   | clients_list; configured Australia and New Zealand cricket sources                                                                           |
| Monthly association competition refresh, 2nd 11:30 | association_to_competition; catalogue associations excluding inactive entries                                                                |
| Monthly club competition refresh, 3rd 11:30        | club_to_competition; active or unknown-active clubs with valid targets, excluding club IDs with recent links within the current 48-hour rule |
| Saturday 13:00 Global grades                       | grades_comps; every valid active competition, batches of 25                                                                                  |
| Sunday 13:00 Global grade teams                    | grades_lookup_teams; every valid grade under active competitions, batches of 25                                                              |
| Account Health                                     | Multi-step organisation/grades/teams/fixture work; the code creates association batch jobs with per-run IDs                                  |
| Account Asset Run preparation                      | grades_comps preparation plus result/fixture work; competition grades already use a configurable 24-hour default freshness rule              |
| Manual triggers                                    | Can start the same Global workflows; distinct manual run keys identify separate requests                                                     |

The Global weekly snapshot selectors do not filter by billable client membership or last successful scrape time. "Active competition" describes sports catalogue state, not an active paying client. These broad selectors are concrete candidates for reducing target volume. This does not establish that they caused the supplied production total.

Sources: Backend/src/api/global-data-workflow/services/globalDataWorkflow.js; Backend/src/api/account/controllers/services/accountHealth/index.js; Backend/src/api/account/controllers/services/accountAssetRuns/index.js; Backend/src/api/shared/services/grades-comps/refreshPlan.js; Backend/src/api/club/controllers/handlers/production/clubsFilters.js.

## Next evidence and proposed work

The useful next production artifact is the recent job table with scope, service, jobId, runId, startedAt, latestAt, and status. Inspect the nine in-progress rows for old timestamps, then group recent work by scope and parent run. Global run keys contain the workflow and scheduled week/month, or manual identity. Account Health batch IDs contain account-health and a stage name.

Separate two measurements: scrape targets processed per parent run, and monitoring/log requests per minute. A large single scheduled batch needs narrower selection; repeated refreshes of the same target need freshness/deduplication; monitoring reads need a lighter summary query and shared or slower polling.

Proposed first implementation is accurate bounded-date summary reporting, including scope counts and sample truncation, followed by shared summary polling. For scrape volume, evaluate client-relevant and stale-target filters in the Global weekly workflows. Preserve broader catalogue discovery at a slower cadence if onboarding still depends on it. No scraper cadence or filters were changed in this investigation.

## Verification

Invoked the real ListScraperLogs handler with an in-memory entityService response of 30 events across ten job IDs and one parent run. Repeated with pageSize=1 and pageSize=25. Both requested limit=10000 with empty filters and reported ten total jobs; they returned one and ten displayed rows respectively. This confirms the aggregation and query scope, not production cost or the source of the 3,285 jobs. No scraping, database writes, or external requests ran.
