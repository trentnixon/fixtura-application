# Onboarding Outstanding Dev Review

Use this as the current dev-team handoff before continuing Phase 6 or marking Phase 5 as fully signed off.

## Current Position

Phases 1-5 are confirmed complete.

Option A (stable setup recovery page) has been implemented. Phase 6 manual browser sign-off is unblocked.

Latest targeted verification:

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/setup-status-card.test.tsx" "src/app/(members)/create-organisation/setup/setup-client.test.tsx" "src/lib/api/hooks/account/useOnboardingSetupStatus.test.tsx" "src/lib/api/hooks/account/useRetryOnboardingSetup.test.tsx" "src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx" "src/lib/onboarding/can-delete-unfinished-onboarding-account.test.ts" "src/lib/onboarding/delete-unfinished-account-error.test.ts" "src/lib/onboarding/is-setup-recovery-hold.test.ts"
```

Result:

- 8 test files passed.
- 63 tests passed.
- No React `act(...)` warnings.

## Resolved Review Items

### P1: Retry setup reachability — Option A implemented

`CreateOrganisationSetupClient` now holds lifecycle redirects when setup status is pending or terminal `failed`, so `/create-organisation/setup?accountId=...` is a stable recovery surface for retry.

Changes:

- `src/lib/onboarding/is-setup-recovery-hold.ts` — `isSetupStatusFailed`, `shouldHoldSetupRecoveryPage`
- `src/app/(members)/create-organisation/setup/setup-client.tsx` — gate redirects and dashboard loader on hold state; show "Checking setup status…" while pending
- `src/app/(members)/create-organisation/setup/setup-client.test.tsx` — failed/pending hold cases

Behavior after fix:

- Wizard-incomplete + setup `failed` → stays on recovery page with `Retry setup`
- Wizard-complete + setup `failed` → stays on recovery page with `Retry setup`
- Wizard-complete + setup pending → shows checking loader until status settles
- Non-failed flows (wizard redirect, dashboard redirect) unchanged

### P3: Polling test act warning — fixed

`useOnboardingSetupStatus.test.tsx` wraps timer advancement in `act()` for the terminal-but-updating polling test.

## Confirmed Good

- `useOnboardingSetupStatus` polling rules match the lifecycle contract:
  - Stops on terminal status when `isUpdating` is not true.
  - Keeps polling when terminal status still reports `isUpdating: true`.
  - Keeps retrying/polling transient `408` timeout behavior.
  - Stops polling on non-transient errors.
- `useRetryOnboardingSetup` invalidates the seven expected lifecycle/setup keys and does not navigate.
- `useDeleteUnfinishedAccount` cancels onboarding-state refetch, invalidates account-scoped caches with no refetch for deleted-account keys, and redirects to organisation selection.
- `canDeleteUnfinishedOnboardingAccount` keeps delete available only before wizard completion and before setup completion.
- `deleteUnfinishedAccountErrorMessage` maps structured CMS errors into customer-facing copy.
- The Phase 5 test matrix is broad and useful.

## Phase 6 Guidance

Phase 6 manual browser sign-off can proceed. Priority retry-reachability scenarios:

- Wizard-complete account whose setup status is `failed` — direct visit `/create-organisation/setup?accountId=...`, confirm **Retry setup** is visible and clickable.
- Wizard-incomplete account whose setup status is `failed` — same URL, confirm no redirect to wizard and retry is usable.
- Wizard-complete account whose setup status is `in_progress` — confirm auto-redirect to dashboard still works.
- Delete unfinished account flow (unchanged).

See also: `docs/route-hardening/onboarding/phases/phase-6-manual-browser-checks.md`

## Phase 7 Reminder

Do not solve the multi-account "Create organisation" ambiguity yet unless explicitly instructed.

That work remains Phase 7:

- `docs/route-hardening/onboarding/phases/phase-7-multi-account-create-organisation.md`
