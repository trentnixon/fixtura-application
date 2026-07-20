# Phase 3: Wizard Data Collection

Status: Complete

## Goal

Prove each wizard step collects and submits exactly the intended data.

## Code Areas

- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/app/(members)/create-organisation/_components/wizard-step-organisation.tsx`
- `src/app/(members)/create-organisation/_components/wizard-step-branding.tsx`
- `src/app/(members)/create-organisation/_components/wizard-step-contact.tsx`
- `src/app/(members)/create-organisation/_components/wizard-step-review.tsx`
- `src/lib/api/hooks/account/useCreateFirstAccount.ts`
- `src/lib/api/hooks/account/useUpdateOnboardingStep1.ts`
- `src/lib/api/hooks/account/useUpdateOnboardingStep2.ts`
- `src/lib/api/hooks/account/useUpdateOnboardingStep3.ts`
- `src/lib/api/hooks/account/useConfirmOnboarding.ts`

## Tasks

- [x] Step 0: verify sport selection, coming-soon handling, and zero-account start sequence.
- [x] Step 1: verify sport, account type, association, optional club, rights holder, and permission payload.
- [x] Step 2: verify premade theme, custom theme, logo upload, and saved logo fallback behavior.
- [x] Step 3: verify first name, last name, and weekly asset email payload.
- [x] Step 4: verify review summary, partial query failures, retry all, and confirm.
- [x] Verify each step blocks invalid submission with customer-safe feedback.
- [x] Verify each successful step invalidates the expected queries.

## Tests To Confirm Or Add

- [x] Component test for Step 0 zero-account `createFirstAccount` behavior.
- [x] Component test for Step 1 required fields and W1 payload.
- [x] Component test for Step 2 theme-only, logo-only, custom theme, upload failure, and theme failure.
- [x] Component test for Step 3 required first name and weekly asset email validation.
- [x] Component test for Step 4 confirm success and error states.
- [x] Hook tests for onboarding mutation invalidation behavior if component tests do not cover it cleanly.

## Commands

- [x] `npx vitest run src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx`
- [x] Add and run targeted tests for each wizard step as files are created.
- [x] Run `npm run typecheck` after code changes.

## Hardening Notes

- Preserve the existing CMS field name `deliveryAddress` while making UI and tests call it weekly asset email.
- Prefer focused tests around payload and user-visible behavior over brittle implementation details.
- Avoid changing the multi-account create/resume behavior in this phase; that is Phase 7.

## Completion Evidence

### Code changes

- None (tests only). Added shared fixtures at `src/app/(members)/create-organisation/_components/_test/wizard-test-fixtures.tsx`.

### Tests added/updated

| File                                     | Coverage                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `create-organisation-wizard.test.tsx`    | Step 0 Get started (7 cases) + existing delete affordance (6 cases)                                         |
| `wizard-step-organisation.test.tsx`      | W1 association + club payloads, validation toast, lookup errors, API error, pending                         |
| `wizard-step-branding.test.tsx`          | Theme-only PATCH, unchanged skip, logo upload, custom theme chain, invalid HEX, load/mutation errors        |
| `wizard-step-contact.test.tsx`           | Required fields, email validation, dirty `deliveryAddress` PATCH, clean skip, partial body, Send to Me, 409 |
| `wizard-step-review.test.tsx`            | Summary labels, confirm success/error, confirmed state, partial failures + Retry all, auth error            |
| `useCreateFirstAccount.test.tsx`         | `account.me` invalidation                                                                                   |
| `useUpdateOnboardingStep1.test.tsx`      | 5-key invalidation matrix                                                                                   |
| `useUpdateOnboardingStep2.test.tsx`      | Upload-before-patch sequencing + 6-key invalidation                                                         |
| `useUpdateOnboardingStep3.test.tsx`      | 5-key invalidation including `auth.me`                                                                      |
| `useConfirmOnboarding.test.tsx`          | 7-key invalidation matrix                                                                                   |
| `useCreateOnboardingStep2Theme.test.tsx` | 4-key invalidation matrix                                                                                   |

**Total:** 58 tests green across 12 files in create-organisation components + 6 hook test files.

### Commands run

```powershell
npx vitest run src/app/(members)/create-organisation/_components/
npx vitest run src/lib/api/hooks/account/useCreateFirstAccount.test.tsx src/lib/api/hooks/account/useUpdateOnboardingStep1.test.tsx src/lib/api/hooks/account/useUpdateOnboardingStep2.test.tsx src/lib/api/hooks/account/useUpdateOnboardingStep3.test.tsx src/lib/api/hooks/account/useConfirmOnboarding.test.tsx src/lib/api/hooks/account/useCreateOnboardingStep2Theme.test.tsx
npm run typecheck
```

Vitest: **58/58 passed**. Typecheck: no errors in new onboarding test files (repo has pre-existing unrelated typecheck failures).

### Remaining risks

- Query invalidation asymmetries documented in Phase 1 remain unfixed (`useUpdateOnboardingStep2` omits `organisationContext`; `useCreateOnboardingStep2Theme` omits lifecycle keys).
- `deliveryAddress` CMS vs app email semantics still open (P2).
- `useCreateFirstAccount` UI still surfaces only `Error.message` (weaker than other steps).
- Multi-account create without `accountId` unchanged (Phase 7).
- BFF route test parity still uneven beyond existing `step-3` route test (Phase 4).

### Next recommended phase

Phase 4 — [phase-4-bff-endpoint-hardening.md](phase-4-bff-endpoint-hardening.md)
