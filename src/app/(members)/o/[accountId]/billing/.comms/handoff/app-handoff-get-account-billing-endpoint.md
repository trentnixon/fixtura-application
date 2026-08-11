# App: Account billing — `GET /api/accounts/:accountId/billing`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-04-07  
**Purpose:** Single consolidated payload for subscription tier, trial, Stripe customers, orders, derived subscription summary, and financial rollups—without Strapi audit fields on nested tiers, and without checkout session / payment intent / cancel URL on orders.

---

## Flow

1. **`GET /api/account/me`** — Bootstrap (user + account list).
2. **`GET /api/accounts/:accountId/billing`** — Billing and payment context for the selected account.

Ownership matches other account-scoped routes (`account.user` = JWT user).

---

## Endpoint

| Property       | Value                                            |
| -------------- | ------------------------------------------------ |
| **Method**     | `GET`                                            |
| **Path**       | `/api/accounts/:accountId/billing`               |
| **Path param** | `accountId` — positive integer Strapi account id |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`      |

**Users-permissions:** Enable **Authenticated** → Account → **`getAccountBilling`**.  
**Reference scope:** `api::account.account.getAccountBilling`

**Caching:** Response includes `Cache-Control: private, no-store`.

---

## Success response (HTTP 200)

Envelope: `{ "data": BillingPayload }`.

### `BillingPayload`

| Field                  | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **`subscriptionTier`** | Current account tier (`null` if none). See SubscriptionTierDto.       |
| **`trial`**            | Trial instance (`null` if none). See TrialDto.                        |
| **`customers`**        | Stripe customer rows for this account. See CustomerDto.               |
| **`orders`**           | Up to **100** most recent orders (by `createdAt` desc). See OrderDto. |
| **`summary`**          | Derived current subscription state. See SummaryDto.                   |
| **`financialSummary`** | Totals over **all** orders for the account (not only the listed 100). |
| **`meta`**             | `{ ordersTotal, ordersReturned, orderListMax }`                       |

### SubscriptionTierDto

`id`, `Name`, `Title`, `SubTitle`, `description`, `price`, `currency`, `stripe_product_id`, `stripe_price_id`, `isActive`, `isClub`, `includeSponsors`, `Category`, `DaysInPass`, `PriceByWeekInPass`, `subscription_items`.  
(Media `image_url` is not included on this endpoint.)

### TrialDto

`id`, `startDate`, `endDate`, `isActive`, `subscriptionTier` (SubscriptionTierDto or `null`).

### CustomerDto

`id`, `stripe_customer_id`, `stripe_created`, `stripe_invoice_prefix`.

### OrderDto

`id`, `Name`, `total`, `currency`, `OrderPaid`, `payment_status`, `checkout_status`, `payment_channel`, `startOrderAt`, `endOrderAt`, `isActive`, `isPaused`, `cancel_at_period_end`, `stripe_subscription_id`, `stripe_status`, `hosted_invoice_url`, `invoice_pdf`, `invoice_number`, `invoice_due_date`, `createdAt`, `updatedAt`, `subscriptionTier` (SubscriptionTierDto or `null`).

**Omitted by design (not returned):** `checkout_session`, `payment_intent`, `cancel_url`, and other order scalars not listed above.

### SummaryDto

Aligned with internal “current subscription” resolution (active order → paid in date range → most recent paid):

- `status` — string (e.g. `Active`, `Paused`, `Expired`, `Pending Payment`, `No active subscription`)
- `tier`, `price`, `currency`
- `startDate`, `endDate` — ISO strings or `null`
- `daysRemaining` — number
- When an active order exists: `cancelAtPeriodEnd`, `isActive`, `autoRenew`

### Financial summary

`totalSpent`, `averageOrderValue`, `totalOrders`, `paidOrders`, `lifetimeValue` (same semantics as admin analytics helper: paid filter uses `OrderPaid` or `Status === "paid"`).

---

## Errors

| HTTP    | When                                                              |
| ------- | ----------------------------------------------------------------- |
| **401** | Missing or invalid JWT                                            |
| **400** | `accountId` not a positive integer                                |
| **404** | Account not found **or** not owned by the user (enumeration-safe) |
| **500** | Server error                                                      |

---

## Notes for app integration

- Enable the **`getAccountBilling`** permission for the Authenticated role after deploy.
- If `meta.ordersTotal` exceeds `meta.orderListMax`, only the newest orders are listed; `financialSummary` still reflects **all** orders.
