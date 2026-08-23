# 06 — Gateway, auth gaps, and setup recovery

**What to build:** Instrument the post-login gateway funnel and auth failure path so product can measure drop-off between sign-in, org selection, wizard, and background setup recovery.

**Blocked by:** Phase 1 (01–04) — shipped

**Status:** ready-for-agent

**Related:** `phase-2-plan.md` (locked Q2, Q3, Q5)

## Events

| Event                                         | Properties                                                     | Trigger                                                                            |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `conversion` `login_failed`                   | `reason_code`                                                  | Login form catch — map `ApiError` status/message to enum; never log email/password |
| `user_action` `organisation_selected`         | `accountId`, `entry_route`, `display_state`, `gateway_reason?` | `handleSelectOrganisation` success, before `router.push`                           |
| `user_action` `organisation_selection_failed` | `accountId?`                                                   | Same handler catch block                                                           |
| `user_action` `onboarding_setup_viewed`       | `accountId`                                                    | Setup recovery page when user sees `SetupStatusCard` (not immediate redirect)      |
| `user_action` `onboarding_setup_retry`        | `accountId`                                                    | Retry setup button success invoke                                                  |
| `conversion` `onboarding_setup_ready`         | `accountId`                                                    | When setup status transitions to `ready` (setup card or setup-client effect)       |

## Tasks

### Phase 1: Auth failure

- [ ] Add `reason_code` mapper in `src/lib/analytics/` (or inline in login-form) from caught errors
- [ ] Call `captureConversion('login_failed', { reason_code })` in `login-form.tsx` catch
- [ ] Ensure analytics init not required for failure events (capture should no-op if disabled — existing behaviour)

### Phase 2: Org selection

- [ ] Read `gateway_reason` from `parseSelectOrgGatewayReason(searchParams)` in select-org content
- [ ] On successful onboarding-state fetch, derive `entry_route` from `resolveAccountEntry(onboardingData)`
- [ ] Pass `display_state` from item view model when selecting from grid/list/details
- [ ] Fire `organisation_selection_failed` on catch in `handleSelectOrganisation`

### Phase 3: Setup recovery

- [ ] Fire `onboarding_setup_viewed` once per mount when recovery UI is shown (`setup-client.tsx`)
- [ ] Fire `onboarding_setup_retry` when retry mutation is invoked (`setup-status-card.tsx`)
- [ ] Fire `onboarding_setup_ready` once when status becomes `ready` (guard with ref to avoid duplicate)

### Phase 4: Catalog & tests

- [ ] Update `.comms/handoff/analytics-app-events.md`
- [ ] Add unit test for `reason_code` mapping if extracted
- [ ] Extend select-org or setup tests only if existing patterns allow lightweight assert on capture mock

## Constraints

- No PII in payloads
- Skip events when path is `/sandbox` or `/admin/system` (ticket 11 guard applies once merged)
- `gateway_reason` optional — omit when not in URL

## Completion criteria

- Smoke: login fail → event with `reason_code`; select org → `organisation_selected` with `entry_route`; setup retry → `onboarding_setup_retry`
