# PostHog server events handoff — Strapi / API

**Date:** 2026-09-08  
**Project:** `214725` (US, production)  
**From:** Members app (`application` repo)  
**To:** API / Strapi team  
**Blocked by:** Internal Strapi user id list (see `.comms/handoff/posthog-hygiene-handoff.md`)

---

## Purpose

Capture lifecycle milestones and trusted person properties from the server. Client SDK must **not** set `$internal_or_test_user` or send PII.

---

## Environment

| Variable          | Where              | Notes                                                            |
| ----------------- | ------------------ | ---------------------------------------------------------------- |
| `POSTHOG_API_KEY` | Strapi server only | Project API key — **never** expose to browser                    |
| `POSTHOG_HOST`    | Strapi server      | `https://us.i.posthog.com` (or first-party proxy if added later) |

Use `posthog-node` (or equivalent HTTP capture). Do not bundle in client.

---

## Events to capture

| Event                  | When                               | distinctId     | Group                                |
| ---------------------- | ---------------------------------- | -------------- | ------------------------------------ |
| `account_created`      | New org/account provisioned        | Strapi user id | `organization: accountId` when known |
| `email_verified`       | Email verification completes       | Strapi user id | `organization: accountId` when known |
| `first_pack_delivered` | First render/pack delivered to org | Strapi user id | `organization: accountId`            |

### Capture shape

```javascript
posthog.capture({
  distinctId: String(strapiUserId),
  event: "account_created", // or email_verified | first_pack_delivered
  properties: {
    surface: "api",
    accountId: String(accountId), // when applicable
  },
  groups: accountId ? { organization: String(accountId) } : undefined,
});
```

---

## Internal / test users (server-only)

Maintain a hardcoded list of Strapi user ids (Fixtura team, QA, demo accounts). On relevant auth/session hooks, **server identify**:

```javascript
posthog.identify({
  distinctId: String(strapiUserId),
  properties: {
    $internal_or_test_user: true,
  },
});
```

**Never** set this property from browser SDK.

PostHog project default insights should filter `$internal_or_test_user != true`.

---

## Privacy rules

**Never send in event or identify properties:**

- Email addresses
- Passwords or tokens
- Full names (use org display name on **group** only from client allowlist)
- Stripe secrets, checkout URLs, session ids

---

## Acceptance criteria

- [ ] `posthog-node` configured with server-only env vars
- [ ] Three lifecycle events appear in PostHog Live with correct `distinctId` and `$groups.organization`
- [ ] Internal ids flagged via server identify; excluded from default dashboards
- [ ] No PII in captured properties (audit sample events in Live)

---

## Client catalog reference

Members app event catalog: `.comms/handoff/analytics-app-events.md`  
Platform decisions: `.comms/handoff/posthog-round2-decisions.md`
