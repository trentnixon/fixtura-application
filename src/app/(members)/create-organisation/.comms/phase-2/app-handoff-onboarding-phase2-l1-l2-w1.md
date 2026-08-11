# App handoff — Phase 2 onboarding lookups (L1, L2) and Step 1 write (W1)

**From:** CMS (Strapi) backend  
**To:** Fixtura members app (BFF + frontend)  
**Date:** 2026-04-07  
**Related:** [cms-request-phase2-lookups-and-w1.md](./cms-request-phase2-lookups-and-w1.md), [phase2-v1-data-matrix-assumptions.md](./phase2-v1-data-matrix-assumptions.md), [A1 first account](./app-handoff-post-account-first-endpoint.md)

## Summary

Upstream routes are implemented for **L1** (sport options), **L2** (organisation types), and **W1** (partial PATCH of Step 1 fields on `api::account.account`). **L3** has no endpoints in v1.

**Base URL:** `{STRAPI_URL}/api` (same as existing account routes).

---

## Auth

All endpoints require the same **JWT (Bearer)** as `GET /api/account/me`.

**Before production:** Strapi Admin → **Settings → Users & permissions → Roles → Authenticated → Account** — enable:

| Action                                  | Used by |
| --------------------------------------- | ------- |
| `getOnboardingLookupsSports`            | L1      |
| `getOnboardingLookupsOrganisationTypes` | L2      |
| `updateOnboardingStep1`                 | W1      |

If an action is disabled, the client receives **403** with a valid JWT.

---

## L1 — GET sport options

- **Upstream:** `GET {STRAPI_URL}/api/account/onboarding/lookups/sports`
- **Success:** **200**  
  Body:

```json
{
  "data": [
    { "id": "Cricket", "label": "Cricket", "sortOrder": 1 },
    { "id": "AFL", "label": "AFL", "sortOrder": 2 }
  ]
}
```

- **`id`:** Must match the `Sport` enum stored on the account (string).
- **Caching:** Response includes `Cache-Control: private, max-age=3600`. The app may still use a longer TanStack Query TTL for session-static data.

**Implementation:** [`src/api/account/controllers/services/onboardingLookups/index.js`](../../../src/api/account/controllers/services/onboardingLookups/index.js)

---

## L2 — GET organisation types

- **Upstream:** `GET {STRAPI_URL}/api/account/onboarding/lookups/organisation-types`
- **Success:** **200**  
  Body:

```json
{
  "data": [{ "id": 1, "label": "Club", "sortOrder": 1 }]
}
```

- **`id`:** Strapi `account-type` document id (integer). Use as `accountTypeId` in W1.
- **Source:** Published `api::account-type.account-type` rows only, sorted by `id` ascending.
- **Caching:** Same as L1 (`Cache-Control: private, max-age=3600`).

---

## W1 — PATCH Step 1 onboarding fields

- **Upstream:** `PATCH {STRAPI_URL}/api/accounts/:accountId/onboarding/step-1`
- **Content-Type:** `application/json`
- **Auth:** Bearer JWT; **must** own the account (`user` relation = JWT user).

### Request body

Send a JSON object, optionally wrapped in `{ "data": { ... } }` (both accepted).

| Field                        | Type           | Notes                                                                  |
| ---------------------------- | -------------- | ---------------------------------------------------------------------- |
| `sport`                      | string         | Optional. One of: `Cricket`, `AFL`, `Hockey`, `Netball`, `Basketball`. |
| `accountTypeId`              | number         | Optional. Must reference a **published** `account-type` id.            |
| `onboardingOrganisationName` | string \| null | Optional. Trimmed; max **255** chars; empty string clears to `null`.   |
| `isRightsHolder`             | boolean        | Optional.                                                              |
| `isPermissionGiven`          | boolean        | Optional.                                                              |

At least **one** field must be present; otherwise **400** with `code: "EMPTY_UPDATE"`.

**Idempotency:** Repeating the same PATCH yields **200** with the same logical outcome (no **409** for “already saved” in v1).

### Success: **200**

```json
{
  "data": {
    "accountId": 123,
    "updated": {
      "sport": "Cricket",
      "accountTypeId": 1,
      "onboardingOrganisationName": "Example FC",
      "isRightsHolder": true,
      "isPermissionGiven": true
    }
  }
}
```

`updated` only includes keys that were present in the request.

**After success:** Re-fetch **`GET /api/account/me`**, **`GET /api/accounts/:accountId/settings`**, and **`GET /api/accounts/:accountId/organisation`** so the client sees `onboardingOrganisationName`, `Sport`, `account_type`, and permission flags (see payload services below).

### Side effects

When `isPermissionGiven` transitions to **true** for the first time, the server logs an informational line. **Async setup jobs** (scrapes, queues) are **not** wired in this change set; they may be added when S1/setup pipeline is integrated.

### Errors

| Status  | When                                                                         | Body shape                                                                      |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **400** | Validation (invalid sport, unknown account type, bad name, empty body, etc.) | `{ "error": { "code": "<string>", "message": "<string>" } }`                    |
| **401** | Missing / invalid JWT                                                        | Strapi default                                                                  |
| **403** | Authenticated role missing `updateOnboardingStep1`                           | Strapi default                                                                  |
| **404** | Account not found for this user                                              | `{ "error": { "code": "ACCOUNT_NOT_FOUND", "message": "Account not found." } }` |
| **500** | Server error                                                                 | Strapi default                                                                  |

Example codes: `INVALID_SPORT`, `UNKNOWN_ACCOUNT_TYPE`, `INVALID_ORG_NAME`, `INVALID_FLAG`, `EMPTY_UPDATE`, `INVALID_BODY`.

---

## Schema (account)

New optional attribute:

- **`onboardingOrganisationName`** (`string`, max 255) — working name before club/association records are linked.

Exposed on:

- `GET /api/account/me` (per-account list items)
- `GET /api/accounts/:accountId/settings`
- `GET /api/accounts/:accountId/organisation`

---

## CMS implementation map

| Route         | File                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom routes | [`src/api/account/routes/custom-account.js`](../../../src/api/account/routes/custom-account.js)                                                       |
| Handlers      | [`src/api/account/controllers/account.js`](../../../src/api/account/controllers/account.js)                                                           |
| L1/L2 data    | [`src/api/account/controllers/services/onboardingLookups/index.js`](../../../src/api/account/controllers/services/onboardingLookups/index.js)         |
| W1 logic      | [`src/api/account/controllers/services/updateOnboardingStep1/index.js`](../../../src/api/account/controllers/services/updateOnboardingStep1/index.js) |

---

## Ops

After deploy, run a **database migration** (Strapi will alter `accounts` for the new column on startup or via your usual migration process). Enable the three **Account** permissions for the **Authenticated** role as listed above.
