# Onboarding Scorecard And Workplan

## Purpose

Provide a sharper assessment of the current Fixtura onboarding experience across the Next.js members app and the Strapi CMS, including:

- current score out of 100
- category-by-category scoring
- what is working well
- what needs work
- what is missing
- how to do the work

This document is intended to be a practical product and implementation brief, not just a summary.

---

## Executive Score

## Overall Score: 62 / 100

This is a credible onboarding foundation with the right lifecycle model, but the production flow is not yet enforcing the rules that model requires.

### Plain-language assessment

- The architecture is stronger than the live route behavior.
- The app understands onboarding conceptually better than it currently enforces it.
- The CMS lifecycle contract is ahead of the frontend route gating.
- Recovery exists in parts, but not yet as a complete user journey.

### High-level verdict

The onboarding system is:

- structurally promising
- partially integrated
- not yet operationally strict enough for production-grade account readiness control

---

## Scorecard

| Category                                  | Score | Assessment                                                                                           |
| ----------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Lifecycle model and contract              | 85    | Strong. The app and CMS now model wizard completion separately from account readiness.               |
| Frontend onboarding wizard                | 74    | Good structure and resume behavior, but final routing logic is too permissive.                       |
| Route gating and access control           | 42    | Main weakness. Unfinished accounts can still reach the scoped app too early.                         |
| Recovery and resume UX                    | 55    | Partial. Resume exists, but setup-preparation and failure recovery are incomplete.                   |
| Setup progress and background preparation | 68    | Good raw pieces exist, but they are not fully wired into the live flow.                              |
| CMS readiness and API shape               | 78    | Strong overall direction. Main gap is aligning app consumption and adding delete support.            |
| Operational completeness                  | 46    | Missing delete-account path, unified route resolver, and complete end-to-end QA coverage.            |
| Product clarity in code                   | 60    | The docs are fairly clear, but the live code does not yet consistently enforce the documented rules. |

---

## What We Do Well

## 1. The lifecycle model is now correct

The biggest strategic win is that onboarding is no longer treated as one flat boolean.

The current system distinguishes:

- wizard progress
- wizard completion
- initial setup progress
- initial data fetch progress
- final account readiness

That is the correct shape for the problem.

Relevant references:

- [`src/types/api/account.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/types/api/account.ts)
- [`.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md)

Why this matters:

- users can finish the form without pretending the account is already ready
- setup can run asynchronously without corrupting app state
- future retry and operational support flows become possible

---

## 2. The app already has the right lifecycle hooks

The frontend already has:

- `useOnboardingOnboardingState`
- `useOnboardingSetupStatus`
- `useRetryOnboardingSetup`

Relevant files:

- [`src/lib/api/hooks/account/useOnboardingOnboardingState.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/hooks/account/useOnboardingOnboardingState.ts)
- [`src/lib/api/hooks/account/useOnboardingSetupStatus.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/hooks/account/useOnboardingSetupStatus.ts)
- [`src/lib/api/hooks/account/useRetryOnboardingSetup.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/hooks/account/useRetryOnboardingSetup.ts)

This is good because the frontend does not need a conceptual rewrite. It mostly needs route and shell integration work.

---

## 3. Wizard resume behavior is already partly implemented

The onboarding wizard already reads onboarding-state and resumes when the wizard is:

- `not_started`
- `in_progress`

Relevant file:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

This means the hardest part of state continuity is already underway.

---

## 4. The route architecture is conceptually strong

The application already has a good layered model:

- public
- authenticated but unscoped gateway
- authenticated and organisation-scoped app

Relevant references:

- [`src/middleware.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/middleware.ts)
- [`.comms/archives/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/archives/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md)

This is the right architecture for multi-organisation account resolution. The main issue is enforcement, not overall design.

---

## 5. Setup polling and retry UI already exist

The app already contains a useful `SetupStatusCard` with:

- polling
- failure display
- retry support

Relevant file:

- [`src/app/(members)/create-organisation/_components/setup-status-card.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.tsx>)

This is an important asset. It means the recovery layer is partly built, even though it is not yet connected to the user journey.

---

## Where We Need Work

## 1. Route gating is too weak

### Current issue

Users can currently reach `/o/[accountId]/dashboard` too early.

That happens because:

- `/select-organisation` links straight to dashboard
- scoped route protection checks account access, not lifecycle readiness

Relevant files:

- [`src/app/(members)/select-organisation/select-organisation-content.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/select-organisation/select-organisation-content.tsx>)
- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)

### Why this matters

This is the single largest product risk in the onboarding flow.

It creates:

- premature app entry
- inconsistent state across users
- confusion about whether setup is really complete
- higher support load when accounts appear usable but are not actually ready

### Required fix

Before any account enters the scoped app:

- fetch onboarding-state
- gate access using `isSetup`

Only `isSetup === true` should allow dashboard access.

---

## 2. Wizard completion is currently treated as readiness

### Current issue

The wizard currently allows dashboard entry when:

- `hasCompletedOnboardingWizard === true`

That is incorrect relative to the lifecycle contract.

Relevant file:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

### Why this matters

This collapses two separate milestones:

- form completion
- account readiness

That breaks the core value of the new lifecycle model.

### Required fix

Change the eligibility rule so:

- only `isSetup === true` opens dashboard

If the wizard is complete but setup is still running or failed:

- route to setup/preparation UI

---

## 3. Recovery UX is incomplete

### Current issue

The app has partial recovery mechanics but not a complete recovery flow.

What exists:

- wizard resume
- setup polling component
- retry mutation

What does not yet exist as a complete journey:

- dedicated preparation screen
- failure recovery route
- delete-account route and action
- consistent redirect behavior from scoped routes back into onboarding recovery

### Why this matters

When onboarding fails or stalls, the user needs a clear next step. Right now the system has components, but not a unified path.

### Required fix

Add a dedicated onboarding recovery/preparation route in the gateway layer and make all unfinished accounts resolve there.

---

## 4. Route resolution logic is not centralized

### Current issue

Lifecycle decisions are spread across:

- select-organisation
- create-organisation wizard
- scoped route boundary

### Risk

This makes it easy for one area to use slightly different rules from another.

### Required fix

Create a shared route resolver utility, for example:

- `src/lib/onboarding/resolve-account-entry.ts`

This should translate `OnboardingStateData` into one of:

- dashboard
- wizard
- preparation
- failed

That resolver should then be reused everywhere.

---

## 5. Delete-account is still missing

### Current issue

There is currently no delete-account endpoint or frontend flow for removing broken or unwanted unfinished accounts.

### Product impact

Without this, users can get trapped with an account that is:

- failed
- partially configured
- no longer wanted

### Required fix

Strapi and the BFF need a supported delete or archive action for unfinished accounts.

Recommended guardrail:

- allow delete only when `isSetup === false`

---

## What Is Missing

## Frontend

- lifecycle-based redirect on account selection
- hard lifecycle gating on `/o/[accountId]/...`
- dedicated setup/preparation screen
- failure-to-recovery path
- delete-account action
- unified resolver for onboarding route decisions
- stronger tests for route behavior

## Strapi CMS / BFF

- delete-account or archive-unfinished-account endpoint
- agreed delete business rules
- consistent handling for setup failure states
- explicit support semantics for when retry is allowed vs when delete is allowed
- production validation that onboarding-state and setup-status remain aligned after confirm and retry

## Product / UX

- final decision on whether users ever see scoped shell before `isSetup === true`
- final failure-state UX wording
- exact delete-account eligibility and confirmation rules
- support guidance for long-running setup or repeated failures

---

## How To Do The Work

## Workstream 1: Frontend route enforcement

### Goal

Ensure unfinished accounts never enter the dashboard or any scoped app route.

### Tasks

1. Update `/select-organisation` to fetch onboarding-state before navigation
2. Replace direct dashboard links with lifecycle-based routing
3. Extend `OrgAccessBoundary` to enforce readiness as well as ownership
4. Redirect unfinished scoped-account access back into onboarding recovery

### Primary files

- [`src/app/(members)/select-organisation/select-organisation-content.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/select-organisation/select-organisation-content.tsx>)
- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)
- [`src/app/(members)/o/[accountId]/layout.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/o/[accountId]/layout.tsx>)

### Success criteria

- no unfinished account can enter `/o/[accountId]/...`
- deep links for unfinished accounts always recover into onboarding flow

---

## Workstream 2: Onboarding wizard correctness

### Goal

Ensure wizard completion does not imply app readiness.

### Tasks

1. Remove `hasCompletedOnboardingWizard` as a dashboard eligibility shortcut
2. Route completed-but-unready accounts to setup/preparation UI
3. Keep wizard resume behavior for `not_started` and `in_progress`

### Primary file

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

### Success criteria

- dashboard only opens on `isSetup === true`
- completed wizard plus unfinished setup always lands on preparation screen

---

## Workstream 3: Preparation and recovery UX

### Goal

Give users a clear post-confirm and post-failure path.

### Tasks

1. Add a dedicated preparation route in the gateway layer
2. Mount `SetupStatusCard`
3. Poll `setup-status` while queued/running
4. Redirect to dashboard when ready
5. Show retry action on failure
6. Add delete-account action when API exists

### Recommended route

- `/create-organisation/setup?accountId=:id`

### Primary files

- new route under `src/app/(members)/create-organisation/...`
- [`src/app/(members)/create-organisation/_components/setup-status-card.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.tsx>)

