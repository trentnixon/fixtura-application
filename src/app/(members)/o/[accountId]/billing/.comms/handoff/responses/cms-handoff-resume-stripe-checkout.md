# CMS handoff: Resume Stripe Checkout (“Continue payment”) — **implemented (backend)**

**From:** Fixtura App (frontend + Next BFF)  
**To:** CMS / Strapi (account billing + Stripe integration)  
**Date:** 2026-05-08  
**Status:** Backend shipped in this repo (`runAccountBillingCheckoutResume`, route, TTL cron, bootstrap permission).

**Related (FE return URLs):** [billing-checkout-return-urls.md](../resources/billing-checkout-return-urls.md)

---

## Summary

1. **Problem:** After “Pay with Stripe Checkout”, the user may close or cancel Stripe. The **Order** stays pending; the FE shows **Payment pending**. Users must be able to **continue payment** without support when the original Checkout Session is still **open**, and automatically get a **new** session when it is not.
2. **Solution (live):** `POST /api/accounts/:accountId/billing/checkout/resume`:
   - Validates a pending Stripe order by **`orderId` (required)** — use `currentPlan.orderId` from `GET /billing`.
   - **Retrieves** the stored `checkout_session` (`cs_...`) from Stripe when present; if **resumable**, returns `session.url` with `reusedExisting: true`.
   - If **not** resumable (expired, complete, missing `url`, retrieve error, etc.), applies **Option B**: mark the previous order **`incomplete_expired`**, create a **new** `api::order.order`, new Checkout Session, `reusedExisting: false`, new `orderId` in the response.
3. **Privacy:** `checkout_session` is **not** on `GET /billing` (`ORDER_SELECT` unchanged); resume returns a one-time redirect URL.

---

## Decisions (locked for this release)

| Topic                                        | Choice                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order strategy when session is not resumable | **Option B** — new order per retry; previous row → `checkout_status: incomplete_expired`, `stripe_status: expired`, `payment_status: canceled`.                                                               |
| `orderId` in body                            | **Required** (v1 does not implement “omit = pick latest pending”).                                                                                                                                            |
| TTL / abandoned checkout                     | **Cron** `expireAbandonedStripeCheckouts` runs **daily 3:00** (same schedule block as `activatePendingOrders`). Env: `BILLING_CHECKOUT_ABANDONED_TTL_MS` (default **259200000** = 72h, min **3600000** = 1h). |
| Auth                                         | New action **`postAccountBillingCheckoutResume`**; bootstrap enables it for the **Authenticated** role (`src/index.js`), same pattern as `postAccountBillingStartTrial`.                                      |

---

## API contract

### Route

| Property   | Value                                                   |
| ---------- | ------------------------------------------------------- |
| **Method** | `POST`                                                  |
| **Path**   | `/api/accounts/:accountId/billing/checkout/resume`      |
| **Scope**  | `api::account.account.postAccountBillingCheckoutResume` |

### Request body

```json
{
  "orderId": "12345"
}
```

`orderId` — string or number in JSON; normalized to positive integer.

### Response (200 OK)

```json
{
  "orderId": "12345",
  "checkoutSessionId": "cs_...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "reusedExisting": true
}
```

- After **Option B rebuild**, `orderId` is the **new** order id (not the request id).
- `checkoutUrl` omitted only if Stripe returned no URL (same behaviour as start checkout).

### Errors

JSON body:

```json
{
  "error": {
    "code": "ORDER_ID_REQUIRED",
    "message": "…"
  }
}
```

| HTTP    | `code` (examples)                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------- |
| **400** | `INVALID_BODY`, `INVALID_ACCOUNT_ID`, `ORDER_ID_REQUIRED`, `INVALID_ORDER_ID`, `USER_EMAIL_REQUIRED` |
| **404** | `NO_ELIGIBLE_ORDER`                                                                                  |
| **409** | `ALREADY_PAID`, `NOT_RESUMABLE_STATE`                                                                |
| **422** | `CHECKOUT_REBUILD_FAILED`                                                                            |
| **500** | `CHECKOUT_CONFIG`, `CHECKOUT_ERROR`                                                                  |

---

## Backend implementation map (this repo)

