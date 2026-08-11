# Frontend handoff — Account notifications (`GET` / `PATCH /api/accounts/:accountId/notifications`)

**To:** Fixtura Members app / Next BFF  
**From:** CMS / Strapi backend  
**Date:** 2026-05-03

---

## Product decisions (hybrid)

| Topic              | Choice                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bundle addressee   | Stored on **`api::account.account`** as **`bundleAddressedTo`** (string, optional, max **255**).                                                                                                                                                                                                                                     |
| Delivery email     | Stored on **`api::account.account`** as **`deliveryEmail`** (string, optional). Normalized (**trim + lower case**) on save; validated with the same basic email shape as security login-email flows. **`null`** clears the field when sent explicitly in PATCH.                                                                      |
| Asset delivery day | **Read-only** on this endpoint: **`assetDeliveryDay`** is derived from **`scheduler.days_of_the_week.Name`** (lowercase string, e.g. `"sunday"`). **Writes** use existing **`PATCH /api/accounts/:accountId/settings`** with **`bundleDeliveryDay`** or **`daysOfTheWeekId`** — same behaviour as today (**`saveAccountSettings`**). |

Do **not** send **`bundleDeliveryDay`**, **`daysOfTheWeekId`**, or **`assetDeliveryDay`** on **`PATCH .../notifications`** (**`400`** / **`DELIVERY_DAY_USE_SETTINGS`**).

---

## Routes

Base URL: Strapi REST prefix **`/api`**.

| Operation                            | Method  | Path                                     |
| ------------------------------------ | ------- | ---------------------------------------- |
| Load notifications slice             | `GET`   | `/api/accounts/:accountId/notifications` |
| Partial update (account fields only) | `PATCH` | `/api/accounts/:accountId/notifications` |

**Ownership:** `accountId` must be a positive integer and belong to **`ctx.state.user`**. Otherwise **`404`** (“Account not found”) on GET; PATCH errors use **`ACCOUNT_NOT_FOUND`** where applicable.

**Auth:** `Authorization: Bearer <jwt>`.

**Permissions:** Strapi Admin → Settings → Users & permissions → **Authenticated** → **Account** → enable:

- **`getAccountNotifications`** — `api::account.account.getAccountNotifications`
- **`saveAccountNotifications`** — `api::account.account.saveAccountNotifications`

Weekday changes still require **`saveAccountSettings`** on **`PATCH .../settings`** (enable that permission for roles that may edit delivery day).

**Members app (this repo):** The notifications screen **reads** bundle addressee from the **`accounts[]`** row **`FirstName`**, delivery mailbox from **`DeliveryAddress`**, and weekday from **`GET .../scheduler`** (`days_of_the_week`). It **writes** those contact fields with **`PATCH /api/accounts/:accountId/onboarding/step-3`** (`firstName`, `deliveryAddress` — same persistence as Phase 4 W3 / `GET …/settings`). Delivery weekday is saved with **`PATCH .../settings`** (`daysOfTheWeekId` or `bundleDeliveryDay`). It does not use **`getAccountNotifications`** / **`PATCH .../notifications`** for this flow (those fields are not the account row the UI displays).

## `GET .../notifications`

**Success `200`:**

```json
{
  "data": {
    "bundleAddressedTo": "Cricket Whanganui",
    "deliveryEmail": "club-ops@example.com",
    "assetDeliveryDay": "sunday"
  }
}
```

- **`bundleAddressedTo`** / **`deliveryEmail`**: **`null`** when unset.
- **`assetDeliveryDay`**: **`null`** when there is no scheduler, no linked day, or empty **`Name`**.

---

## `PATCH .../notifications`

**Body:** flat JSON or **`{ "data": { ... } }`** (same unwrap convention as **`PATCH .../settings`** / branding).

**Allowed keys only:** **`bundleAddressedTo`**, **`deliveryEmail`**.

| Key                     | Rules                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **`bundleAddressedTo`** | String or **`null`**. Trimmed; empty string after trim stored as **`null`**. Max **255** characters. |
| **`deliveryEmail`**     | String (valid email after trim/normalize) or **`null`** to clear.                                    |

**Success `200`:** `{ "data": { ... } }` — same shape as **`GET .../notifications`** after save.

---

## Errors

Envelope: **`{ "error": { "code": "<CODE>", "message": "<text>" } }`** with HTTP status as listed.

| HTTP | `code`                        | When                                                                                        |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| 400  | `INVALID_BODY`                | Body not a JSON object (optional **`data`** wrapper invalid).                               |
| 400  | `DELIVERY_DAY_USE_SETTINGS`   | **`bundleDeliveryDay`**, **`daysOfTheWeekId`**, or **`assetDeliveryDay`** present on PATCH. |
| 400  | `UNSUPPORTED_FIELDS`          | Any key other than **`bundleAddressedTo`** / **`deliveryEmail`**.                           |
| 400  | `EMPTY_UPDATE`                | Empty object or no applicable keys.                                                         |
| 400  | `INVALID_BUNDLE_ADDRESSED_TO` | Wrong type, or string longer than **255**.                                                  |
| 400  | `INVALID_DELIVERY_EMAIL`      | Wrong type, or string fails email validation.                                               |
| 404  | `ACCOUNT_NOT_FOUND`           | Account missing or not owned (PATCH load path).                                             |

---

## Related

- **`PATCH /api/accounts/:accountId/settings`** — weekday and other settings; see [frontend-handoff-patch-account-settings-save.md](./frontend-handoff-patch-account-settings-save.md).
- **`GET /api/accounts/:accountId/scheduler`** — full scheduler payload if needed elsewhere.