### Success criteria

- users see meaningful preparation state after confirm
- users have recovery actions if setup fails

---

## Workstream 4: Shared lifecycle resolver

### Goal

Make route decisions consistent everywhere.

### Tasks

1. Create shared resolver utility
2. Use it in:
   - select-organisation
   - create-organisation
   - org-access-boundary
3. Add tests covering all lifecycle branches

### Suggested file

- `src/lib/onboarding/resolve-account-entry.ts`

### Success criteria

- all onboarding route decisions are derived from one rule source

---

## Workstream 5: Strapi and BFF completion work

### Goal

Close the backend support gaps for recovery and operational correctness.

### Required CMS/BFF work

1. Define delete-account endpoint for unfinished accounts
2. Confirm business rules for delete eligibility
3. Confirm exact retry eligibility rules and failure codes
4. Validate that lifecycle fields remain consistent after:
   - confirm
   - retry-setup
   - long-running background jobs
5. Consider whether a compact onboarding-state summary should eventually be exposed on `/api/account/me`

### Recommended delete rule

- delete only allowed when `isSetup === false`

### Recommended endpoint shape

One of:

- `DELETE /api/accounts/:accountId`
- `POST /api/accounts/:accountId/delete`

### Success criteria

- failed or abandoned onboarding can be exited cleanly
- frontend has a supported delete path

---

## Priority Order

## Immediate priority

1. Fix route gating
2. Fix wizard eligibility
3. Add preparation route

## Next priority

4. Centralize resolver logic
5. Add lifecycle route tests
6. Wire retry flow into live UX

## Backend and product completion

7. Add delete-account support
8. Finalize support policy for failed and slow setup

---

## Risk Register

## Risk 1

Unfinished accounts enter the app and create misleading dashboard experiences.

### Severity

High

### Fix

Block scoped app entry unless `isSetup === true`

---

## Risk 2

Wizard completion is confused with account readiness.

### Severity

High

### Fix

Separate post-confirm preparation from dashboard entry

---

## Risk 3

Failed onboarding lacks a complete escape route.

### Severity

Medium to high

### Fix

Provide retry and delete flows

---

## Risk 4

Lifecycle logic drifts between app areas.

### Severity

Medium

### Fix

Use a shared resolver and test it thoroughly

---

## Recommended Acceptance Standard

The onboarding flow should not be considered complete until all of the following are true:

1. `select-organisation` resolves lifecycle before navigation
2. no scoped route is accessible before `isSetup === true`
3. wizard-complete but unready accounts go to preparation UI
4. failed setup offers retry
5. failed or unwanted unfinished accounts can be deleted once backend support exists
6. all lifecycle branches are covered by tests

---

## Final Assessment

The current onboarding system is good enough to prove the product model, but not yet good enough to trust as a controlled production onboarding gate.

The strongest parts are:

- lifecycle design
- CMS contract direction
- route architecture
- wizard resume foundation

The weakest parts are:

- route enforcement
- readiness gating
- recovery completion
- missing deletion path

### Updated interpretation of the score

`62 / 100` means:

- the system is viable
- the strategy is mostly right
- the implementation still has one major structural gap
- closing that gap is straightforward enough if handled as a focused route-and-recovery project

---

## Related Documents

- [`ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md)
- [`.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md)
- [`.comms/archives/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/archives/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md)
