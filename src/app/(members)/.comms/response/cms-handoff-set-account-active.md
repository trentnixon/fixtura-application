# CMS handoff: owner can set account active

**Date:** 2026-10-03
**From:** CMS (Strapi) Backend
**To:** fixtura-admin
**Re:** Member account page switch for `account.isActive`
**Status:** Implemented. Restart Strapi after pulling this so the Authenticated role receives `setAccountActive`.

No new admin route. No admin permission checkbox. Account lookup and the support directory already return `isActive`. Those screens will now move when the owner uses the switch.

---

## What to change in admin

1. Keep Active and Inactive grouping on the existing `isActive` field from `GET /api/account/admin/lookup`. Do not add a second flag.
2. Treat an **inactive account** as an owner choice, not a CMS outage. Initial setup and the initial data fetch are both completed, and the owner has set `isActive` to false.
3. Do not raise a stuck-render or missed-health alert for that account while it stays inactive. New scheduler runs, on-demand renders, and account health checks skip it. A run that has already started still finishes.
4. Leave billing, trials, orders, Stripe, and delete as they are. An inactive account can still be billed.
5. Do not add an admin button for this switch. The owner does it from the member account page. Support View cannot call the route.
6. A **not set up** account still has `isActive: false` from the default. That is not the Inactive group. The owner route rejects it.

---

## Owner route

This is the member app, not admin axios.

```http
PATCH /api/accounts/:accountId/active
Authorization: Bearer <jwt>
```

```json
{ "isActive": false }
```

Success:

```json
{ "data": { "id": 319, "isActive": false } }
```

| HTTP | `code`                       | When                                                                                                                                                            |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `INVALID_BODY`               | Body is not a JSON object, or `isActive` is missing.                                                                                                            |
| 400  | `INVALID_IS_ACTIVE`          | `isActive` is not a JSON boolean. `null`, `0`, `1`, and `"false"` land here.                                                                                    |
| 404  | `ACCOUNT_NOT_FOUND`          | Missing, or the JWT user does not own the account.                                                                                                              |
| 409  | `ACCOUNT_ACTIVE_NOT_MUTABLE` | Owned, but `isSetup` is not true, or `initialSetupStatus` and `initialDataFetchStatus` are not both `completed`. A same-value write in that state is still 409. |

The JWT user must be `account.user`. A support super-user read does not grant this write.

On a completed account, sending the value already stored is success `200`. Unknown body keys are ignored.

---

## What admin already shows

`GET /api/account/admin/lookup` still returns `isActive`. A stored `null` is sent as `false`. After the owner writes `true` or `false`, lookup, `GET /api/account/me`, settings, and onboarding-state all show that boolean.

The support directory still maps `isActive === true` and still filters on `isActive`. Account analytics still treats the flag as operational. There is no record of who flipped it.

Strapi Admin can still edit the column on the account. This route does not lock the field.

---

## What stays quiet while inactive

These existing skips are unchanged. Off does not add a new pause, and it does not remove these:

- Asset-run cron: `account_inactive`. The sweep is every 2 minutes, Sydney time.
- On-demand asset run: `not_ready` / `account_inactive`.
- Account health sweeps, the Tuesday 3pm health cycle, and the daily 2pm pre-render freshness check.

Turning the account back on restores those gates on the next sweep. A delivery day, a Tuesday health cycle, or a 2pm freshness check that passed while the account was inactive is not replayed. A paid order, the delivery weekday, and "already rendered today" still apply after On.

`isUpdating` does not block the owner write, and it does not by itself skip those jobs.

---

## Restart

Bootstrap grants `api::account.account.setAccountActive` on the Authenticated role. Restart Strapi after deploy. Do not grant this action to the admin API token role.
