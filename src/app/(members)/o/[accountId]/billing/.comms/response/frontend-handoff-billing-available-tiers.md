# Frontend handoff — available subscription tiers (per account)

## Purpose

Return **active, published** subscription tiers the signed-in user may choose for **a specific account**, already filtered to that account’s type (Club vs Association). Use this for **plan selection** UI before calling checkout or invoice-request endpoints.

Canonical TypeScript shapes live in the repo at:

`src/api/account/types/billing-contract-v1.d.ts`

(types: `AvailableBillingTier`, `AvailableTiersResponse`, `SubscriptionTierCategory`).

---

## Endpoint

| Item     | Value                                                           |
| -------- | --------------------------------------------------------------- |
| Method   | `GET`                                                           |
| Path     | `/api/accounts/:accountId/billing/available-tiers`              |
| Full URL | `{STRAPI_URL}/api/accounts/{accountId}/billing/available-tiers` |

There is **no request body**. All inputs are the URL path and headers.

---

## Request — what the frontend sends

### Path parameter

| Param       | Type             | Notes                                                                    |
| ----------- | ---------------- | ------------------------------------------------------------------------ |
| `accountId` | string (numeric) | Strapi account id. Non-numeric or `<= 0` → **400** `Invalid account id`. |

Example: `/api/accounts/42/billing/available-tiers`

### Headers

```http
Authorization: Bearer <jwt>
```

Unauthenticated → **401** `Authentication required`.

### Query string

None. Do not rely on query parameters; they are not part of the contract.

---

## Auth — Users & Permissions

Enable for the **Authenticated** role:

| Scope key                                              | Purpose                                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `api::account.account.getAccountBillingAvailableTiers` | Account → **getAccountBillingAvailableTiers** (exact label may vary in Admin UI) |

Location: Strapi Admin → **Settings** → **Users & permissions** → **Roles** → **Authenticated** → **Account**.

---

## Behaviour (summary)

1. Resolves the JWT user and validates **account ownership** (same pattern as other member account billing routes).
2. Loads the account’s **account type** and derives a **Club** / **Association** filter when possible.
3. Loads all **published** (`publishedAt` set) and **`isActive: true`** subscription tiers from CMS, ordered by **`price` ascending**.
4. Drops tiers that do not match the account’s category rules (tier `Category` / `isClub` vs account type).
5. Sport-specific tier filtering is reserved for the future; currently all active tiers passing the category filter are included.
6. Maps each tier to the **camelCase** `AvailableBillingTier` wire shape (no raw CMS field names in the response).

---

## Success response (`200`)

Body is a plain JSON object (not Strapi’s `{ data: { attributes } }` envelope):

```json
{
  "tiers": [
    {
      "id": "12",
      "name": "Club Season Pass",
      "description": "",
      "category": "Club",
      "price": 299,
      "currency": "AUD",
      "daysInPass": 180,
      "priceByWeekInPass": 12.5,
      "isActive": true,
      "includeSponsors": false,
      "includedAssetTypes": ["Video", "Social graphic"],
      "packageName": "optional-if-set",
      "stripePriceId": "price_xxx"
    }
  ]
}
```

### TypeScript — `AvailableTiersResponse`

```ts
export type SubscriptionTierCategory = "Club" | "Association";

export type AvailableBillingTier = {
  id: string;
  name: string;
  description: string;
  category: SubscriptionTierCategory;
  price: number;
  currency: string;
  daysInPass: number;
  priceByWeekInPass?: number;
  isActive: boolean;
  includeSponsors: boolean;
  includedAssetTypes: string[];
  packageName?: string;
  stripePriceId?: string;
};

export type AvailableTiersResponse = {
  tiers: AvailableBillingTier[];
};
```

### Field notes for UI

| Field                | Meaning                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | Use as **`subscriptionTierId`** when calling `POST .../billing/checkout` or `POST .../billing/invoice-requests` (string on the wire). |
| `price`              | Decimal **currency units** (e.g. dollars), not cents.                                                                                 |
| `currency`           | ISO 4217 (e.g. `AUD`).                                                                                                                |
| `daysInPass`         | Pass length from CMS (`DaysInPass` internally).                                                                                       |
| `priceByWeekInPass`  | Present only when CMS has a finite numeric `PriceByWeekInPass`.                                                                       |
| `includedAssetTypes` | Human-readable labels derived from tier `subscription_items` (strings or small objects).                                              |
| `stripePriceId`      | Optional; useful for debugging or future client flows; checkout is still started via the backend.                                     |
| `packageName`        | Optional; only if the mapper is passed extra context (normally omitted).                                                              |

Response header:

```http
Cache-Control: private, no-store
```

Treat the list as **user-specific** and do not cache in public CDNs.

---

## Error responses

| Status  | When                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **401** | Missing or invalid JWT.                                                                                                       |
| **400** | Invalid `accountId` (not a positive integer).                                                                                 |
| **404** | Account not found **or** user does not own the account (anti-enumeration: same message shape as other account-scoped routes). |
| **500** | Server error while loading tiers.                                                                                             |

---

## Related calls (after plan selection)

| Action               | Method | Path                                                | Body uses `subscriptionTierId` from `tiers[].id`                      |
| -------------------- | ------ | --------------------------------------------------- | --------------------------------------------------------------------- |
| Billing state / CTAs | `GET`  | `/api/accounts/:accountId/billing`                  | —                                                                     |
| Stripe Checkout      | `POST` | `/api/accounts/:accountId/billing/checkout`         | `subscriptionTierId`, `startDate`, …                                  |
| Invoice request      | `POST` | `/api/accounts/:accountId/billing/invoice-requests` | `subscriptionTierId`, `requestedStartDate`, billing contact fields, … |

Full billing contract: `.comms/accounts/handoff/frontend-billing-api-contract-handoff.md`.

---

## Example — minimal client request

```http
GET /api/accounts/42/billing/available-tiers HTTP/1.1
Host: <strapi-host>
Authorization: Bearer <jwt>
```

```ts
// Example: typed fetch (adjust base URL)
const res = await fetch(`${STRAPI_URL}/api/accounts/${accountId}/billing/available-tiers`, {
  headers: { Authorization: `Bearer ${token}` },
});
const body: AvailableTiersResponse = await res.json();
```

---

## Changelog

| Date       | Note                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 2026-05-06 | Initial handoff aligned with `billing-contract-v1.d.ts` and `getAvailableBillingTiersForAccount` service. |
