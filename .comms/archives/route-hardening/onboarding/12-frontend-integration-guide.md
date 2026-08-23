# Frontend Integration Guide: CMS Multi-Account Organisations

**Prepared:** 2026-07-13  
**CMS clarifications incorporated:** 2026-07-13  
**CMS repository:** `D:\htdoc\Fixtura\Fixtura.com.au\Backend`  
**Audience:** Fixtura frontend implementation and review team  
**Purpose:** Describe the implemented CMS multi-account contract and the frontend changes required to integrate with it safely.

## Executive summary

The CMS ownership model has changed from one authenticated user owning one account to one authenticated user owning multiple organisation accounts.

The user identity now answers only:

- who is authenticated; and
- whether that user owns a requested account.

It does not select an active or default account. Every account-scoped frontend route, request, mutation, cache entry, redirect, and screen must use an explicit account id.

The key frontend behavior is:

- `POST /api/account/first` means **obtain the user's reusable blank organisation account**;
- it returns `201` when it creates a new blank account;
- it returns `200` when it reuses an existing blank account;
- both responses contain `{ data: { accountId } }`;
- `GET /api/account/me` returns all owned accounts in `data.accounts[]`; and
- `data.accountId` remains temporarily for compatibility but must not be used as account selection state.

The frontend may now begin Phase 06 integration and audit work against this contract. Production deployment remains subject to CMS staging/PostgreSQL preflight.

## Implemented CMS model

### Ownership relationship

The CMS schema now uses:

```text
User.accounts  oneToMany -> Account
Account.user   manyToOne -> User
```

A user may own multiple accounts. Existing account ids and ownership mappings were preserved locally.

### Blank-account rule

An account is blank only while both conditions are true:

- it has no selected club; and
- it has no selected association.

The following do not make an account ongoing:

- selecting only an account type;
- changing wizard progress;
- saving a partial organisation name;
- creating default scheduler/template records; or
- abandoning onboarding without deleting the account.

Once either a club or association is selected, the account is ongoing. A later create request may then create another blank account.

A user may own at most one blank account at a time. The CMS enforces this under concurrent requests through a per-user database lock and transaction.

### Account-state classification

Blank, unfinished, operationally set up, and deletable are separate concepts:

- **Blank:** neither a club nor an association is selected. This classification is only for the CMS `/account/first` create/reuse rule.
- **Onboarding unfinished:** `onboardingWizardCompletedAt` is `null`.
- **Operationally set up:** `isSetup === true`.
- **Deletable:** determined only by the deletion endpoint; the frontend must not infer eligibility from list fields.

For organisation selection, use `onboardingWizardCompletedAt === null` for **Continue setup**. Do not reproduce the blank-account club/association rule in frontend presentation logic.

## API contract

### Obtain a blank organisation account

```http
POST /api/account/first
Authorization: Bearer <member-jwt>
Content-Type: application/json
```

The request body remains optional. Existing supported optional fields may be sent where the current frontend flow already requires them.

#### New blank created

Status:

```http
201 Created
```

Body:

```json
{
  "data": {
    "accountId": 456
  }
}
```

#### Existing blank reused

Status:

```http
200 OK
```

Body:

```json
{
  "data": {
    "accountId": 456
  }
}
```

The frontend must treat both statuses as success and continue with the returned id. Do not branch into different onboarding behavior based on `200` versus `201`.

#### Busy/retry response

If the CMS cannot obtain the per-user creation lock after bounded retries:

```http
503 Service Unavailable
Retry-After: 1
```

```json
{
  "error": {
    "code": "ACCOUNT_CREATE_BUSY",
    "message": "Account creation is busy. Please retry."
  }
}
```

Frontend behavior:

- keep the current page and user input;
- stop the pending state;
- show a retryable error;
- respect `Retry-After` where practical; and
- allow the user to retry the same operation.

The current CMS always emits `Retry-After: 1` as integer delay seconds, not an HTTP date. The frontend may defensively support both standard forms, but integer seconds are the current contract.

Do not issue an alternative create call or generate a client-side account id.

#### Other errors

- unauthenticated: `401`;
- invalid request data: `400`; and
- unexpected creation failure: `500` using the existing CMS error convention.

