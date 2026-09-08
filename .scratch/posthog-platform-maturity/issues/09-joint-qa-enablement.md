# 09 — Joint QA: cross-surface journey

**What to build:** Signed-off smoke journey proving one PostHog person across marketing → app → hub (and server milestones when ticket 07 live).

**Blocked by:** 01 (hygiene), 03 (group props), 04 (hub handoff on contentv2), 07 (optional for full funnel).

**Status:** ready-for-agent

**Owner:** QA + product

### Journey

1. Marketing: pricing/pageview → register (`form_submitted` / register success) with Analytics Consent granted.
2. App: login → `login_success` / identify → onboarding steps → `trial_started` or activation event.
3. Bundles: `pack_viewed` → open Hub with handoff → `hub_opened` on hub surface.
4. (When server live) `account_created` / `first_pack_delivered` on same person.

### Tasks

- [ ] Run journey on staging with analytics enabled and internal user excluded from metrics check.
- [ ] Confirm single person in PostHog with events from expected surfaces and `$groups.organization` on app events.
- [ ] Confirm organization group properties present on account-scoped events (ticket 03).
- [ ] Log pass/fail and person id in QA notes (no PII in repo — reference PostHog person link only).
- [ ] Update `.comms/handoff/analytics-handoff.md` App status when passed.

### Acceptance

- One distinct person; no orphan anonymous hub-only person when handoff implemented.
- Documented in handoff or episode; blockers filed for any failed step.
