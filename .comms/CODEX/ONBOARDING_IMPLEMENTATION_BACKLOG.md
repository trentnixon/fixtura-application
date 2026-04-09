# Onboarding Implementation Backlog

## Purpose

Translate the onboarding scorecards and recovery plan into a practical delivery backlog across:

- frontend app
- BFF / Next API routes
- Strapi CMS
- QA / verification

This document is structured as a working backlog rather than a product brief.

---

## Delivery Goal

Deliver a controlled onboarding flow where:

- account selection resolves lifecycle before navigation
- no unfinished account can enter the scoped app
- setup preparation and failure states have clear UX
- retry works
- delete-account can be added cleanly once backend support is ready

---

## Epic 1: Enforce Lifecycle Before Dashboard Entry

### Status

Completed

### Completion note

Epic 1 has been implemented and verified in code:

- `/select-organisation` now resolves `onboarding-state` before navigation
- scoped route protection now blocks unfinished accounts from entering `/o/[accountId]/...`
- invalid and forbidden account redirects remain intact

Verification completed through code review and lifecycle resolver tests.

### Outcome

Users cannot enter `/o/[accountId]/...` unless the account is actually ready.

### Status (2026-04-08)

**Completed** in app: lifecycle routing uses `accountEntryFromOnboardingState` ([`resolve-account-entry.ts`](d:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)) from both organisation selection and scoped layout boundary.

**Verification (code + automated):**

- **1.1** — `handleSelectOrganisation` fetches GET onboarding-state, then `router.push(accountEntryFromOnboardingState(...))` (non-simulator). Acceptance: no blind dashboard navigation when APIs succeed.
- **1.2** — `OrgAccessBoundary` loads org context first; on success loads onboarding-state; if intent ≠ `dashboard`, `router.replace` to wizard or preparation. Invalid/forbidden org still uses `selectOrganisationUrlWithReason` (unchanged).
- **Dev simulator** — When `NEXT_PUBLIC_SELECT_ORG_SIMULATOR=true` and `?orgSim=` is set, selection **intentionally** skips onboarding-state and pushes the scoped dashboard so picker/layout states can be tested without lifecycle APIs (see comment in `select-organisation-content.tsx`).
- **Server-side gate** — **Waived for Epic 1**: enforcement is client-side in `OrgAccessBoundary` (brief loader/redirect before children). A future hardening pass can add a server `redirect()` in the scoped layout if product requires zero scoped HTML before `isSetup`.
- **Tests** — [`src/lib/onboarding/epic1-lifecycle-gate.test.ts`](d:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/epic1-lifecycle-gate.test.ts) locks the Epic 1 routing matrix; [`resolve-account-entry.test.ts`](d:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.test.ts) covers resolver branches.

### Ticket 1.1 — Done

`select-organisation` resolves onboarding-state before navigation

### Scope

- replace direct dashboard links with lifecycle-based navigation
- fetch onboarding-state on account selection
- route to dashboard, wizard, or preparation UI based on lifecycle

### Files

- [`src/app/(members)/select-organisation/select-organisation-content.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/select-organisation/select-organisation-content.tsx>)

### Acceptance criteria

- selecting an account no longer blindly opens dashboard
- lifecycle is resolved before route transition

### Status

Completed

### Completion note

Implemented in:

- [`src/app/(members)/select-organisation/select-organisation-content.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/select-organisation/select-organisation-content.tsx>)
- [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)

---

### Ticket 1.2 — Done

Scoped route boundary blocks unfinished accounts

### Scope

- extend scoped route protection to include readiness checks
- redirect unfinished accounts back into onboarding recovery
- preserve current invalid-org and forbidden-org redirects

### Files

- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)
- [`src/app/(members)/o/[accountId]/layout.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/o/[accountId]/layout.tsx>)

### Acceptance criteria

- deep links to `/o/[accountId]/...` are blocked for unfinished accounts
- invalid and forbidden accounts still go to `/select-organisation?reason=...`

### Status

Completed

### Completion note

Implemented in:

- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)
- [`src/app/(members)/o/[accountId]/layout.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/o/[accountId]/layout.tsx>)

---

