# 01 — Analytics foundation (consent, init, pageviews)

**What to build:** PostHog loads in the App only when consent allows, the feature flag is on, and a project key is configured. Every navigation emits an explicit `$pageview` with `surface: app`. Autocapture stays off. Traffic uses the existing `/ingest` proxy.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Analytics module exists as the single capture entry point (consent read, enabled check, init, capture helper with mandatory `surface: app`).
- [ ] Consent uses shared key `localStorage.fixtura_analytics_consent` (ported from marketing pattern).
- [ ] Analytics runs only when `NEXT_PUBLIC_FEATURE_ANALYTICS` is `'true'` and `NEXT_PUBLIC_POSTHOG_KEY` is set.
- [ ] PostHog init uses `api_host: '/ingest'`, autocapture disabled.
- [ ] Root layout mounts client provider and pageview tracker for App routes.
- [ ] `NEXT_PUBLIC_FEATURE_ANALYTICS` documented in env example; handoff/env reference updated.
- [ ] Unit tests cover consent gating, flag gating, and surface injection on capture (mocked client).
