# Frontend handoff — Save account settings (preferences)

**To:** Fixtura app / BFF  
**From:** CMS / Strapi backend  
**Date:** 2026-05-01

---

## What shipped

Authenticated **`PATCH /api/accounts/:accountId/settings`** accepts a **partial** JSON body, updates the **account** (and optionally the linked **scheduler** delivery day), enforces **organisation-type gating** on the server, and returns the same **`data`** shape as **`GET /api/accounts/:accountId/settings`** after a successful save.

---

## Access

| Item         | Value                               |
| ------------ | ----------------------------------- |
| Method       | `PATCH`                             |
| Path         | `/api/accounts/:accountId/settings` |
| Auth         | `Authorization: Bearer <jwt>`       |
| Content-Type | `application/json`                  |

**Ownership:** `accountId` must belong to the authenticated user (same as other `/accounts/:accountId/*` routes).

**Permissions:** Strapi Admin → Settings → Users & permissions → **Authenticated** (or your app role) → **Account** → enable **`saveAccountSettings`** (scope: `api::account.account.saveAccountSettings`).

---

## Request body

Send a **flat** object or **`{ data: { ... } }`**. At least one field must apply after **gating** (see below); otherwise **`400`** / **`EMPTY_UPDATE`**.

| Field                    | Type                         | Applies to                                          | Persistence                                                                                        |
| ------------------------ | ---------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `includeJuniorSurnames`  | `boolean`                    | All accounts                                        | `account.include_junior_surnames`                                                                  |
| `competitionsGroupedBy`  | `"grade"` \| `"competition"` | **Association only** (`account_type` ≠ club id `1`) | `account.group_assets_by`: `grade` → `true`, `competition` → `false`                               |
| `splitSeniorsAndMasters` | `boolean`                    | **Club only** (`account_type` id `1`)               | `account.split_seniors_and_masters`                                                                |
| `daysOfTheWeekId`        | positive integer             | All (if scheduler exists)                           | `scheduler.days_of_the_week` → published `days-of-the-week` id                                     |
| `bundleDeliveryDay`      | non-empty string             | All (if scheduler exists)                           | Resolved case-insensitively against published **`days-of-the-week.Name`**; sets scheduler relation |

If both **`daysOfTheWeekId`** and **`bundleDeliveryDay`** are present, **`daysOfTheWeekId`** wins.

**Gating:** Fields that do not apply to the account’s organisation type are **silently ignored** (not an error). For example, a club sending only `competitionsGroupedBy` yields **no updates** → **`EMPTY_UPDATE`**.

**Published rows:** Delivery day id / name must resolve to a **published** `days-of-the-week` entry (`publicationState: live`).

---

## Success response

**`200`** — body shape matches **`GET .../settings`**:

```json
{ "data": { "...": "same fields as GET /accounts/:id/settings" } }
```

`GET` settings now includes **`split_seniors_and_masters`** (boolean) alongside existing fields.

---

## Error responses

Errors use the same envelope as branding saves:

```json
{ "error": { "code": "SOME_CODE", "message": "Human-readable message" } }
```

| HTTP | `code`                              | When                                                          |
| ---- | ----------------------------------- | ------------------------------------------------------------- |
| 400  | `INVALID_BODY`                      | Body not a JSON object (and not `{ data: object }`).          |
| 400  | `EMPTY_UPDATE`                      | Nothing to apply after gating / empty body.                   |
| 400  | `INVALID_INCLUDE_JUNIOR_SURNAMES`   | Key present but not a boolean.                                |
| 400  | `INVALID_COMPETITIONS_GROUPED_BY`   | Association sent illegal value (not `grade` / `competition`). |
| 400  | `INVALID_SPLIT_SENIORS_AND_MASTERS` | Club sent non-boolean.                                        |
| 400  | `INVALID_DAYS_OF_THE_WEEK`          | Bad id, unpublished id, or unknown `bundleDeliveryDay`.       |
| 400  | `SCHEDULER_MISSING`                 | Delivery field sent but account has no scheduler row.         |
| 404  | `ACCOUNT_NOT_FOUND`                 | Account missing or not owned by user.                         |

---

## Operational note

After deploy, **`saveAccountSettings`** must be **enabled** for the JWT role in Strapi Admin or calls return **403**.

---

## Related

- Read: `GET /api/accounts/:accountId/settings`
- Read (delivery context): `GET /api/accounts/:accountId/scheduler`
- Org type id: **`account_type` id `1` = Club** (same as organisation endpoint).
