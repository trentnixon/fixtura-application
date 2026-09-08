# 06 — Staging PostHog project split

**What to build:** Separate PostHog project for staging/local dev; production key only on production hosts. Stops localhost port pollution in project `214725`.

**Blocked by:** None (ops/platform).

**Status:** ready-for-agent

**Owner:** Platform / Vercel env

### Tasks

- [ ] Create new PostHog project under Fixtura org (staging).
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY` → production Vercel projects only.
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY_STAGING` (or equivalent) → staging.fixtura.com.au + optional local dev.
- [ ] Update env reference docs and replication brief pointer.
- [ ] Communicate to team: local dev should use staging key or disable analytics unless intentionally testing production project.

### Acceptance

- Staging deploy uses different project id than production.
- No new localhost events in production project after team adopts staging key (verify after 7d).
