# CMS request — set account active

**From:** Fixtura App (frontend)
**To:** CMS / Strapi backend
**Date:** 2026-10-03
**Status:** CMS implemented this route. See `../response/cms-handoff-set-account-active.md`.
**Purpose:** Let the account owner turn `account.isActive` on or off from `/o/:accountId/account`.

---

## Context

The account page already shows Active or Inactive from `isActive` on `GET /api/accounts/:accountId/settings`. The organisation picker uses the same flag. After setup has finished, `isActive: false` puts the organisation in the Inactive group. `isActive: true` puts it back in Active.

The organisation stays openable in the app. Billing, Stripe, trials, orders, delete, and in-flight renders stay as they are. Existing CMS gates that already skip work when `isActive !== true` stay as they are. This request does not remove those gates and does not add new ones. A later delete may use this state, but this request does not change delete eligibility.

`PATCH /api/accounts/:accountId/settings` (`saveAccountSettings`) does not accept `isActive`. Its allowlist is `includeJuniorSurnames`, `competitionsGroupedBy`, `splitSeniorsAndMasters`, `daysOfTheWeekId`, and `bundleDeliveryDay`. Leave that allowlist alone.

---

## Request

Add a new owner write. Do not fold this into `saveAccountSettings`.

| Item       | Value                                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method     | `PATCH`                                                                                                                                                                      |
| Path       | `/api/accounts/:accountId/active`                                                                                                                                            |
| Auth       | `Authorization: Bearer <jwt>`                                                                                                                                                |
| Permission | `setAccountActive` (`api::account.account.setAccountActive`). Grant it on the Authenticated role in bootstrap (`src/index.js`), same as other recent account actions.        |
| Ownership  | Owner-only, same as `saveAccountSettings` (`account.user` matches the JWT). Support super-user reads do not apply. Missing or not owned returns `404` / `ACCOUNT_NOT_FOUND`. |

Body, flat or `{ "data": { ... } }`:

```json
{ "isActive": false }
```

`isActive` is required and must be a JSON boolean. Unknown keys are ignored, same as settings saves. `{ "isActive": false, "foo": 1 }` is success. `null`, `0`, `1`, and `"false"` are `400` / `INVALID_IS_ACTIVE`.

Success `200`:

```json
{ "data": { "id": 319, "isActive": false } }
```

Writing the current value is `200`, not `EMPTY_UPDATE`, only when the account passes the mutability check. A same-value write on an account that fails that check is `409`, not `200`.

| HTTP | `code`                       | When                                                                                                                                                                  |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `INVALID_BODY`               | Body is not a JSON object, or `isActive` is missing.                                                                                                                  |
| 400  | `INVALID_IS_ACTIVE`          | `isActive` is present and is not a JSON boolean. Includes `null`, `0`, `1`, and `"false"`.                                                                            |
| 404  | `ACCOUNT_NOT_FOUND`          | Account missing or not owned by the JWT user.                                                                                                                         |
| 409  | `ACCOUNT_ACTIVE_NOT_MUTABLE` | The JWT user owns the account, and `isSetup` is not `true` or `initialSetupStatus` and `initialDataFetchStatus` are not both `completed`. Same-value writes included. |

Error envelope, same as settings saves:

```json
{ "error": { "code": "INVALID_IS_ACTIVE", "message": "isActive must be a boolean." } }
```

---

## What must change

Persist `account.isActive` only.

The next read of each of these must return that same boolean:

- `GET /api/accounts/:accountId/settings` (`data.isActive`)
- `GET /api/account/me` (`data.accounts[].isActive`)
- `GET /api/accounts/:accountId/onboarding/onboarding-state` (`account.isActive === true` in `accountLifecycleReadModel`)

The picker prefers onboarding-state `isActive` when that query succeeds, and falls back to the `/me` row. If those two disagree, the card stays in the wrong group.

A stored `null` is out of scope. Settings and `/me` return `null`, and onboarding-state returns `false`. This write only sends `true` or `false`, so the three reads agree after a real write. Schema default `false` is fine.

---

## What must not change

- `isSetup`, `isUpdating`, wizard completion, and pipeline status.
- `markInitialOnboardingComplete` in `finalizeOrchestratorSlice`. It may still set `isActive: true` when onboarding finishes.
- Existing job gates. Asset-run cron (`account_inactive`), on-demand runs (`not_ready` / `account_inactive`), account-health sweeps, the weekly cycle, and pre-render freshness stay as they are. Do not remove them for this switch, and do not add a separate display field.
- Billing, Stripe, trials, orders, and in-flight renders. Those are not gated by `isActive` today. Leave them that way. Do not cancel an in-flight render.
- `DELETE /api/accounts/:accountId` and `ACCOUNT_DELETE_NOT_ALLOWED`.
- The `saveAccountSettings` allowlist.
- Support directory, admin lookup, and account analytics. They may keep treating `isActive` as operational.

`isActive: false` is not a delete. It does move the picker group, and it does keep the existing skips for new scheduler runs, on-demand renders, and health checks.

---

## App use

The account page will add a switch. On sends `{ "isActive": true }`. Off sends `{ "isActive": false }`. The badge and the picker group follow the saved value.

The app will offer the switch only when `isSetup === true` and both lifecycle statuses are `completed`. CMS must reject anything earlier with `409` / `ACCOUNT_ACTIVE_NOT_MUTABLE`. Otherwise `afterUpdate` in `src/index.js` forces `isActive: true` on this PATCH when the account is `isSetup` but the two statuses are not both `completed`.

Once both statuses are `completed`, that hook leaves `isActive` alone. A later account update must not turn the organisation back on. Only this PATCH does that.

---

## Answers

Path and action are confirmed. `PATCH /api/accounts/:accountId/active` and `api::account.account.setAccountActive`. Grant the action in bootstrap.

One `account.isActive` column is correct. No new field.

Off does not need new pause behaviour. Leave the gates that already treat `isActive !== true` as not ready. Leave billing, Stripe, trials, delete, and in-flight renders ungated.

Owner-only. Same rule as `saveAccountSettings`.

Reject the write unless `isSetup === true` and both `initialSetupStatus` and `initialDataFetchStatus` are `completed`. Do not accept it earlier.

Unknown keys are ignored. Non-booleans are `INVALID_IS_ACTIVE`.

Check order is body, then ownership, then mutability. A bad body is `400` before any account lookup. A missing or unowned account is `404`. `409` is only for an account the JWT user owns.

Once both lifecycle statuses are `completed`, later account updates do not turn `isActive` back on. The hook returns before that write. `retryOnboardingSetup` only runs when setup or the initial fetch has failed. The first onboarding finalize may still set `isActive: true`. After that, only this PATCH changes it.

The `409` body uses the same error envelope, with `code: "ACCOUNT_ACTIVE_NOT_MUTABLE"`. The app branches on `code`.
