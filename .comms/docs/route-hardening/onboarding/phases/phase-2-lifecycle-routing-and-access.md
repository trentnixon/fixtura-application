# Phase 2: Lifecycle Routing And Access Gates

Status: Complete

## Goal

Prove customers always land in the correct place for their onboarding state.

## Code Areas

- `src/lib/onboarding/resolve-account-entry.ts`
- `src/lib/onboarding/select-org-card-tone.ts`
- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/components/auth/org-access-boundary.tsx`
- `src/app/(members)/create-organisation/setup/setup-client.tsx`
- `src/app/(members)/o/[accountId]/season/_components/season-onboarding-shell.tsx`

## Tasks

- [x] Verify `select-organisation` fetches onboarding-state before opening an account.
- [x] Verify incomplete wizard accounts route to `/create-organisation?accountId=...`.
- [x] Verify completed wizard accounts route to scoped dashboard.
- [x] Verify completed wizard accounts enter scoped routes when setup is running or failed.
- [x] Verify `OrgAccessBoundary` rejects invalid account id segments.
- [x] Verify gateway redirects clear stale org-context query data.
- [x] Verify season route exception behavior is intentional.

## Tests To Confirm Or Add

- [x] `resolveAccountEntry` state matrix.
- [x] `accountEntryFromOnboardingState` path matrix.
- [x] `selectOrgCardToneFromOnboardingState` state matrix.
- [x] `OrgAccessBoundary` invalid id, wizard, dashboard, and season cases.
- [x] Select organisation route decision for wizard vs dashboard accounts.
- [x] Setup client redirect behavior for wizard vs dashboard states.

## Commands

- [x] `npx vitest run src/lib/onboarding/resolve-account-entry.test.ts`
- [x] `npx vitest run src/lib/onboarding/epic1-lifecycle-gate.test.ts`
- [x] `npx vitest run src/lib/onboarding/select-org-card-tone.test.ts`
- [x] `npx vitest run src/components/auth/org-access-boundary.test.tsx`
- [x] `npx vitest run src/app/(members)/create-organisation/setup/setup-client.test.tsx`
- [x] `npx vitest run src/app/(members)/select-organisation/select-organisation-content.test.tsx`

## Hardening Notes

- Keep `resolveAccountEntry` as the routing source of truth.
- Setup and data-fetch status should remain non-blocking after wizard completion unless product changes the rule.
- Any exception, such as season route behavior, needs a named test.

## Completion Evidence

- Code changes:
  - Added focused select-organisation lifecycle routing coverage.
- Tests added/updated:
  - `src/app/(members)/select-organisation/select-organisation-content.test.tsx`
    - unfinished wizard routes to `/create-organisation?accountId=...`
    - completed wizard routes to scoped dashboard
    - onboarding-state fetch failure surfaces inline error and does not navigate
- Commands run:
  - `npx vitest run src/lib/onboarding/resolve-account-entry.test.ts src/lib/onboarding/epic1-lifecycle-gate.test.ts src/lib/onboarding/select-org-card-tone.test.ts src/components/auth/org-access-boundary.test.tsx "src/app/(members)/create-organisation/setup/setup-client.test.tsx"`
    - 5 files passed, 24 tests passed
  - `npx vitest run "src/app/(members)/select-organisation/select-organisation-content.test.tsx"`
    - 1 file passed, 3 tests passed
  - `npx vitest run src/lib/onboarding/resolve-account-entry.test.ts src/lib/onboarding/epic1-lifecycle-gate.test.ts src/lib/onboarding/select-org-card-tone.test.ts src/components/auth/org-access-boundary.test.tsx "src/app/(members)/create-organisation/setup/setup-client.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx"`
    - 6 files passed, 27 tests passed
- Remaining risks:
  - Multi-account "Create organisation" ambiguity remains intentionally deferred to Phase 7.
  - Setup/data-fetch status remains non-blocking by design; product should revisit only if lifecycle rules change.