## Epic 2: Correct Wizard Completion Behavior

### Status

Completed

### Completion note

Epic 2 has been implemented and verified in code:

- wizard completion no longer unlocks dashboard on its own
- only `isSetup === true` opens the dashboard
- completed-but-unready accounts now route to preparation
- unfinished onboarding still resumes correctly

Verification completed through code review and updated lifecycle resolver tests.

### Outcome

Wizard completion no longer unlocks dashboard prematurely.

### Ticket 2.1

Remove wizard-complete shortcut to dashboard

### Scope

- stop treating `hasCompletedOnboardingWizard` as equivalent to readiness
- allow dashboard entry only when `isSetup === true`

### Files

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

### Acceptance criteria

- completed wizard plus `isSetup === false` no longer redirects to dashboard
- only ready accounts enter dashboard

### Status

Completed

### Completion note

Implemented in:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)
- [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)

---

### Ticket 2.2

Keep wizard resume behavior for unfinished onboarding

### Scope

- preserve route logic for:
  - `not_started`
  - `in_progress`
- ensure `completed` goes to preparation screen instead of wizard steps

### Acceptance criteria

- wizard starts correctly for new accounts
- wizard resumes correctly for in-progress accounts
- completed accounts do not reopen as editable wizard unless explicitly designed later

### Status

Completed

### Completion note

Implemented in:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)
- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)

---

## Epic 3: Add Setup Preparation And Recovery UI

### Status

Completed

### Completion note

Epic 3 has been implemented and verified in code:

- gateway preparation route exists at `/create-organisation/setup`
- live preparation screen mounts `SetupStatusCard`
- setup status is polled while preparation is in progress
- ready state redirects to dashboard
- failed state shows retry in the live preparation flow

Verification completed through code review and targeted middleware and component tests.

### Outcome

Users see a clear preparation state after confirm and a clear recovery state on failure.

### Ticket 3.1

Create setup/preparation route in gateway layer

### Scope

- add a dedicated route for setup preparation and recovery
- keep this route in the gateway flow rather than the scoped app shell

### Suggested route

- `/create-organisation/setup?accountId=:id`

### Acceptance criteria

- completed but unfinished accounts land on preparation UI
- this route becomes the standard recovery destination

### Status

Completed

### Completion note

Implemented in:

- [`src/app/(members)/create-organisation/setup/page.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/page.tsx>)
- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)
- [`src/middleware.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/middleware.ts)

Verified by:

- [`src/middleware.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/middleware.test.ts)

---

### Ticket 3.2

Mount `SetupStatusCard` in live flow

### Scope

- render setup status UI in the preparation route
- poll setup-status until ready or failed
- redirect to dashboard when ready

### Files

- new route files under `src/app/(members)/create-organisation/...`
- [`src/app/(members)/create-organisation/_components/setup-status-card.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.tsx>)

### Acceptance criteria

- users see setup progress after confirm
- users are automatically routed to dashboard when ready

### Status

Completed

### Completion note

Implemented in:

- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)
- [`src/app/(members)/create-organisation/_components/setup-status-card.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.tsx>)

Verified by:

- [`src/app/(members)/create-organisation/_components/setup-status-card.test.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.test.tsx>)

---

### Ticket 3.3

Expose retry flow in live preparation screen

### Scope

- wire `useRetryOnboardingSetup(accountId)` into live recovery screen
- surface retry only when failure state allows it

### Files

