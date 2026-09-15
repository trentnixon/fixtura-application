# Cron timing review, 13 September 2026

## Follow-up: legacy crons disabled

The owner confirmed that the only remaining legacy Heroku worker is Scheduler/Creator. The ScrapeGeneral and ScrapeResults legacy workers discussed below are no longer deployed there. Their duplicate production workload is therefore not a current saving opportunity on Heroku.

At the owner's request, ScrapeGeneral's five recurring definitions and ScrapeResults' legacy account-discovery definition now have explicit false registration guards. The definitions remain in place. The CMS legacy registry was already excluded and stays disabled. Scheduler/Creator and the separate ScrapeResults 17:00 QA registration are unchanged.

Verification invoked both legacy setup functions with scheduler/dependency spies: zero cron registrations. The separate QA setup still registered its existing 17:00 expression. Both edited JavaScript files passed syntax checks. These are local source changes, not a production deployment. The original audit below describes the state before this follow-up.

There are credible opportunities to reduce work, particularly duplicate legacy scraping, broad scheduler reads, and frequent idle polling. The count of cron callbacks alone does not establish CPU, database, or scraping cost.

This review covers the checked-out Backend registry, its task implementations and policy, and the ScrapeGeneral and ScrapeResults entry points. Production deployment revisions, replica counts, environment flags, queue history, and execution durations remain unverified. No operational schedules were changed. The review artifacts live in the members application's scratch directory because that is the current workspace.

## Current timetable

All CMS schedules explicitly resolve to Australia/Sydney. There are 32 registered jobs: nine interval jobs, 12 daily jobs, seven weekly jobs, and four monthly jobs. On a normal 24-hour day, the interval jobs produce 2,616 callbacks. Including daily jobs gives 2,628, before weekly/monthly additions. Counts are per cron-enabled process and include callbacks that immediately return because a flag is disabled. DST transition days differ.

| Job                                    | Current Sydney timing                        | Work and conditions                                                                                  |
| -------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| accountAssetRunSequence                | Every 2 minutes                              | Recover stale asset runs, continue the oldest active run, or admit due account work                  |
| reconcileResultScrapeV2                | Every 2 minutes, same tick as asset sequence | Reconcile active result runs and wake the orchestrator; recovery lease protects this sweep           |
| cronHeartbeatProbe                     | Every 5 minutes                              | Unconditional log line only                                                                          |
| queuePingProbe                         | Every 5 minutes, same tick as heartbeat      | Queue round-trip probe only when QUEUE_PING_PROBE_ENABLED=true                                       |
| recoverStrandedFixtureDiscoveryIngest  | Every 5 minutes at :03/:08/:13/...           | Recover existing stranded ingest rows                                                                |
| activatePendingOrders                  | :02/:17/:32/:47 each hour                    | Activate or recover paid orders whose Sydney start date has arrived                                  |
| sweepAccountHealthFixtureDiscovery     | :07/:22/:37/:52 each hour                    | Recover stale Account Health fixture discovery and reconcile linked pre-render work                  |
| timeoutOnboardingFixtureDiscoveryBatch | :10/:25/:40/:55 each hour                    | Fail stuck onboarding discovery items                                                                |
| checkExpiredOrders                     | Hourly at :07                                | Expire eligible paid orders                                                                          |
| cleanBullQueues                        | Daily 01:00                                  | Remove old completed/failed queue jobs                                                               |
| cleanupSportingCatalogue               | Daily 03:00                                  | Bounded catalogue deletion cascade; explicit enable flag, dry-run by default                         |
| cleanupStaleRenders                    | Daily 03:30                                  | Old completed render retention; explicit enable flag                                                 |
| hydratePlayhqLogosBatch                | Daily 03:30                                  | Missing-logo backfill, enabled by default, batch size defaults to 50                                 |
| checkTrialExpirations                  | Daily 04:00                                  | Bounded expired-trial processing                                                                     |
| cleanupAccountHealthRuns               | Daily 04:00                                  | Terminal health-run retention; explicit enable flag                                                  |
| cleanupOperationalLedgers              | Daily 04:30                                  | Operational evidence retention; explicit enable flag                                                 |
| tokenChecker                           | Daily 05:00                                  | Token renewal check                                                                                  |
| expireAbandonedStripeCheckouts         | Daily 06:00                                  | Expire stale incomplete checkouts                                                                    |
| checkSeasonPassExpirations             | Daily 09:10                                  | Paid-order expiry warnings                                                                           |
| preRenderAccountFreshness              | Daily 14:00                                  | Evaluate tomorrow's scheduled accounts against a 72-hour freshness threshold; refresh stale accounts |
| updateDailyRollups                     | Daily 23:00                                  | Aggregate current-day costs and update current-month account rollups                                 |
| updateWeeklyRollups                    | Monday 01:30                                 | Previous-week cost aggregation                                                                       |
| cleanupGradeOrderingAuditEvents        | Monday 02:00                                 | Delete grade-ordering audit events older than 12 months                                              |
| triggerGradesCompsScrape               | Saturday 13:00                               | Global current-season competition grades                                                             |
| triggerWeeklyGradeTeamsScrape          | Sunday 13:00                                 | Global current-season grade teams                                                                    |
| syncClubToAssociationLinks             | Monday 13:00                                 | Add-only relationship integrity through Global workflow                                              |
| syncAssociationToClubLinks             | Monday 13:15                                 | Reverse relationship integrity through Global workflow                                               |
| accountHealthSequence                  | Tuesday 15:00                                | Eligible active, setup, billable accounts; skip those refreshed since Monday                         |
| updateMonthlyRollups                   | 1st monthly 02:00                            | Monthly cost aggregation                                                                             |
| triggerClientsListScrape               | 1st monthly 11:30                            | Global organisation discovery                                                                        |
| triggerAssociationToCompetitionScrape  | 2nd monthly 11:30                            | Global association-to-competition discovery                                                          |
| triggerClubToCompetitionScrape         | 3rd monthly 11:30                            | Global club-to-competition discovery                                                                 |

