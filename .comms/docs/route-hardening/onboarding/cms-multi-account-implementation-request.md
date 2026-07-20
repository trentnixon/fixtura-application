# CMS Implementation Request: Multi-Account Organisation Creation

> **Historical request / partially superseded (2026-07-13).**
> Final implemented CMS contract for the frontend is
> [`12-frontend-integration-guide.md`](./12-frontend-integration-guide.md).
> Treat “Current Confirmed CMS State” (one-to-one) below as the pre-implementation baseline, not live status.

## Purpose

Please update the CMS so one authenticated user can own multiple organisation accounts.

This is required to unblock onboarding Phase 7. The frontend has already been updated so:

- `/create-organisation` with no `accountId` means obtain a blank organisation account: create one when none exists, otherwise reuse the user's existing blank account.
- `/create-organisation?accountId=...` means explicit resume of an owned unfinished account.
- `/select-organisation` expects `GET /api/account/me` to return all owned accounts in `data.accounts[]`.

The CMS must now persist and return that model.

## Current Confirmed CMS State

CMS is currently a hard one-to-one user/account model.

Current schema:

```text
User.account  oneToOne  -> Account  mappedBy: "user"
Account.user  oneToOne  -> User     inversedBy: "account"
```

Current behavior:

- `GET /api/account/me` already returns `data.accounts[]`, but the one-to-one schema means that array is only 0 or 1 account.
- `POST /api/account/first` is idempotent.
- If a user already has an account, `POST /api/account/first` returns `200` with the existing first `accountId`.
- It does not create a second organisation.

That blocks the product rule: **Create organisation should provide a fresh blank account once the user's existing accounts have a club or association selected, while never allowing multiple blank accounts.**

## Required Schema Change

Change the relationship to:

```text
User.accounts  oneToMany  -> Account  mappedBy: "user"
Account.user   manyToOne  -> User     inversedBy: "accounts"
```

Expected file areas:

- `src/extensions/users-permissions/content-types/user/schema.json`
- `src/api/account/content-types/account/schema.json`

Important:

- Do not keep both `User.account` and `User.accounts` as Strapi inverses of the same relation.
- Preserve existing account ids.
- Preserve onboarding, billing, branding, setup, and asset state on existing account rows.
- Existing one-account users must still see their existing account after migration.

## Required Controller / Service Change

Update `POST /api/account/first`.

Expected file area:

- `src/api/account/controllers/account.js`

Required behavior:

1. Authenticated user with zero accounts calls `POST /api/account/first`.
   - Create a new account.
   - Return `201`.
   - Return `{ data: { accountId: <new id> } }`.

2. Authenticated user with one or more existing accounts calls `POST /api/account/first`.
   - If the user already owns a blank account, return that blank account id instead of creating another account.
   - If the user does not own a blank account, create an additional account.
   - Do not detach or overwrite existing accounts.
   - A newly created account returns `201` with `{ data: { accountId: <new id> } }`.
   - A repeated request that reuses the existing blank account returns `200` with `{ data: { accountId: <existing blank id> } }`.

For this contract, an account is blank while both its club and association relations are unset. Once either relation has been selected, the account is ongoing, even if the wizard has not been completed. Automatically created defaults do not make an account non-blank. CMS must identify and document the exact schema fields used for the club and association relations before implementing this lookup.

A user must never have multiple blank accounts. CMS must enforce this server-side, including for retries, double-clicks, and concurrent requests.

The endpoint name can remain `/api/account/first` for now for app compatibility, even though the behavior becomes "create account for current user".

## Required `/api/account/me` Behavior

`GET /api/account/me` must return every account owned by the authenticated user.

Required response shape:

```json
{
  "data": {
    "accountId": 123,
    "accounts": [{ "id": 123 }, { "id": 456 }],
    "user": {}
  }
}
```

Notes:

- `data.accounts[]` is the source of truth for organisation selection.
- There is no default or active account selected from this response. The user explicitly chooses an account from `data.accounts[]`.
- Target product behavior has no default account. During the compatibility audit, `data.accountId` may temporarily remain the deterministic lowest owned account id so existing consumers are not broken without warning.
- New and updated flows must not use `data.accountId` for selection. After all frontend, admin, and client consumers are audited, return it as `null` or remove it when compatibility permits.
- The frontend no longer uses `data.accountId` to decide create-new onboarding.
- Keep the existing account object fields, user payload, and response structure unchanged apart from returning all owned accounts in `data.accounts[]`.

