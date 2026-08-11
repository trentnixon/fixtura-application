# Billing Checkout — return URLs (Stripe / CMS)

## Purpose

After **Stripe Checkout**, the user must land on a URL the frontend recognises so it can **invalidate TanStack Query caches** and **refetch `GET /billing`** (and available tiers), per [frontend-billing-api-contract-handoff.md](./frontend-billing-api-contract-handoff.md) (“On return from Stripe, refresh `GET /billing`”).

Canonical query-parameter names are defined in code: [`core/billing-checkout-return.ts`](../../_core/billing-checkout-return.ts).

## Recommended patterns

**A. Session id (Stripe placeholder) — success only**  
Configure Checkout **success_url** to include the session id, for example either:

- `https://<app-origin>/o/<accountId>/billing?session_id={CHECKOUT_SESSION_ID}`
- or (recommended parity with cancel): `https://<app-origin>/o/<accountId>/billing/success?session_id={CHECKOUT_SESSION_ID}` — redirects to `/billing` with the same query so the client flow is unchanged. Canonical builder path: `accountScopedRoutes.billingSuccess(accountId)`.

The app treats any non-empty `session_id` or `checkout_session_id` on **`/billing`** as a **success return** and refreshes billing.

**Do not** send checkout **cancel** traffic to `/billing?session_id=...` only — that would show as success. Use pattern **C** or explicit **B** for cancel.

**B. Explicit outcome (CMS-controlled)**  
If the backend builds URLs without Stripe’s session placeholder:

- Success: `.../billing?billing_checkout=success`
- Cancel: `.../billing?billing_checkout=cancelled`

**C. Dedicated cancel path (recommended with Stripe session placeholder on cancel)**  
Configure Checkout **cancel_url** to:

- `https://<app-origin>/o/<accountId>/billing/cancel?session_id={CHECKOUT_SESSION_ID}`

That route immediately redirects to `/o/<accountId>/billing?billing_checkout=cancelled` so the client runs the same invalidate + banner flow as pattern B (and drops `session_id` from the visible URL). Canonical builder path: `accountScopedRoutes.billingCancel(accountId)` in code.

## Behaviour

1. On load, if any recognised marker is present, the client **invalidates** `queryKeys.account.billing(accountId)`, `queryKeys.account.billingAvailableTiers(accountId)`, and `queryKeys.account.billingInvoiceRequests(accountId)`.
2. The address bar is **`router.replace`’d** to the same path **without** those query params (avoids leaking `session_id` in bookmarks/history noise).

## CMS / Stripe checklist

- [ ] `success_url` points at `/o/{accountId}/billing/success?session_id=...` **or** `/o/{accountId}/billing` with `session_id` or `billing_checkout=success`.
- [ ] `cancel_url` points at `/o/{accountId}/billing/cancel` (optional `?session_id={CHECKOUT_SESSION_ID}`) **or** at `/o/{accountId}/billing?billing_checkout=cancelled` — never `/billing?session_id=...` alone for cancel.
- [ ] Webhook still updates Strapi — UI may lag until webhook completes; user can refresh if needed.

## Date

- 2026-05-05 — Front-end contract for return markers.
- 2026-05-08 — Document `/billing/success` and `/billing/cancel` redirect entrypoints; cancel vs `session_id` on `/billing` alone.