- [`src/lib/api/hooks/account/useRetryOnboardingSetup.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/hooks/account/useRetryOnboardingSetup.ts)
- preparation route and status UI

### Acceptance criteria

- failed setup displays retry action
- successful retry returns to queued/running state

### Status

Completed

### Completion note

Gateway preparation route [`/create-organisation/setup`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/page.tsx>) polls setup status via existing BFF routes, redirects to the dashboard when onboarding-state reports `isSetup`, and surfaces retry on terminal failure. Middleware treats nested `/create-organisation/*` paths as gateway-protected (same cookie gate as the wizard). Automated coverage: [`src/middleware.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/middleware.test.ts), [`setup-status-card.test.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.test.tsx>).

---

## Epic 4: Centralize Lifecycle Route Decisions

### Status

Completed

### Completion note

Tickets 4.1–4.2 are delivered in app code. Shared resolver: [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts). Tests: [`resolve-account-entry.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.test.ts), [`epic1-lifecycle-gate.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/epic1-lifecycle-gate.test.ts). Reused in [`select-organisation-content.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/select-organisation/select-organisation-content.tsx>), [`create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>), [`org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx), and [`setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>) (preparation screen uses `resolveAccountEntry` for wizard, dashboard, and invalidate branches). **No CMS endpoint updates** were required — Epic 4 only consumes existing **GET** `onboarding-state` `data`. See also Epic 1 completion note (same resolver).

### Outcome

Route rules are defined once and reused consistently.

### Ticket 4.1

Create shared onboarding route resolver

### Status

Completed

### Scope

- create a utility that maps `OnboardingStateData` into route intent
- reuse it in:
  - select-organisation
  - create-organisation wizard
  - scoped route boundary

### Suggested file

- `src/lib/onboarding/resolve-account-entry.ts`

### Acceptance criteria

- route decision logic is not duplicated across multiple features

---

### Ticket 4.2

Add tests for resolver logic

### Status

Completed

### Scope

- cover:
  - not started
  - in progress
  - completed but not ready
  - ready
  - failed

### Acceptance criteria

- lifecycle route behavior is testable independently of page components

---

## Epic 5: BFF Contract Completion

### Status

Completed

### Completion note

Epic 5 has been implemented and documented:

- onboarding lifecycle BFF routes now use a shared Strapi-to-Next response adapter
- payload and status pass-through behavior is documented and test-covered
- delete-account BFF preparation work is captured as a placeholder integration plan pending CMS contract finalization

Verification completed through code review, shared adapter tests, and Epic 5 implementation notes.

### Outcome

The Next app has stable app-facing endpoints to support lifecycle routing and recovery.

### Scope note (CMS / BFF vs Epic 4)

- **Epic 4** does not require Strapi or BFF changes; it only derives routes from the existing **GET** `onboarding-state` response body (`OnboardingStateData`) on the client.
- **CMS accuracy** (correct `isSetup`, wizard flags, pipeline enums) and **BFF fidelity** (proxy preserves payload semantics, stable error codes) are in scope here — especially **Ticket 5.1** — not under Epic 4.

### Ticket 5.1

Confirm BFF alignment with onboarding-state and setup-status contract

### Scope

- verify BFF routes faithfully proxy and preserve payload semantics
- confirm error handling remains stable for frontend routing logic

### Files

- [`src/app/api/accounts/[accountId]/onboarding/onboarding-state/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/onboarding-state/route.ts)
- [`src/app/api/accounts/[accountId]/onboarding/setup-status/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/setup-status/route.ts)
- [`src/app/api/accounts/[accountId]/onboarding/retry-setup/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/retry-setup/route.ts)

### Acceptance criteria

- lifecycle payloads are passed through consistently
- expected error codes and statuses are preserved

### Status

Completed

### Completion note

Implemented in:

- [`src/app/api/accounts/[accountId]/onboarding/onboarding-state/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/onboarding-state/route.ts)
- [`src/app/api/accounts/[accountId]/onboarding/setup-status/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/setup-status/route.ts)
- [`src/app/api/accounts/[accountId]/onboarding/retry-setup/route.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/api/accounts/[accountId]/onboarding/retry-setup/route.ts)
- [`src/lib/api/bff/next-response-from-strapi-fetch.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/bff/next-response-from-strapi-fetch.ts)

Verified by:

- [`src/lib/api/bff/next-response-from-strapi-fetch.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/bff/next-response-from-strapi-fetch.test.ts)
- [`src/app/(members)/create-organisation/.comms/epic-5-bff-contract-verification.md`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/.comms/epic-5-bff-contract-verification.md>)

---

### Ticket 5.2

Prepare BFF support for delete-account endpoint

### Scope

- add placeholder integration plan once Strapi contract is final
- define invalidation behavior and frontend mutation shape

### Acceptance criteria

- BFF implementation path is ready when CMS endpoint lands

### Status

Completed

### Completion note

Prepared in:

- [`src/app/(members)/create-organisation/.comms/epic-5-ticket-5-2-delete-account-bff-placeholder.md`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/.comms/epic-5-ticket-5-2-delete-account-bff-placeholder.md>)

The placeholder captures:

- intended BFF route pattern
- `route-definitions.ts` / `accountApi` / hook follow-on work
- invalidation behavior baseline
- frontend mutation shape once CMS contract is final

---

## Epic 6: CMS Recovery Completion

### Outcome

Strapi supports full recovery, not just retry.

### Ticket 6.1

Finalize delete-account contract for unfinished accounts

### Scope

- define endpoint
- define eligibility rule
- define success and failure responses

### Recommendation

- allow delete only when `isSetup === false`

### Acceptance criteria

- contract documented and approved by app + CMS teams

---

### Ticket 6.2

Implement delete-account endpoint

### Scope

- add delete or archive behavior in Strapi
- ensure ownership and state validation
- return stable error codes

### Acceptance criteria

- unfinished account can be deleted safely
- ready accounts cannot be deleted through onboarding recovery flow

---

### Ticket 6.3

Formalize retry/delete/support policy

### Scope

- define when each recovery action is shown
- ensure CMS status codes and payloads support those choices

### Acceptance criteria

- frontend does not need to guess recovery behavior

---

## Epic 7: QA And Verification

### Outcome

All lifecycle branches are verified end-to-end.

### Ticket 7.1

Frontend route-flow QA

### Scope

- test account selection routing
- test deep links to scoped routes
- test wizard resume
- test preparation-to-dashboard transition

### Acceptance criteria

- no unfinished account can bypass lifecycle gating

---

### Ticket 7.2

CMS lifecycle-state QA

### Scope

- confirm status transitions after:
  - confirm
  - setup running
  - setup success
  - setup failure
  - retry

### Acceptance criteria

- worker state and lifecycle payload remain aligned

---

### Ticket 7.3

Recovery-path QA

### Scope

- verify retry behavior
- verify delete behavior when implemented
- verify support-only states if any remain

### Acceptance criteria

- all failure paths produce a clear next action

---

## Backlog By Team

## Frontend App

- Ticket 1.1
- Ticket 1.2
- Ticket 2.1
- Ticket 2.2
- Ticket 3.1
- Ticket 3.2
- Ticket 3.3
- Ticket 7.1

## BFF / Next API

- Ticket 5.1
- Ticket 5.2

## Strapi CMS

- Ticket 6.1
- Ticket 6.2
- Ticket 6.3
- Ticket 7.2

## Shared QA / Product Verification

- Ticket 7.3

---

## Recommended Sequence

## Phase 1

- Ticket 2.1
- Ticket 1.1
- Ticket 1.2

Reason:

These are the minimum changes needed to stop premature dashboard access.

## Phase 2

- Ticket 3.1
- Ticket 3.2
- Ticket 3.3

Reason:

These make the recovery and preparation flow complete and maintainable. (Ticket 4.1 was completed under Epic 4 alongside the shared resolver.)

## Phase 3

- Ticket 5.1
- Ticket 6.1
- Ticket 6.2
- Ticket 6.3

Reason:

These close the backend recovery gaps, especially delete-account.

## Phase 4

- Ticket 7.1
- Ticket 7.2
- Ticket 7.3

Reason:

These harden the flow and reduce regression risk. (Ticket 4.2 — resolver tests — completed under Epic 4.)

---

## Definition Of Done

The onboarding backlog should be considered complete when:

1. account selection resolves lifecycle before navigation
2. dashboard access is blocked unless `isSetup === true`
3. completed-but-unready accounts see preparation UI
4. failed setup shows retry
5. unfinished account delete exists or is explicitly accepted as deferred
6. deep-link bypass is closed
7. lifecycle route logic is centralized
8. key lifecycle branches are covered by tests and QA

---

## Related Documents

- [`ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md)
- [`ONBOARDING_PRODUCT_DECISION_BRIEF.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ONBOARDING_PRODUCT_DECISION_BRIEF.md)
