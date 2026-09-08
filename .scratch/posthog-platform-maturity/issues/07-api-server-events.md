# 07 — API server events + internal user flag (Strapi)

**What to build:** posthog-node in Strapi/API for lifecycle captures and trusted `$internal_or_test_user` person property. Not implemented in members app repo — comms + coordination.

**Blocked by:** Internal Strapi user id list from ticket 01.

**Status:** ready-for-agent

**Owner:** API / Strapi team

### Tasks

- [ ] Publish `.comms/API/handoff/posthog-server-events.md` (or extend existing API handoff) with capture contract.
- [ ] Configure `POSTHOG_API_KEY` server env only (never client).
- [ ] Implement capture: `account_created`, `email_verified`, `first_pack_delivered` with distinctId = Strapi user id, surface = api, `$groups: { organization: accountId }` when known.
- [ ] Implement server identify for hardcoded internal Strapi ids: `$internal_or_test_user: true`.
- [ ] Never send email, names, or Stripe secrets in properties.

### Capture shape (reference)

```
distinctId: strapiUserId
event: account_created | email_verified | first_pack_delivered
properties: { surface: 'api', $groups: { organization: accountId } }
```

### Acceptance

- Server events appear in PostHog Live with correct distinctId and group.
- Internal team logins flagged server-side; project filter excludes them from default insights.