| Piece                            | Path                                                                                                                                                                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestrator                     | [`src/api/account/controllers/services/billingCheckout/runAccountBillingCheckoutResume.js`](../../../src/api/account/controllers/services/billingCheckout/runAccountBillingCheckoutResume.js)                                                                                    |
| Eligibility + body parse         | [`src/api/account/controllers/services/billingCheckout/loadEligibleResumeOrder.js`](../../../src/api/account/controllers/services/billingCheckout/loadEligibleResumeOrder.js)                                                                                                    |
| Stripe retrieve + classify       | [`src/api/account/controllers/services/billingCheckout/retrieveResumableSession.js`](../../../src/api/account/controllers/services/billingCheckout/retrieveResumableSession.js)                                                                                                  |
| Expire row helper                | [`src/api/account/controllers/services/billingCheckout/expireAbandonedCheckoutOrder.js`](../../../src/api/account/controllers/services/billingCheckout/expireAbandonedCheckoutOrder.js)                                                                                          |
| Tier re-validation               | [`src/api/account/controllers/services/billingCheckout/validateTierEligibleForResume.js`](../../../src/api/account/controllers/services/billingCheckout/validateTierEligibleForResume.js)                                                                                        |
| Session create (idempotency opt) | [`src/api/account/controllers/services/billingCheckout/buildStripeCheckoutSessionForBilling.js`](../../../src/api/account/controllers/services/billingCheckout/buildStripeCheckoutSessionForBilling.js) (`stripeRequestOptions.idempotencyKey` = `resume:rebuild:<prevOrderId>`) |
| Controller                       | [`src/api/account/controllers/account.js`](../../../src/api/account/controllers/account.js) — `postAccountBillingCheckoutResume`                                                                                                                                                 |
| Route                            | [`src/api/account/routes/custom-account.js`](../../../src/api/account/routes/custom-account.js)                                                                                                                                                                                  |
| TTL cron task                    | [`config/cron-tasks/tasks/expireAbandonedStripeCheckouts.js`](../../../config/cron-tasks/tasks/expireAbandonedStripeCheckouts.js)                                                                                                                                                |
| Cron registration                | [`config/cron-tasks.js`](../../../config/cron-tasks.js) — `expireAbandonedStripeCheckouts`                                                                                                                                                                                       |
| Permission bootstrap             | [`src/index.js`](../../../src/index.js) — `ensureAccountBillingCheckoutResumePermission`                                                                                                                                                                                         |

---

## Env

| Variable                                                       | Purpose                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `BILLING_CHECKOUT_SUCCESS_URL` / `BILLING_CHECKOUT_CANCEL_URL` | Same as start checkout (must include `{CHECKOUT_SESSION_ID}`).                     |
| `BILLING_CHECKOUT_ABANDONED_TTL_MS`                            | Age after which incomplete+unpaid Stripe orders are expired by cron (default 72h). |

---

## Acceptance criteria (backend)

- [x] Resume route + service + tests.
- [x] Reuse path when session open, not expired, has `url`.
- [x] Rebuild path (**Option B**) when session not resumable or `checkout_session` missing.
- [x] TTL cron marks stale rows `incomplete_expired` so `GET /billing` pending selection drops them (`orderSelection` excludes `incomplete_expired`).
- [ ] **Ops:** Confirm **Authenticated** role shows the new permission in Admin after deploy (bootstrap should create/enable it).

---

## Ready for FE

1. Add BFF route `POST /api/accounts/[accountId]/billing/checkout/resume` → Strapi (mirror `billing/checkout`).
2. Add `accountApi.postAccountBillingCheckoutResume(accountId, body)` + `useMutation` hook.
3. Replace `BillingPaymentPendingBanner` link-to-`/billing/create` with **resume + redirect** when `variant === "checkout"`.
4. On **rebuild**, use **returned `orderId`** for any follow-up that still keys off order id until the next `GET /billing` refresh.
5. Invalidate `queryKeys.account.billing` / `billingOrders` after return from Stripe as already planned.

---

## References (FE / monorepo paths)

| Area                         | Location                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Payment pending banner       | `src/app/(members)/o/[accountId]/billing/_components/banners/BillingPaymentPendingBanner.tsx` |
| Banner copy / Stripe variant | `src/app/(members)/o/[accountId]/billing/_utils/payment-pending/billingPaymentPending.ts`     |
| Billing overview lifecycle   | `src/app/(members)/o/[accountId]/billing/overview/_hooks/useBillingOverviewLifecycle.ts`      |
| Start checkout (client)      | `src/lib/api/hooks/account/usePostAccountBillingCheckout.ts`                                  |
