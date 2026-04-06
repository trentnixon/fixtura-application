# Handoff — Phase 2: `GET /accounts/:accountId/settings`

**Phase:** 2  
**Date:** 2026-04-05  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §7](../account-admin-api-contract.md#7-route--endpoint-map), [phase-02-accounts-settings.md](../phase-02-accounts-settings.md), implementation: [`src/api/account/controllers/services/getAccountSettingsPayload/index.js`](../../../../src/api/account/controllers/services/getAccountSettingsPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 2 adds a **read-only** account settings endpoint so the admin app can load configuration and behaviour flags **without** calling the full organisation hub. The response is a flat JSON object under `data` (no scheduler, renders, `render_token`, template/theme resolution). **`GET /account/me`** remains the bootstrap/switcher source; **this endpoint is the canonical source for the account settings screen** when you need `hasCompletedStartSequence`, `hasCustomTemplate`, or a single-account settings view that should not depend on the hub.

---

## Endpoints

| Method | Path (suffix)                   | Purpose                                                     |
| ------ | ------------------------------- | ----------------------------------------------------------- |
| GET    | `/accounts/:accountId/settings` | Account configuration and flags for the authenticated owner |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/settings` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountSettings`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountSettings** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/accounts/319/settings HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { ... } }` per Strapi convention.
- **Stable for v1:** Field names below; all are account scalars or `account_type` as a numeric id (nullable).
- **May evolve:** Additional scalars if product extends the account model (avoid hub domains here).
- **Does not include:** `template`, `theme`, `template_option` bodies (Phase 3 branding); `scheduler`, `renders`, `render_token`.

| Field                                            | Type            | Notes                                                         |
| ------------------------------------------------ | --------------- | ------------------------------------------------------------- |
| `id`                                             | number          | Account id                                                    |
| `FirstName`, `LastName`                          | string \| null  |                                                               |
| `DeliveryAddress`                                | string \| null  | Email field on account                                        |
| `isActive`, `isSetup`, `isUpdating`              | boolean         |                                                               |
| `isRightsHolder`, `isPermissionGiven`            | boolean \| null |                                                               |
| `group_assets_by`, `include_junior_surnames`     | boolean         |                                                               |
| `Sport`                                          | string          | Enumeration value                                             |
| `hasCompletedStartSequence`, `hasCustomTemplate` | boolean         | Setup progression                                             |
| `account_type`                                   | number \| null  | Related `account-type` id (same idea as bootstrap list items) |

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "FirstName": "…",
    "LastName": null,
    "DeliveryAddress": "club@example.com",
    "isActive": true,
    "isSetup": true,
    "isRightsHolder": true,
    "isPermissionGiven": true,
    "group_assets_by": false,
    "include_junior_surnames": true,
    "isUpdating": false,
    "Sport": "Cricket",
    "hasCompletedStartSequence": true,
    "hasCustomTemplate": false,
    "account_type": 1
  }
}
```

---

## Errors

| Situation                                                                  | HTTP status | Notes                                   |
| -------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| Not authenticated                                                          | **401**     | Missing/invalid JWT                     |
| Valid JWT, role lacks `getAccountSettings`                                 | **403**     | Strapi users-permissions                |
| `accountId` missing or not a positive integer                              | **400**     | Invalid id                              |
| Valid JWT, valid id format, user does not own account (or account missing) | **404**     | “Account not found”                     |
| Server error                                                               | **500**     | Generic message; details in server logs |

---

## Migration from legacy hub

- **Previously:** Settings-like fields often came from **`GET /account/organisation/:accountId`**, which returns the full **FixturaContentHub** aggregate (scheduler, renders, tokens, rollups).
- **Now:** Use **`GET /accounts/:accountId/settings`** for configuration-only UI. Overlapping scalars match the **header** portion of the hub (names align with [`fixturaContentHub/index.js`](../../../../src/api/account/controllers/services/fixturaContentHub/index.js)) plus **`hasCompletedStartSequence`** and **`hasCustomTemplate`**, which are **not** on the hub response today.
- **Stop** using the hub for settings-only screens once the app is migrated; keep the hub for screens that still need scheduler/renders until those phases ship.

---

## Source of truth vs `GET /account/me`

| Concern                                                                                                        | Use                                       |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Shell bootstrap, account switcher, light per-account row in list                                               | **`GET /account/me`** (`data.accounts[]`) |
| Dedicated **settings** screen / authoritative flags including `hasCompletedStartSequence`, `hasCustomTemplate` | **`GET /accounts/:accountId/settings`**   |

Bootstrap list items overlap several fields; prefer **this endpoint** when building the settings page so you stay aligned with future schema additions without pulling the hub.

---

## Caching and freshness

- **v1:** No reliance on `ETag` for correctness. Sensitive account data: treat as **private, no-store** on the client unless product approves caching.

---

## Open questions / follow-ups

- **Write API:** PATCH/PUT for settings is out of scope for this phase; add when product defines validation and permissions.

---

## Links

- Phase plan: [phase-02-accounts-settings.md](../phase-02-accounts-settings.md)
- Contract: [account-admin-api-contract.md](../account-admin-api-contract.md)
- Research brief: [Fixtura-account-data-research-brief-v2.md](../../Fixtura-account-data-research-brief-v2.md)
