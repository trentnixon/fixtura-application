# App handoff — POST first account (A1)

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend / BFF) Team  
**Date:** 2026-04-07  
**Updated:** 2026-04-08 (optional `sport` + `hasCompletedStartSequence` in request body on Get Started / A1)

## CMS delivery — ready to integrate

The upstream handler **`POST /api/account/first`** is **live in the Strapi codebase** (`createFirstAccount`). Point the members BFF at `{STRAPI_URL}/api/account/first` with the same JWT pattern as `GET /api/account/me`.

**Before production:** Strapi Admin → **Settings → Users & permissions → Roles → Authenticated → Account** → enable **`createFirstAccount`**. Permission action id: `api::account.account.createFirstAccount`. If this stays disabled, the app will see **403** with a valid JWT.

**App checklist:** Proxy `POST` with Bearer token; treat **200** and **201** as success and read **`data.accountId`**; then call **`GET /api/account/me`** for bootstrap (see [`app-handoff-get-account-me-endpoint.md`](../../../.comms/app-handoff-get-account-me-endpoint.md)).

---

**Context:** Phase 1 onboarding ([`PhasedIntegrationPath.md`](../../.docs/PhasedIntegrationPath.md)). Members app exposes a BFF route that proxies to Strapi; CMS implements the upstream handler.

## Request (BFF — browser → Next.js)

- **Method / path:** `POST /api/account/first`
- **Auth:** Session cookie (same as `GET /api/account/me`).
- **Body:** JSON object, forwarded as-is. **v1:** often `{}`. **App (2026-04-08):** when the user completes **Get Started** with a sport and the app calls A1 (zero-account users), the client sends `{ "sport": "<id>", "hasCompletedStartSequence": true }` where `<id>` is the **L1** sport id string (same values as `GET /api/account/onboarding/lookups/sports`). **`hasCompletedStartSequence`** tells CMS the initial start sequence (sport selection) has completed. CMS persists these on the new account (`Sport`, `hasCompletedStartSequence`) when provided; otherwise schema defaults apply.

## Upstream (BFF → Strapi)

- **Method / path:** `POST {STRAPI_URL}/api/account/first`
- **Headers:** `Authorization: Bearer <JWT from cookie>`, `Content-Type: application/json`, `Accept: application/json`
- **Body:** Same as client body (often `{}`, or `{ "sport": "<id>", "hasCompletedStartSequence": true }` on Get Started; see Request section).

## Success response (contract)

Envelope aligned with other account APIs:

```json
{
  "data": {
    "accountId": 123
  }
}
```

- **`accountId`:** Numeric Strapi account document id. Required for the client to scope subsequent calls to `/api/accounts/[accountId]/…`.

CMS may add additional fields under `data`; the app types them as an index signature where needed.

### HTTP status (chosen behaviour)

| Case                                           | Status  | Body                               |
| ---------------------------------------------- | ------- | ---------------------------------- |
| First account created                          | **201** | `{ "data": { "accountId": <n> } }` |
| User already had an account (idempotent retry) | **200** | Same shape, same `accountId`       |

The app and BFF should treat **200** and **201** as success and read `data.accountId` in both cases.

## Error responses

| Status | Meaning (illustrative)                                                                     |
| ------ | ------------------------------------------------------------------------------------------ |
| 401    | Unauthenticated                                                                            |
| 403    | Forbidden (e.g. Users & Permissions: `createFirstAccount` disabled for Authenticated)      |
| 400    | Bad request / validation (e.g. invalid `sport` or non-boolean `hasCompletedStartSequence`) |
| 500    | Server error                                                                               |

**Not used in v1:** **409** for “already has account” — idempotent success is **200** with the existing `accountId` (see above).

Error JSON should expose `error` or `message` string for the fetch client (see `apiRequest` normalization).

## Idempotency

- **Locked:** If the user already has an account linked to the JWT user, respond **200** with `{ data: { accountId } }` (same as first successful create). No **409** for this case in v1.
- **v1:** Body is **not** applied on idempotent **200** (optional fields are ignored; no merge/update).
- Concurrent duplicate requests: implementation may return **200** after creation if another request won the race (same `accountId`).

## CMS implementation (Strapi)

Paths below are **in the Strapi repository**, not the Fixtura Next.js app.

| Item                       | Detail                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route                      | `POST /account/first` → `src/api/account/routes/custom-account.js`                                                                                                                                                                                                              |
| Handler                    | `src/api/account/controllers/account.js` → `createFirstAccount`                                                                                                                                                                                                                 |
| Permission (Authenticated) | Enable **Account → `createFirstAccount`** in Strapi Admin. **Action id:** `api::account.account.createFirstAccount`                                                                                                                                                             |
| Creation chain             | Uses `src/api/account/controllers/AccountInitializer/AccountCreator.js` (account + scheduler + template option defaults). **Not** the same as legacy `POST /account/createAccount` (unauthenticated, different validation); v1 does **not** require theme/template in the body. |
| Request body               | Optional **`sport`** (L1 id, must match sports lookup) and **`hasCompletedStartSequence`** (boolean). Persisted on create to account **`Sport`** and **`hasCompletedStartSequence`**. Clients may send `{}`. Forwarding arbitrary JSON is supported for future fields.          |

## GET /api/account/me after success

After A1, `GET /api/account/me` should return bootstrap data where the user can resolve an account (`accounts[]` and/or `accountId` consistent with [`account-me-rows`](../../../../../lib/account/account-me-rows.ts)).

## Open questions (future)

- **`sport` on A1:** Idempotent **200** retries do not merge/update `sport` in v1.
- **`hasCompletedStartSequence` on A1:** Idempotent **200** retries do not merge/update in v1.
- Other non-empty body fields: optional JSON beyond `sport` / `hasCompletedStartSequence` remains **reserved** until schema is defined.
