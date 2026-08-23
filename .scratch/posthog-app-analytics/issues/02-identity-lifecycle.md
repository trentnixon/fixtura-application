# 02 — Identity lifecycle (identify, group, login, reset)

**What to build:** Signed-in users are identified in PostHog by backend user id. Account-scoped routes attach an organization group keyed by `accountId`. Login emits `login_success`. Logout clears PostHog identity. Returning sessions re-identify on load.

**Blocked by:** 01 — Analytics foundation

**Status:** ready-for-agent

- [ ] After login, once session user id is available, `identify(userId)` runs (string backend id, never email).
- [ ] Login emits explicit `conversion` event with `login_success` per event catalog.
- [ ] Logout calls `reset()` in the centralized logout flow before redirect.
- [ ] Session bridge re-identifies authenticated users on App load (cookie session without fresh login).
- [ ] Under `/o/[accountId]/*`, `group("organization", accountId)` is set using route `accountId`.
- [ ] Group context is cleared or updated appropriately when leaving account scope.
- [ ] Unit tests cover identify/group/reset behaviour via mocked analytics module.
