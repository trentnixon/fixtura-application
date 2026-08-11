# Phase 04: Create and Explicit Resume

## Goal

Separate create intent from resume intent while ensuring the returned or requested account id scopes the entire wizard.

## Create mode

Route intent:

```text
/create-organisation
```

Required sequence:

1. Submit `POST /api/account/first` once.
2. Disable repeated submission while pending.
3. Treat `200` reuse and `201` creation identically.
4. Validate and use `response.data.accountId`.
5. Initialize the wizard with that exact id.
6. Send that id in every account-specific onboarding route.
7. Invalidate the shared account list when visible data changes.

## Resume mode

Route intent:

```text
/create-organisation?accountId=456
```

Required sequence:

1. Parse a positive integer account id.
2. Load onboarding state for that exact id.
3. Never call `/account/first` merely because the account is unfinished.
4. Never fall back to another account after load failure.
5. Handle unavailable/not-owned safely and return to selection through an explicit user action or safe navigation.

## Onboarding routes

Use the parent guide's complete `/api/accounts/:accountId/onboarding/...` inventory. Route id is authoritative; step bodies must not override it. User-level lookup routes remain unscoped.

## Busy and retry behavior

For `503 ACCOUNT_CREATE_BUSY`:

- retain the current page and user input;
- stop pending state;
- show a retryable error;
- respect `Retry-After` where practical; and
- retry the same create operation without generating an id or calling an alternative endpoint.

A network retry that receives `200` with the already-created blank id is ordinary success.

## Tasks

- Remove fallbacks to `/me.data.accountId`, `accounts[0]`, or user state.
- Make create/resume mode explicit and mutually exclusive.
- Trace account id through wizard state, uploads, confirmation, setup status, retry, and restart.
- Prevent duplicate submissions at both UI and mutation-control layers where appropriate.
- Reset wizard state when the explicit route id changes.
- Preserve user-entered data for retryable create failures.

## Tests

- `201` begins onboarding with the returned id.
- `200` begins/resumes the returned blank id identically.
- Double click causes one pending mutation.
- Timeout retry returning the existing id succeeds.
- `503` produces a retryable, non-destructive state.
- Explicit resume loads only the requested id and does not call create.
- Invalid or inaccessible id does not fall back.
- Every wizard operation uses the explicit id.

## Acceptance criteria

- Create and resume cannot silently mutate another account.
- No code path enters account-specific wizard work without a validated id.
- Both success statuses and busy retry behavior have test evidence.
- Route changes cannot display stale wizard state from a previous account.

## Handoff to Phase 05

Identify where abandonment/deletion is exposed and which wizard/list caches must be cleared after confirmed deletion.

---

## Phase 04 completion handoff — 2026-07-13

### Outcome

**Phase complete**

Create and explicit resume are mutually exclusive; blank obtain treats `200`/`201` identically; `503 ACCOUNT_CREATE_BUSY` is retryable without losing sport selection; create success syncs `?accountId=` and trusts the just-created id until `/account/me` refreshes.

### Acceptance criteria

| Criterion                                                     | Status                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Create and resume cannot silently mutate another account      | Pass — resume requires owned query id; create uses returned id only     |
| No account-specific wizard work without a validated id        | Pass — steps gated on `accountId` from owned query or just-created id   |
| Both success statuses and busy retry have test evidence       | Pass — ids 101/202 success + URL sync; busy retry reuses same mutate    |
| Route/id changes do not show stale prior-account wizard state | Pass — query-id change resets hydration / mismatched `createdAccountId` |

### Findings and implementation

- Files changed:
  - `src/lib/api/account-create-busy.ts` (+ test)
  - `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx` (+ test)
  - `src/app/(members)/create-organisation/_components/wizard-step-branding.tsx` (explicit-id comment)
  - Docs: this file; `01-audit-ledger.md` §2; phase index README
- Stale note: `docs/route-hardening/onboarding/phases/phase-7-multi-account-create-organisation.md` may still imply create-always-new; prefer this guide / Phase 04 handoff.

### Phase 05 starting inputs — deletion

**Delete affordance (still client-inferred eligibility):**

- UI: unfinished delete control + confirm dialog in `create-organisation-wizard.tsx`
- Gate: `canDeleteUnfinishedOnboardingAccount(onboardingData)` (`hasCompletedOnboardingWizard` / `isSetup` inference — Phase 05 must stop treating this as authoritative)
- Mutation: `useDeleteUnfinishedAccount(accountId)`

**Caches already invalidated on confirmed delete success** (`useDeleteUnfinishedAccount`):

- `queryKeys.account.me`
- `queryKeys.account.onboardingState(accountId)` (cancel + invalidate)
- `queryKeys.account.setupStatus(accountId)`
- `queryKeys.account.settings(accountId)`
- `queryKeys.account.organisationContext(accountId)`
- `queryKeys.account.branding(accountId)`
- `queryKeys.auth.me`

Phase 05 must add uncertain-outcome handling (refetch list before permanent UI change) and stop inferring delete eligibility from list/onboarding fields alone.

### Verification

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" src/lib/api/hooks/account/useCreateFirstAccount.test.tsx src/app/api/account/first/route.test.ts src/lib/api/parse-create-first-account-response.test.ts src/lib/api/account-create-busy.test.ts
```

- Focused vitest: **5 files, 35 tests passed**.

### Working-tree notes

Unrelated dirty files outside create/resume (dashboard branding, `button.tsx`, save-branding dialog, older onboarding docs) were preserved.

### Next phase

**Phase 05: Deletion and uncertain outcomes** — CMS delete endpoint authoritative; handle 403 / uncertain results; refetch account list before permanent UI change.
