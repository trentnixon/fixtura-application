# Phase 02: API Types, Parsing, and BFF Behavior

## Goal

Make the shared frontend contract accurately represent multi-account CMS responses before screen-level changes rely on it.

## Inputs

- Phase 01 audit ledger.
- Parent integration guide API contract.

## Required behavior

- `/api/account/me.data.accounts` is the complete owned-account array.
- Compatibility `data.accountId` is optional and nullable in types and is never selection state.
- `/api/account/first` accepts both `200` and `201` and parses exactly `{ data: { accountId: number } }`.
- `503 ACCOUNT_CREATE_BUSY` remains retryable and exposes `Retry-After` to the caller.
- Current `Retry-After` is integer seconds; defensive support for an HTTP date is allowed.
- BFF/proxy handlers preserve upstream `200`, `201`, `503`, structured bodies, and relevant headers.
- Account-level structured and legacy 404s normalize to a common unavailable/not-owned application result.
- Nested-resource 404s are not misclassified as account ownership failures.

## Tasks

- Update account response and account-list item types using the guaranteed CMS fields.
- Ensure `accountOrganisationDetails` is typed safely enough for name extraction without asserting an undocumented shape.
- Audit fetch wrappers for assumptions that only `200` is successful.
- Preserve `Retry-After` across the application route boundary.
- Preserve authenticated, non-public cache behavior for account responses.
- Add a narrow account-not-found normalizer that receives endpoint/resource context.
- Remove response transforms that manufacture or inject an account id.
- Keep optional creation request fields supported without expecting additional response fields.

## Prohibited shortcuts

- Do not map `accounts[0].id` into compatibility `data.accountId`.
- Do not convert all 404s into account-not-found.
- Do not collapse every successful `/account/first` response to `201` or every response to `200`.
- Do not expose JWTs or `INTERNAL_CMS_TOKEN` to browser code or logs.

## Tests

- Account parsing with two or more accounts.
- Nullable and absent compatibility `accountId`.
- `/account/first` proxy preservation for `200` and `201`.
- `503` body and `Retry-After` preservation.
- Structured account 404 normalization.
- Legacy account-scoped 404 normalization.
- A nested-resource 404 that remains resource-specific.
- Malformed success data without a numeric returned account id.

## Validation commands

Run the focused service, hook, route-handler, and type tests identified by Phase 01, then lint/typecheck the changed contract layer. Record exact commands and counts.

## Acceptance criteria

- Shared types no longer encode one selected account.
- Both create/reuse success statuses reach callers unchanged or with explicitly tested equivalent metadata.
- Busy responses remain actionable to UI code.
- Error normalization is safe and resource-aware.
- No new code depends on the compatibility field.

## Handoff to Phases 03 and 04

Document the final hook/service interfaces, error/result types, retry metadata, and any call-site migrations still required.

---

## Phase 02 completion handoff — 2026-07-13

### Outcome

**Phase complete** (contract layer). Repo-wide `tsc --noEmit` still reports **61** pre-existing errors outside this phase’s files; focused vitest suites for Phase 02 pass.

### Acceptance criteria

| Criterion                                          | Status                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Shared types no longer encode one selected account | Pass — `accountId` optional/nullable; `accounts[]` documented as list source of truth |
| Create/reuse 200 and 201 reach callers             | Pass — BFF + first-route tests; create parse fail-closed                              |
| Busy responses actionable to UI code               | Pass — `ApiError.retryAfterSeconds` + structured `details`; Phase 04 wires UX         |
| Error normalization resource-aware                 | Pass — `isAccountUnavailableError` / `accountUnavailableResult`                       |
| No new code depends on compatibility field         | Pass — row helpers no longer use `accountId` / `rows[0]` for selection                |

### Interfaces for later phases

- `activeAccountSummaryFromMePayload(payload, selectedAccountId: string | undefined)` — requires non-empty selected id; `undefined` on miss.
- `accountPickerRowsFromMePayload` — `accounts ?? []` only.
- `ApiError.retryAfterSeconds: number | null` — from `Retry-After`.
- `parseCreateFirstAccountResponse` — used by `accountApi.createFirstAccount`.
- `isAccountUnavailableError(error, { resource: "account" | "nested" })` and `accountUnavailableResult(...)`.

### Call-site migrations still required

- Phase 03: gateway sidebar when `accountId` omitted (no org chip from compatibility id); Continue-setup / Unfinished organisation copy.
- Phase 04: create-wizard busy/retry UX using `retryAfterSeconds` + `ACCOUNT_CREATE_BUSY`.
- Phase 06: wire `isAccountUnavailableError` into OrgAccessBoundary / resume 404 paths.

### Files changed (production + tests)

- `src/types/api/account.ts`
- `src/lib/account/account-me-rows.ts` (+ test)
- `src/lib/api/bff/next-response-from-strapi-fetch.ts` (+ test)
- `src/app/api/account/me/route.ts`
- `src/app/api/account/first/route.ts` (+ test)
- `src/lib/api/routes/route-definitions.ts`
- `src/lib/api/client/api-error.ts`
- `src/lib/api/client/fetch-client.ts` (+ `fetch-client.retry-after.test.ts`)
- `src/lib/api/parse-retry-after-header.ts` (+ test)
- `src/lib/api/parse-create-first-account-response.ts` (+ test)
- `src/lib/api/account-unavailable.ts` (+ test)
- `src/lib/api/services/account.api.ts`
- `src/lib/api/hooks/account/useCreateFirstAccount.ts`
- Docs: this file; `01-audit-ledger.md` statuses

### Verification

```powershell
npx vitest run src/lib/account/account-me-rows.test.ts src/app/api/account/first/route.test.ts src/lib/api/hooks/account/useCreateFirstAccount.test.tsx src/lib/api/bff/next-response-from-strapi-fetch.test.ts src/lib/api/parse-retry-after-header.test.ts src/lib/api/parse-create-first-account-response.test.ts src/lib/api/account-unavailable.test.ts src/lib/api/client/fetch-client.retry-after.test.ts
```

- Focused vitest: **8 files, 43 tests passed** (42 + 1 retry-after).
- `npx tsc --noEmit`: **61** errors, all outside Phase 02 changed contract files (pre-existing baseline).

### Next

**Phase 03: Organisation selection** — explicit list rendering, Continue setup from `onboardingWizardCompletedAt === null`, Unfinished organisation naming, gateway chrome without compatibility fallback.
