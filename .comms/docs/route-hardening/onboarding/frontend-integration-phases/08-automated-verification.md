# Phase 08: Automated Verification

## Goal

Prove the reconciled frontend implementation satisfies the final CMS contract and detect remaining singular-account assumptions.

## Prerequisites

- Phases 02 through 07 are implemented and reconciled.
- Their completion evidence and deferred risks are available.

## Required contract scenarios

1. `201` from `/account/first` starts onboarding with the returned id.
2. `200` starts or resumes with the returned id identically.
3. Pending create prevents duplicate mutations.
4. Timeout retry returning the existing blank id succeeds.
5. `503 ACCOUNT_CREATE_BUSY` produces retryable state.
6. Selection renders two or more accounts.
7. Nameless account shows **Unfinished organisation**.
8. Every account action navigates with its row id.
9. Explicit resume loads only the requested owned account.
10. Account-level 404 does not fall back.
11. Confirmed deletion removes the account and later creation works.
12. Two-account onboarding caches remain isolated.
13. Billing, scheduler, and other high-risk caches remain isolated.
14. Create, resume, redirect, and selection code works with compatibility `data.accountId` absent.
15. BFF tests preserve `200`, `201`, `503`, `Retry-After`, and structured bodies.

Also cover legacy account-scoped 404 normalization, nested-resource 404 distinction, deletion uncertainty reconciliation, and cross-user safe behavior.

## Tasks

- Map every required scenario to one or more named tests.
- Update stale tests that encode the former one-account CMS behavior.
- Run focused suites first, then relevant integration suites.
- Run lint and typecheck in proportion to the changed surface.
- Run build if required by repository practice or if server/client boundaries changed.
- Re-run audit searches for forbidden selection dependencies.
- Separate new failures from known unrelated baseline failures with evidence.

## Minimum targeted command

Start with the current paths if they still exist:

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"
```

Expand this command using the Phase 01 inventory and changed files. Do not claim full coverage from the minimum command alone.

## Evidence format

For every command record:

- exact command;
- start/end or duration where useful;
- files/suites and tests passed, failed, or skipped;
- failure ownership;
- rerun result after fixes.

## Acceptance criteria

- All 15 contract scenarios have passing automated evidence.
- Legacy/structured 404 distinction has passing evidence.
- Required two-account isolation tests pass.
- No unresolved failure is hidden as “unrelated” without supporting baseline evidence.
- Lint, typecheck, and build status are explicitly reported.

## Handoff to Phase 09

Produce a browser checklist linked to automated test coverage and identify behaviors that still require real network/navigation evidence.

---

## Phase 08 completion handoff — 2026-07-13

### Outcome

**Phase complete**

All 15 contract scenarios and the “also cover” items have named, passing automated evidence. Full `npm run build` is deferred: repo-wide typecheck still fails on a known unrelated baseline (59 errors after Phase 08 fixture typing cleanup; Phase 02 baseline was 61). No new errors in Phase 08 multi-account test files.

### Acceptance criteria

| Criterion                                                  | Status                                           |
| ---------------------------------------------------------- | ------------------------------------------------ |
| All 15 contract scenarios have passing automated evidence  | Pass                                             |
| Legacy/structured 404 distinction has passing evidence     | Pass                                             |
| Required two-account isolation tests pass                  | Pass                                             |
| Failures not hidden as unrelated without baseline evidence | Pass                                             |
| Lint, typecheck, and build status explicitly reported      | Pass (build blocked by known typecheck baseline) |

### Scenario → test map

| #   | Scenario                                | Status | Evidence                                                                                                                                                                                                                                   |
| --- | --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `201` starts with returned id           | Pass   | `create-organisation-wizard.test.tsx` — `calls createFirstAccount for zero-account users then advances to step 1`; `scopes wizard to returned id 202`; `account/first/route.test.ts` — preserves 201                                       |
| 2   | `200` blank reuse identical success     | Pass   | Wizard — `treats blank reuse id 101 the same as create`; BFF — preserves 200                                                                                                                                                               |
| 3   | Pending create blocks duplicates        | Pass   | Wizard — `shows Preparing… when createFirst is pending`                                                                                                                                                                                    |
| 4   | Timeout retry → blank id succeeds       | Pass   | Wizard — `on timeout then retry, accepts returned blank id 101 as success`                                                                                                                                                                 |
| 5   | `503 ACCOUNT_CREATE_BUSY` retryable     | Pass   | Wizard busy test; `account-create-busy.test.ts`; `parse-retry-after-header.test.ts`; `fetch-client.retry-after.test.ts`; BFF Retry-After                                                                                                   |
| 6   | Selection renders 2+ accounts           | Pass   | `select-organisation-content.test.tsx` — `renders two or more account cards and does not auto-select`                                                                                                                                      |
| 7   | Nameless → Unfinished organisation      | Pass   | Select — `shows Unfinished organisation for a nameless account`                                                                                                                                                                            |
| 8   | Actions navigate with row id            | Pass   | Select — `navigates each card with that card's explicit account id`                                                                                                                                                                        |
| 9   | Explicit resume owned only              | Pass   | Wizard — resume owned / blocks unowned                                                                                                                                                                                                     |
| 10  | Account-level 404 no fallback           | Pass   | `org-access-boundary.test.tsx`; `account-unavailable.test.ts`; `gateway-reasons.test.ts`                                                                                                                                                   |
| 11  | Confirmed delete + later create         | Pass   | `useDeleteUnfinishedAccount` success; wizard — `after confirmed delete of unfinished 201, create-first obtains blank id 301`; `useCreateFirstAccount` — new blank id 301                                                                   |
| 12  | Two-account onboarding isolation        | Pass   | Wizard — `explicit resume of account 22 loads only that account's onboarding state`; delete — `two-account onboarding caches: deleting 11 leaves account 22 onboarding data intact`; `query-keys.isolation.test.ts`; exact-id delete suite |
| 13  | Billing/scheduler/high-risk isolation   | Pass   | `query-keys.isolation.test.ts`; `billingInvoiceRequestPrefill.test.ts`; asset picker isolation; `cancel-other-account-queries.test.ts`; `account-switch-race.isolation.test.ts` (slow A→B + scheduler cancel)                              |
| 14  | Works without compatibility `accountId` | Pass   | Select multi-account with `accountId: null`; wizard create with empty me / null compat; `account-me-rows.test.ts`; sidebar gateway test; `parse-account-me-response.test.ts`                                                               |
| 15  | BFF 200/201/503/Retry-After/bodies      | Pass   | `account/first/route.test.ts`; `next-response-from-strapi-fetch.test.ts` (incl. no Retry-After omit)                                                                                                                                       |

