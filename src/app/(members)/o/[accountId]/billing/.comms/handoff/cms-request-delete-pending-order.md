# CMS request: Delete / discard pending order

**From:** Fixtura App (frontend + Next BFF)  
**To:** CMS / Strapi (account billing + Stripe integration)  
**Date:** 2026-05-08  
**Purpose:** Specify backend support so a member can **remove an in-flight or draft billing order** (e.g. abandoned Stripe Checkout or an unpaid incomplete order) and **start again** with a new card checkout or invoice flow — without conflating this with **subscription cancel at period end** or **Stripe return / abandon** (UI-only).

**Related:**

- [billing-checkout-return-urls.md](../resources/billing-checkout-return-urls.md) — success/cancel return URLs (abandon checkout ≠ delete order record).
- [frontend-handoff-orders-by-account-endpoint.md](../response/frontend-handoff-orders-by-account-endpoint.md) — `GET /api/orders/account/:accountId` list shape (camelCase history rows).
- [cms-handoff-billing-available-actions-invoice-states.md](../response/cms-handoff-billing-available-actions-invoice-states.md) — `availableActions` / blocking pending checkout semantics on `GET /billing`.

---

## Summary

1. **Problem:** A user may create an **invoice** or **card payment** order path and then want to **cancel/remove** that attempt to make a **new** one. An unpaid or incomplete **Order** row (and possibly an open Stripe Checkout Session) can remain and continues to affect **`GET /billing`** and **`availableActions`** (e.g. blocking `canStartCheckout` / plan selection when a pending order exists).
2. **Solution:** Expose an **account-scoped, authenticated** mutation that **discards** an order only when **business rules** allow (not paid, not active entitlement, etc.), including **cleaning up** any linked Stripe Checkout Session where applicable. The app will call this from a **Delete order** (or “Remove and start over”) CTA with a **confirm** step.
3. **Scope naming:** This is **discard pending / draft checkout order**, not **`cancel_at_period_end`**, not **`POST …/billing/checkout/resume`**, and not “user closed Stripe tab” alone (see **Current system facts**).

---

## Current system facts (code-backed)

| Fact                   | Detail                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order list (read-only) | Next BFF `GET /api/accounts/:accountId/billing/orders` implements **GET only** → Strapi `GET /api/orders/account/:accountId`. File: `src/app/api/accounts/[accountId]/billing/orders/route.ts`.                                                                       |
| Order row shape        | TypeScript: `AccountBillingOrderHistoryDto` in `src/types/api/account.ts` (e.g. `isPaid`, `paymentStatus`, `checkoutStatus`, `paymentChannel`).                                                                                                                       |
| Billing summary        | `GET /api/accounts/:accountId/billing` remains the source of truth for **blocking** in-flight checkout; `availableActions` must align after a successful discard (see linked handoff above).                                                                          |
| Orders UI              | `OrdersTableSectionTable` actions column only exposes **hosted invoice** / **invoice PDF** links when URLs exist — **no delete CTA** today (`src/app/(members)/o/[accountId]/billing/_components/orders/OrdersTableSectionTable.tsx`).                                |
| Invoice requests       | BFF `GET` + `POST` only on `…/billing/invoice-requests` — **no delete** (`src/app/api/accounts/[accountId]/billing/invoice-requests/route.ts`). Removing an **invoice request** without an order row may need a **separate** contract (see **Invoice-request path**). |

---

## Desired UX (frontend)

- Show a **destructive** secondary CTA (e.g. **Delete order** or **Remove and start over**) only when the **server** indicates the row is eligible (preferred: flag on summary or per-order; see **`GET /billing` integration**).
- Require **explicit confirmation** (modal or equivalent) before calling the API.
- On success: invalidate/refetch **`GET /billing`**, **`GET …/billing/orders`**, and **`GET …/billing/invoice-requests`** if product rules tie those views to the discarded order.
- On error: surface **409** / **422** messages without assuming the order is gone; refetch summary.

---

## Proposed backend feature

Ask CMS to choose **one** HTTP style and document it in Strapi + runbooks.

| Option              | Method   | Example path (Strapi)                                     | Notes                                                                           |
| ------------------- | -------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **A (recommended)** | `POST`   | `/api/accounts/:accountId/billing/orders/:orderId/delete` | Explicit sub-resource action; fits side effects (Stripe expire/void, webhooks). |
| **B**               | `DELETE` | `/api/accounts/:accountId/billing/orders/:orderId`        | REST-idiomatic; same guards and body rules as A.                                |

The Next.js BFF will mirror the chosen contract under `src/app/api/accounts/[accountId]/billing/` (e.g. new `orders/[orderId]/route.ts` or `orders/[orderId]/delete/route.ts`, per repo conventions).

### Request

- **Path params:** `accountId`, `orderId` (string or number as standardised; must belong to the account and JWT user).
- **Body:** Empty object `{}` or omitted for `DELETE`; if `POST`, optional `reason` / `clientMutationId` only if CMS wants audit — **not required for v1**.

