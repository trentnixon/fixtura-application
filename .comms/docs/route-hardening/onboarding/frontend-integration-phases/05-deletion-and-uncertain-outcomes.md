# Phase 05: Deletion and Uncertain Outcomes

## Goal

Delete only the explicitly selected account, treat the CMS as the eligibility authority, and reconcile uncertain network outcomes safely.

## Contract

```http
DELETE /api/accounts/:accountId
```

Success must confirm:

```json
{ "data": { "accountId": 456, "deleted": true } }
```

Relevant failures:

- `400` invalid id;
- `401` unauthenticated;
- `404 ACCOUNT_NOT_FOUND` nonexistent or not owned;
- `403 ACCOUNT_DELETE_NOT_ALLOWED` completed, set-up, updating, queued, or running account.

## Tasks

- Pass the selected account id in the deletion route.
- Do not infer eligibility from `/account/me` list fields.
- Remove the account from UI/cache only after confirmed success or an authoritative refetch showing absence.
- On timeout or uncertain response, refetch `/api/account/me`.
- If absent after refetch, treat deletion as successful.
- If present, retain it and show retry/error state.
- Clear only the deleted id's wizard, form, query, mutation, and persisted state.
- Navigate to a safe selection/create route after success.
- Ensure a later `/account/first` can obtain a new blank account without client-side stale state.

## Prohibited shortcuts

- No optimistic permanent removal before confirmation.
- No deletion based on list position or compatibility account id.
- No client-side reproduction of completed/setup/queued/running eligibility rules.
- No success message if the outcome remains uncertain and refetch failed.

## Tests

- Confirmed deletion removes the correct id and invalidates the list.
- Failure retains the account.
- `403 ACCOUNT_DELETE_NOT_ALLOWED` shows a safe non-success result.
- Structured and legacy account-not-found behavior is safe.
- Timeout plus absent-on-refetch resolves as success.
- Timeout plus present-on-refetch retains the account.
- Deleted account-specific state is cleared without clearing other accounts.
- Later creation can use a newly returned blank id.

## Acceptance criteria

- The UI never hides a still-existing account as though deletion succeeded.
- Uncertain outcomes are reconciled against `/api/account/me`.
- Other accounts' caches and state survive deletion.
- Error copy does not enumerate cross-user ownership.

## Handoff to Phases 06 and 07

List all routes and cache namespaces touched by deletion so the broader hardening and isolation audits can verify them.

---

## Phase 05 completion handoff — 2026-07-13

### Outcome

**Phase complete**

CMS DELETE is the eligibility authority; wizard delete shows whenever a validated `accountId` is present; success requires `{ data: { accountId, deleted: true } }`; uncertain outcomes (408 / 5xx / transport) reconcile against a fresh `/api/account/me` before any permanent UI change.

### Acceptance criteria

| Criterion                                                            | Status                                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| UI never hides a still-existing account as though deletion succeeded | Pass — no optimistic removal; present-on-refetch retains + error                   |
| Uncertain outcomes reconciled against `/api/account/me`              | Pass — absent → success cleanup; present → retain; refetch fail → no success claim |
| Other accounts' caches and state survive deletion                    | Pass — `removeQueries` only for deleted id; dual-id hook test                      |
| Error copy does not enumerate cross-user ownership                   | Pass — existing `deleteUnfinishedAccountErrorMessage` 404/403 copy                 |
| Client no longer infers delete eligibility                           | Pass — removed `canDeleteUnfinishedOnboardingAccount`                              |

### Findings and implementation

- Files changed:
  - `src/lib/api/parse-delete-account-response.ts` (+ test)
  - `src/lib/api/account-delete-outcome.ts` (+ test)
  - `src/lib/api/services/account.api.ts` — parse on delete
  - `src/types/api/account.ts` — `DeleteAccountResponse`
  - `src/lib/api/hooks/account/useDeleteUnfinishedAccount.ts` (+ test rewrite)
  - `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx` (+ test rename)
  - Removed `src/lib/onboarding/can-delete-unfinished-onboarding-account.ts` (+ test)
  - Docs: this file; `01-audit-ledger.md` §2 / §9; phase index README

### Phase 06 / 07 starting inputs — routes and caches

**Routes touched by deletion:**

- BFF: `DELETE /api/accounts/:accountId` (`src/app/api/accounts/[accountId]/route.ts`)
- Client: `accountApi.deleteUnfinishedAccount(accountId)`
- UI: unfinished delete confirm dialog in `create-organisation-wizard.tsx` only (no select-org delete)

**Caches on confirmed delete** (`useDeleteUnfinishedAccount`):

- `removeQueries`: `onboardingState(accountId)`, `setupStatus(accountId)`, `settings(accountId)`, `organisationContext(accountId)`, `branding(accountId)`
- `invalidateQueries`: `queryKeys.account.me`, `queryKeys.auth.me`
- Navigate: `ROUTES.selectOrganisation`

Phase 07 should still audit other account-scoped key families (billing, sponsors, media, season-hub, renders, `ui.*PickerSelectedId`) under rapid switch — delete does not clear every account-scoped namespace today.

### Verification

```powershell
npx vitest run src/lib/api/parse-delete-account-response.test.ts src/lib/api/account-delete-outcome.test.ts src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" src/lib/onboarding/delete-unfinished-account-error.test.ts src/app/api/accounts/[accountId]/route.test.ts
```

- Focused vitest: **6 files, 55 tests passed**.

### Working-tree notes

Unrelated dirty files outside deletion (dashboard branding, `button.tsx`, save-branding dialog, older onboarding docs) were preserved.

### Next phase

**Phase 06: Route and server-side hardening** — OrgAccessBoundary / nested 404 normalization; treat nonexistent and cross-user account ids identically without fallback.