Expected file area:

- `src/api/account/controllers/services/loggedInAccountPayload/index.js`

The current query by `where: { user: userId }` appears compatible with the target model, but please verify after the relation change.

## Ownership Contract

Keep account-scoped ownership checks.

The expected rule remains:

```text
account.id === :accountId
account.user.id === jwtUser.id
```

Routes for another user's account should continue to return the current CMS convention, currently understood as `404 ACCOUNT_NOT_FOUND`.

Do not introduce JWT-selected active account context for this work. The frontend already passes explicit `accountId` in member routes.

## Confirmed Implementation Decisions

### Blank Account And Duplicate-Submission Rule

- Retries, double-clicks, and concurrent requests must not create multiple blank accounts.
- A user may own only one blank account at a time.
- An account is blank until a club or association has been selected.
- Once a club or association has been selected, the account is ongoing, even if onboarding is unfinished or later abandoned.
- If a blank account already exists, `POST /api/account/first` returns that account id rather than creating another blank account.
- The server must enforce this rule; frontend double-submit protection is supplementary only.
- A blank account remains the user's reusable blank account until a club or association is selected or the account is explicitly deleted. A user who wants to abandon that blank account and start again must delete it through the unfinished-account flow first.

### Wizard Progress And Account Visibility

- The wizard already saves progress and provides a final review of saved data. No new provisioning-failure workflow is required for this change.
- Unfinished and operationally inactive owned accounts must remain in `data.accounts[]` so the user can resume them.
- An account explicitly deleted through the wizard must no longer appear.
- A deleted blank account must not count as the user's blank account. After deletion, the next create request may create a new blank account and return `201`.

### No Product Default Account And Temporary Compatibility

- There is no default or implicitly active account.
- The account-selection screen shows every account under the user's control, and the user explicitly chooses which account to view or use.
- `data.accounts[]` is the source of truth.
- Until the consumer audit is complete, legacy `data.accountId` may temporarily remain the deterministic lowest owned account id for compatibility only. This value is not an active or selected account.
- New and updated flows must ignore the compatibility field. Once all consumers are confirmed safe, return `null` or remove the field when compatibility permits.

### `/api/account/me` Compatibility

- Keep the user payload, account object fields, and overall response behavior exactly as they are today.
- The required functional change is that the user relation becomes `accounts[]` and the array contains every owned account object.
- Do not add new user fields or expose additional private/internal user data.

### Account-Scoped Processing

- The user record exists for authentication and ownership verification; it does not control account processing.
- Payments, Stripe data, subscriptions, orders, tracking, fixtures, scheduled jobs, queue jobs, and other processing must resolve through the specific account or an account-scoped related record.
- These flows must never select an arbitrary or default account from the user.

### Migration And Data Preservation

- All existing account ids, data, relations, and user ownership must remain unchanged.
- Accounts remain attached to their existing users; the change only allows each user to own more than one account.
- CMS must perform and report pre/post migration integrity checks so no account becomes orphaned and no user loses account visibility.

### Full Singular-Account Audit

- CMS must audit the entire backend for code that assumes a user has only one account. The known files below are starting points, not the audit boundary.
- Search for `user.account`, singular account population, one-result assumptions, relation metadata, and helpers such as `FindRealUser`.
- Every occurrence must either:
  - use an explicit account or account-scoped relation;
  - use the new `accounts[]` relationship where a list is intended; or
  - be documented as safe with the reason no change is needed.

### Authentication And Error Contracts

- Existing authentication and error behavior remains unchanged.
- Unauthenticated requests remain `401`.
- Invalid account id format remains `400`.
- Cross-user access remains `404 ACCOUNT_NOT_FOUND` so the API does not reveal whether another user's account exists.
- Nonexistent and not-owned account ids should retain the same non-enumerating response behavior.

## Implementation Questions And Confirmed Answers

### Blank Account Race Handling

**Question:** How will CMS enforce "only one blank account per user" under concurrent requests? Is this a transaction, lock, unique constraint/partial index, or best-effort service check?

**Answer:** CMS must enforce the rule atomically. A best-effort service-level "check then create" is not sufficient. CMS should use the transaction, lock, database constraint, or equivalent mechanism appropriate to the actual database and relation schema, then document the chosen mechanism. The required result is that concurrent requests return the same blank account id and create exactly one account row.