**Also cover**

| Topic                           | Status | Evidence                                                                       |
| ------------------------------- | ------ | ------------------------------------------------------------------------------ |
| Legacy account-scoped 404       | Pass   | `account-unavailable.test.ts`                                                  |
| Nested-resource 404 ≠ ownership | Pass   | `account-unavailable.test.ts`                                                  |
| Deletion uncertainty reconcile  | Pass   | `useDeleteUnfinishedAccount` uncertain cases; `account-delete-outcome.test.ts` |
| Cross-user safe behavior        | Pass   | OrgAccessBoundary 403/404 → identical `not_found`; `gateway-reasons.test.ts`   |

### Findings and implementation

- Fixture cleanup: `accountMeQueryData` / select-org `accountMeResponse` no longer default multi-account fixtures via `accounts[0]`; require explicit `accountId` when multiple rows.
- Added gap tests for scenarios #4, #11, #12.
- Widened wizard `searchParamsGet` mock return type for typecheck.
- Forbidden-selection re-scan leftovers are comments, create-response `res.data.accountId` (correct), or single-row fixture helpers (`accounts.length === 1` only).

### Verification

**Minimum suite**

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"
```

- Result: **4 files, 41 tests passed**.

**Expanded multi-account suite**

```powershell
npx vitest run "src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx" "src/lib/api/account-unavailable.test.ts" "src/lib/api/account-delete-outcome.test.ts" "src/lib/api/parse-delete-account-response.test.ts" "src/lib/api/parse-create-first-account-response.test.ts" "src/lib/api/parse-retry-after-header.test.ts" "src/lib/api/account-create-busy.test.ts" "src/lib/api/client/fetch-client.retry-after.test.ts" "src/lib/api/bff/next-response-from-strapi-fetch.test.ts" "src/lib/api/query/query-keys.isolation.test.ts" "src/lib/api/query/cancel-other-account-queries.test.ts" "src/components/auth/org-access-boundary.test.tsx" "src/lib/config/gateway-reasons.test.ts" "src/app/(members)/o/[accountId]/billing/_utils/invoice-request/billingInvoiceRequestPrefill.test.ts" "src/components/pickers/assets-list-for-selection/_hooks/use-asset-picker-selection.isolation.test.tsx" "src/lib/account/account-me-rows.test.ts" "src/components/navigation/app-sidebar/_utils/build-sidebar-user.test.ts"
```

- Result: **17 files, 90 tests passed**.

**Lint (touched Phase 08 test files):** `npx eslint` on wizard fixtures/tests, select-org test, create/delete hooks tests — **exit 0**.

**Typecheck:** `npm run typecheck` — **56** `error TS` after outstanding-item fixes (was 59 in Phase 08 handoff; Phase 02 baseline 61). Multi-account-owned files contribute **zero** errors (`next-response-from-strapi-fetch.ts`, `parse-account-me-response.ts`, delete/exact-id helpers). Remaining errors are outside this phase (settings fixtures, remotion carousel, template-builder preview tests, etc.).

**Build:** **blocked by known typecheck baseline** (`npm run build` runs typecheck first). Not executed.

### Outstanding-items rerun — 2026-07-13

Closed `OUTSTANDING-ITEMS.md` OI-01 through OI-05:

- OI-01: BFF `ResponseInit` omits `headers` when `Retry-After` absent (`exactOptionalPropertyTypes`).
- OI-02: Active docs/prompts point at `12-frontend-integration-guide.md`; historical CMS one-to-one docs bannered.
- OI-03: `removeExactAccountScopedQueries` + persisted manage-sponsors clear on confirmed delete.
- OI-04: Deferred-promise A→B race + scheduler cancel tests; optimistic server rollback classified N/A.
- OI-05: `accounts` required; `parseAccountMeResponse` fail-closed before selection consumers.

**Expanded multi-account suite (post OI):**

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts" "src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx" "src/lib/api/account-unavailable.test.ts" "src/lib/api/account-delete-outcome.test.ts" "src/lib/api/parse-delete-account-response.test.ts" "src/lib/api/parse-create-first-account-response.test.ts" "src/lib/api/parse-retry-after-header.test.ts" "src/lib/api/account-create-busy.test.ts" "src/lib/api/client/fetch-client.retry-after.test.ts" "src/lib/api/bff/next-response-from-strapi-fetch.test.ts" "src/lib/api/query/query-keys.isolation.test.ts" "src/lib/api/query/cancel-other-account-queries.test.ts" "src/components/auth/org-access-boundary.test.tsx" "src/lib/config/gateway-reasons.test.ts" "src/app/(members)/o/[accountId]/billing/_utils/invoice-request/billingInvoiceRequestPrefill.test.ts" "src/components/pickers/assets-list-for-selection/_hooks/use-asset-picker-selection.isolation.test.tsx" "src/lib/account/account-me-rows.test.ts" "src/components/navigation/app-sidebar/_utils/build-sidebar-user.test.ts" "src/app/(members)/o/[accountId]/billing/create/actions/create-stripe-invoice.test.ts" "src/lib/account/organisation-display-name.test.ts" "src/lib/api/hooks/account/useAccountOrganisationContext.test.tsx" "src/lib/api/parse-account-me-response.test.ts" "src/lib/api/query/is-exact-account-scoped-query-key.test.ts" "src/lib/api/query/account-switch-race.isolation.test.ts"
```

