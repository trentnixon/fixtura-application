# CMS Research Request: User To Multiple Accounts

> **Historical / non-authoritative (2026-07-13).**
> Research request and CMS response from the one-to-one blocker period.
> Current contract: [`12-frontend-integration-guide.md`](./12-frontend-integration-guide.md).
> Do not treat “always creates a new account instance” or one-to-one CMS status as current instructions.

## CMS Response Received

CMS confirmed Phase 7 is blocked at the backend persistence layer.

Summary:

- CMS is still a hard one-to-one user/account model.
- `User.account` is `oneToOne` mapped by `Account.user`.
- `Account.user` is `oneToOne` inversed by `User.account`.
- `GET /api/account/me` already returns `data.accounts[]`, but the current schema means that list can only contain zero or one account.
- `POST /api/account/first` is idempotent:
  - zero accounts: creates an account and returns `201`;
  - existing account: returns `200` with the existing first `accountId`;
  - it does not create a second organisation.

Required CMS change:

```text
User.accounts  oneToMany  -> Account  mappedBy: "user"
Account.user   manyToOne  -> User     inversedBy: "accounts"
```

Required handler change:

- `POST /api/account/first` must create a new account for the authenticated user instead of returning the existing account.

Do not treat app-side Phase 7 as production-complete until CMS can create and return a second account for the same user.

## Request

Please investigate the current CMS user/account relationship and report back on the safest path to support one signed-in user owning multiple organisation accounts.

This research is needed before we fully rely on the Phase 7 onboarding rule:

- **Create organisation** obtains the reusable blank account (`200`/`201` equivalent) — historical drafts said “always creates a new account instance”; that wording is superseded.
- Selecting an existing unfinished organisation resumes that account.
- `/create-organisation?accountId=...` is explicit resume only.

## Background

The members app has been updated so the create-organisation wizard no longer silently reuses the current `/api/account/me.accountId` when the user already has an account.

The remaining risk appears to be in the CMS data model. The CMS is currently understood to behave like a one-to-one user/account relationship. If that is true, creating another organisation for the same user may overwrite, detach, or hide the existing account instead of adding a second owned account.

The desired model is:

```text
User has many Accounts
Account belongs to one User
```

Ownership checks should stay account-scoped:

```text
account.id === :accountId
account.user.id === jwtUser.id
```

## Research Questions

Please confirm the answers to these questions.

1. What is the current CMS relation between user and account?
   - Is it one-to-one, one-to-many, many-to-one, or implemented through custom service logic?
   - What are the exact Strapi content-type fields involved?
   - Is there an existing legacy `account` field on user?

2. What happens today when a user with an existing account creates another account?
   - Does CMS create a second account row?
   - Does it replace the user's existing account relation?
   - Does it create the row but fail to return it from `GET /api/account/me`?
   - Does it fail validation?

3. Can we safely migrate the existing user `account` field into a canonical `accounts` relation?
   - Recommended target: `User.accounts` has many `Account`.
   - Recommended target: `Account.user` belongs to one `User`.
   - Please identify whether Strapi supports renaming/converting this relation directly or whether a new field/backfill/remove sequence is safer.

4. What migration/backfill is required?
   - For every user with an existing single account relation, ensure that account appears in the new `accounts` collection.
   - Preserve account ids and all onboarding state.
   - Preserve ownership checks.
   - Avoid orphaning existing account rows.

5. What CMS service/controller changes are needed?
   - `POST /api/account/first` should create an additional account for the authenticated user even if the user already owns accounts.
   - It must not overwrite or detach existing accounts.
   - It must return the new account id as `{ data: { accountId } }`.
   - `GET /api/account/me` must return all owned accounts in `data.accounts[]`.

6. Are there downstream assumptions that only one account exists?
   - Account setup jobs.
   - Scraper/data-fetch state.
   - Branding/theme relations.
   - Subscription/billing relations.
   - Member dashboard queries.
   - Admin CMS screens or lifecycle hooks.

7. What is the safest rollout strategy?
   - Can this be done in one CMS migration?
   - Do we need a compatibility period where both `account` and `accounts` exist?
   - Should the API keep reading from both fields during migration?
   - When can the legacy single-account field be removed?

## Expected Report Back

Please report back with:

- Current relation shape, including content-type field names.
- Whether creating a second account currently works, partially works, or fails.
- Recommended schema change.
- Recommended migration/backfill plan.
- Required controller/service updates.
- Test plan and fixtures required.
- Rollback risks.
- Any product or app decisions needed before implementation.

## Acceptance Criteria For CMS Implementation

Once implemented, these scenarios must pass:

1. A new user with zero accounts calls `POST /api/account/first`.
   - A new account is created.
   - Response includes the new `accountId`.
   - `GET /api/account/me` returns one account in `accounts[]`.

2. The same user calls `POST /api/account/first` again.
   - A second account is created.
   - The first account remains linked to the same user.
   - `GET /api/account/me` returns both accounts in `accounts[]`.

3. The user can resume either owned account by account id.
   - Account-scoped onboarding routes return success for both owned ids.

4. The user cannot access another user's account.
   - Account-scoped routes return the existing CMS ownership failure convention, either `403` or `404`.

5. Existing users keep their current account after migration.
   - No account ids change.
   - No onboarding state is reset.
   - No account is orphaned.

## App Context

Relevant app-side files:

- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/lib/api/hooks/account/useCreateFirstAccount.ts`
- `src/app/api/account/first/route.ts`

Related onboarding docs:

- `docs/route-hardening/onboarding/cms-multi-account-user-relation.md`
- `docs/route-hardening/onboarding/phases/phase-7-multi-account-create-organisation.md`
