# CMS request: Resume Stripe Checkout (“Continue payment”)

**From:** Fixtura App (frontend + Next BFF)  
**To:** CMS / Strapi (account billing + Stripe integration)  
**Date:** 2026-05-08  
**Purpose:** Specify backend support for **resuming** Stripe Checkout when a user cancels or closes the hosted payment window but an unpaid order remains. Frontend will call a dedicated **resume** endpoint and redirect to the returned Checkout URL; it will **not** persist `checkoutUrl` client-side.

**Related (FE return URLs):** [billing-checkout-return-urls.md](../resources/billing-checkout-return-urls.md)

---

## Summary

1. **Problem:** After “Pay with Stripe Checkout”, the user may close or cancel Stripe. The **Order** stays pending; the FE shows **Payment pending**. Users must be able to **continue payment** without support when the original Checkout Session is still **open**, and automatically get a **new** session when it is not.
2. **Solution:** Implement `POST /api/accounts/:accountId/billing/checkout/resume` that:
   - Validates a pending Stripe order (prefer `orderId` from billing summary).
   - **Retrieves** the stored `checkout_session` (`cs_...`) from Stripe; if **resumable**, returns `session.url`.
   - If **not** resumable (expired, complete, missing `url`, etc.), **creates a new Checkout Session** and returns its `url`, updating persisted state per the **order strategy** decision below.
3. **Privacy:** Do **not** expose `checkout_session` on `GET /billing` unless product explicitly allows; the resume endpoint is the right place to hand FE a one-time redirect URL.

---

## Current system facts (code-backed)

| Fact                  | Detail                                                                                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order type            | Strapi `api::order.order` (`orders`).                                                                                                                                                                                        |
| Order before redirect | Backend creates an **Order** before sending the user to Stripe Checkout (`createBillingCheckoutOrder` → `strapi.db.query("api::order.order").create`).                                                                       |
| Initial pending shape | Typically `checkout_status: "incomplete"`, `payment_status: "unpaid"`, `payment_channel: "stripe"`.                                                                                                                          |
| Session id storage    | After `checkout.sessions.create`, order is updated with `checkout_session: session.id` and `stripe_status: "open"` (`runAccountBillingCheckout`).                                                                            |
| Billing summary gap   | `GET /billing` loader **does not** select `checkout_session` in `ORDER_SELECT`, so FE **cannot** resume without a new endpoint or expanded payload.                                                                          |
| Pending selection     | Billing logic can pick a single “pending” order among many (e.g. filter incomplete / pending unpaid, **newest** by `createdAt`) — FE should pass **`orderId`** when possible to avoid wrong-order edge cases.                |
| Paid completion       | `checkout.session.completed` webhook activates order when payment indicates paid (`checkoutSessionCompletedHandler`); until then, UI should stay **neutral pending**, not “failed”.                                          |
| Return URLs           | Success/cancel URLs should include `{CHECKOUT_SESSION_ID}`. App expects patterns documented in [billing-checkout-return-urls.md](../resources/billing-checkout-return-urls.md) (e.g. `/billing/success`, `/billing/cancel`). |

---

## Desired UX (frontend)

- When billing state indicates **unpaid / open Stripe checkout** (`payment_pending` + Stripe channel), show a **Continue payment** (or “Resume checkout”) CTA.
- On click: **POST resume** → receive `{ checkoutUrl }` → **`window.location.assign(checkoutUrl)`** (or equivalent full navigation).
- **Do not** store `checkoutUrl` in `localStorage`, query params, or long-lived client state.
- On return from Stripe (success or cancel route): treat as **“refresh state”** — invalidate/refetch `GET /billing` and orders; **do not** assume hard failure on cancel.

**FE implementation note:** Today `BillingPaymentPendingBanner` links to `/billing/create`. Once this endpoint exists, the CTA should call resume + redirect instead.

---

## Backend feature: `POST …/billing/checkout/resume`

### Route

| Property       | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Method**     | `POST`                                                  |
| **Path**       | `/api/accounts/:accountId/billing/checkout/resume`      |
| **Path param** | `accountId` — same as existing billing routes           |
| **Auth**       | Same as `POST …/billing/checkout` (scoped user/session) |

The Next.js BFF will mirror other billing routes: `{STRAPI_URL}/api/accounts/{accountId}/billing/checkout/resume` (exact BFF file TBD when FE implements the proxy).

### Request body

```json
{
  "orderId": "12345"
}
```

| Field     | Required        | Notes                                                                                                                                                                          |
| --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `orderId` | **Recommended** | String or number as you standardise; must match the pending order the FE shows (e.g. from `currentPlan.orderId` on `GET /billing`). Backend validates ownership + eligibility. |
| _(omit)_  | Fallback only   | If omitted, select latest eligible pending Stripe order using the **same** deterministic rules as billing summary (document the rule in Strapi).                               |

### Response (200 OK)

```json
{
  "orderId": "12345",
  "checkoutSessionId": "cs_...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "reusedExisting": true
}
```

| Field               | Meaning                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `orderId`           | Order the session is tied to after this call (may differ from request if “new order per retry” — see decisions). |
| `checkoutSessionId` | Stripe Checkout Session id for support/debug (FE may log in dev only).                                           |
| `checkoutUrl`       | Immediate redirect target for the browser.                                                                       |
| `reusedExisting`    | `true` if existing open session URL was returned; `false` if a new session was created.                          |