- Result: **27 files, 156 tests passed**.

**Lint:** focused ESLint on changed implementation/test files — **exit 0**.

### Phase 09 browser checklist (automated coverage link)

| Browser matrix item (Phase 09)              | Automated coverage                                     | Still needs real network/nav   |
| ------------------------------------------- | ------------------------------------------------------ | ------------------------------ |
| 1. Selection with one ongoing               | Select-org routing tests                               | Yes — live CMS list            |
| 2. Create org record 200/201 + id           | Wizard + BFF                                           | Yes — real status codes        |
| 3. Wizard uses exact id                     | Wizard returned-id tests                               | Yes                            |
| 4. Both accounts on selection               | Select 2+ cards                                        | Yes                            |
| 5. Blank reuse same id                      | Wizard 200 path                                        | Yes — concurrent blank lock    |
| 6. New blank after club/association         | Partial (create after delete)                          | Yes — CMS blank rules          |
| 7. Resume each unfinished by id             | Wizard explicit resume + dual-id                       | Yes                            |
| 8. Switch across domains / cache            | Keys + cancel + picker isolation + deferred race tests | Yes — rapid A↔B with live data |
| 9. Delete eligible unfinished               | Delete hook + wizard delete                            | Yes                            |
| 10. `ACCOUNT_DELETE_NOT_ALLOWED`            | Wizard mapped 403                                      | Yes — policy fixture           |
| 11. Nonexistent / cross-user identical      | OrgAccessBoundary + gateway                            | Yes — second user              |
| 12. Nested-resource 404 distinct            | `account-unavailable`                                  | Optional staging spot-check    |
| 13. `503 ACCOUNT_CREATE_BUSY` + Retry-After | Wizard + BFF + client                                  | Yes if safely simulatable      |

**Required staging personas (unchanged):** two ongoing accounts; existing blank; deletable unfinished; second user for cross-user denial.

### Risks and next work

| Risk                                          | Severity        | Owner              | Target                                   |
| --------------------------------------------- | --------------- | ------------------ | ---------------------------------------- |
| Repo-wide tsc baseline blocks `npm run build` | Medium          | Frontend           | Outside multi-account (or Phase 10 note) |
| Rapid live A↔B cache races                    | Medium          | Frontend + staging | Phase 09                                 |
| CMS blank-reuse under concurrency             | Medium          | CMS + staging      | Phase 09                                 |
| Staging fixture provisioning                  | High if missing | Staging owner      | Phase 09 blocker                         |

### Working-tree notes

Unrelated dirty files (dashboard branding, sandbox data-lab, `button.tsx`, older onboarding docs) were preserved. Phase docs under `frontend-integration-phases/` remain untracked until committed by the user.

### Next phase

**Phase 09: Browser and staging verification** — use the checklist above; do not mark browser criteria from code inspection alone.
