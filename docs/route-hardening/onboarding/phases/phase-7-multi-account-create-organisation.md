# Phase 7: Multi-Account Create Organisation Decision

> **Superseded contract note (2026-07-13):** Active multi-account create/reuse behavior is defined by
> [`../12-frontend-integration-guide.md`](../12-frontend-integration-guide.md).
> Create Organisation obtains the reusable blank account; `200` reuse and `201` create are equivalent
> frontend success. The CMS one-to-one production blocker below is historical and no longer current.

Status: App complete; CMS multi-account contract available (see frontend integration guide)

## Goal

Resolve the known multi-account "Create organisation" ambiguity after the existing flow is stable.

## Problem

The select-organisation UI offers "Create organisation" for customers who already have accounts,
but the wizard historically only called `createFirstAccount` when there were zero account rows. For
existing-account customers, it could advance using the compatibility `/api/account/me` account id, which
risked resuming or editing an existing account instead of obtaining a blank organisation.

## Code Areas

- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/lib/api/hooks/account/useCreateFirstAccount.ts`
- `src/lib/api/services/account.api.ts`
- `src/types/api/account.ts`
- CMS contract docs or handoff notes for additional account creation
- `docs/route-hardening/onboarding/cms-multi-account-user-relation.md` (historical)
- `docs/route-hardening/onboarding/cms-user-account-relation-research-request.md` (historical)
- `docs/route-hardening/onboarding/cms-multi-account-implementation-request.md` (historical request; final contract in `12-frontend-integration-guide.md`)

## Product Decisions

- [x] Existing-account customers are allowed to create an additional organisation from this route.
- [x] Product rule: **Create organisation obtains the reusable blank account** (`200` reuse / `201` create are equivalent success).
- [x] `/create-organisation` with no `accountId` is create/reuse mode and must not infer or reuse compatibility `/api/account/me.accountId`.
- [x] `/create-organisation?accountId=...` is explicit resume mode and only works for an owned account id from `/api/account/me.accounts`.
- [x] Customers can resume incomplete organisations by selecting the unfinished organisation card from `/select-organisation`.
- [x] The select-org card can keep saying "Create organisation" because it now matches the action.

## Implementation Options

### Option A: Additional Account Creation Supported

- Add/use a CMS endpoint for creating another account.
- Make "Create organisation" start a new account creation flow, not reuse `/api/account/me.accountId`.
- Keep resume behavior only when an explicit owned `accountId` is present.
- Add tests for zero-account, one-account, multi-account, resume, and invalid account id.

### Option B: Additional Account Creation Not Supported

- Hide or disable "Create organisation" when the customer already has accounts.
- Keep `/create-organisation?accountId=...` as the explicit unfinished-account resume route.
- Add customer copy explaining how to request another organisation if needed.
- Add tests proving existing-account users cannot accidentally edit the current account.

### Option C: Split Create And Resume

- Create route starts new account creation only.
- Resume route requires `accountId`.
- Select organisation sends unfinished accounts to resume.
- Add route-level guards for missing, invalid, and wrong-account `accountId`.

## Acceptance Criteria

- [x] UI label matches the action.
- [x] Existing-account customers cannot accidentally edit the wrong account.
- [x] Resume flow requires an account id that belongs to the signed-in user.
- [x] New-account flow calls the account creation endpoint and uses the returned `accountId`.
- [x] Tests cover zero-account creation, existing-account creation, explicit resume, and inaccessible account id.

## Tests To Add Or Update

- [x] Select organisation lifecycle routing for unfinished account resume.
- [x] Select organisation lifecycle routing for completed account dashboard entry.
- [x] Create organisation behavior without `accountId` for zero-account users.
- [x] Create organisation behavior without `accountId` for existing-account users.
- [x] Create organisation resume behavior with owned `accountId`.
- [x] Create organisation behavior with inaccessible `accountId`.
- [x] Service/hook tests for account creation endpoint.

## Commands

- [x] Run targeted create/select organisation component tests.
- [x] Run account creation hook/BFF tests.
- [ ] Run `npm run typecheck`.

## Hardening Notes

- Do this last so the decision is made on a stable baseline.
- Do not solve this by silently picking an account id.
- Prefer explicit route mode or explicit account id over inference.

## Completion Evidence

- Product decision:
  - **Create organisation obtains the reusable blank account** (`200` reuse / `201` create equivalent).
  - Incomplete existing organisations are resumed by selecting the organisation card, not by clicking Create organisation.
- Code changes:
  - `create-organisation-wizard.tsx` no longer falls back to compatibility `/api/account/me.accountId` when `/create-organisation` has no `accountId`.
  - Create mode calls `createFirstAccount` for both zero-account and existing-account users, then uses the returned `data.accountId` for the wizard.
  - Explicit resume mode requires `/create-organisation?accountId=...` and verifies the id is present in `/api/account/me.accounts`.
  - Missing create response `accountId` now shows an inline error instead of entering Step 1 without an account id.
- Tests added/updated:
  - `create-organisation-wizard.test.tsx` covers zero-account create, existing-account create/reuse, explicit owned resume, inaccessible resume id, and missing create response id.
  - `select-organisation-content.test.tsx` continues to cover unfinished-account resume via organisation selection.
- Commands run:
  - `npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"`
  - Result: 4 files, 27 tests, all green.
- Remaining risks:
  - Historical CMS one-to-one / idempotent-first research is archived below and in the CMS research docs; **not** an active production blocker.
  - Endpoint name remains `createFirstAccount` / `/api/account/first`; current CMS contract is blank-account obtain (`200`/`201`).
  - Full repo typecheck may still have known unrelated failures from earlier phases unless those have been resolved separately.
  - Continue verification via `frontend-integration-phases/` and Phase 09 browser/staging.

## Historical CMS Blocker (superseded)

> The findings below were true during early Phase 7 research. They are retained for history only.
> Current CMS contract: [`../12-frontend-integration-guide.md`](../12-frontend-integration-guide.md).

CMS research previously confirmed a hard one-to-one user/account schema and idempotent
`POST /api/account/first` that returned the existing first account. That blocked end-to-end
multi-account create at the time.

Required CMS schema at that time:

```text
User.accounts  oneToMany  -> Account  mappedBy: "user"
Account.user   manyToOne  -> User     inversedBy: "accounts"
```

CMS implementation handoff (historical request):

- `docs/route-hardening/onboarding/cms-multi-account-implementation-request.md`
