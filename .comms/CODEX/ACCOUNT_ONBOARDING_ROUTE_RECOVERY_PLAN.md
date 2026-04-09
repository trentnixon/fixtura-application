DONE

# Account Onboarding Route Recovery Plan

## Purpose

Define the route and state changes needed so unfinished accounts cannot enter the dashboard. If an account is not fully set up, the user must be routed back into onboarding recovery, setup preparation, or account deletion once that capability exists.

This plan reflects the current codebase and the intended lifecycle contract in:

- `.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`
- `.comms/archives/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`

---

## Current Problem

The current implementation allows an account to enter the scoped app too early.

### What happens today

- `/select-organisation` loads `GET /api/account/me`
- account cards display `isActive` and `isSetup`
- selecting an account links directly to `/o/[accountId]/dashboard`
- `/o/[accountId]` route protection validates account access only
- onboarding readiness is not enforced before dashboard entry

### Current bug

In `create-organisation-wizard.tsx`, the app currently treats:

- `hasCompletedOnboardingWizard === true`

as enough to open the dashboard.

That is incorrect.

Per the lifecycle handoff, the account is only ready for dashboard entry when:

- `isSetup === true`

Wizard completion means the form is finished. It does not mean backend setup and initial data preparation are complete.

---

## Required Product Rule

The dashboard may only open when:

- `isSetup === true`

Everything else must route to onboarding recovery.

### Route decision rules

When an account is selected, fetch:

- `GET /api/accounts/:accountId/onboarding/onboarding-state`

Then route as follows:

1. `isSetup === true`
   - open `/o/[accountId]/dashboard`
2. `onboardingWizardStatus === "not_started"`
   - open onboarding wizard
3. `onboardingWizardStatus === "in_progress"`
   - resume onboarding wizard at `onboardingCurrentStep`
4. `onboardingWizardStatus === "completed"` and `isSetup === false`
   - open setup/preparation UI
5. setup failed
   - open setup/preparation UI with recovery actions

Recovery actions should be:

- `Retry setup`
- `Delete account` once backend support exists

---

## Target Flow

```text
Login
-> /select-organisation
-> user selects account
-> fetch onboarding-state
-> if ready: dashboard
-> if wizard incomplete: onboarding wizard
-> if wizard complete but setup running: preparation screen
-> if setup failed: preparation screen with retry and delete
```

Deep links to `/o/[accountId]/...` must also respect the same lifecycle rules.

---

## Required Changes

## 1. Change `/select-organisation` to route by lifecycle

### File

- `src/app/(members)/select-organisation/select-organisation-content.tsx`

### Current behavior

- each account tile links directly to `accountScopedRoutes.dashboard(id)`

### Required behavior

- selecting an account must first fetch onboarding-state
- route based on lifecycle result, not summary flags from `/api/account/me`

### Notes

- `GET /api/account/me` remains useful for account listing only
- do not use `me.accounts[].isSetup` as the source of truth for entry routing
- use `queryClient.fetchQuery(...)` with `queryKeys.account.onboardingState(accountId)`

### Result

The gateway becomes the first lifecycle decision point instead of blindly opening the dashboard.

---

## 2. Fix dashboard eligibility in the onboarding wizard

### File

- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`

### Current behavior

Current logic:

- `hasCompletedOnboardingWizard === true || isSetup === true`

opens the dashboard.

### Required behavior

Replace that rule with:

- only `isSetup === true` opens the dashboard

### Expected behavior after change

1. `not_started`
   - start at wizard step 1
2. `in_progress`
   - resume at `onboardingCurrentStep`
3. `completed` and not ready
   - show setup/preparation state, not dashboard
4. `isSetup === true`
   - redirect to dashboard

This is the primary correctness fix.

---

## 3. Add a dedicated setup/preparation recovery screen

### Recommendation

Add a gateway-layer route for preparation and recovery.

Suggested route:

- `/create-organisation/setup?accountId=:id`

This keeps unfinished accounts in the lightweight gateway flow instead of mounting the full scoped app shell too early.

### Responsibilities

This screen should:

- load and display setup status
- poll while setup is queued or running
- redirect to dashboard when ready
- show retry action on failure
- show delete action once backend support exists

### Existing component to reuse

- `src/app/(members)/create-organisation/_components/setup-status-card.tsx`

### Current status

`SetupStatusCard` already exists, but is not mounted anywhere in the live flow.

### Required behavior

- mount `SetupStatusCard`
- use `useOnboardingSetupStatus(accountId)`
- redirect to dashboard when:
  - `status === "ready"`, or
  - `isSetup === true`
- show recovery actions when failed

---

## 4. Enforce lifecycle gating on scoped routes

### Files

- `src/app/(members)/o/[accountId]/layout.tsx`
- `src/components/auth/org-access-boundary.tsx`

### Current behavior

Scoped route protection currently verifies:

- valid account id
- user owns the account
- account exists

It does not verify onboarding readiness.

### Required behavior

After access is validated, also fetch onboarding-state and route as follows:

1. `isSetup === true`
   - render scoped app
2. onboarding incomplete or setup incomplete
   - redirect out of scoped app and into gateway recovery
3. invalid / forbidden / missing account
   - keep current redirect to `/select-organisation?reason=...`

### Goal

Prevent users from deep-linking into:

- `/o/[accountId]/dashboard`
- `/o/[accountId]/settings`
- `/o/[accountId]/branding`
- any other scoped route

when the account is not actually ready.

---

## 5. Centralize lifecycle route resolution

### Recommendation

Create a small resolver utility so lifecycle routing is defined once.

Suggested file:

- `src/lib/onboarding/resolve-account-entry.ts`

### Purpose

Given `OnboardingStateData`, return a route intent such as:

- `dashboard`
- `wizard`
- `preparation`
- `failed`

### Why

Without this, the same branching logic will get duplicated in:

- `select-organisation`
- `create-organisation-wizard`
- scoped route boundary

Centralizing the rule reduces drift and future regressions.

---

## 6. Add delete-account recovery path

### Status

Delete-account is currently TBC. No existing endpoint or UI was found in the repo.

### Required backend/BFF work

One of the following needs to exist:

- `DELETE /api/accounts/:accountId`
- `POST /api/accounts/:accountId/delete`

### Expected restrictions

Delete should likely only be available when the account is not fully set up.

Recommended rule:

- allow delete only when `isSetup === false`

### Required frontend work once API exists

Add:

- `useDeleteAccount(accountId)` mutation

Show action on:

- failed setup state
- optionally unfinished onboarding state if product approves

On success:

- invalidate `queryKeys.account.me`
- invalidate account-scoped onboarding queries
- redirect to `/select-organisation`
- show success feedback

---

## Recommended Implementation Order

1. Fix wizard eligibility so only `isSetup === true` opens dashboard
2. Add preparation/recovery route and mount `SetupStatusCard`
3. Change `/select-organisation` to resolve lifecycle before navigation
4. Extend scoped route protection to block unfinished accounts
5. Add delete-account backend and frontend once contract is agreed

---

## QA Scenarios

The updated flow must be tested against these cases:

1. Account selected, `onboardingWizardStatus === "not_started"`
   - user lands in step 1
2. Account selected, `onboardingWizardStatus === "in_progress"`
   - user resumes at correct step
3. Account selected, `onboardingWizardStatus === "completed"` and `isSetup === false`
   - user lands on preparation screen, not dashboard
4. Preparation screen while setup is `queued` or `running`
   - polling continues
5. Preparation screen when setup becomes ready
   - user is redirected to dashboard
6. Preparation screen when setup fails
   - retry action is shown
7. Deep-link to `/o/[accountId]/dashboard` for unfinished account
   - redirected to onboarding recovery
8. Deep-link to scoped route for invalid or forbidden account
   - redirected to `/select-organisation?reason=...`
9. Delete account once implemented
   - account removed, list refreshed, user returned to gateway

---

## Final Rule Summary

The route system should enforce this consistently:

```text
isSetup === true
-> dashboard allowed

isSetup === false
-> dashboard blocked
-> route to wizard or preparation UI
```

And for failed onboarding:

```text
setup failed
-> no dashboard access
-> offer retry
-> offer delete account when available
```

This is the required change to make onboarding recovery deterministic and to stop unfinished accounts from leaking into the scoped app.
