# 04 — Hub distinct-id handoff (app + contentv2 comms)

**What to build:** When members app opens external Delivery Hub from bundles, append opaque Strapi user id query param (`phDistinctId`) to hub URL. Publish handoff for contentv2 to identify on init, strip param from URL, never use alias.

**Blocked by:** None (needs session user id available at click time — already true via auth).

**Status:** ready-for-agent

**Owner:** Members app (URL helper) + contentv2 (identify on load)

### Tasks — members app

- [ ] Add analytics module helper: appendHandoffDistinctId(hubUrl, userId) — preserves existing query string; param name `phDistinctId`.
- [ ] Use helper where external hub links are built (bundles downloads panel / hub_opened flow).
- [ ] Unit tests: helper appends param; encodes id; does not drop existing params.
- [ ] Do not pass email or tokens.

### Tasks — comms (contentv2)

- [ ] Write `.comms/handoff/posthog-hub-identify-handoff.md` with init snippet, strip-URL pattern, and acceptance criteria.
- [ ] Document cross-subdomain cookie + param as fallback for incognito/first Hub visit.

### Acceptance

- Hub link from app includes `phDistinctId` when user is signed in.
- After contentv2 implements handoff: one PostHog person for app + hub events in joint smoke test.
