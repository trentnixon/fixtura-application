# 05 — Joint QA and production enablement

**What to build:** App analytics is verified end-to-end against marketing stitching, production env is correctly configured, and the handoff doc is updated with outcomes. Feature flag can be turned on safely in staging then production.

**Blocked by:** 03 — Onboarding funnel events, 04 — App product events

**Status:** ready-for-agent

- [ ] Staging `NEXT_PUBLIC_POSTHOG_KEY` confirmed as shared project `214725` (same as marketing).
- [ ] Staging run: marketing pageview → register (marketing) → App login → onboarding step → bundles → one PostHog person with `marketing_site` and `app` events.
- [ ] `LOCAL_FEATURE_TEST_CHECKLIST.md` PostHog items pass (loads only when configured, no sensitive form data).
- [ ] `.comms/handoff/analytics-handoff.md` updated with PR links and Hub-out-of-scope note for parallel Hub work.
- [ ] Production enablement steps documented: set flag true, verify consent, smoke-test login identify.