The four cleanup gates are DATA_CLEANUP_CATALOGUE_CRON_ENABLED, DATA_CLEANUP_RENDER_CRON_ENABLED, DATA_CLEANUP_HEALTH_CRON_ENABLED, and DATA_CLEANUP_LEDGER_CRON_ENABLED. Production values were not read. Logo hydration uses PLAYHQ_LOGO_HYDRATION_CRON_ENABLED.

Source: Backend/config/cron-tasks.js and its seven imported registry modules. The adjacent inventory.json records exact expressions and notes from the review snapshot.

## Work outside the CMS cron list

| Owner                                  | Timing                               | Significance                                                                                                    |
| -------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Invoice email outbox                   | Every 15 seconds plus a startup poll | Up to 5,760 recurring polls/day/process; selects up to 20 pending/failed rows with attempts below eight         |
| Fixture discovery queue metrics        | Every 3 minutes by default           | 480 Redis count checks/day when registered; configurable or disabled with FIXTURE_DISCOVERY_METRICS_INTERVAL_MS |
| Competition grades queue metrics       | Every 3 minutes by default           | Another 480 checks/day when registered; configurable with QUEUED_COMPETITION_GRADES_METRICS_INTERVAL_MS         |
| ScrapeGeneral organisation lookup      | 1st monthly 00:00 Sydney             | Legacy independent producer                                                                                     |
| ScrapeGeneral relationship lookup      | Thursday 01:00 Sydney                | Legacy independent producer                                                                                     |
| ScrapeGeneral association competitions | Daily 03:00 Sydney                   | Expression is daily despite a comment saying Friday                                                             |
| ScrapeGeneral competition grades       | Daily 12:00 Sydney                   | Expression is daily despite a comment saying Saturday                                                           |
| ScrapeGeneral grade/game sync          | Daily 15:00 Sydney                   | Legacy independent producer                                                                                     |
| ScrapeResults fetch-test QA            | Daily 17:00 Sydney                   | Worker wires this non-project QA schedule                                                                       |

ScrapeGeneral/worker.js calls setupCronJobs in production mode. These five schedules are still executable locally; whether that worker runs in production is unknown. Its production startup also calls runDataCleanup once, which is not a recurring cron.

ScrapeResults defines a half-hour account-discovery schedule, but the inspected worker only calls setupFetchTestCron. Do not count the half-hour definition as active production work. Likewise, the CMS legacyTasks.js entries are not imported into the active registry and contribute no callbacks.