### Load all owned accounts

```http
GET /api/account/me
Authorization: Bearer <member-jwt>
```

Representative response:

```json
{
  "data": {
    "accountId": 123,
    "accounts": [
      {
        "id": 123
      },
      {
        "id": 456
      }
    ],
    "user": {}
  }
}
```

The real account objects retain the existing fields used by the frontend. The abbreviated objects above illustrate ownership/list shape only.

Each `data.accounts[]` item currently guarantees:

```ts
{
  id: number;
  FirstName: string | null;
  LastName: string | null;
  DeliveryAddress: string | null;
  isActive: boolean;
  isSetup: boolean;
  isRightsHolder: boolean;
  isPermissionGiven: boolean;
  group_assets_by: unknown;
  include_junior_surnames: boolean;
  isUpdating: boolean;
  Sport: string | null;
  onboardingOrganisationName: string | null;
  onboardingWizardCompletedAt: string | null;
  account_type: number | null;
  accountOrganisationDetails: object | null;
  templateOptionId: number | null;
}
```

This list data is sufficient for organisation-selection rendering, naming, and **Continue setup** presentation. It is not sufficient to determine deletion eligibility.

The CMS currently returns accounts in ascending account-id order. This ordering is not selection or preference state. The frontend may apply a separate presentation sort as long as every account remains visible and navigation continues to use each row's explicit id.

Frontend rules:

- `data.accounts[]` is the source of truth for organisation listing and selection.
- Render every returned account.
- Do not truncate to the first account.
- Do not infer an active/default account from array position.
- Do not use `data.accountId` as selected account state.
- Do not use `account.isActive` as selected-account state; it represents operational readiness.
- Preserve unfinished, blank, incomplete, inactive, and resumable accounts in the list.

### Temporary compatibility field

`data.accountId` currently contains the deterministic lowest owned account id. It exists only to avoid breaking legacy consumers during rollout.

It is not:

- the active account;
- the last selected account;
- the preferred organisation;
- the account to open automatically; or
- permission to omit an explicit account id.

Frontend types should tolerate this field becoming `null` or being removed in a later contract cleanup. New code must not depend on it.

### Explicit account ownership

Member-facing account routes enforce:

```text
requested account id + authenticated user id
```

Expected failures:

- malformed account id: `400`;
- unauthenticated: `401`; and
- nonexistent or another user's account: `404 ACCOUNT_NOT_FOUND`.

The shared non-enumerating error shape is:

```json
{
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "Account not found."
  }
}
```

The frontend must handle nonexistent and cross-user account ids identically. Do not tell the user that another person's account exists.

Structured error formatting is not yet consistent across every legacy member endpoint. Newer onboarding, deletion, Stripe, and hardened services return structured `ACCOUNT_NOT_FOUND`; some older account-scoped controllers return a plain Strapi `404` with an `Account not found` message.

Temporarily normalize both forms into the same unavailable/not-owned UI state:

- account-scoped `404` with `error.code === "ACCOUNT_NOT_FOUND"`; and
- legacy account-scoped `404` without that code.

Do not broadly normalize unrelated nested-resource errors, such as `Render not found`, without considering the missing resource type.

## Required frontend flows

### Create organisation

Route intent:

```text
/create-organisation
```

Required sequence:

1. User chooses **Create organisation**.
2. Frontend calls `POST /api/account/first` once.
3. Disable repeated submission while the request is pending.
4. Accept either `200` or `201`.
5. Read `response.data.accountId`.
6. Initialize the wizard with that exact id.
7. Include that id in every subsequent onboarding request.
8. Refresh/invalidate the account listing when account-visible data changes.

Important:

- A `200` is not a no-op or error. It means an existing blank account is being resumed.
- A `201` does not mean the account is complete. It means a new blank row and required defaults were created.
- Network retry may return `200` after the original request committed but its response was lost. This must behave exactly like success.

### Explicit resume

Route intent:

```text
/create-organisation?accountId=456
```

Required sequence:

1. Parse and validate the explicit `accountId`.
2. Load onboarding state for that account id.
3. Do not call `/account/first` merely because the account is unfinished.
4. Do not fall back to `data.accountId` or the first account if loading fails.
5. Treat `404 ACCOUNT_NOT_FOUND` as unavailable/not owned and navigate safely back to organisation selection.

