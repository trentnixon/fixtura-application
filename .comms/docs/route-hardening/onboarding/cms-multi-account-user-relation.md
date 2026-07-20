# CMS Handoff: Multi-Account User Relation

> **Historical / non-authoritative (2026-07-13).**
> This document captured an earlier research state (CMS one-to-one + “always create a new row”).
> The current CMS multi-account contract and frontend rules live in
> [`12-frontend-integration-guide.md`](./12-frontend-integration-guide.md).
> Do not use this file as an active LLM or implementation instruction.

## Context

Phase 7 product rule **at the time of this research** was:

- Clicking **Create organisation** must always create a new account instance.
- Selecting an unfinished organisation card resumes that existing account.
- `/create-organisation?accountId=...` is explicit resume only.

**Current product rule:** Create Organisation obtains the reusable blank account; `200` reuse and `201` create are equivalent frontend success. See the frontend integration guide.

The members app now enforces that rule client-side. CMS research has confirmed the remaining blocker: the backend still enforces a one-to-one user/account relationship and `POST /api/account/first` is idempotent.

## Confirmed CMS Findings

CMS is currently one-to-one between user and account:

```text
User.account  oneToOne  -> Account  mappedBy: "user"
Account.user  oneToOne  -> User     inversedBy: "account"
```

`GET /api/account/me` already returns `data.accounts[]`, but under the current schema that array can only contain zero or one account.

CMS also confirmed `POST /api/account/first` is currently idempotent:

- If the user has no account, it creates one and returns `201`.
- If the user already has an account, it returns `200` with the existing first `accountId`.
- It does not create a second organisation for the same user.

Therefore app-side Phase 7 is implemented, but end-to-end multi-account create is blocked until CMS changes the schema and this handler.

## Current Issue

That prevents this product rule from working reliably:

- A signed-in user with an existing account clicks **Create organisation**.
- The app calls `POST /api/account/first`.
- CMS must create a new account row and link it to the same user.
- `GET /api/account/me` must then return both account rows in `accounts[]`.

While CMS treats the user/account relation as one-to-one, the intended Phase 7 behavior cannot persist reliably. The current `POST /api/account/first` path avoids overwrite by returning the existing account, but that means "Create organisation" cannot create a second organisation yet.

## Required CMS Model Change

Update the account/user relation so:

- One user can own many account rows.
- Each account row still belongs to exactly one owning user for tenancy checks.
- Ownership checks remain account-scoped: account id must be owned by the JWT user.

Expected relationship:

- `User.accounts` has many `Account`
- `Account.user` belongs to one `User`

Keep the existing account ownership semantics:

```text
account.id === :accountId
account.user.id === jwtUser.id
```

## Endpoint Contract Updates

### `POST /api/account/first`

Despite the legacy name, this endpoint now needs to support additional account creation.

Required behavior:

- Authenticated user with zero accounts: create first account.
- Authenticated user with one or more accounts: create an additional account.
- Never overwrite or detach existing accounts.
- Return the new account id:

```json
{
  "data": {
    "accountId": 123
  }
}
```

The app sends:

```json
{
  "sport": "cricket",
  "hasCompletedStartSequence": true
}
```

### `GET /api/account/me`

Required behavior:

- Return all account rows owned by the JWT user in `data.accounts[]`.
- `data.accountId` may remain a default/first account for backwards compatibility, but the app no longer uses it for create-new onboarding.
- New account rows created through `POST /api/account/first` must appear in `accounts[]` after cache refresh.

### Account-Scoped Routes

All account-scoped routes must continue validating ownership:

- `GET /api/accounts/:accountId/onboarding/onboarding-state`
- `PATCH /api/accounts/:accountId/onboarding/step-1`
- `PATCH /api/accounts/:accountId/onboarding/step-2`
- `PATCH /api/accounts/:accountId/onboarding/step-3`
- `POST /api/accounts/:accountId/onboarding/confirm`
- `DELETE /api/accounts/:accountId`
- Other `/api/accounts/:accountId/*` member routes

The tenancy rule is unchanged: the route should only operate when the selected account belongs to the JWT user.

## App Behavior Already Implemented

Frontend behavior now expects:

- `/create-organisation` with no `accountId` calls account creation.
- Existing accounts are not inferred from `/api/account/me.accountId`.
- `/create-organisation?accountId=...` resumes only if that id is present in `/api/account/me.accounts`.
- Selecting an unfinished organisation card from `/select-organisation` routes to explicit resume.

Relevant app files:

- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/lib/api/hooks/account/useCreateFirstAccount.ts`
- `src/app/api/account/first/route.ts`

## CMS Test Scenarios

1. User with zero accounts calls `POST /api/account/first`.
   - Expected: new account is created and returned.
   - `GET /api/account/me` returns one row.

2. Same user calls `POST /api/account/first` again.
   - Expected: second account is created and returned.
   - First account remains linked to the user.
   - `GET /api/account/me` returns two rows.

3. User resumes first account with `/api/accounts/:firstId/onboarding/onboarding-state`.
   - Expected: 200 if owned.

4. User resumes second account with `/api/accounts/:secondId/onboarding/onboarding-state`.
   - Expected: 200 if owned.

5. User tries another user's account id.
   - Expected: 404 or 403 according to existing ownership convention.

## App Test Evidence

Targeted Phase 7 tests pass:

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"
```

Result:

- 4 files passed.
- 27 tests passed.

## Open Decision

The endpoint name `POST /api/account/first` is now misleading. CMS/app can either:

- Keep the path for compatibility and treat it as create-account for the signed-in user.
- Add a clearer endpoint such as `POST /api/accounts` or `POST /api/account/create`, then update the app service/hook names.

For the current app implementation, keeping the existing path is lowest-risk as long as CMS changes the user relation and creation behavior.

## CMS Implementation Notes From Research

- Change `User.account` to `User.accounts` as the single inverse relation.
- Change `Account.user` from `oneToOne` to `manyToOne` and set `inversedBy: "accounts"`.
- Do not keep both `account` and `accounts` as Strapi inverse fields for the same relation.
- Preserve existing account ids and onboarding state; current join rows should continue to represent ownership after the cardinality change.
- Remove the idempotent early return from `createFirstAccount`.
- Keep ownership checks as account-scoped queries, returning the existing `404 ACCOUNT_NOT_FOUND` convention for missing or not-owned account ids.
- Audit singular `user.account` helper paths such as `FindRealUser`, tracking, Stripe/order helpers, and fixture tracking before enabling multi-account production flows.
