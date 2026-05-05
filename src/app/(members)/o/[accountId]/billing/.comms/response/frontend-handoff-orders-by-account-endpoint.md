# Frontend handoff — list orders by account

## Purpose

Expose every billing/order row linked to the signed-in user’s account so the app can render an **order history** screen without scraping billing summaries or staff analytics routes.

For subscription lifecycle and CTAs, **`GET /api/accounts/:accountId/billing`** remains the source of truth; this endpoint is for **listing historical orders** with a stable, camelCase shape.

## Endpoint

| Item     | Value                                         |
| -------- | --------------------------------------------- |
| Method   | `GET`                                         |
| Path     | `/api/orders/account/:accountId`              |
| Full URL | `{STRAPI_URL}/api/orders/account/{accountId}` |

## Authentication

Send the Strapi JWT:

```http
Authorization: Bearer <jwt>
```

The authenticated user must **own** the account (`account.user` matches JWT user). Cross-account access returns **404** (same anti-enumeration pattern as other member account routes).

## Users & Permissions

Enable for the **Authenticated** role:

| Scope key                             | UI label (approx.)             |
| ------------------------------------- | ------------------------------ |
| `api::order.order.getOrdersByAccount` | Order → **getOrdersByAccount** |

Location: Strapi Admin → **Settings** → **Users & permissions** → **Roles** → **Authenticated** → **Order**.

After deploying new routes, restart Strapi if permissions do not appear until refresh.

## Success response (`200`)

Body is **not** wrapped in `{ data: ... }` (plain JSON object):

```json
{
  "accountId": 123,
  "orders": [
    {
      "id": 456,
      "name": null,
      "status": null,
      "currency": "AUD",
      "total": "99.00",
      "isPaid": true,
      "paymentStatus": "paid",
      "checkoutStatus": "complete",
      "paymentChannel": "stripe",
      "isActive": true,
      "isPaused": false,
      "cancelAtPeriodEnd": false,
      "stripeStatus": "active",
      "stripeSubscriptionId": "sub_...",
      "startAt": "2026-01-01T00:00:00.000Z",
      "endAt": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-02T00:00:00.000Z",
      "subscriptionTier": {
        "id": 1,
        "name": "Club Pass",
        "price": 99,
        "currency": "AUD"
      }
    }
  ],
  "meta": {
    "count": 1
  }
}
```

### Field notes

- **`orders`**: sorted **newest first** (`createdAt` descending). Includes **all** orders for the account (no server-side pagination yet).
- **`name`**: CMS field `Order.Name` (string).
- **`status`**: CMS field `Order.Status` — in schema this is **boolean**; treat as opaque unless product defines semantics.
- **`total`**: stored as **string** in CMS; parse on the client if you need a number.
- **`subscriptionTier`**: `null` when no tier relation; otherwise `{ id, name, price, currency }` (`name` maps from tier `Name`).

## Error responses

| HTTP  | When                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `400` | `:accountId` is missing or not a **positive integer** (message: `Invalid account id.`)                                                     |
| `401` | No JWT / user not resolved (message: `Authentication required.`)                                                                           |
| `403` | JWT valid but role lacks `getOrdersByAccount` permission                                                                                   |
| `404` | Account does not exist **or** JWT user does **not** own it (message: `Account not found.`; code `ACCOUNT_NOT_FOUND` from ownership helper) |
| `500` | Unexpected failure loading orders (message: `Failed to load orders.`)                                                                      |

## Example request

```http
GET https://your-strapi.example.com/api/orders/account/42
Authorization: Bearer eyJhbGc...
```

Empty history is still **`200`** with `"orders": []` and `"meta": { "count": 0 }`.

## Backend references

- Route registration: `src/api/order/routes/custom-routes.js`
- Handler: `src/api/order/controllers/order.js` → `getOrdersByAccount`
- Ownership check: `src/api/account/controllers/services/security/index.js` → `assertOwnedAccount`

## Related

Broader billing contract (summary, checkout, trials): `.comms/accounts/handoff/frontend-billing-api-contract-handoff.md`
