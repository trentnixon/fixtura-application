# Analytics handoff — App & Hub teams

**Date:** 2026-08-23  
**From:** Marketing / platform  
**PostHog project:** `214725` (shared across all Fixtura surfaces)

## Request

Implement client analytics on App and Hub using the **same PostHog project key** as the marketing site so we can stitch journeys from first pageview through Delivery Hub usage.

## What you need to read

| Doc            | Path (marketing repo)                       |
| -------------- | ------------------------------------------- |
| Spec           | `.docs/analytics/Fixtura-Analytics-Spec.md` |
| Event catalog  | `.docs/analytics/event-catalog.md`          |
| Implementation | `.docs/analytics/implementation-guide.md`   |
| Dashboards     | `.docs/analytics/dashboards.md`             |

Clone or browse: `fixtura/marketing` on branch `staging`.

## Decisions already made

1. **One project** — not separate marketing vs product projects.
2. **`surface` on every event** — `app` or `hub` (Hub = Delivery Hub routes on App host).
3. **`identify(backendUserId)`** on login/register — never email.
4. **`group("organization", orgId)`** when org context exists.
5. **Explicit events** — no autocapture for product funnels.
6. **Shared consent key** — `localStorage.fixtura_analytics_consent` on `*.fixtura.com.au`.
7. **Sentry stays** for errors — not PostHog exception capture.
8. **Server events** for `account_created`, `email_verified`, `first_pack_delivered` (API team).

## Your deliverables

### App team

- [ ] Same env vars (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_FEATURE_ANALYTICS`)
- [ ] Init + `/ingest` proxy (or direct host)
- [ ] Consent gate (copy marketing module)
- [ ] `$pageview` with `surface: app`
- [ ] `identify()` + `conversion` `login_success` on auth
- [ ] `reset()` on logout
- [ ] Catalog events for onboarding (see proposed steps in catalog)
- [ ] PR updates `event-catalog.md` for any new events

### Hub team

- [ ] `surface: hub` on Hub routes (`hub_opened`, `pack_viewed`, `asset_downloaded`, `pack_rerun`)
- [ ] Share init/consent with App (same host)
- [ ] Confirm Hub path prefix for surface routing

### API / Strapi team

- [ ] `POSTHOG_API_KEY` in server env only
- [ ] Server capture for lifecycle events in catalog

## Marketing status (reference)

- Live: `$pageview`, `cta_clicked`, `conversion`, `form_submitted`, `user_action`
- `identify()` on register success (backend user id)
- QA: `.docs/TESTING.md` PostHog section

## App status (this repo)

- **Phase 1 (live):** client module, consent gate, `$pageview` (`surface: app`), identify/group/reset, onboarding + bundles core events
- **Phase 2 (live):** full App product analytics — gateway, activation, billing, bundles, sponsors, vision, media, dashboard, auth recovery (~70+ explicit events; see catalog)
- Event catalog (App): `.comms/handoff/analytics-app-events.md`
- Enable: `NEXT_PUBLIC_FEATURE_ANALYTICS=true` + consent + shared project key
- Hub (`surface: hub`): separate Delivery Hub codebase — not in this repo

## Open questions for you

1. **Hub path prefix** — confirm route pattern (e.g. `/hub/*`, `/delivery/*`) for `surface: hub`.
2. **Login event** — confirm where App gets stable `user.id` after sign-in for `identify()`.
3. **Monorepo** — if App + Hub share a repo, consider `@fixtura/analytics` package from marketing modules.

## Verification

Joint QA session: one user journey from marketing pricing → register → App login → Hub download, single person in PostHog with events across `marketing_site`, `app`, and `hub`.

## Contact

Update this doc with PR links when App/Hub analytics ships.
