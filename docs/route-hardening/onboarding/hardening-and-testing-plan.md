# Onboarding Hardening And Testing Plan

Status: In review

## Purpose

Create a phase-based hardening plan for account onboarding so endpoint behavior, data collection,
route lifecycle, recovery paths, and tests can be tightened in a controlled order.

This plan covers:

- `/select-organisation`
- `/create-organisation`
- `/create-organisation/setup`
- Scoped account entry from `/o/[accountId]/*`
- Customer-facing onboarding BFF routes under `/api/account/*` and `/api/accounts/[accountId]/onboarding/*`

## Current Strengths

- Lifecycle routing has a clear source of truth in `resolveAccountEntry`.
- Wizard completion unlocks scoped account access; setup/data-fetch status is surfaced without blocking users.
- Onboarding request and response types are documented in `src/types/api/account.ts`.
- Step mutations invalidate the right account bootstrap and scoped query keys.
- Unfinished-account deletion has helper logic, user copy, mutation tests, and UI coverage.
- Existing tests cover lifecycle routing, select-org card tone, setup status display, and delete eligibility.

## Current Gaps

- Multi-account "Create organisation" behavior is ambiguous and must be resolved last after the rest of the flow is hardened.
- Onboarding BFF routes repeat proxy logic instead of sharing guard, JSON parsing, Strapi forwarding, and response passthrough helpers.
- API route test coverage is uneven: `step-3` is covered, but most other onboarding routes need parity tests.
- Step 3 stores weekly asset email in `deliveryAddress`, which is contract-compatible but easy to misunderstand.
- Wizard step component and hook invalidation tests now cover Steps 0–4 (Phase 3 complete).

## Phase 1: Scope And Contract Inventory

Status: Complete — route, endpoint, and data-field matrices recorded in phase workbook.

Goal: confirm what the app believes the onboarding contract is before changing behavior.

Phase workbook: [phase-1-scope-and-contract.md](phases/phase-1-scope-and-contract.md)

## Phase 2: Lifecycle Routing And Access Gates

Status: Complete — lifecycle resolver, scoped boundary, setup client, and select-organisation route decision tests are green.

Goal: prove customers always land in the correct place for their onboarding state.

Phase workbook: [phase-2-lifecycle-routing-and-access.md](phases/phase-2-lifecycle-routing-and-access.md)

## Phase 3: Wizard Data Collection

Status: Complete — wizard step component tests (Steps 0–4) and onboarding mutation hook invalidation tests are green (58 tests).

Goal: prove each wizard step collects and submits exactly the intended data.

Phase workbook: [phase-3-wizard-data-collection.md](phases/phase-3-wizard-data-collection.md)

## Phase 4: BFF Endpoint Hardening

Status: Complete — shared BFF helpers, 15 route refactors, and 95 route/helper tests green.

Goal: make the onboarding BFF routes consistent and testable.

Phase workbook: [phase-4-bff-endpoint-hardening.md](phases/phase-4-bff-endpoint-hardening.md)

## Phase 5: Recovery, Retry, And Deletion

Status: Complete — setup status display matrix, retry/delete hooks, recovery routing, and helper error mapping covered (56 tests).

Goal: make failed or abandoned onboarding recoverable without data loss surprises.

Phase workbook: [phase-5-recovery-retry-and-deletion.md](phases/phase-5-recovery-retry-and-deletion.md)

## Phase 6: Manual Browser Checks

Status: Complete (interim sign-off — setup-`failed` retry fixtures deferred to CMS/admin)

Goal: prove the whole experience holds together outside isolated unit tests.

Phase workbook: [phase-6-manual-browser-checks.md](phases/phase-6-manual-browser-checks.md)

## Phase 7: Multi-Account Create Organisation Decision

Status: Complete — `/create-organisation` always creates a new account; explicit `accountId` resumes an owned unfinished account.

Goal: resolve the known ambiguity last, once the existing flow is stable.

Phase workbook: [phase-7-multi-account-create-organisation.md](phases/phase-7-multi-account-create-organisation.md)

## Working Order

1. Inventory and contract proof.
2. Lifecycle routing tests.
3. Wizard data collection tests.
4. BFF route parity and helper cleanup.
5. Recovery and deletion checks.
6. Manual browser pass.
7. Multi-account create organisation decision and implementation.

## Production Sign-off

- Owner:
- Known gaps:
  - Setup-`failed` retry reachability and pending-on-load loader checks deferred until CMS/admin can seed `failed` fixtures.
  - No-fixtures association/club setup state needs a dedicated follow-up fixture.
  - `/api/account/first` endpoint name is legacy; Phase 7 now depends on it supporting additional account creation, not only first-account creation.
- Test evidence:
  - Phase 6 manual browser pass (account 583): wizard complete, dashboard/season entry, setup URL redirect, branding/contact/review flows.
  - Targeted Vitest: 8 files, 63 tests passed.
  - Phase 7 targeted Vitest: 4 files, 27 tests passed.
- Production decision: Pending final owner sign-off; onboarding hardening phases complete with documented fixture follow-ups.