### Account-specific onboarding endpoints

All account-specific onboarding endpoints carry `accountId` in the route:

```text
PATCH  /api/accounts/:accountId/onboarding/step-1
POST   /api/accounts/:accountId/onboarding/step-2/theme
PATCH  /api/accounts/:accountId/onboarding/step-2
POST   /api/accounts/:accountId/onboarding/step-2/upload
PATCH  /api/accounts/:accountId/onboarding/step-3
POST   /api/accounts/:accountId/onboarding/confirm
GET    /api/accounts/:accountId/onboarding/setup-status
GET    /api/accounts/:accountId/onboarding/onboarding-state
POST   /api/accounts/:accountId/onboarding/retry-setup
POST   /api/accounts/:accountId/onboarding/restart
```

Request bodies contain step data only and must not select or override the route account.

These lookup routes remain user-level and require no account id:

```text
GET /api/account/onboarding/lookups/sports
GET /api/account/onboarding/lookups/organisation-types
GET /api/account/onboarding/lookups/associations
GET /api/account/onboarding/lookups/clubs
GET /api/account/onboarding/lookups/themes
```

### Organisation selection

The selection page must:

- render every object in `data.accounts[]`;
- use each object's `id` for navigation and actions;
- keep unfinished accounts visible;
- display **Unfinished organisation** when no usable organisation name exists;
- use appropriate action copy such as **Continue setup** for unfinished accounts;
- avoid visual designation of a default account unless the product later adds one; and
- open the explicitly selected account only.

For display naming, use a usable `onboardingOrganisationName`, then a usable name supplied by `accountOrganisationDetails`. Show **Unfinished organisation** only when neither source supplies a usable organisation name.

### Delete or abandon unfinished organisation

The CMS retains the existing unfinished-account deletion rules. The frontend must send the explicit account id intended for deletion.

Endpoint:

```http
DELETE /api/accounts/:accountId
Authorization: Bearer <member-jwt>
```

Success body:

```json
{
  "data": {
    "accountId": 456,
    "deleted": true
  }
}
```

Relevant failures are `401` unauthenticated, `400` invalid account id, `404 ACCOUNT_NOT_FOUND` for nonexistent or unowned accounts, and `403 ACCOUNT_DELETE_NOT_ALLOWED` when the account is completed, set up, updating, queued, or running.

After successful deletion:

- remove or invalidate that account in cached `accounts[]` data;
- return the user to a safe selection/create route;
- clear account-specific wizard state for the deleted id; and
- allow a later `/account/first` request to create a new blank account.

If deletion fails:

- do not remove the account from the UI as though deletion succeeded;
- show the CMS error safely; and
- refetch account state if the result is uncertain.

A timeout may occur after deletion has committed. After an uncertain response, refetch `/api/account/me`: absence means deletion succeeded; presence means retain the account and show retry/error state.

## Routing requirements

Every member route that displays or mutates account data must carry an explicit account id, preferably in the route segment already used by the application:

```text
/o/:accountId/...
```

Audit all redirects, links, server actions, route handlers, and loaders for:

- missing account ids;
- fallback to the first returned account;
- fallback to `data.accountId`;
- fallback to `user.account`;
- account ids stored only in global mutable state; and
- redirects that silently substitute another account when access fails.

Authentication identifies the user. Routing identifies the selected account.

## Cache and client-state isolation

Every account-scoped cache key must include the explicit account id.

Unsafe example:

```text
["billing-summary"]
```

Required form:

```text
["billing-summary", accountId]
```

Apply this rule to:

- onboarding state and setup status;
- billing, orders, checkout, subscriptions, and invoices;
- branding, themes, templates, and settings;
- fixtures, grades, tracking, and scheduler data;
- renders, assets, media, sponsors, and analytics; and
- mutations and optimistic update stores.

When switching accounts:

- cancel or ignore stale requests for the previous account;
- do not render previous-account data under the new route;
- reset account-specific forms where appropriate;
- scope optimistic mutations to the selected account; and
- invalidate only the affected account plus the shared account list when required.

## BFF and proxy requirements

