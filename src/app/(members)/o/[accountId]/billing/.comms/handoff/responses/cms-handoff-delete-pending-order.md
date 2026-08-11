# CMS handoff: Discard pending Stripe checkout order — **implemented (backend)**

**From:** Fixtura CMS / Strapi (this repo)  
**To:** App (frontend + Next BFF)  
**Date:** 2026-05-08  
**Status:** Backend shipped: `runAccountBillingDeletePendingOrder`, `GET /billing` flag `availableActions.canDeletePendingOrder`, bootstrap permission.

**Request spec:** [cms-request-delete-pending-order.md](../requests/cms-request-delete-pending-order.md)  
**Related (resume):** [cms-handoff-resume-stripe-checkout.md](cms-handoff-resume-stripe-checkout.md)

---

## Summary

1. **Problem:** Member starts Stripe Checkout; an unpaid `api::order.order` row blocks `availableActions` / plan selection. User should be able to **discard** that attempt and start again.
2. **Solution:** `POST /api/accounts/:accountId/billing/orders/:orderId/delete` soft-expires the row (same terminal fields as resume Option B + TTL cron) and best-efforts `stripe.checkout.sessions.expire` when `checkout_session` is present.
3. **Summary flag:** `GET /billing` now includes `availableActions.canDeletePendingOrder` when at least one account order is a deletable Stripe `checkout_status: incomplete` row (camelCase v1 contract).

---

## Decisions (locked)

| Topic                    | Choice                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP                     | `POST /api/accounts/:accountId/billing/orders/:orderId/delete`, body optional `{}`                                                                          |
| Persistence              | **Soft** — update row to `checkout_status: incomplete_expired`, `stripe_status: expired`, `payment_status: canceled` (reuse `expireAbandonedCheckoutOrder`) |
| Idempotency              | **200** with `noOp: true` when row already terminal (`incomplete_expired`, or `canceled` + `payment_status: canceled`) for that account                     |
| Anti-enumeration         | Wrong/missing order or not owner → **404** `ORDER_NOT_FOUND` (same pattern as resume for cross-account)                                                     |
| Non-Stripe / wrong state | **409** `ORDER_NOT_DELETABLE`; paid → **409** `ALREADY_PAID`                                                                                                |
| Stripe                   | Best-effort `sessions.expire`; log failures; **always** apply DB terminal state after expire attempt                                                        |
| Invoice requests         | **Out of scope v1**                                                                                                                                         |

---

## API contract

### Route

| Property   | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| **Method** | `POST`                                                      |
| **Path**   | `/api/accounts/:accountId/billing/orders/:orderId/delete`   |
| **Scope**  | `api::account.account.postAccountBillingDeletePendingOrder` |

### Path params

- `accountId` — positive int string
- `orderId` — positive int string (Strapi order id)

### Response (200 OK) — active discard

```json
{
  "orderId": "12345",
  "checkoutStatus": "incomplete_expired",
  "stripeSessionExpired": true,
  "noOp": false
}
```

- `stripeSessionExpired`: `true` only when a `checkout_session` was present and Stripe `expire` returned successfully.

### Response (200 OK) — idempotent no-op

```json
{
  "orderId": "12345",
  "noOp": true,
  "checkoutStatus": "incomplete_expired"
}
```

### Errors

Envelope (same as resume):

```json
{
  "error": {
    "code": "INVALID_ACCOUNT_ID",
    "message": "…"
  }
}
```

| HTTP    | `code` (examples)                        |
| ------- | ---------------------------------------- |
| **400** | `INVALID_ACCOUNT_ID`                     |
| **401** | (Strapi unauthorized — no JSON envelope) |
| **404** | `ORDER_NOT_FOUND`                        |
| **409** | `ORDER_NOT_DELETABLE`, `ALREADY_PAID`    |
| **422** | `INVALID_ORDER_ID`                       |
| **500** | `INTERNAL_ERROR` (DB failure)            |

---

## Billing summary (v1)

`GET /api/accounts/:accountId/billing` → `data.availableActions.canDeletePendingOrder`

-- `true` when not `accessStatus: restricted` and **any** loaded order for the account matches: `payment_channel === "stripe"`, unpaid, `checkout_status === "incomplete"`.

---

## Backend implementation map

| Piece                        | Path                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eligibility + helpers        | [`src/api/account/controllers/services/billingCheckout/loadEligibleDeletableOrder.js`](../../../src/api/account/controllers/services/billingCheckout/loadEligibleDeletableOrder.js)                   |
| Stripe expire (best-effort)  | [`src/api/account/controllers/services/billingCheckout/expireStripeCheckoutSession.js`](../../../src/api/account/controllers/services/billingCheckout/expireStripeCheckoutSession.js)                 |
| Orchestrator                 | [`src/api/account/controllers/services/billingCheckout/runAccountBillingDeletePendingOrder.js`](../../../src/api/account/controllers/services/billingCheckout/runAccountBillingDeletePendingOrder.js) |
| Row terminal helper (shared) | [`src/api/account/controllers/services/billingCheckout/expireAbandonedCheckoutOrder.js`](../../../src/api/account/controllers/services/billingCheckout/expireAbandonedCheckoutOrder.js)               |
| `availableActions`           | [`src/api/account/controllers/services/billingV1/availableActions.js`](../../../src/api/account/controllers/services/billingV1/availableActions.js)                                                   |
| Billing summary wiring       | [`src/api/account/controllers/services/billingSummary/buildBillingSummary.js`](../../../src/api/account/controllers/services/billingSummary/buildBillingSummary.js)                                   |
| Contract types               | [`src/api/account/types/billing-contract-v1.d.ts`](../../../src/api/account/types/billing-contract-v1.d.ts)                                                                                           |
| Controller                   | [`src/api/account/controllers/account.js`](../../../src/api/account/controllers/account.js) — `postAccountBillingDeletePendingOrder`                                                                  |
| Route                        | [`src/api/account/routes/custom-account.js`](../../../src/api/account/routes/custom-account.js)                                                                                                       |
| Permission bootstrap         | [`src/index.js`](../../../src/index.js) — `ensureAccountBillingDeletePendingOrderPermission`                                                                                                          |

---

## Acceptance criteria (backend)

- [x] Route + service + unit tests + route wiring test
- [x] Eligible incomplete Stripe order → terminal row + best-effort session expire
- [x] Second call on terminal row → 200 `noOp: true`
- [x] `GET /billing` exposes `canDeletePendingOrder` when a deletable row exists
- [ ] **Ops:** Confirm **Authenticated** role shows `postAccountBillingDeletePendingOrder` in Admin after deploy (bootstrap should create/enable it)

---

## Ready for FE / BFF

1. Add `POST /api/accounts/[accountId]/billing/orders/[orderId]/delete` → Strapi proxy (same auth as other billing POSTs).
2. Drive **Delete order** CTA from `availableActions.canDeletePendingOrder` (and optionally hide when false).
3. On success: invalidate `GET /billing` and `GET …/billing/orders`.
4. On 200 with `noOp: true`, treat as success (refetch billing).

---

## References

- App request: [.comms/stripe/requests/cms-request-delete-pending-order.md](../requests/cms-request-delete-pending-order.md)
- Ticket: `TKT-2026-009` in [`src/api/account/.docs/Tickets.md`](../../../src/api/account/.docs/Tickets.md)
