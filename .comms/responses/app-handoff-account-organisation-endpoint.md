# App: Selected account dashboard — `GET /api/account/organisation/:accountId`

**From:** CMS (Strapi) Backend Team
**To:** Fixtura App (frontend) Team
**Date:** 2026-04-03
**Purpose:** Load full dashboard data for the account the user selected after `GET /api/account/me`.

---

## 1. Two-step flow

1. **`GET /api/account/me`** — Returns `user`, `accountId`, and `accounts[]` (summary per account: ids, scalars, `accountOrganisationDetails` preview).
2. **`GET /api/account/organisation/:accountId`** — User picks an `accountId` from `accounts` (or uses `accountId`). Call this endpoint with the same JWT to load the **full dashboard aggregate** for that account only.

The server validates that the **JWT user owns** the account (same `user` relation as `account.me`). No user id is passed in the URL.

---

## 2. Endpoint contract

| Property       | Value                                            |
| -------------- | ------------------------------------------------ |
| **Method**     | `GET`                                            |
| **Path**       | `/api/account/organisation/:accountId`           |
| **Path param** | `accountId` — positive integer Strapi account id |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`      |
| **Query**      | None.                                            |

**Strapi API prefix:** If `config/server` uses a custom REST prefix, prepend it (default is `/api`).

---

## 3. Users-permissions (CMS ops)

Enable the **Authenticated** permission for this action:

**Settings → Users & permissions → Roles → Authenticated → Account → `organisationAccountDetails` → enable.**

**Permission action id (reference):** `api::account.account.organisationAccountDetails`

If disabled, the app receives **403 Forbidden** with a valid JWT.

---

## 4. Success response (HTTP 200)

```json
{
  "data": {
    "id": 319,
    "FirstName": "…",
    "LastName": null,
    "DeliveryAddress": "…",
    "isActive": true,
    "isSetup": true,
    "isRightsHolder": true,
    "isPermissionGiven": true,
    "group_assets_by": false,
    "include_junior_surnames": true,
    "isUpdating": false,
    "Sport": "Cricket",
    "scheduler": {},
    "account_type": 1,
    "accountOrganisationDetails": {},
    "render_token": {},
    "template": "Basic",
    "theme": {},
    "renders": [],
    "rollup": {},
    "metricsOverTime": {},
    "metricsAsPercentageOfCost": {}
  }
}
```

**Shape:** The `data` object is the Fixtura dashboard aggregate (scheduler, renders, rollup, metrics, organisation slice, tokens, branding). Treat field-level details as **evolving**; type only what your screens consume.

---

## 5. Error responses

| HTTP    | When                                                                                |
| ------- | ----------------------------------------------------------------------------------- |
| **400** | `accountId` is missing or not a positive integer.                                   |
| **401** | No or invalid JWT.                                                                  |
| **403** | Valid JWT but role lacks `organisationAccountDetails`.                              |
| **404** | Account does not exist or is **not owned** by the JWT user (same message for both). |
| **500** | Server error building the payload.                                                  |

---

## 6. Example

```bash
curl -sS -H "Authorization: Bearer YOUR_JWT" \
  "https://YOUR_CMS_HOST/api/account/organisation/319"
```

---

## 7. Backend reference

| Item        | Location                                                                |
| ----------- | ----------------------------------------------------------------------- |
| Route       | `src/api/account/routes/custom-account.js`                              |
| Handler     | `src/api/account/controllers/account.js` → `organisationAccountDetails` |
| Ownership   | `src/api/account/controllers/services/validateAccountOwnership.js`      |
| Aggregation | `src/api/account/controllers/services/fixturaContentHub/index.js`       |

---

## 8. Open questions

- None from CMS side.

---

## 9. Related (Fixtura app)

- BFF: `src/app/api/account/organisation/[accountId]/route.ts`
- Client: `accountApi.getOrganisationAccountDetails` — `src/lib/api/services/account.api.ts`
- Route pattern & gateway flow: [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](../18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) (see **Application implementation** section)