If the frontend proxies CMS requests through application routes:

- preserve the upstream `200` or `201` status from `/account/first`;
- preserve `{ data: { accountId } }` without reshaping it inconsistently;
- forward `Retry-After` for `503 ACCOUNT_CREATE_BUSY`;
- preserve structured `ACCOUNT_NOT_FOUND` errors;
- forward the authenticated user's JWT using the established secure mechanism; and
- never inject an account id from `data.accountId` when the caller supplied none.

Do not cache authenticated account payloads publicly.

## Internal worker routes are not frontend APIs

The CMS contains dual-path internal/member protection for these legacy worker-oriented routes:

- `GET /account/createTracking/:ID`;
- `GET /account/fixtureDateRange/:ID`; and
- `GET /scheduler/getDownloads/:accountId`.

Internal callers require `INTERNAL_CMS_TOKEN`. Member callers require a valid JWT plus ownership.

Frontend guidance:

- Do not embed or expose `INTERNAL_CMS_TOKEN` in browser code, public runtime configuration, client bundles, or frontend logs.
- Browser/member calls must use the normal user JWT path.
- If no frontend code calls these routes, leave them out of the frontend integration.
- Any server-side frontend caller must still prefer member JWT ownership unless it is explicitly classified as a trusted internal service.

## CMS ownership-audit reference

The CMS ownership-hardening ledger is maintained at:

```text
D:\htdoc\Fixtura\Fixtura.com.au\Backend\.comms\FrontEnd\request\cms-multi-account\04-consumer-hardening.md
```

Compare the frontend's account-scoped consumers against that ledger, the onboarding endpoint inventory above, Stripe subscription create/change operations, and the dual-path tracking/download routes. Ownership enforcement is generally in place for newer member services, although legacy `404` response formatting remains inconsistent.

## Frontend implementation audit checklist

### API types and parsing

- [ ] `POST /account/first` accepts both `200` and `201`.
- [ ] Both statuses parse `{ data: { accountId: number } }`.
- [ ] `503 ACCOUNT_CREATE_BUSY` is retryable.
- [ ] `/account/me.data.accounts` is an array of all account objects.
- [ ] `/account/me.data.accountId` is compatibility-only and nullable/removable in types.
- [ ] `ACCOUNT_NOT_FOUND` is parsed consistently.

### Create and resume

- [ ] Create without an id calls `/account/first`.
- [ ] Reused blank account opens the returned id.
- [ ] Explicit resume does not call `/account/first` unnecessarily.
- [ ] Pending submission disables duplicate clicks.
- [ ] Retrying after timeout safely accepts the same returned id.
- [ ] Every wizard request uses its explicit account id.

### Selection page

- [ ] Every `accounts[]` object is rendered.
- [ ] No first-account/default selection is inferred.
- [ ] Blank and unfinished accounts remain visible.
- [ ] Missing organisation name displays **Unfinished organisation**.
- [ ] Each action navigates using that row's id.
- [ ] Create organisation remains available when existing accounts are ongoing.

### Deletion

- [ ] Delete uses the selected explicit account id.
- [ ] Successful deletion invalidates the list and account-specific caches.
- [ ] Failed deletion does not hide the account.
- [ ] A later create can obtain a new blank account.

### Isolation

- [ ] All account-scoped cache keys include account id.
- [ ] Switching account routes does not display stale prior-account state.
- [ ] Billing and checkout use the selected account.
- [ ] Branding/assets use the selected account.
- [ ] Fixtures/tracking/scheduler use the selected account.
- [ ] Onboarding state is isolated by account id.
- [ ] Server actions and BFF routes do not derive account selection from the user alone.

## Required frontend automated tests

At minimum, add or confirm tests for:

