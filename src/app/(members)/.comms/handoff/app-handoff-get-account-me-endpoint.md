# App: Logged-in account payload — `GET /api/account/me`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-04-03  
**Purpose:** Integrate the authenticated **account/me** endpoint to load the current user’s linked account, dashboard-style **contentHub** data, and optional **extended** relations after login or on app shell refresh.

---

## 1. Overview

- The CMS resolves the **account** by the JWT user (`account.user` is one-to-one with `users-permissions` user). The app does **not** pass an account id in the URL.
- **Default** response includes a safe **user** slice, **accountId**, and **contentHub** (same aggregation as the legacy `GET /account/fixturaContentHubAccountDetails/:ID` path, plus rollup metrics).
- **Optional** `depth=extended` adds a second block **extended** with relations not included in content hub (subscription tier, orders summary, trial, collections, sponsors, media libraries, customers, template option).

**Suggested use:** Call immediately after successful login (or when restoring a session) to hydrate account context; use `depth=extended` only when the screen needs billing/collections/sponsors (larger payload).

---

## 2. Endpoint contract

| Property     | Value                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Method**   | `GET`                                                                                                                  |
| **Path**     | `/api/account/me`                                                                                                      |
| **Full URL** | `{CMS_BASE_URL}/api/account/me`                                                                                        |
| **Auth**     | **Required.** `Authorization: Bearer <jwt>` (users-permissions JWT from `/api/auth/local` or your existing auth flow). |
| **Query**    | Optional: `depth=extended` (see §5).                                                                                   |

**Strapi API prefix:** If `config/server` uses a custom REST prefix, prepend it (default is `/api`).

---

## 3. Users-permissions (CMS ops)

For **Authenticated** users to call this route, the permission must be enabled in Strapi Admin:

**Settings → Users & permissions → Roles → Authenticated → Account → `loggedInAccount` → enable.**

**Permission action id (reference):** `api::account.account.loggedInAccount`

If this is disabled, the app will receive **403 Forbidden** even with a valid JWT.

---

## 4. Response shape (success, HTTP 200)

Strapi wraps the handler result as:

```json
{
  "data": {
    "accountId": 123,
    "user": { ... },
    "contentHub": { ... },
    "extended": { ... }
  }
}
```

- **extended** is present **only** when `?depth=extended` is sent.

### 4.1 TypeScript — envelope and fixed fields

```typescript
/** Success body for GET /api/account/me */
interface AccountMeResponse {
  data: AccountMePayload;
}

interface AccountMePayload {
  accountId: number;
  user: AccountMeUser | null;
  contentHub: AccountContentHubPayload;
  /** Only when called with ?depth=extended */
  extended?: AccountMeExtended;
}

interface AccountMeUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: {
    id: number;
    name: string;
    type: string;
  } | null;
}
```

### 4.2 `contentHub` (dashboard aggregate)

Built by `FixturaContentHubService` and `FilterAccountData`. Core fields include:

| Area            | Notes                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account scalars | `id`, `FirstName`, `LastName`, `DeliveryAddress`, `isActive`, `isSetup`, `isRightsHolder`, `isPermissionGiven`, `group_assets_by`, `include_junior_surnames`, `isUpdating`, `Sport` |
| Scheduler       | Nested scheduler details (when present)                                                                                                                                             |
| Organisation    | `account_type` (numeric id), `accountOrganisationDetails` (club vs association deep slice)                                                                                          |
| Renders         | `renders` array and derived **rollup** / **metricsOverTime** / **metricsAsPercentageOfCost**                                                                                        |
| Branding        | `template`, `theme` (string names where applicable)                                                                                                                                 |
| Token           | `render_token` — output is passed through Strapi **content API sanitize** (no raw secrets added by this endpoint)                                                                   |

Treat **contentHub** as the source of truth for post-login dashboard state unless the product explicitly needs **extended**.

