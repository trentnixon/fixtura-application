# 03 — Organization group property enrichment

**What to build:** Extend client analytics module `groupOrganization` to accept an allowlisted property bag (name, plan, sport). Wire account-scoped bridge to set group properties once per accountId per session from existing account/billing data. Never put plan/sport/trial on person.

**Blocked by:** None (parallel with 02).

**Status:** ready-for-agent

**Owner:** Members app (this repo)

### Tasks

- [ ] Add group property allowlist (name, plan, sport) and validation helper; reject PII and unknown keys.
- [ ] Extend groupOrganization(accountId, properties?) to pass properties to PostHog group call.
- [ ] Map plan from billing summary (billingStatus, accessStatus, currentPlan, trial) to small slug enum for PostHog.
- [ ] Map sport and display name from account bootstrap row (AccountSummary / organisation details).
- [ ] Update AnalyticsAccountGroup (or equivalent bridge) to fetch account + billing context and call group with properties; ref-guard dedupe per accountId per session.
- [ ] Preserve resetGroups() on leave account scope.
- [ ] Unit tests: allowlist strips bad keys; mock client receives expected group key + properties.

### Acceptance

- PostHog Live: app events under `/o/[accountId]/*` show organization group with name, plan, sport after entering account scope.
- No person properties for plan/sport/trial set from client.
