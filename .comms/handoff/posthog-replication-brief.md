# PostHog setup brief — replicate on another Fixtura subdomain

**Audience:** contentV2 (or any new Fixtura host)  
**Reference implementation:** members app (`staging.fixtura.com.au` / `application.fixtura.com.au`)  
**Date:** 2026-09-08  
**PostHog project:** `214725` (shared with www + app — do not create a new project)

---

## What we did (members app)

1. **Same-origin ingest proxy** — browser calls `/ingest` on the app host; server rewrites to PostHog US.
2. **Client init** — `posthog-js` with `api_host: '/ingest'` (relative, not a full URL).
3. **Two env vars only** — key + feature flag. No `POSTHOG_HOST` env var.
4. **Explicit events only** — autocapture off; manual `$pageview` and catalog events.
5. **No separate consent gate on the app** — members are logged-in users; analytics runs when the feature flag and key are set. (www keeps its own cookie banner — do not change www.)
6. **Verified** — `GET https://<host>/ingest/decide?v=3` returns PostHog JSON (not 404/HTML).

---

## Step 1 — Ingest proxy on the new host

Each subdomain needs **its own** `/ingest` proxy on **that origin**.

### Next.js (same as members app)

In `next.config.ts`:

- Rewrite `/ingest/static/:path*` → `https://us-assets.i.posthog.com/static/:path*`
- Rewrite `/ingest/:path*` → `https://us.i.posthog.com/:path*`
- Set `skipTrailingSlashRedirect: true` (PostHog trailing-slash requests)

### Vue / Vite / Nginx / Cloudflare (contentV2 likely)

Equivalent rule: any request to `https://contentv2.fixtura.com.au/ingest/*` proxies to `https://us.i.posthog.com/*`.

Do **not** point contentV2 at `www.fixtura.com.au/ingest` — that is cross-subdomain and easier for blockers to target.

**Smoke test (required before go-live):**

```
GET https://contentv2.fixtura.com.au/ingest/decide?v=3
```

Expect JSON with `requestId`, `config`, etc.

---

## Step 2 — Environment variables

| Variable                                                      | Value                            | Notes                    |
| ------------------------------------------------------------- | -------------------------------- | ------------------------ |
| `NEXT_PUBLIC_POSTHOG_KEY` (Next) or `VITE_POSTHOG_KEY` (Vite) | Same key as project `214725`     | Client-exposed by design |
| `NEXT_PUBLIC_FEATURE_ANALYTICS` or `VITE_FEATURE_ANALYTICS`   | `true` when analytics should run | Literal string `true`    |

**Do not set** `NEXT_PUBLIC_POSTHOG_HOST` / `VITE_POSTHOG_HOST` for this pattern — ingest is hardcoded as relative `/ingest`.

Set these in the host’s deployment config (e.g. Vercel project env for that subdomain).

---

## Step 3 — Client initialization

Install `posthog-js`. Init once on app load:

| Option                      | Value                                     |
| --------------------------- | ----------------------------------------- |
| `api_host`                  | `'/ingest'`                               |
| `ui_host`                   | `'https://us.posthog.com'`                |
| `autocapture`               | `false`                                   |
| `capture_pageview`          | `false` (emit `$pageview` explicitly)     |
| `capture_pageleave`         | `false`                                   |
| `disable_session_recording` | `true` (unless product decides otherwise) |
| `persistence`               | `'localStorage+cookie'`                   |

Only call `posthog.init()` when the feature flag is `true` **and** the key is present.

Members app reference: `src/lib/analytics/posthog-client.ts`, `src/lib/analytics/analytics.ts`.

---

## Step 4 — Events and identity

- **One PostHog project** — all Fixtura surfaces share project `214725`.
- **`surface` on every event** — members app uses `surface: 'app'`. Pick the correct surface for contentV2 (likely `hub` if it is the Delivery Hub — confirm with product).
- **`identify(backendUserId)`** after login — use Strapi/backend user id, never email.
- **`group('organization', accountId)`** when org context exists (if applicable on contentV2).
- **`reset()`** on logout.
- **Explicit events only** — follow shared event catalog in marketing repo (`.docs/analytics/event-catalog.md` on branch `staging`).

---

## Step 5 — What not to copy from www

- www PostHog setup is live — **do not change it**.
- www uses a marketing consent banner — **contentV2 does not need the app consent cookie flow** unless product/legal requires it for that surface.
- Do not use a third env var for PostHog host.

---

## Checklist for contentV2 go-live

- [ ] Host/stack confirmed (Vue SPA? Vercel? Nginx?)
- [ ] `/ingest` proxy configured on **contentv2.fixtura.com.au**
- [ ] Smoke test: `/ingest/decide?v=3` → JSON
- [ ] PostHog key + feature flag set in deployment env
- [ ] `posthog.init` with `api_host: '/ingest'`
- [ ] `surface` value agreed (`hub` vs other)
- [ ] `$pageview` + identify on login verified in PostHog Live events
- [ ] Autocapture remains off

---

## Open item for contentV2 team

Confirm **hosting platform** (Vercel / Cloudflare Pages / custom Nginx) so the exact proxy config can be pasted — the pattern is the same; only the mechanism differs from Next.js rewrites.

## References (members app repo)

- Ingest rewrites: `next.config.ts`
- Analytics module: `src/lib/analytics/`
- Env reference: `.comms/archives/ENVIRONMENT-AND-CONFIG-REFERENCE.md`
- Shared handoff: `.comms/handoff/analytics-handoff.md`