1. `201` from `/account/first` starts onboarding with the returned id.
2. `200` from `/account/first` starts/resumes onboarding with the returned id.
3. Pending create prevents duplicate frontend mutations.
4. A timeout/retry that returns the existing blank id succeeds.
5. `503 ACCOUNT_CREATE_BUSY` produces a retryable state.
6. `/select-organisation` renders two or more returned accounts.
7. A nameless blank account shows **Unfinished organisation**.
8. Selecting each account navigates with its explicit id.
9. Explicit resume loads only the requested owned account.
10. `404 ACCOUNT_NOT_FOUND` does not fall back to another account.
11. Deletion removes the account after confirmed success and permits later creation.
12. Switching between two accounts keeps onboarding caches isolated.
13. Switching between two accounts keeps billing, scheduler, and other high-risk caches isolated.
14. No create, resume, redirect, or selection code depends on `/me.data.accountId`.
15. BFF/proxy tests preserve `200`, `201`, `503`, `Retry-After`, and structured error bodies.

Existing targeted frontend tests referenced by the CMS handoff include:

```powershell
npx vitest run "src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx" "src/app/(members)/select-organisation/select-organisation-content.test.tsx" "src/lib/api/hooks/account/useCreateFirstAccount.test.tsx" "src/app/api/account/first/route.test.ts"
```

Adjust paths only if the frontend repository has moved these files.

## Required browser verification

Use a test user who can safely own multiple local/staging accounts.

No reusable staging fixtures or staging users are currently guaranteed. Before final integration testing, coordinate dedicated non-production users for:

- one user with two ongoing accounts;
- one user with an existing blank account;
- one user with a deletable unfinished account; and
- a second user for cross-user denial.

Do not use production customer accounts for this matrix. Local CMS integration tests create disposable fixtures automatically.

1. Load organisation selection with one ongoing account.
2. Click **Create organisation**.
3. Confirm the wizard uses the returned new account id.
4. Return to selection and confirm both accounts appear.
5. Start create again while the second account is blank.
6. Confirm the same blank account is reused rather than creating a third.
7. Select a club or association on the blank account.
8. Start create again and confirm a different blank account is created.
9. Resume each unfinished account using its explicit id.
10. Switch between accounts and inspect onboarding, billing, branding, fixtures, scheduler, and cached state.
11. Delete an eligible unfinished account and confirm it disappears only after success.
12. Confirm an inaccessible/cross-user id returns safe not-found behavior without fallback.

Record request statuses, returned ids, visible account list, and any cache/state leakage.

## CMS verification status relevant to frontend work

Locally verified CMS behavior includes:

- multi-account schema;
- blank create and reuse;
- concurrent SQLite convergence;
- second-account creation after organisation selection;
- second blank reuse;
- production unfinished-account deletion followed by new creation;
- two-account onboarding-state isolation;
- second-account scheduler/template default isolation;
- Stripe account ownership checks;
- public registration relation allowlist; and
- integration cleanup adding zero new orphan accounts.

Current local test results:

- multi-account unit suite: `41/41` passing;
- multi-account integration suite: `8/8` passing; and
- new integration runs restore their pre-run database counts.

Known CMS/deployment gates that do not block beginning frontend work:

- existing local historical test pollution still prevents the old migration postflight snapshot from passing;
- PostgreSQL two-connection concurrency proof requires staging access;
- staging/production database preflight is not complete; and
- compatibility `data.accountId` remains temporarily.
- dedicated staging test users and fixtures still require coordination.

These gates block production sign-off, not frontend implementation against the local contract.

## Frontend completion report required

When the frontend audit is complete, report in one consolidated document:

- every frontend consumer of `/api/account/me.data.accountId` and its resolution;
- every singular/default-account assumption found;
- files changed;
- cache keys reviewed or changed;
- automated tests added/updated;
- exact commands and pass/fail counts;
- browser verification evidence;
- `200`, `201`, `503`, deletion, and switching results;
- cross-user/not-found behavior; and
- any deferred risk with owner and follow-up.

## Frontend exit gate

Frontend Phase 06 is complete only when:

- all owned accounts render from `accounts[]`;
- create and blank reuse both work;
- explicit resume works;
- account switching is explicit and cache-isolated;
- deletion refreshes selection correctly;
- cross-user/not-found access does not fall back or enumerate;
- no new flow depends on compatibility `data.accountId`; and
- automated and browser evidence pass against the final CMS contract.

## Final integration principle

The user chooses an organisation account explicitly. The JWT authenticates the user, `accounts[]` lists their available organisations, and the chosen account id scopes every operation. No array position, compatibility field, readiness flag, or global user state may silently choose an account.
