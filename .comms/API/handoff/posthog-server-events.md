# PostHog server events handoff — Strapi / API

**Date:** 2026-09-08  
**Project:** `214725` (US, production)  
**From:** Members app (`application` repo)  
**To:** API / Strapi team  
**Execution spec:** `TKT-POSTHOG-001` in Backend `.comms/posthog/.docs/Tickets.md`  
**Implementation status:** Shipped Backend `master` `e99743b` — see `.comms/handoff/cms-handoff-posthog-server-events-shipped.md`. Live capture pending `POSTHOG_API_KEY` on CMS Heroku + joint QA.

---

## Purpose

Capture lifecycle milestones and trusted person properties from the server. Client SDK must **not** set `$internal_or_test_user` or send PII.

Lifecycle captures are **not blocked** on the internal Strapi user id list. Server `$internal_or_test_user` identify ships as fast follow when the list is published (see `.comms/handoff/posthog-hygiene-handoff.md`).

---

## Environment

| Variable          | Where              | Notes                                                            |
| ----------------- | ------------------ | ---------------------------------------------------------------- |
| `POSTHOG_API_KEY` | Strapi server only | Project API key — **never** expose to browser                    |
| `POSTHOG_HOST`    | Strapi server      | `https://us.i.posthog.com` (or first-party proxy if added later) |

Use `posthog-node` (or equivalent HTTP capture). Do not bundle in client.

**Rollout:** prod + staging send when keys set; local no-op by default. Document var names only in `.env.example`.

---

## Surfaces

Fourth canonical surface: **`api`** (alongside `marketing_site`, `app`, `hub`). All server events include `surface: "api"`.

Cross-reference: `marketing/docs/adr/0001-single-posthog-project-cross-surface.md`

---

## Events to capture

| Event                  | When                                        | distinctId            | Group                            |
| ---------------------- | ------------------------------------------- | --------------------- | -------------------------------- |
| `account_created`      | New account row via account creator service | Strapi user id        | `organization: accountId`        |
| `email_verified`       | User `confirmed` false → true               | Strapi user id        | **omit** (account may not exist) |
| `first_pack_delivered` | First eligible render per account           | Account owner user id | `organization: accountId`        |

### `first_pack_delivered` definition

**`Complete === true && Processing === false && at least one download`** on the render. Does not require `EmailSent`. Server milestone = assets exist; client `pack_viewed` = user saw them.

**Idempotency (v1):** query prior eligible renders for the account; rare concurrent duplicates acceptable. Escalate to persisted account timestamp only if Live Events show real dupes.

### Capture shape

```javascript
posthog.capture({
  distinctId: String(strapiUserId),
  event: "account_created", // or email_verified | first_pack_delivered
  properties: {
    surface: "api",
    accountId: String(accountId), // when applicable; omit for email_verified
  },
  groups: accountId ? { organization: String(accountId) } : undefined,
});
```

---

## Hook map

| Event                  | Hook                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `account_created`      | Account creator service — after successful create only; not on idempotent reuse; not on raw account CRUD   |
| `email_verified`       | Users-permissions user lifecycle `afterUpdate` — `confirmed` false → true only                             |
| `first_pack_delivered` | New render afterUpdate notifier — after rollup/completion guards; explicit eligibility + query idempotency |

**Analytics noise note:** legacy `POST /account/createAccount` is unauthenticated; events trust body `user` id. Separate from auth hardening.

---

## Internal / test users (server-only)

Maintain a hardcoded list of Strapi user ids (Fixtura team, QA, demo accounts). On user lifecycle create/update when id in list, **server identify**:

```javascript
posthog.identify({
  distinctId: String(strapiUserId),
  properties: {
    $internal_or_test_user: true,
  },
});
```

**Never** set this property from browser SDK. Optional follow-up: auth middleware on every request if dashboard hygiene still leaks.

PostHog project default insights should filter `$internal_or_test_user != true`.

---

## Privacy rules

**Never send in event or identify properties:**

- Email addresses
- Passwords or tokens
- Full names (use org display name on **group** only from client allowlist)
- Stripe secrets, checkout URLs, session ids

---

## Failure posture

- Unconfigured env: no-op
- Configured but capture fails: log and continue — never block account creation or render lifecycle
- `posthog.shutdown()` on Strapi teardown when configured

---

## Acceptance criteria

- [ ] `posthog-node` configured with server-only env vars
- [ ] Three lifecycle events appear in PostHog Live with correct `distinctId` and `$groups.organization` where applicable
- [ ] Internal ids flagged via server identify when list populated; excluded from default dashboards
- [ ] No PII in captured properties (audit sample events in Live)
- [ ] Unit tests on pure decision functions; manual Live Events checklist passed on staging

---

## Client catalog reference

Members app event catalog: `.comms/handoff/analytics-app-events.md`  
Platform decisions: `.comms/handoff/posthog-round2-decisions.md`  
CMS canonical handoff: `Backend/.comms/posthog/request/posthog-server-events.md`