Before coding this behavior, CMS must provide a short concurrency design proposal that identifies:

- the database engine and how the club and association relations are stored;
- the exact fields or join tables used to determine blankness;
- the proposed transaction, user-level lock, lock row/table, constraint, creation-token mechanism, or equivalent;
- why the mechanism serializes creation for the same user;
- failure, rollback, and lock-release behavior; and
- the automated concurrency test approach.

### Blank Account Status Code

**Question:** When `/api/account/first` reuses an existing blank account, should the response be `200` or `201`?

**Answer:** Return `200` when reusing an existing blank account and `201` when a new account is created.

### Blank Account Definition

**Question:** Is "blank until club or association selected" enough, or should account type also matter?

**Answer:** Account type does not change the rule. An account remains blank while both its club and association relations are unset. Selecting only an account type still leaves it blank. Once either a club or association is selected, the account becomes ongoing.

### Blank Account Visibility Copy And State

**Question:** How should a blank account appear in `/api/account/me.data.accounts[]` and the select-organisation UI?

**Answer:** Blank accounts must appear in `data.accounts[]` so users can resume them. Keep the account fields currently returned. The frontend should retain its existing unfinished-account presentation; if the account has no usable organisation name, display the fallback label **Unfinished organisation**.

### `data.accountId` Compatibility

**Question:** Can CMS confirm no remaining frontend, admin, or client depends on `/api/account/me.data.accountId` containing a real id? If a dependency remains, should CMS temporarily return a deterministic first account id?

**Answer:** There is no product concept of a default account. CMS and frontend must audit remaining consumers before changing the field. During that audit, CMS may temporarily preserve the deterministic lowest owned account id for legacy compatibility only; it is not an active or selected account and new flows must not use it. When all consumers are confirmed safe, return `null` or remove the field when compatibility permits. Any legacy dependency found must be reported and resolved.

### Soft Delete And Deleted Accounts

**Question:** What is the exact CMS deletion model for unfinished accounts: hard delete, soft delete, archived flag, or draft/publish state?

**Answer:** Keep the CMS deletion mechanism already in use; this work does not introduce a new deletion model. Regardless of the underlying mechanism, an account explicitly deleted by the user must not appear in `/api/account/me` and must not participate in blank-account detection. Deleting the user's blank account allows the next create request to create a new blank account. CMS must document the existing deletion mechanism and verify both exclusion behaviors.

### Provisioning Failure State

**Question:** If account defaults fail after creating the account row, does CMS roll back, or does the blank/resumable account remain? What status or error will the frontend see?

**Answer:** No new provisioning-failure workflow is required for this change. Preserve the existing wizard and error behavior: saved accounts remain visible and resumable. CMS must report if the current creation process can leave an unusable account that cannot be resumed; that condition must not be silently introduced by this relation change.

### Migration Verification

**Question:** What exact pre/post migration checks will CMS run?

**Answer:** CMS must report:

- users-with-accounts count before and after;
- total account count before and after;
- orphaned-account count before and after;
- any users who lost account visibility;
- verification that existing account ids and ownership did not change; and
- sample verification of existing onboarding, billing, branding, and setup data.

### Singular Helper Audit Evidence

**Question:** Can CMS report every `user.account` or single-account assumption found and mark each as changed, safe, or deferred?

**Answer:** Yes. CMS must report every singular-account assumption found and classify it as:

- changed;
- safe without change, with a reason; or
- deferred, with the risk and required follow-up clearly identified.

### Second Account Manual Proof

**Question:** Can CMS provide a concrete result proving blank-account reuse followed by creation of a second account?

**Answer:** Yes. Phase 7 sign-off requires proof that:

1. The user creates a first blank account and receives `201` with its id.
2. A repeated request returns `200` with the same id and creates no additional row.
3. The user selects a club or association for that account.
4. A subsequent create request returns `201` with a different new account id.
5. Both accounts remain owned by the same user and appear in `data.accounts[]`.

## Legacy Singular Account Helper Audit

Please audit and update any code that assumes `user.account` singular.

Known areas from CMS research:

- `FindRealUser` helpers.
- `src/api/account/controllers/Utils/TrackingFunc.js`
- `src/api/order/controllers/services/helpers/userHelpers.js`
- Tracking helpers.
- Stripe/order helpers.
- Fixture tracking paths.

