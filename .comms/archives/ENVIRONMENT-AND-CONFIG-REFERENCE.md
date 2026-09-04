# Environment variables and configuration — Fixtura application

**Purpose:** Single reference for `.env` variables, build-time secrets, and non-env config used by this Next.js app.  
**Audience:** Developers, DevOps, and anyone provisioning staging/production.  
**Last reviewed:** 2026-04-04

Values are **not** secrets in this document unless noted; copy real secrets only from your password manager or host config.

---

## 1. Quick reference table

| Name                               | Required                   | Where read                                            | Role                                                                                                          |
| ---------------------------------- | -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `STRAPI_URL`                       | **Yes** for members login  | Server (`src/lib/config/env.ts`)                      | Strapi base URL (no trailing slash). Used by `POST /api/auth/login` and `fetchStrapiWithAuthCookie`.          |
| `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT` | No                         | Client + server (`src/lib/config/logout-redirect.ts`) | Path after logout and after session invalidation (401). Default behaviour when unset implies `/login`.        |
| `NEXT_PUBLIC_POSTHOG_KEY`          | **Yes** for analytics      | Client (`src/lib/analytics/analytics.ts`)             | PostHog project API key.                                                                                      |
| `NEXT_PUBLIC_FEATURE_ANALYTICS`    | **Yes** to enable capture  | Client (`src/lib/analytics/enabled.ts`)               | Must be exactly `true` (with key + consent) for events to fire.                                               |
| `NODE_ENV`                         | Automatic                  | Next.js / app                                         | `development` \| `production` \| `test`. Affects cookie `secure`, PostHog debug, React Query devtools.        |
| `CI`                               | Usually set by CI          | `next.config.ts` (Sentry plugin)                      | When set, Sentry build plugin is less silent during source-map upload.                                        |
| `SENTRY_AUTH_TOKEN`                | For production source maps | Sentry webpack plugin (build)                         | Auth token to upload source maps to Sentry. Not used at runtime.                                              |
| `NEXT_RUNTIME`                     | Set by Next                | `src/instrumentation.ts`                              | Internal; do not set manually.                                                                                |
| `NEXT_PUBLIC_ENABLE_DEV_SANDBOX`   | No                         | Server + client (`src/lib/dev-sandbox.ts`)            | When exactly `true`, `/sandbox` (portal, kitchen sink, route lab) renders; otherwise those routes return 404. |

---

## 2. Members area / Strapi

### `STRAPI_URL`

- **Example:** `http://localhost:1337` or `https://cms.example.com`
- **Rules:** No trailing slash (trimmed in code). **Server-only** — do **not** prefix with `NEXT_PUBLIC_` (keeps Strapi URL off the client bundle).
- **If missing:** Login API returns “login unavailable” style errors; server Strapi helpers return 500.
- **Align with CMS:** Canonical URLs per environment are documented in [responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md](./responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md) §1.

### `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`

- **Optional.** If unset, logout and session-invalid flows use the default login path logic in `getLogoutRedirectPath()` / `getSessionInvalidRedirectUrl()` (typically `/login`, with `?reason=session` when applicable).
- **Example:** `/` to send users to the marketing home after logout.
- **Note:** Must be a path the Next app serves; `NEXT_PUBLIC_` is required because redirect behaviour runs in the browser.

### `NEXT_PUBLIC_ENABLE_DEV_SANDBOX`

- **Optional.** Single source of truth for development sandbox routes ([`.comms/19-Dev-Sandbox-Routes.md`](../19-Dev-Sandbox-Routes.md)).
- **Enable:** set to the literal string `true` (not `True`, `1`, or empty).
- **If unset or any other value:** `/sandbox` and nested routes behave as though they do not exist (Next.js `notFound()`).
- **Local:** add `NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true` to `.env.local` when working on the sandbox portal, kitchen sink, or route lab.
- **Staging / production:** omit or set `false` so sandbox routes are not reachable.

---

## 3. Analytics (PostHog)

### `NEXT_PUBLIC_POSTHOG_KEY`

- **Required** for PostHog to initialise in `src/lib/analytics/analytics.ts` via `AnalyticsProvider` in `src/app/layout.tsx`.
- **Client-exposed** by design (`NEXT_PUBLIC_*`).