### Response (success)

- **`200 OK`** with JSON body, e.g. `{ "orderId": "12345", "checkoutStatus": "canceled" }` (exact fields CMS prefers), **or**
- **`204 No Content`** if CMS prefers no body.

### Errors (standardise JSON body for FE)

| HTTP          | When                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| **401**       | Missing/invalid session                                                         |
| **404**       | Order not found, not owned by account, or anti-enumeration                      |
| **409**       | Order not discardable (paid, active subscription, wrong channel, business rule) |
| **422**       | Validation / malformed id                                                       |
| **502 / 500** | Stripe or internal failure; safe `message` if available                         |

---

## Server-side eligibility (decisions for CMS / product)

Confirm and document:

1. **Allow discard** when the order is **not** paid (`isPaid === false` or equivalent), **not** driving active paid entitlement, and checkout/subscription signals are in a **discardable** set (e.g. incomplete / open / abandoned **unpaid** checkout — **exclude** completed + paid flows).
2. **Stripe:** If `checkout_session` (`cs_…`) exists on the order, **expire or void** the session per Stripe’s API so the URL cannot complete payment after discard. Document **idempotency**: second delete → **404** or **200 no-op** (pick one).
3. **Deny discard** when payment has completed, subscription is **active/trialing** with entitlement, or policy requires retention — use **409** with a stable error code/message.
4. **Persistence:** **Hard delete** vs **soft delete** (archived flag + hidden from “pending” pickers) — CMS decides; `GET /billing` and order list must behave consistently after discard.

---

## `GET /billing` integration (recommended)

To keep one source of truth for the **Delete order** CTA:

- Prefer adding a boolean on **`availableActions`**, e.g. `canDeletePendingOrder` / `can_discard_checkout` (exact key CMS standardises), **or** a per-order `canDiscard` on list rows if the summary cannot express multi-order edge cases.

Weaker alternative: FE infers from `GET …/billing/orders` only — acceptable only if eligibility rules are **identical** to server enforcement (not recommended long term).

---

## Invoice-request path (open question)

If the user wants to “start over” when only an **invoice request** exists (no discardable `order` row):

- Will CMS expose **`DELETE` or `POST …/billing/invoice-requests/:id/…`**?
- Or does a **new** `POST …/invoice-requests` supersede the previous row, and should the FE call something to **cancel** the old request?

**Do not assume** behaviour until CMS confirms; frontend handoff will follow the chosen contract.

---

## Security and privacy

- Same **account ownership** and auth model as existing `GET /billing` / `POST …/checkout` routes.
- Response must **not** leak other accounts’ existence (use **404** where appropriate).
- Avoid returning secrets; CMS-side audit logs only as needed.

---

## Acceptance criteria

- [ ] Authenticated member can discard an **eligible** pending Stripe checkout order; subsequent **`GET /billing`** no longer treats that order as blocking when that was the only blocker (per product rules).
- [ ] **Ineligible** orders return **409** with a stable, safe message.
- [ ] **`GET …/billing/orders`** reflects discarded rows per CMS retention policy (removed vs archived).
- [ ] Open Stripe Checkout Session is **not** usable to complete payment after successful discard.
- [ ] Idempotent or second-call behaviour is documented and tested.

---

## Ready for FE (after CMS ships)

1. Add BFF route for the chosen method/path → Strapi proxy (mirror existing billing guards).
2. Add `accountApi` mutation + React Query `useMutation` hook; invalidate `queryKeys.account.billing` and `billingOrders` (and invoice-requests if needed).
3. Add **Delete order** (or product copy) + **confirm** dialog in billing UI (orders table and/or overview — product placement).
4. Map **`availableActions`** (or per-order flag) to CTA visibility.
5. Extend `BILLING_AVAILABLE_ACTION_LABELS` / types if new action keys ship.

---

## References (repo)

| Area                            | Location                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| BFF orders (GET only)           | `src/app/api/accounts/[accountId]/billing/orders/route.ts`                                                                |
| BFF invoice-requests (GET/POST) | `src/app/api/accounts/[accountId]/billing/invoice-requests/route.ts`                                                      |
| Order history types             | `src/types/api/account.ts` (`AccountBillingOrderHistoryDto`, `AccountBillingOrdersResponse`)                              |
| Client read: orders             | `src/lib/api/services/account.api.ts` (`getAccountBillingOrders`), `src/lib/api/hooks/account/useAccountBillingOrders.ts` |
| Orders table UI                 | `src/app/(members)/o/[accountId]/billing/_components/orders/OrdersTableSectionTable.tsx`                                  |
| Related CMS request             | `src/app/(members)/o/[accountId]/billing/.comms/handoff/cms-request-resume-stripe-checkout.md`                            |

**Backend (sibling repo):** Implementation details (Order model, `checkout_session`, webhooks) live in Strapi/CMS; this doc does not prescribe internal service filenames.
