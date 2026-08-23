# 11 — Analytics hygiene and catalog sync

**What to build:** Prevent dev/admin traffic from polluting PostHog; keep event catalog and handoff docs current for Phase 2.

**Blocked by:** None — implement first or in parallel with 06

**Status:** ready-for-agent

## Tasks

### Phase 1: Path guard

- [ ] Add `isAnalyticsExcludedPath(pathname: string): boolean` in `src/lib/analytics/` — true for `/sandbox`, `/admin/system`
- [ ] Call from `captureEvent` and `capturePageView` before capture (early return)
- [ ] Unit tests: excluded paths no-op; `/o/1/dashboard` still captures

### Phase 2: Catalog

- [ ] Update `.comms/handoff/analytics-app-events.md` with all Phase 2 events (see `phase-2-plan.md`)
- [ ] Update `.comms/handoff/analytics-handoff.md` App status section — Phase 2 tickets 06–11
- [ ] Note marketing `event-catalog.md` sync as follow-up PR to marketing repo (out of scope for App-only commit unless coordinated)

### Phase 3: QA checklist

- [ ] Add Phase 2 smoke steps to `LOCAL_FEATURE_TEST_CHECKLIST.md` if file exists (org select, settings save, billing return)
- [ ] Document PostHog MCP verification queries for `surface: app` events

## Constraints

- Guard applies to all capture including identify/pageview — but identify on login from sandbox sign-in is edge case; acceptable
- Do not disable analytics in test env via path guard — tests mock client

## Completion criteria

- Navigate `/sandbox/...` with analytics enabled → no PostHog capture
- Production routes unchanged
- Catalog lists all implemented + planned Phase 2 events