### `NEXT_PUBLIC_FEATURE_ANALYTICS`

- **Required** for events to fire: must be the literal string `true`.
- Analytics also requires browser consent (`localStorage.fixtura_analytics_consent === "granted"`, shared with marketing on `*.fixtura.com.au`).

### PostHog wiring (not env)

- `next.config.ts` rewrites `/ingest` → `https://us.i.posthog.com` (first-party proxy; `api_host` in code is `/ingest`).
- `ui_host` is fixed to `https://us.posthog.com` in `src/lib/analytics/constants.ts`.
- Init options live in `src/lib/analytics/posthog-client.ts` (explicit events only; autocapture off).

---

## 4. Observability (Sentry)

### Runtime

- **DSN** is currently set **in repository files** `sentry.server.config.ts` and `sentry.edge.config.ts` (not via `SENTRY_DSN` env in this project). To rotate DSN per environment, change those files or refactor to `process.env.SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` per Sentry’s Next.js docs.

### Build / CI

- **`SENTRY_AUTH_TOKEN`** — Used when uploading source maps during `next build` (see `.env.sentry-build-plugin` pattern in repo). Set in CI secrets or local `.env` for releases; **never commit** the token.

### Other Sentry / Next

- **`next.config.ts`** — `withSentryConfig` includes `org: "na-g0d"`, `project: "fixtura-marketing"` (build-time; change in config if the Sentry project changes).
- **`CI`** — When truthy, Sentry plugin `silent` is false so upload logs are visible (useful in pipelines).

---

## 5. Next.js and tooling (implicit)

| Mechanism      | Notes                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`     | `auth-cookie.ts`: `secure: true` on cookies in production. `query.tsx`: React Query Devtools in non-production. |
| `NEXT_RUNTIME` | Used in `instrumentation.ts` to load server vs edge Sentry config — set by the framework.                       |

---

## 6. Config that is not environment variables

| Item                            | Location                                                             | Notes                                                             |
| ------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| PostHog ingest rewrites         | `next.config.ts` `rewrites()`                                        | Proxies `/ingest` to PostHog US.                                  |
| `skipTrailingSlashRedirect`     | `next.config.ts`                                                     | PostHog compatibility.                                            |
| Sentry DSN, traces, org/project | `sentry.server.config.ts`, `sentry.edge.config.ts`, `next.config.ts` | See §4.                                                           |
| Auth cookie name / max age      | `src/lib/auth/auth-constants.ts`                                     | `fixtura_members_jwt`, 7 days.                                    |
| Cookie options                  | `src/lib/auth/auth-cookie.ts`                                        | `httpOnly`, `sameSite: lax`, `path: /`, `secure` from `NODE_ENV`. |
| Routes (`/app`, `/login`)       | `src/lib/config/routes.ts`                                           | Not env-driven.                                                   |

---

## 7. Checklist by environment

### Local development

- [ ] `STRAPI_URL` → local Strapi if testing login.
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` → dev/test project key or disable analytics if your workflow allows (otherwise ensure key exists).
- [ ] `NEXT_PUBLIC_FEATURE_ANALYTICS=true` when testing analytics locally (plus consent in localStorage).
- [ ] Optional: `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`.
- [ ] Optional: `NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true` if using `/sandbox` (portal, kitchen sink, route lab).

### Staging / production

- [ ] `STRAPI_URL` for that environment’s Strapi URL.
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (staging vs production PostHog project as per product).
- [ ] `NEXT_PUBLIC_FEATURE_ANALYTICS=true` when analytics should be live in that environment.
- [ ] `SENTRY_AUTH_TOKEN` in CI for source maps (and verify Sentry DSN/project in config files).
- [ ] Optional: `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`, `CI=true` in pipelines as needed.

---

## 8. Related files

- [`.env.example`](../.env.example) — minimal template checked into git (expand with local secrets only in `.env`, never commit secrets).
- [CMS-TEAM-MEMBERS-AREA-HANDOFF.md](./CMS-TEAM-MEMBERS-AREA-HANDOFF.md) — Strapi integration context.
- [7-MEMBERS-AREA-TECHNICAL-DECISIONS.md](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md) — cookie and auth decisions.
