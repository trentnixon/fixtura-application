# PostHog hygiene handoff — marketing + contentv2 + ops

**Date:** 2026-09-08  
**Project:** `214725` (US, production)  
**From:** Members app (`application` repo)  
**To:** Marketing (www), Delivery Hub (contentv2), platform ops  
**Related:** `.comms/handoff/posthog-round2-decisions.md`

---

## Why this matters

Production PostHog project `214725` is shared across marketing, members app, Delivery Hub, and (future) API server events. **Data hygiene bugs on www and contentv2 inflate volume and corrupt funnels.** The members app is verified clean — fixes below are **not** in the application repo.

---

## Required fixes (marketing + contentv2)

### 1. Stop `$opt_in` on every route change

**Symptom:** `$opt_in` event count tracks 1:1 with `$pageview` on www and contentv2.

**Cause:** `posthog.opt_in_capturing()` called from router / pageview handler instead of consent grant only.

**Fix:**

```javascript
// WRONG — in router / pageview / layout effect
posthog.opt_in_capturing();

// RIGHT — only when user clicks Accept on consent banner
if (!posthog.has_opted_in_capturing()) {
  posthog.opt_in_capturing();
}
```

**Acceptance:** Live events — `$opt_in` no longer spikes on every SPA navigation.

### 2. Confirm `autocapture: false` everywhere

Grep all Fixtura repos for `posthog.init` and confirm:

```javascript
posthog.init(key, {
  autocapture: false,
  // ...
});
```

**Symptom to fix:** `$autocapture` events from `localhost:3004` (and other dev ports) in project `214725`.

**Action:** Identify which repo/process binds port 3004; fix init options there.

### 3. Audit `www.fixtura.co.nz`

Events from `www.fixtura.co.nz` appear in production project.

- If intentional: apply same consent + init standards as `fixtura.com.au`.
- If not intentional: audit deployment, rotate key if leaked, disconnect stray init.

---

## Interim project filters (PostHog UI)

Until staging project split (see ticket 06):

- Exclude persons/events where `$internal_or_test_user = true` (once API implements server flag).
- Exclude `$host` matching `localhost` and `staging.fixtura.com.au`.

---

## Internal Strapi user IDs (shared with API ticket 07)

Provide a hardcoded list of Strapi user ids for Fixtura team / test accounts. API will set `$internal_or_test_user: true` via **server-only** `posthog-node` identify — never from client SDK.

| Strapi user id          | Label (internal) |
| ----------------------- | ---------------- |
| _(TBD — Trent to fill)_ |                  |

PostHog dashboard build (Activation & Product) is blocked on this list + `$opt_in` fix.

---

## Members app — already aligned (no action)

- `autocapture: false`
- No `opt_in_capturing()` in capture path
- `/sandbox/**` SDK path exclusion
- `cross_subdomain_cookie: true` (implemented 2026-09-08)
- Org group properties on `group('organization', …)` (implemented 2026-09-08)
- Hub links append `?phDistinctId=<strapiUserId>` (implemented 2026-09-08)

---

## Verification checklist

- [ ] Marketing: `$opt_in` fix deployed
- [ ] contentv2: `$opt_in` fix deployed
- [ ] All repos: `autocapture: false` confirmed
- [ ] Port 3004 source identified and fixed
- [ ] `www.fixtura.co.nz` audited
- [ ] Internal Strapi id list published to API team
- [ ] PostHog project filters applied (interim)
