# Phase 4: BFF Endpoint Hardening

Status: Complete

## Goal

Make onboarding BFF routes consistent, tested, and easy to maintain.

## Code Areas

- `src/app/api/account/first/route.ts`
- `src/app/api/account/onboarding/lookups/**/route.ts`
- `src/app/api/accounts/[accountId]/onboarding/**/route.ts`
- `src/app/api/accounts/[accountId]/route.ts`
- `src/lib/api/bff/guard-account-strapi-request.ts`
- `src/lib/api/bff/guard-strapi-request.ts`
- `src/lib/api/bff/parse-json-body-or-empty.ts`
- `src/lib/api/bff/next-response-from-strapi-fetch.ts`
- `src/app/api/_test-utils/strapi-route-mocks.ts`

## Tasks

- [x] Compare every onboarding BFF route against the existing `step-3` route test expectations.
- [x] Decide whether to extract shared JSON proxy helpers or use existing helpers consistently.
- [x] Standardize unauthorized behavior.
- [x] Standardize invalid account id behavior.
- [x] Standardize missing Strapi URL behavior.
- [x] Standardize invalid JSON behavior for JSON write routes.
- [x] Standardize upstream JSON error passthrough.
- [x] Standardize upstream text error passthrough.
- [x] Standardize unexpected exception handling and Sentry capture.
- [x] Verify multipart upload forwards auth and file body correctly.
- [x] Verify GET routes use `cache: "no-store"`.

## Route Test Matrix

- [x] `POST /api/account/first`
- [x] `GET /api/account/onboarding/lookups/sports`
- [x] `GET /api/account/onboarding/lookups/organisation-types`
- [x] `GET /api/account/onboarding/lookups/associations`
- [x] `GET /api/account/onboarding/lookups/clubs`
- [x] `GET /api/account/onboarding/lookups/themes`
- [x] `PATCH /api/accounts/[accountId]/onboarding/step-1`
- [x] `PATCH /api/accounts/[accountId]/onboarding/step-2`
- [x] `POST /api/accounts/[accountId]/onboarding/step-2/upload`
- [x] `POST /api/accounts/[accountId]/onboarding/step-2/theme`
- [x] `PATCH /api/accounts/[accountId]/onboarding/step-3`
- [x] `POST /api/accounts/[accountId]/onboarding/confirm`
- [x] `GET /api/accounts/[accountId]/onboarding/setup-status`
- [x] `GET /api/accounts/[accountId]/onboarding/onboarding-state`
- [x] `POST /api/accounts/[accountId]/onboarding/retry-setup`
- [x] `DELETE /api/accounts/[accountId]`

## Commands

- [x] `npx vitest run src/app/api/accounts/[accountId]/onboarding/step-3/route.test.ts`
- [x] Run each new route test as it is added.
- [x] Run grouped onboarding API route tests after helper changes.
- [x] Run `npm run typecheck` (repo has pre-existing unrelated failures; Phase 4 files are clean).

## Hardening Notes

- Keep response shapes stable unless a route is already demonstrably inconsistent with the rest of the app.
- Consolidation should reduce duplicated proxy code without obscuring route-specific upstream paths.
- Do not introduce broad middleware behavior in this phase.

## Completion Evidence

- Code changes:
  - Added `guardStrapiRequest` and `parseJsonBodyOrEmpty` helpers under `src/lib/api/bff/`.
  - Refactored all 15 onboarding BFF routes to use shared guards + `nextResponseFromStrapiFetch`.
  - Account-scoped routes use `guardAccountStrapiRequest`; auth-only routes use `guardStrapiRequest`.
  - JSON write routes use `parseJsonBodyOrEmpty`; multipart upload keeps inline check but uses shared guard + mapper.
  - Added shared route test utilities at `src/app/api/_test-utils/strapi-route-mocks.ts`.
- Tests added/updated:
  - 13 new `route.test.ts` files for onboarding BFF routes.
  - Updated `step-3/route.test.ts` and `accounts/[accountId]/route.test.ts` to use shared mocks.
  - Added unit tests for `guard-strapi-request` and `parse-json-body-or-empty`.
  - 95 tests passing across 18 test files (helpers + all onboarding BFF routes).
- Commands run:
  - `npx vitest run src/lib/api/bff/guard-strapi-request.test.ts src/lib/api/bff/parse-json-body-or-empty.test.ts src/app/api/account/first/route.test.ts src/app/api/account/onboarding src/app/api/accounts/[accountId]/onboarding src/app/api/accounts/[accountId]/route.test.ts`
  - `npm run typecheck` (pre-existing failures outside Phase 4 scope)
- Remaining risks:
  - `GET /api/account/me` and legacy `GET /api/account/organisation/[accountId]` still use inline guards (out of Phase 4 matrix).
  - Billing route tests still use local mocks; shared util available for future adoption.
  - Phase 7 multi-account create-organisation behavior unchanged.
- Next recommended phase:
  - Phase 5: Recovery, Retry, And Deletion (`docs/route-hardening/onboarding/phases/phase-5-recovery-retry-and-deletion.md`)