Preferred approach:

- Account-scoped flows should accept/use an explicit `accountId`.
- User-level fallbacks should choose a documented default only where old behavior requires it.
- Do not use `account.isActive` as "selected account"; that field already means operational/readiness state.

## Migration Expectations

For existing data:

- Existing user/account ownership must remain intact.
- Existing account ids must not change.
- Existing onboarding status must not reset.
- Existing billing/subscription/order relations must remain attached to the same account.
- No account rows should become orphaned.

Rollback risk:

- Once users can own multiple accounts, reverting to one-to-one would require manually choosing which account to keep attached. Please call this out in the CMS rollout notes.

## Required CMS Tests

Please add or update CMS tests for these scenarios.

### Account Creation

1. New user with zero accounts calls `POST /api/account/first`.
   - Response is `201`.
   - Response includes a new `accountId`.
   - `GET /api/account/me` returns one account.

2. Same user calls `POST /api/account/first` again before selecting a club or association.
   - Response is `200`.
   - Response includes the same blank `accountId`.
   - No additional account is created.
   - `GET /api/account/me` still returns exactly one account.

3. Same user selects a club or association for the first account, then calls `POST /api/account/first` again.
   - Response is `201`.
   - Response includes a different new `accountId`.
   - First account remains linked to the same user with all saved data unchanged.
   - `GET /api/account/me` returns both account ids.

4. Two create requests for the same user run concurrently while no blank account exists.
   - Both responses resolve to the same blank `accountId`.
   - Exactly one new account row is created.
   - The user owns exactly one blank account after both requests complete.

5. After the second blank account is created, the same user calls `POST /api/account/first` again before selecting a club or association on it.
   - Response is `200`.
   - Response includes the second blank account id.
   - No third account row is created.
   - The user still owns exactly one blank account.

### Account Selection / Ownership

6. User can load onboarding state for the first owned account.
   - Expected success.

7. User can load onboarding state for the second owned account.
   - Expected success.

8. User cannot load another user's account.
   - Expected existing ownership failure convention, currently `404 ACCOUNT_NOT_FOUND`.

### Migration Regression

9. Existing one-account user after migration:
   - Same account id is present.
   - Same onboarding fields are present.
   - Same billing/branding/setup fields are present.
   - `GET /api/account/me` returns that account in `accounts[]`.

### Downstream Regression

10. New account receives its own per-account relations.

- Branding/theme/template option/scheduler defaults should attach to the new account only.
- Billing/order/customer relations should remain account-scoped.

11. Any updated singular `user.account` helper has coverage or a documented manual verification path.

## Confirmation Needed Back From CMS Team

Please report back with:

- Schema diff summary.
- Controller/service diff summary.
- Migration/backfill notes.
- Test command run.
- Passing test count.
- Any failing tests and whether they are related.
- Manual verification notes for:
  - first account creation;
  - second account creation;
  - `/api/account/me` returning both accounts;
  - explicit owned-account access;
  - other-user account denial.

## Frontend Interrogation And Potential Change Areas

The frontend is already structured around explicit account selection, but the CMS response and blank-account rules require a focused frontend audit. The items below are investigation areas, not assumptions that every listed file must change.

### API Contract And Proxy Layer

Inspect frontend API routes, response schemas, parsing, and proxy behavior for:

- assumptions that `POST /api/account/first` always returns `201`;
- support for `200` when CMS reuses an existing blank account;
- preservation of `{ data: { accountId } }` for both `200` and `201` responses;
- assumptions that `/api/account/me.data.accountId` always contains a real id;
- singular `account` parsing or types that must become `accounts[]`; and
- accidental filtering, truncation, or selection of only the first returned account.

Potential frontend changes may include accepting both successful creation statuses, updating response schemas/types, and removing any remaining dependency on `data.accountId`.

### Account Hooks, Mutations, And Cache State

Inspect account hooks and mutation behavior for:

- double-submit protection while the create request is pending;
- retry behavior after timeouts or network failures;
- whether a reused blank account id is handled the same as a newly created id;
- invalidation or refresh of `/api/account/me` after create, resume, update, or delete;
- stale cached account arrays after a second account is created; and
- cache keys that omit the explicit `accountId` and could leak state between owned accounts.

