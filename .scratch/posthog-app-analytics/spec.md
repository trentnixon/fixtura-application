# Spec: PostHog client analytics (App)

Status: ready-for-agent

Related: `.comms/handoff/analytics-handoff.md`, marketing repo `.docs/analytics/*` on branch `staging`

## Problem Statement

Marketing has live PostHog analytics on the public site, but the members App does not emit compatible events. Product cannot stitch a user journey from marketing pageview through App login, onboarding, and bundles usage into a single PostHog person. The App has PostHog dependencies and an ingest proxy wired, but no client initialization, consent gate, identity lifecycle, or catalog events.

## Solution

Implement client-side PostHog analytics in the members App using the same shared PostHog project as marketing, with explicit events only (no autocapture), a shared consent key across `*.fixtura.com.au`, and `surface: app` on every App event. Wire identify/group/reset at auth and account-scope boundaries so journeys stitch with marketing and (separately) the external Delivery Hub.

## User Stories

1. As a product analyst, I want App pageviews in the same PostHog project as marketing, so that I can measure traffic and navigation inside the members area.
2. As a product analyst, I want every App event tagged with `surface: app`, so that I can filter App behaviour separately from marketing and Delivery Hub.
3. As a product analyst, I want a user who registers on marketing and later signs into the App to appear as one person in PostHog, so that acquisition-to-activation funnels are measurable.
4. As a product analyst, I want `identify` called with the backend user id (never email), so that identity is stable and privacy-safe.
5. As a product analyst, I want `group("organization", accountId)` when the user is scoped to an account, so that org-level reporting works.
6. As a product analyst, I want a `login_success` conversion event on sign-in, so that I can measure App authentication separately from marketing registration.
7. As a product analyst, I want PostHog reset on logout, so that shared-browser sessions do not leak identity.
8. As a privacy-conscious user, I want analytics to respect the same consent stored in `localStorage.fixtura_analytics_consent`, so that my choice on marketing applies on the App host.
9. As a platform engineer, I want analytics disabled unless `NEXT_PUBLIC_FEATURE_ANALYTICS` is explicitly true and a key is present, so that we can ship code without firing events prematurely.
10. As a platform engineer, I want PostHog traffic proxied through `/ingest` on the App host, so that ad blockers are less likely to block analytics.
11. As a platform engineer, I want autocapture disabled, so that only catalogued explicit events enter PostHog.
12. As a platform engineer, I want Sentry to remain the sole error-capture path, so that PostHog is not used for exceptions.
13. As a product analyst, I want onboarding wizard step events (start, step complete, abandon, finish), so that I can measure create-organisation funnel drop-off.
14. As a product analyst, I want events when a user opens the external Delivery Hub from bundles, so that I can measure App-to-Hub handoff even before Hub-native events exist.
15. As a product analyst, I want bundles list and render-detail interactions instrumented per the marketing event catalog, so that content-delivery usage inside the App is visible.
16. As a QA engineer, I want a verifiable path from marketing pricing → register → App login with one person and events across `marketing_site` and `app`, so that joint QA can sign off stitching.
17. As a developer, I want a single analytics module as the only capture entry point, so that surface tagging and consent cannot be bypassed accidentally.
18. As a developer, I want login to trigger identify after the stable user id is available from the session API, so that we do not rely on login response bodies that omit user data.
19. As a developer, I want logout to clear PostHog identity in the same place session cache is cleared, so that identity lifecycle stays consistent.
20. As a developer, I want account-scoped group assignment to follow the route `accountId`, so that group keys match how the App scopes data everywhere else.
21. As a marketing stakeholder, I want any new App-only events documented back to the shared event catalog, so that dashboards stay authoritative.
22. As a support engineer, I want no form field values or secrets in analytics payloads, so that PII and tokens never reach PostHog.
23. As a product analyst, I want select-organisation and gateway routes to emit pageviews with `surface: app`, so that pre-account navigation is included in App analytics.
24. As a product analyst, I want sandbox and internal dev routes excluded or no-op when analytics is off, so that dev traffic does not pollute production dashboards.
25. As a Delivery Hub engineer, I want App analytics scoped to `surface: app` only, so that Hub events (`surface: hub`) can ship independently in the Hub codebase with the same project key and consent key.

