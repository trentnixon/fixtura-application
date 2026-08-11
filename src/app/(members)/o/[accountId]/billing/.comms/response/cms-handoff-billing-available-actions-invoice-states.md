# CMS → FE handoff: billing `availableActions` and invoice-request states

**Date:** 2026-05-07  
**Area:** `GET /api/accounts/:accountId/billing` (billing summary)  
**Backend change:** Order-grounded flags for hosted checkout and plan selection when `billingStatus` is `invoice_requested` or `invoice_under_review`.

## Summary

The CMS billing summary builder now derives `availableActions.canStartCheckout` and `availableActions.canSelectPlan` using the same idea the members app already uses for “payment in flight”: **a pending order or open Stripe checkout on the account**, not invoice-request CMS row state by itself. If the latest invoice request is still `submitted` (or under review) but there is **no** active entitlement and **no** blocking unpaid/incomplete checkout row in the orders we load for billing, the API may again expose card checkout and plan pick alongside invoice request. There is **no new field** in the response and **no change** to `billingStatus` strings or to `latestInvoiceRequest` shape.

## Why we changed it

Some accounts could show `billingStatus: invoice_requested` with `latestInvoiceRequest.status: submitted` while having no `activeOrder`, no meaningful Stripe/payment signal, and no subscription in progress. The backend still computed `billingStatus` from the invoice-request status (unchanged), but `availableActions` treated `invoice_requested` / `invoice_under_review` as excluding hosted checkout and plan selection. That hid Stripe in the wizard even though nothing on the order side was blocking—while `POST .../billing/checkout` was not gated the same way, so API and UI disagreed.

## What the frontend should rely on

Continue to drive **whether to show Stripe** from **`availableActions.canStartCheckout`** (and plan selection from **`canSelectPlan`**), not from `billingStatus` or `latestInvoiceRequest.status` alone. After this deploy, those flags may be **true** for `invoice_requested` / `invoice_under_review` **only when** the backend sees no in-flight checkout or unpaid pending order for that snapshot. If you added **extra** guards such as “if `invoice_requested` then never show card,” consider removing them after verification so you do not double-suppress what the API already encodes.

## Edge cases and non-goals

States such as **`invoice_sent`**, **`active`**, and **`trialing`** are unchanged by this logic; we did not add a bypass there, to avoid encouraging a second payment path after an invoice is issued or while entitlement/trial applies. When a real incomplete checkout or unpaid pending order exists, **`canStartCheckout`** and **`canSelectPlan`** stay **false** even if `billingStatus` remains `invoice_requested` (invoice precedence in the status string can still “win” over `checkout_started` / `payment_pending` in the summary).

## Suggested QA

- Account shaped like historical issue: no paid window, invoice request `submitted`, empty or non-pending orders → expect **`canStartCheckout` and `canSelectPlan` true** (subject to `accessStatus` not `restricted`).
- Same account with an unpaid order in **`checkout_status: incomplete`** → expect **both false** until that flow completes or clears.

## References

- Implementation: `src/api/account/controllers/services/billingV1/availableActions.js`, `buildBillingSummary.js`, `billingStatus.js` (`hasBlockingOrderOrCheckoutFromSignals`).
- Existing contract types: `src/api/account/types/billing-contract-v1.d.ts` (unchanged).
