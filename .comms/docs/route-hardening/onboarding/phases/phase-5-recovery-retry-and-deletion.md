# Phase 5: Recovery, Retry, And Deletion

Status: Complete

## Goal

Make failed or abandoned onboarding recoverable without data loss surprises.

## Code Areas

- `src/app/(members)/create-organisation/_components/setup-status-card.tsx`
- `src/app/(members)/create-organisation/setup/setup-client.tsx`
- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/lib/api/hooks/account/useOnboardingSetupStatus.ts`
- `src/lib/api/hooks/account/useRetryOnboardingSetup.ts`
- `src/lib/api/hooks/account/useDeleteUnfinishedAccount.ts`
- `src/lib/onboarding/can-delete-unfinished-onboarding-account.ts`
- `src/lib/onboarding/delete-unfinished-account-error.ts`

## Tasks

- [x] Verify S1 setup status states: `in_progress`, `retryable`, `pending`, `ready`, `failed`, `blocked`, `abandoned`, and unknown fallback copy.
- [x] Verify pipeline enums display (`initialSetupStatus` / `initialDataFetchStatus`: `not_started`, `queued`, `running`, `completed`, `failed`).
- [x] Verify retry setup appears only when `showRetryOnFailure` is true and S1 status is terminal `failed`.
- [x] Verify retry setup mutation invalidates lifecycle/setup caches (7 query keys).
- [x] Verify unfinished-account delete appears only before wizard completion (`hasCompletedOnboardingWizard === false`) and before setup completion (`isSetup !== true`).
- [x] Verify delete action requires confirmation dialog.
- [x] Verify delete errors map to useful customer copy (`deleteUnfinishedAccountErrorMessage`).
- [x] Verify delete success clears account-related caches and returns to organisation selection.

## Tests To Confirm Or Add

- [x] Setup status display matrix (`setup-status-card.test.tsx` — 18 tests).
- [x] Setup status polling and retry policy (`useOnboardingSetupStatus.test.tsx` — 12 tests).
- [x] Retry mutation success and failure behavior (`useRetryOnboardingSetup.test.tsx` — 2 tests).
- [x] Delete affordance visibility matrix (`can-delete-unfinished-onboarding-account.test.ts` — 6 tests; wizard delete suite unchanged).
- [x] Delete mutation success and failure cache/navigation behavior (`useDeleteUnfinishedAccount.test.tsx` — 2 tests).
- [x] Delete error mapping (`delete-unfinished-account-error.test.ts` — 10 tests).
- [x] Setup client recovery routing (`setup-client.test.tsx` — 6 tests).

## Commands

- [x] `npx vitest run src/app/(members)/create-organisation/_components/setup-status-card.test.tsx`
- [x] `npx vitest run src/app/(members)/create-organisation/setup/setup-client.test.tsx`
- [x] `npx vitest run src/lib/api/hooks/account/useOnboardingSetupStatus.test.tsx`
- [x] `npx vitest run src/lib/api/hooks/account/useRetryOnboardingSetup.test.tsx`
- [x] `npx vitest run src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx`
- [x] `npx vitest run src/lib/onboarding/can-delete-unfinished-onboarding-account.test.ts`
- [x] `npx vitest run src/lib/onboarding/delete-unfinished-account-error.test.ts`
- [x] Grouped run: 56 tests passing across 7 files.

## Hardening Notes

- Destructive actions must keep explicit confirmation.
- Recovery copy should be concrete without exposing CMS internals.
- Setup failure should not block scoped access after wizard completion unless product changes that lifecycle rule.
- Retry is intentionally offered only on `/create-organisation/setup` (`showRetryOnFailure`), not inside the wizard compact card.
- Lifecycle redirects on the setup recovery route are held when setup status is pending or `failed` (see `is-setup-recovery-hold.ts`).
- Setup retry has no confirmation dialog; wizard nav-back actions do use confirmation dialogs.

## Completion Evidence

- Code changes:
  - Added `src/lib/onboarding/is-setup-recovery-hold.ts` — hold recovery page when setup status is pending or terminal `failed`.
  - Updated `setup-client.tsx` — gate lifecycle redirects and dashboard loader on hold state; show "Checking setup status…" while pending (Option A retry reachability fix).
- Tests added/updated:
  - Expanded `setup-status-card.test.tsx` from 5 to 18 tests (terminal/non-terminal states, query errors, retry 409, pipeline detail, `requiresUserAction`, `errorCode`).
  - Expanded `useOnboardingSetupStatus.test.tsx` from 1 to 12 tests (polling stop/continue, 408 recovery, retry limits, enabled guard, invalid payload; act warning fixed).
  - Added `useRetryOnboardingSetup.test.tsx` (API call + 7-key invalidation on success; no invalidation/navigation on failure).
  - Expanded `setup-client.test.tsx` from 1 to 8 tests (invalid account, onboarding error retry, wizard redirect, `ready` invalidation, failed/pending hold cases).
  - Added `is-setup-recovery-hold.test.ts` (5 tests).
  - Expanded `delete-unfinished-account-error.test.ts` from 3 to 10 tests.
  - Expanded `can-delete-unfinished-onboarding-account.test.ts` from 4 to 6 tests.
- Commands run:
  - `npx vitest run src/app/(members)/create-organisation/_components/setup-status-card.test.tsx src/app/(members)/create-organisation/setup/setup-client.test.tsx src/lib/api/hooks/account/useOnboardingSetupStatus.test.tsx src/lib/api/hooks/account/useRetryOnboardingSetup.test.tsx src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx src/lib/onboarding/can-delete-unfinished-onboarding-account.test.ts src/lib/onboarding/delete-unfinished-account-error.test.ts src/lib/onboarding/is-setup-recovery-hold.test.ts`
  - Result: 8 files, 63 tests, all green.
- Remaining risks:
  - S1 `status` strings are CMS-driven; unknown values rely on fallback copy in `statusDescription()`.
  - Retry 409 handling is UI-only in `SetupStatusCard`; BFF passthrough covered in Phase 4 route tests.
  - `setup-client` retry-success path depends on invalidation + resumed polling rather than explicit navigation (by design).
  - Phase 7 multi-account create-organisation behavior unchanged.
- Next recommended phase:
  - Phase 6: Manual Browser Checks (`docs/route-hardening/onboarding/phases/phase-6-manual-browser-checks.md`)
