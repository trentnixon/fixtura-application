# 01 — Phase 0 hygiene handoff (marketing + contentv2)

**What to build:** Cross-repo comms and verification so production PostHog project `214725` is trustworthy before funnel decisions. Members app is already clean — no code changes in this repo for opt_in/autocapture bugs.

**Blocked by:** None — start immediately (blocks trusting dashboards).

**Status:** ready-for-agent

**Owner:** Marketing + contentv2 (+ ops for co.nz / port 3004)

### Tasks

- [ ] Publish handoff to marketing repo: move `opt_in_capturing()` to Analytics Consent grant handler only; guard with `has_opted_in_capturing() === false` before calling.
- [ ] Publish handoff to contentv2: same `$opt_in` fix (1:1 with pageviews observed on contentv2).
- [ ] Grep all Fixtura repos for `posthog.init`; confirm `autocapture: false` everywhere; fix localhost:3004 source.
- [ ] Audit `www.fixtura.co.nz` events — intentional surface or disconnect/rotate key.
- [ ] Document internal Strapi user id list for `$internal_or_test_user` (shared with ticket 07).
- [ ] Verify PostHog project filters: exclude `$internal_or_test_user = true`; interim exclude `$host` localhost and `staging.fixtura.com.au`.

### Acceptance

- Live events: `$opt_in` count no longer tracks pageview count on www/contentv2.
- No new `$autocapture` from dev ports.
- Handoff doc in `.comms/handoff/` (extend `posthog-round2-decisions.md` or new file).