```typescript
/**
 * Opaque / evolving — prefer typing the fields your screens actually use.
 * Aligns with legacy fixturaContentHub + filterAccountData outputs.
 */
type AccountContentHubPayload = Record<string, unknown>;
```

### 4.3 `extended` (only with `depth=extended`)

Second DB read: account id + targeted populates. Includes (non-exhaustive):

- `subscription_tier` — id, Name, description, price, currency
- `orders` — status/summary fields only (no checkout session, Stripe customer/subscription ids, payment method strings, invoices)
- `trial_instance` — with shallow club/association and subscription_tier
- `data_collections` — including `processingTracker` JSON when present
- `sponsors` — including `Logo` media
- `result_collections`, `account_media_libraries` (with `imageId` media), `customers` (**id only**), `template_option` (`useBackground`)

```typescript
/** Populated account document slice; shape follows Strapi entity API. */
type AccountMeExtended = Record<string, unknown>;
```

---

## 5. Query parameter

| Query          | Values     | Effect                                          |
| -------------- | ---------- | ----------------------------------------------- |
| `depth`        | `extended` | Adds **extended** to `data`.                    |
| (omit / other) | —          | **contentHub** + **user** + **accountId** only. |

Example:

```http
GET /api/account/me?depth=extended
Authorization: Bearer <jwt>
```

---

## 6. Error responses

| HTTP    | When                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| **401** | No or invalid JWT; or user blocked / unconfirmed per users-permissions advanced settings. |
| **403** | Valid JWT but role lacks `api::account.account.loggedInAccount`.                          |
| **404** | Authenticated user has **no** linked `account` row (`user` relation).                     |
| **500** | Server error loading hub or extended data (logged server-side).                           |

**404 body (typical):** message such as `No account linked to this user` (Strapi error envelope may wrap this).

---

## 7. Example requests

### cURL (default payload)

```bash
curl -sS -H "Authorization: Bearer YOUR_JWT" \
  "https://YOUR_CMS_HOST/api/account/me"
```

### cURL (extended)

```bash
curl -sS -H "Authorization: Bearer YOUR_JWT" \
  "https://YOUR_CMS_HOST/api/account/me?depth=extended"
```

### Fetch (browser / RN)

```typescript
const res = await fetch(`${CMS_BASE_URL}/api/account/me`, {
  headers: {
    Authorization: `Bearer ${jwt}`,
    Accept: "application/json",
  },
});

if (!res.ok) {
  // handle 401 / 403 / 404 / 500
  throw new Error(await res.text());
}

const json: AccountMeResponse = await res.json();
const { accountId, user, contentHub, extended } = json.data;
```

---

## 8. Implementation notes for the app

1. **Single account per user** — Schema is one-to-one; no account picker in this contract. If multi-account is introduced later, the CMS would need a new contract (e.g. active account id).
2. **Prefer default** first load; add **extended** only on routes that need billing/collections to limit payload and parse time.
3. **403 after deploy** — Usually missing **loggedInAccount** permission for Authenticated; coordinate with CMS ops.
4. **404** — User exists but onboarding never created an `account`; app should send user to account creation / support flow as you already do elsewhere.
5. **Caching** — Response can be large; cache in app state keyed by user id + optional `depth`; invalidate on logout and on known account mutations.

---

## 9. Backend reference (for traceability)

| Item          | Location                                                               |
| ------------- | ---------------------------------------------------------------------- |
| Route         | `src/api/account/routes/custom-account.js` (`GET /account/me`)         |
| Handler       | `src/api/account/controllers/account.js` → `loggedInAccount`           |
| Orchestration | `src/api/account/controllers/services/loggedInAccountPayload/index.js` |
| Content hub   | `src/api/account/controllers/services/fixturaContentHub/index.js`      |

---

## 10. Open questions

- None from CMS side; confirm app base URL and env naming (`NEXT_PUBLIC_*`, etc.) in your repo.
