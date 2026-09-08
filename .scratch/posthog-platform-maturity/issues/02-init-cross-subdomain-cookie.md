# 02 — Init: cross_subdomain_cookie

**What to build:** Explicitly set `cross_subdomain_cookie: true` in PostHog init options so anonymous distinct_id persists across www, application, and contentv2 subdomains.

**Blocked by:** None.

**Status:** ready-for-agent

**Owner:** Members app (this repo)

### Tasks

- [ ] Add `cross_subdomain_cookie: true` to init options builder in client analytics module.
- [ ] Update init options unit test snapshot/assertion.
- [ ] Confirm no regression: init still gated by feature flag + key only.

### Acceptance

- Init options test passes with new flag.
- Smoke: same browser session can be traced across subdomains after anonymous browsing (manual or PostHog Live).
