# Epic 6 App Workplan

## Purpose

Define the **app-side** work required now that the CMS side of Epic 6 is complete.

This document is limited to:

- Next.js BFF work
- frontend API client and hook work
- onboarding recovery UI work
- app-side QA and verification

This document does **not** restate the CMS implementation. It assumes the CMS contract is now available and verified through:

- [`EPIC_6_OPERATIONAL_VERIFICATION.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_6_OPERATIONAL_VERIFICATION.md)

---

## Epic 6 App Goal

Allow the app to consume the completed CMS recovery contract so users can:

- retry failed setup where allowed
- delete unfinished accounts where allowed
- be blocked from delete where CMS says delete is not allowed
- see clear recovery actions without guessing backend policy

---

## CMS Contract Assumed By App

From the CMS handoff and operational verification, the app should now assume:

- delete endpoint exists on CMS side for unfinished accounts
- `isSetup === true` remains the only dashboard-ready state
- delete is allowed for incomplete wizard accounts where `hasCompletedOnboardingWizard === false` and `isSetup === false`
- delete is not allowed once the wizard is complete or setup is complete
- delete blocked responses use:
  - `403`
  - `ACCOUNT_DELETE_NOT_ALLOWED`
- not-owned account delete uses:
  - `404`
  - `ACCOUNT_NOT_FOUND`

Reference:

- [`EPIC_6_OPERATIONAL_VERIFICATION.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_6_OPERATIONAL_VERIFICATION.md)

---

## What The App Needs To Build

## 1. Add BFF delete-account route

### Goal

Mirror the CMS delete endpoint in the Next BFF using the same proxy style as the existing onboarding lifecycle routes.

### Recommended file

- `src/app/api/accounts/[accountId]/route.ts`

or, if you prefer a dedicated recovery action shape:

- `src/app/api/accounts/[accountId]/delete/route.ts`

Preferred option depends on the final CMS path. Keep the BFF path aligned with CMS as closely as possible.

### Expected behavior

- read auth cookie
- validate `accountId`
- call Strapi with the same method/path semantics
- preserve Strapi response body and status via `nextResponseFromStrapiFetch`

### Reuse

Use the same BFF helper pattern already implemented in Epic 5:

- [`next-response-from-strapi-fetch.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/bff/next-response-from-strapi-fetch.ts)

---

## 2. Register route in app API definitions

### Goal

Make the delete endpoint available through the app’s internal route-definition layer.

### Files

- [`src/lib/api/routes/route-definitions.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/routes/route-definitions.ts)

### Required work

- add route key
- add path
- add description aligned with Epic 6 semantics

---

## 3. Add `accountApi` delete method

### Goal

Expose a thin typed client method for delete-account.

### File