The invoice and queue-metrics workers skip observer runtime. Both normal and production CMS server configuration enable cron without an equivalent observer/leader check. Confirm how many deployed processes register cron; business locks can prevent duplicate work while leaving duplicate polling and logs.

Sources: Backend/src/api/order/controllers/services/adminInvoices/invoiceEmailOutbox.js; Backend/src/index.js; Backend/config/redis/registerFixtureDiscoveryProcessor.js; Backend/config/redis/registerQueuedCompetitionGradesProcessor.js; Scrapers/ScrapeGeneral/worker.js and core/schedulers/cronSchedules.js; Scrapers/ScrapeResults/worker.js and src/services/scheduler/cronJobs.js.

## Where policy and implementation differ

The authoritative policy reserves 23:30 to 08:00 for rendering, places ordinary maintenance at 08:00 to 11:30, permits Global work from 11:30, and stops new heavy admission at 22:30. Continuous bounded recovery and billing checks are intentional exceptions. Global workflows share an exclusive lock; a later scheduled trigger does not mean a second scraper can run concurrently.

1. Asset orchestration changed from 15 minutes to two minutes in commit 425fdcd on 17 August. This was an intentional responsiveness change. The target catalogue and recovery policy still describe 15 minutes. Result reconciliation is two minutes in the registry but one minute in those documents.
2. Retention jobs, logo hydration, and weekly/monthly cost rollups still sit inside the protected render window. Catalogue and render cleanup are gated, so runtime contention depends on production flags. Cleanup and logo hydration coincide at 03:30; trial expiry and health cleanup coincide at 04:00.
3. Heartbeat remains enabled despite being classified as temporary. Its implementation only logs and provides no durable success/progress record. Retirement depends on verifying replacement operational evidence.
4. The schedule catalogue audit reports VALID for 87 inventory jobs. Inspection shows that it compares policy and historical inventory, not the current cron registry. Passing it therefore does not establish current policy compliance or deployed state. The 87 count includes consumers and retired/manual paths, not 87 active CMS crons.

Sources: Backend/docs/data-platform/04-authoritative-cron-catalogue.md; authoritative-schedule-catalogue.json; recovery-observability-policy.json; Backend/scripts/audit-data-schedule-catalogue.js; Backend/config/cron-tasks/tasks/cronHeartbeatProbe.js.

## Proposed changes in priority order

| Priority | Proposal                                                                                                                            | Expected benefit                                                                                       | Dependency or tradeoff                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Confirm ScrapeGeneral deployment and retire its independent producers once CMS replacement outcomes are proven                      | Removes potentially duplicated whole scraping workflows; likely more useful than trimming cheap checks | Confirm deployed owners, stop producers, drain/reconcile existing jobs, preserve needed consumers                                                  |
| 1        | Keep the two-minute asset tick initially; check the orchestrator slot and active run before loading all schedulers                  | Avoid a broad database read while an existing run occupies the lane                                    | Preserve active-run continuation, due-account order, catch-up, and recovery behaviour                                                              |
| 1        | Narrow scheduler candidate reads to due/eligible accounts and required relations                                                    | Avoid repeatedly loading all scheduler renders and account orders                                      | Verify billing eligibility and overdue-run semantics against current behaviour                                                                     |
| 2        | Give invoice outbox polling a longer idle interval, initially 60 seconds, with wake-up on enqueue and retry backoff                 | Static 60-second polling would remove 4,320 polls/day/process, a 75% reduction for this worker         | Without enqueue wake-up, first-delivery polling wait can rise from 15 to 60 seconds; add exclusive claims/single-flight before concurrency changes |
| 2        | Move retention and backfills into the morning maintenance window                                                                    | Reduce contention with customer rendering                                                              | Offset starts, retain batch bounds, check run duration before claiming jobs cannot overlap                                                         |
| 2        | Retire the heartbeat when durable monitoring is verified; move two queue count loggers from 3 to 15 minutes where monitoring allows | Remove 288 heartbeat logs/day and 768 count checks/day across two registered loggers                   | Queue failure/progress detection must remain covered; queue ping tests a different round-trip property                                             |
| 2        | Generate current schedule documentation from registry metadata; audit explicit policy exceptions                                    | Make future drift visible                                                                              | Keep historical inventory separate from actual current configuration                                                                               |
| 3        | Consider a slower idle asset-admission scan only after separating it from active-run continuation                                   | A flat 2-to-15-minute change would remove 624 callbacks/day, but is not recommended as the first edit  | Current cron starts/continues a single orchestrator lane; slower ticks can accumulate delivery delays                                              |
| 3        | Review frequency of logo backfill and global integrity once backlog/change-rate evidence exists                                     | Avoid low-yield work after migration backlogs clear                                                    | Logo hydration already targets pending organisations and has an event-driven path; prove that path covers new/changed logos                        |