Frontend double-submit protection remains desirable for user experience, but CMS is responsible for enforcing the single-blank-account rule.

### Create And Resume Organisation Routing

Inspect onboarding routing and wizard initialization for:

- `/create-organisation` obtaining a blank account from CMS, whether newly created or reused;
- `/create-organisation?accountId=...` resuming only the explicitly requested owned account;
- no fallback to `data.accountId`, the first account, or a JWT-selected account;
- every wizard request using the returned or explicit `accountId`; and
- account state from one wizard session not carrying into another account.

Potential frontend changes may include treating a `200` reuse response as a successful create-or-resume result and ensuring all subsequent wizard requests remain explicitly account-scoped.

### Select Organisation Listing

Inspect the selection screen for:

- rendering every object in `data.accounts[]`;
- preserving the account fields and presentation already in use;
- showing unfinished, blank, ongoing, inactive, and resumable owned accounts;
- excluding accounts explicitly deleted by the user;
- using **Unfinished organisation** when a blank account has no usable organisation name;
- selecting an account by its explicit id; and
- avoiding any visual or routing concept of a default account.

Potential frontend changes may include the fallback label and any state-specific action copy such as **Continue setup** rather than **Open organisation**.

### Delete And Abandon Flow

Inspect the wizard deletion flow for:

- deleting the intended explicit `accountId` only;
- removing the deleted account from cached `accounts[]` immediately or after refetch;
- returning the user safely to the organisation-selection screen;
- ensuring a deleted blank account no longer blocks creation of a new blank account; and
- handling CMS deletion failures without hiding an account that still exists.

### Account Isolation Across Frontend Features

Audit frontend member routes and account-aware clients for any remaining singular or implicit account assumptions, including:

- billing and subscription screens;
- orders and checkout;
- branding and assets;
- fixtures, tracking, and scheduler screens;
- onboarding and setup status;
- dashboard links and redirects; and
- server actions, route handlers, and API clients that derive account context from the logged-in user alone.

Every account-scoped request must use the account selected in the route or operation. Authentication identifies the user; it does not select the account.

### Frontend Tests To Add Or Update If The Audit Finds Gaps

The frontend test suite should prove:

1. A `201` response for a newly created blank account starts the wizard with the returned id.
2. A `200` response for an existing blank account starts or resumes the wizard with the returned id.
3. Repeated UI submission does not start multiple mutations.
4. `/select-organisation` renders all returned account objects.
5. A nameless blank account uses the **Unfinished organisation** fallback.
6. Selecting each account navigates with that account's explicit id.
7. No create, resume, selection, or redirect logic depends on `data.accountId`.
8. Deleting an unfinished account removes it from the listing and allows a later blank account to be obtained.
9. Cached data and requests remain isolated when switching between two owned accounts.
10. Cross-user and nonexistent-account failures retain the current safe frontend behavior.

### Frontend Audit Report Back

Before Phase 7 sign-off, frontend should report:

- every remaining consumer of `data.accountId` and its disposition;
- every singular `account` assumption found in the affected account-selection and onboarding paths;
- files changed, if any;
- tests added or updated;
- the frontend test command and result; and
- manual verification of new-account creation, blank-account reuse, explicit resume, deletion, account switching, and account isolation.

## Frontend Re-Test After CMS Confirmation

Once CMS confirms the above, frontend will re-run:

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"
```

Then we should perform a browser pass:

1. Existing user with one organisation that already has a club or association selected opens `/select-organisation`.
2. User clicks **Create organisation**.
3. CMS creates a second account.
4. Wizard uses the returned second `accountId`.
5. Returning to `/select-organisation` shows both organisations.
6. Selecting an unfinished organisation resumes that specific account.
7. Selecting a completed organisation opens that specific account dashboard.

## Phase 7 Sign-Off Rule

Existing frontend Phase 7 work is complete against the prior create-account contract. The final CMS contract now requires a focused frontend compatibility audit, so Phase 7 remains **CMS-blocked and frontend-audit-required** until CMS proof and frontend audit evidence are both complete.

Sign-off requires proof that:

- one user can own multiple account rows;
- create organisation creates and assigns a new account row when no blank account exists, and reuses the existing blank account otherwise;
- retries and concurrent create requests cannot leave a user with multiple blank accounts;
- `/api/account/me` returns all owned accounts;
- account-scoped ownership checks still protect cross-user access.