### Resume decision tree (server-side)

1. Load order by `orderId` (or fallback selection). Reject if not owned, not `payment_channel: "stripe"`, or not in an eligible pending state (e.g. already `OrderPaid` / `checkout_status: active` / wrong channel).
2. If `order.checkout_session` is missing, skip retrieve → create new Checkout Session per product rules.
3. Else `stripe.checkout.sessions.retrieve(csId)`:
   - If `payment_status` is already `paid` or `no_payment_required` while status is still ambiguous, prefer **409** or a **200** with instruction to refresh billing — avoid sending user to duplicate payment without product sign-off.
   - **Resumable** if **all** hold:
     - `session.status === "open"`
     - `session.expires_at` is absent or **`expires_at > now`**
     - `session.url` is non-empty  
       → Return that `url`, `reusedExisting: true`.
   - If retrieve fails, `url` missing, status not open, or expired → **create new** Checkout Session; return new `url`, `reusedExisting: false`.
4. **Idempotency:** Multiple rapid clicks while the session is still resumable should return the **same** `checkoutUrl` (same `checkoutSessionId`) where possible.

**Stripe note:** If `retrieve` does not return `url` in your API version/config, treat as **not resumable** and create a new session (do not block the user).

### Errors (standardise JSON body for FE)

| HTTP          | When                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| **404**       | No eligible pending order, or `orderId` not found / not owned.                        |
| **409**       | Order not resumable (e.g. already completed, wrong channel, business rule violation). |
| **422**       | Cannot create a new session (invalid/removed price, plan mismatch).                   |
| **502 / 500** | Stripe or internal failure; include a safe user-facing `message` if available.        |

---

## Decisions needed (CMS / product)

### 1) Order strategy when session is not resumable

Pick **one** and document in Strapi/runbooks:

- **Option A — Reuse same order:** Overwrite `order.checkout_session` with the new `cs_...`. Consider an audit trail (e.g. history field) if disputes matter.
- **Option B — New order per retry (recommended for consistency):** Create a **new** `api::order.order`, attach new session, mark previous incomplete order as `incomplete_expired` / `canceled` / equivalent so billing summary does not select it.

### 2) TTL / abandoned checkout

- Schema supports `checkout_status: incomplete_expired`; TTL job may not exist yet.
- **Propose:** e.g. **72 hours** after `checkout_status: incomplete` + unpaid, set `incomplete_expired` (and any companion fields), and **exclude** that order from “pending” selection in `GET /billing`.
- Confirm whether expired rows remain visible in **billing history** for support vs hidden from primary UI.

---

## Security & privacy

- Avoid returning `checkout_session` on **`GET /billing`** unless explicitly approved; resume endpoint is sufficient for redirect.
- `checkoutUrl` is short-lived; FE must not persist it for later reuse.

---

## Acceptance criteria

- [ ] User who **cancels** or **closes** Stripe returns to the app; billing shows **pending** (not assumed hard failure); `GET /billing` + orders refresh on return markers (per [billing-checkout-return-urls.md](../resources/billing-checkout-return-urls.md)).
- [ ] **Continue payment** calls `POST …/billing/checkout/resume` and redirects to Stripe.
- [ ] If original session is **open** and not expired, user gets **same** Checkout flow (`reusedExisting: true`).
- [ ] If session is **expired** or **complete**, user gets a **new** valid Checkout URL without support (`reusedExisting: false`).
- [ ] After successful payment (possibly delayed webhooks), `GET /billing` reflects **paid / active** entitlement.
- [ ] (If TTL agreed) Abandoned incompletes transition to expired state and no longer drive the pending banner.

---

## Ready for FE (after CMS ships)

1. Add BFF route `POST /api/accounts/[accountId]/billing/checkout/resume` → Strapi (mirror `billing/checkout`).
2. Add `accountApi.postAccountBillingCheckoutResume(accountId, body)` + `useMutation` hook.
3. Replace `BillingPaymentPendingBanner` link-to-`/billing/create` with **resume + redirect** when `variant === "checkout"`.
4. Invalidate `queryKeys.account.billing` / `billingOrders` after resume **on return** (existing return lifecycle already invalidates; optional invalidate after successful POST if staying on page on error).

---

## References (repo)

| Area                                        | Location                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Payment pending banner                      | `src/app/(members)/o/[accountId]/billing/_components/banners/BillingPaymentPendingBanner.tsx`     |
| Banner copy / Stripe variant                | `src/app/(members)/o/[accountId]/billing/_utils/payment-pending/billingPaymentPending.ts`         |
| Billing overview lifecycle (return markers) | `src/app/(members)/o/[accountId]/billing/overview/_hooks/useBillingOverviewLifecycle.ts`          |
| Return param names                          | `src/app/(members)/o/[accountId]/billing/_constants/checkout/billingCheckoutReturnParams.ts`      |
| Start checkout (client)                     | `src/lib/api/hooks/account/usePostAccountBillingCheckout.ts`                                      |
| Handoff examples                            | `src/app/(members)/o/[accountId]/billing/.comms/handoff/frontend-billing-api-contract-handoff.md` |

**Backend (sibling repo):** `createBillingCheckoutOrder`, `runAccountBillingCheckout`, `ORDER_SELECT` in billing summary loader, `orderSelection.js`, `checkoutSessionCompletedHandler.js` — paths as used in CMS/backend codebase.