The asset sweep currently loads every scheduler, populated render history, and account order relations before checking whether the orchestrator slot is free. It also scans up to 100 active asset runs for recovery on each tick. This is concrete excess query scope even though its actual production cost is not measured. Source: Backend/src/api/account/controllers/services/accountAssetRuns/index.js, loadSchedulersForCron, queueDueAccountAssetRuns, recoverStaleAccountAssetRuns, and runScheduledAccountAssetCron.

The invoice outbox uses setInterval with no single-flight guard or atomic claim visible in processInvoiceEmailOutbox. A slow delivery or multiple backend processes can select the same pending row. Its enqueue idempotency key prevents duplicate row creation but does not establish exclusive delivery. Address claiming and retry spacing when revising this worker, rather than only changing its timer.

I would retain result reconciliation, stranded-ingest recovery, onboarding timeouts, order activation/expiration, and Tuesday Account Health for the first pass. Those workflows serve different states. Pre-render evaluation already checks freshness for tomorrow's schedules, and weekly health already skips fresh accounts. Confirm ACCOUNT_HEALTH_WEEKLY_IGNORE_FRESH_SINCE_MONDAY is unset/false in production before changing either cadence.

## Candidate morning maintenance timetable

These are proposed start times, not deployed changes or guarantees of non-overlap. Keep existing daily/weekly/monthly frequency unless explicitly changed below.

| Proposed Sydney start               | Work                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| 08:05 daily                         | Bull retention cleanup                                 |
| 08:15 daily                         | Daily cost rollup of the completed previous Sydney day |
| 08:35 Monday                        | Previous-week cost rollup                              |
| 08:55 on the 1st                    | Previous-month cost rollup                             |
| 09:10 daily                         | Existing expiry warnings, unchanged                    |
| 09:20 daily                         | Catalogue cleanup                                      |
| 09:40 daily                         | Old completed render cleanup                           |
| 10:00 daily                         | Terminal Account Health cleanup                        |
| 10:20 daily                         | Operational ledger cleanup                             |
| 10:40 Monday                        | Grade-ordering audit retention                         |
| 11:00 daily, then review for weekly | Missing-logo backfill                                  |

The daily rollup cannot safely move by editing its cron alone. It currently selects the current day with process-local Date methods and updates the current month. A morning run must deliberately select the previous Sydney date and its month, including the first day of a month. Verify weekly/monthly period boundaries too. If an earlier aggregation is required by a later one, enforce completion ordering; a 20-minute offset alone is not that guarantee. Keep token/trial/checkout lifecycle timings in the first pass until their business deadlines are checked.

## Evidence needed to choose the final settings

Use the most recent 14 to 21 production days. For each job capture duration, rows checked, rows changed, work enqueued, skips by reason, errors, retries, and queue age. Compare scheduled asset time with admission and delivered time. Include runtime roles, replicas, deployed commits, and non-secret feature-flag values.

Existing useful evidence includes account-asset-run sweep logs with checked/eligible/queued/skipped/recover/orch, Account Health exclusion counts, cleanup deletion summaries, and the authenticated read-only data-platform operations summary/events endpoints. Recovery events bucket successful sweeps into 15-minute intervals, so event counts alone are not exact invocation counts.

Start with producer retirement and narrower queries. Compare delivery latency and recovery outcomes after each change before reducing customer-facing cadence. Require no new missed deliveries or unresolved recovery backlog. No production metrics were supplied during this review, so numerical savings above describe calls, not infrastructure cost.

## Verification

- Generated the 32-entry inventory directly from current registry metadata without invoking jobs.
- Ran `node ../Backend/scripts/audit-data-schedule-catalogue.js` from the application root: VALID, 87 historical inventory jobs, one reserved workflow record.
- Read the production server configuration, active registry, relevant task implementations, independent worker entry points, and asset-cadence commit history.
- No jobs, database mutations, messages, deployment actions, or production schedule changes were executed.
