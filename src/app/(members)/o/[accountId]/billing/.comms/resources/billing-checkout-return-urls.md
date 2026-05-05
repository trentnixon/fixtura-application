# Billing Checkout — return URLs (Stripe / CMS)

## Purpose

After **Stripe Checkout**, the user must land on a URL the frontend recognises so it can **invalidate TanStack Query caches** and **refetch `GET /billing`** (and available tiers), per [frontend-billing-api-contract-handoff.md](./frontend-billing-api-contract-handoff.md) (“On return from Stripe, refresh `GET /billing`”).

Canonical query-parameter names are defined in code: [`billing-checkout-return.ts`](../billing-checkout-return.ts).

## Recommended patterns

**A. Session id (Stripe placeholder)**  
Configure Checkout **success_url** (and optionally **cancel_url**) to include the session id, for example:

- `https://<app-origin>/o/<accountId>/billing?session_id={CHECKOUT_SESSION_ID}`

The app treats any non-empty `session_id` or `checkout_session_id` as a **success return** and refreshes billing.

**B. Explicit outcome (CMS-controlled)**  
If the backend builds URLs without Stripe’s placeholder:

- Success: `.../billing?billing_checkout=success`
- Cancel: `.../billing?billing_checkout=cancelled`

## Behaviour

1. On load, if any recognised marker is present, the client **invalidates** `queryKeys.account.billing(accountId)`, `queryKeys.account.billingAvailableTiers(accountId)`, and `queryKeys.account.billingInvoiceRequests(accountId)`.
2. The address bar is **`router.replace`’d** to the same path **without** those query params (avoids leaking `session_id` in bookmarks/history noise).

## CMS / Stripe checklist

- [ ] `success_url` points at `/o/{accountId}/billing` with `session_id` or `billing_checkout=success`.
- [ ] `cancel_url` points at `/o/{accountId}/billing` with `billing_checkout=cancelled` (or equivalent agreed contract).
- [ ] Webhook still updates Strapi — UI may lag until webhook completes; user can refresh if needed.

## Date

- 2026-05-05 — Front-end contract for return markers.