- [`src/lib/api/services/account.api.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/api/services/account.api.ts)

### Required work

- add method that calls the new BFF route
- preserve `ApiError` behavior through the existing client stack

### Expected behavior

- success response can be minimal
- blocked and not-found responses should surface CMS error codes/messages unchanged where possible

---

## 4. Add delete mutation hook

### Goal

Create the frontend mutation wrapper that handles invalidation and navigation.

### Suggested file

- `src/lib/api/hooks/account/useDeleteUnfinishedAccount.ts`

### Required invalidations

Mirror the placeholder plan from Epic 5:

- `queryKeys.account.me`
- `queryKeys.account.onboardingState(accountId)`
- `queryKeys.account.setupStatus(accountId)`
- `queryKeys.account.settings(accountId)`
- `queryKeys.account.organisationContext(accountId)`
- `queryKeys.account.branding(accountId)`
- `queryKeys.auth.me`

### Recommended success behavior

On success:

- invalidate account and auth-adjacent caches
- redirect to `/select-organisation`

### Recommended error behavior

Handle:

- `403 ACCOUNT_DELETE_NOT_ALLOWED`
- `404 ACCOUNT_NOT_FOUND`
- generic network / unexpected errors

Do not invent app-side state rules that contradict CMS. Respect backend response semantics.

---

## 5. Add delete action to recovery UI

### Goal

Expose account deletion only in the states where CMS allows it.

### Key product rule from CMS verification

Delete is allowed for:

- incomplete wizard accounts

Delete is not allowed for:

- wizard complete accounts
- setup-complete accounts

### Implication for current UI

The current preparation screen is aimed at:

- completed wizard
- setup running or failed

That means delete should **not** simply be added to the existing preparation screen for all cases.

### Required app decision

The app needs to surface delete in the correct recovery surface for **incomplete wizard** accounts.

### Likely places to integrate

1. `create-organisation` flow when loading an existing account with:
   - `hasCompletedOnboardingWizard === false`
   - `isSetup === false`
2. possibly a dedicated “abandon setup” action in the wizard shell

### Files likely involved

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)
- possibly a new shared recovery/action component

### Important constraint

Do **not** expose delete for setup-failed-but-wizard-complete accounts if CMS contract forbids it.

That is one of the main changes from earlier assumptions.

---

## 6. Update recovery messaging

### Goal

Make the app’s recovery copy match the CMS contract.

### Required behavior

- completed wizard + failed setup:
  - show retry
  - do not show delete if CMS forbids it
- incomplete wizard:
  - allow abandonment/delete if CMS allows it
- blocked delete:
  - show backend-driven error message or mapped copy for `ACCOUNT_DELETE_NOT_ALLOWED`

### Files likely involved

- [`src/app/(members)/create-organisation/_components/setup-status-card.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/setup-status-card.tsx>)
- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

---

## 7. Add app-side tests

### Goal

Verify the app correctly consumes the CMS recovery contract.

### Test areas

1. BFF delete route
   - unauthorized
   - invalid `accountId`
   - passthrough success
   - passthrough `ACCOUNT_DELETE_NOT_ALLOWED`
   - passthrough `ACCOUNT_NOT_FOUND`
2. delete mutation hook
   - invalidation behavior
   - navigation on success
3. UI action gating
   - delete shown for incomplete wizard where applicable
   - delete hidden for completed wizard / setup flows if CMS forbids it
   - retry remains visible for failed setup

### Suggested files

- `src/app/api/accounts/[accountId]/.../*.test.ts`
- `src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.ts`
- component tests around onboarding recovery UI

---

## Recommended App Work Order

## Step 1

Add BFF delete route

## Step 2

Add route definition and `accountApi` method

## Step 3

Add delete mutation hook with invalidations

## Step 4

Wire delete action into the correct onboarding UI state

## Step 5

Add tests and verify CMS-aligned behavior

---

## Acceptance Criteria

Epic 6 app work should be considered complete when:

1. the app can call the CMS delete contract through the BFF
2. delete mutation invalidates the correct caches
3. successful delete returns the user to organisation selection
4. blocked delete shows correct error handling
5. delete is only shown in CMS-allowed states
6. retry remains available where CMS allows it
7. app-side tests cover the main success and failure branches

---

## Implementation Notes

- Reuse the Epic 5 BFF adapter rather than creating another response-normalization path.
- Keep app-side logic subordinate to CMS rules. Do not widen delete availability in the UI beyond what the CMS contract allows.
- The largest product nuance in Epic 6 app work is this:
  - delete is for unfinished/incomplete wizard recovery
  - retry is for failed setup recovery after wizard completion

Those are not the same user state and should not be merged casually.

---

## Related Documents

- [`EPIC_6_OPERATIONAL_VERIFICATION.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_6_OPERATIONAL_VERIFICATION.md)
- [`EPIC_6_CMS_HANDOFF.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_6_CMS_HANDOFF.md)
- [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md)
- [`src/app/(members)/create-organisation/.comms/epic-5-ticket-5-2-delete-account-bff-placeholder.md`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/.comms/epic-5-ticket-5-2-delete-account-bff-placeholder.md>)
