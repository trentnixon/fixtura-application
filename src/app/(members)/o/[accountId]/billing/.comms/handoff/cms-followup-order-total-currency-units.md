# CMS follow-up — Order.total must be currency units (not Stripe cents)

**From:** Fixtura App (frontend)  
**To:** CMS / Strapi backend  
**Date:** 2026-07-05  
**Related:** [`frontend-handoff-orders-by-account-endpoint.md`](../response/frontend-handoff-orders-by-account-endpoint.md)

## Problem

Some Stripe-backed orders return `total` in **cents** (e.g. `65000`) while the contract and tier prices use **dollars** (e.g. `650`). Non-Stripe orders (e.g. One Month Pass at `200`) appear correct.

Customer-visible symptom: billing history showed **A$65,000.00** instead of **A$650.00** for Association Season Pass orders.

## Verified expected API shape (DevTools)

Confirm on `GET /api/accounts/:accountId/billing/orders` (BFF → Strapi `GET /api/orders/account/:accountId`):

| Order (example) | Field                    | Observed (reported) | Expected contract     |
| --------------- | ------------------------ | ------------------- | --------------------- |
| Season Pass 457 | `total`                  | `"65000"`           | `"650"` or `"650.00"` |
| Season Pass 457 | `subscriptionTier.price` | `650`               | `650`                 |
| Season Pass 457 | `paymentChannel`         | `"stripe"`          | `"stripe"`            |
| One Month 455   | `total`                  | `"200"`             | `"200"`               |
| One Month 455   | `subscriptionTier.price` | `200`               | `200`                 |

Redacted sample row (Season Pass):

```json
{
  "id": 457,
  "total": "65000",
  "currency": "AUD",
  "paymentChannel": "stripe",
  "subscriptionTier": {
    "id": 1,
    "name": "Season Pass",
    "price": 650,
    "currency": "AUD"
  }
}
```

## Required CMS fix (source of truth)

1. **On save** from Stripe Checkout / subscription / invoice webhooks: persist `Order.total` in **decimal currency units** (AUD dollars), same as `subscriptionTier.price` and available-tiers `price`.
2. **Divide Stripe amounts by 100** before writing when the Stripe API returns cents (`amount_total`, `unit_amount`, invoice `subtotal`, etc.).
3. **Optional backfill:** update existing rows where `total = tier.price * 100` (e.g. orders 456, 457: `65000` → `650`).

## App mitigation (shipped)

The app normalizes display totals when `parsedTotal === subscriptionTier.price * 100` (see `resolveOrderTotalForDisplay` in `billingHistoryOrderUtils.ts`). This is a **display-layer workaround**; raw API values remain wrong until CMS is fixed.

## Contract clarification to add to handoff

- `orders[].total` — string in **currency units** (e.g. `"650.00"`), **never** Stripe cents.
- Stripe integrations must convert cents → dollars before persistence.