## Implementation Decisions

1. **Single test seam — analytics module**
   - All capture flows through one client analytics module (consent, enabled check, init, typed capture, surface injection).
   - UI and auth hooks call this module; they do not import the PostHog SDK directly.
   - Prefer testing this module and thin bridge components over testing SDK integration or layout wiring.

2. **Surface model**
   - App repo emits `surface: app` on every event.
   - External Delivery Hub (`NEXT_PUBLIC_BUNDLES_HUBS_URL`) is a separate codebase and emits `surface: hub` — out of scope here.
   - In-app bundles management (`/o/[accountId]/bundles/*`) is `surface: app`, not `hub`.

3. **Identity**
   - `identify(backendUserId)` using string id from the authenticated session API (Strapi user id).
   - Never pass email to `identify` or event properties.
   - `group("organization", accountId)` when the user is under an account-scoped route, using the URL `accountId` string.
   - Clear group context when leaving account scope if the SDK requires it.

4. **Auth integration points**
   - After successful login, once session user id is fetched, call `identify` and emit `conversion` with `login_success`.
   - On logout success, call `reset()` before redirect.
   - A session-watching bridge may re-identify on refresh when a cookie session already exists.

5. **Consent and feature flag**
   - Shared key: `localStorage.fixtura_analytics_consent` (read marketing module behaviour; port, do not reinvent).
   - Analytics runs only when consent allows AND `NEXT_PUBLIC_FEATURE_ANALYTICS === 'true'` AND `NEXT_PUBLIC_POSTHOG_KEY` is set.
   - Autocapture off; session recording off unless marketing spec explicitly requires otherwise.

6. **Transport**
   - `api_host: '/ingest'` (existing Next.js rewrites to PostHog US).
   - `ui_host: 'https://us.posthog.com'`.
   - Confirm deployed key belongs to shared PostHog project `214725` before production enablement.

7. **Module origin**
   - Port marketing's analytics module patterns into `src/lib/analytics/` (consent, init, helpers). No shared npm package in this phase.

8. **Event catalog**
   - Follow marketing `.docs/analytics/event-catalog.md` for event names and property shapes.
   - App PR updates that catalog (or a comms copy in this repo) for any App-only events added.
   - Onboarding events align with proposed catalog steps for create-organisation wizard.

9. **App-side Hub handoff**
   - When user clicks through to external Delivery Hub from bundles, emit an explicit App event (e.g. hub link opened) with `accountId` and render context — not Hub-native `pack_viewed` / `asset_downloaded`.

10. **Provider placement**
    - Client provider and pageview tracker mounted at app root so public and members routes both pageview when enabled.
    - Members-only identity bridge inside members layout or session boundary.

## Testing Decisions

- Test external behaviour of the analytics module: consent gating, feature-flag gating, capture no-ops when disabled, and mandatory `surface: app` on outbound payloads (mock PostHog client).
- Test identity helpers: identify/group/reset called with expected ids when bridge receives session and route context (mock module).
- Do not assert on PostHog SDK internals or network calls to `/ingest`.
- Prior art: vitest unit tests beside config helpers (e.g. bundles-hub tests) and hook tests with mocked services.
- Manual QA: joint journey per handoff verification section; checklist item in `LOCAL_FEATURE_TEST_CHECKLIST.md`.

## Out of Scope

- Delivery Hub (`surface: hub`) implementation — separate repo / parallel effort with same project key and consent key.
- Server-side PostHog events (`account_created`, `email_verified`, `first_pack_delivered`) — API / Strapi team.
- Extracting `@fixtura/analytics` shared package — defer until Hub + marketing sync justifies it.
- PostHog exception capture — Sentry remains authoritative.
- Marketing site changes.
- Dashboard creation in PostHog.

## Further Notes

- Current repo state: `posthog-js` installed, `/ingest` rewrites present, `instrumentation-client.ts` is Sentry-only; env docs referencing PostHog init are stale.
- Login API returns `{ ok: true }` only; user id comes from session fetch after login (already done in login form for routing).
- Register flow lives on marketing; App handles login identify only.
- Open coordination: confirm `NEXT_PUBLIC_POSTHOG_KEY` in each environment matches project `214725`.
