# Billing Cancel

Route: `/o/[accountId]/billing/cancel`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Billing checkout cancel return (Stripe).

## Customer Purpose

Stripe Checkout `cancel_url` entrypoint. When a customer abandons checkout, they land here and are redirected to the billing overview with a transient cancelled banner and refreshed billing data. This route is a server redirect shim — not a standalone UI page.

## Features To Prove

- [x] Explains what happened. _(banner via_ `CheckoutReturnBanner` _+_ `billingCheckoutReturnBanner.ts` _— "Checkout was cancelled. Refreshing billing status…")_
- [x] Offers a safe return to billing. _(server redirect to_ `/o/[accountId]/billing` _via_ `accountScopedRoutes.billing`_)_
- [x] Refetches billing state if needed. _(`useBillingOverviewLifecycle` invalidates billing, orders, available tiers, and invoice-requests queries)_
- [x] Does not imply payment failed if checkout was simply cancelled. _(cancel page strips_ `session_id` _; only forwards_ `billing_checkout=cancelled` _— session ids on_ `/billing` _alone are treated as success)_

## User Journeys

- **Happy path:** Customer starts Stripe checkout → cancels in Stripe → lands on `/billing/cancel` → redirected to `/billing?billing_checkout=cancelled` → `CheckoutReturnBanner` shown → queries invalidated and refetched → URL params stripped via `router.replace`.
- **Direct visit:** Customer or bookmark hits `/billing/cancel` directly → same redirect chain → banner and refetch on overview.
- **Wrong account:** Cancel page does not validate `accountId` segment; overview client redirects invalid segment to select-organisation.
- **Error path:** N/A at cancel page itself; billing load errors handled on overview (`ErrorState` with retry — see `billing.md`).

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/billing/cancel/page.tsx`
- **Sibling entrypoint:** `src/app/(members)/o/[accountId]/billing/success/page.tsx`
- **Return handling:** `useBillingOverviewLifecycle`, `readBillingCheckoutReturnOutcome`, `stripBillingCheckoutReturnParams`
- **Banner:** `CheckoutReturnBanner`, `billingCheckoutReturnBanner.ts`
- **Constants:** `billingCheckoutReturnParams.ts`
- **Route builder:** `accountScopedRoutes.billingCancel()` in `account-routes.ts`
- **Contract doc:** `src/app/(members)/o/[accountId]/billing/.comms/resources/billing-checkout-return-urls.md`

## Related API Routes

**Refetched on return (via overview lifecycle — not called by cancel page directly):**

- `GET /api/accounts/[accountId]/billing` — consolidated billing summary
- `GET /api/accounts/[accountId]/billing/orders` — order history
- `GET /api/accounts/[accountId]/billing/available-tiers` — tier options
- `GET /api/accounts/[accountId]/billing/invoice-requests` — invoice request list

**Inherited from billing overview (see `billing.md`):**

- Billing GET API tests cover pending/cancelled order state in summary responses.

## Data States

Redirect-only route — most states are owned by `/billing` overview (cross-reference `billing.md`):

- [x] Loading — overview shows `BrandedLoader` after redirect completes.
- [x] Empty — overview handles `no_billing` / empty orders per billing mode.
- [x] Partial data — overview renders summary before orders finish loading.
- [x] Success — cancelled banner shown transiently until refetch completes; overview renders mode-specific UI.
- [ ] Validation error — N/A on cancel route.
- [x] Permission denied — gateway redirect on billing/orders GET (handled in overview lifecycle).
- [x] Not found / wrong account — invalid segment redirect to select-organisation (overview client).
- [x] API failure — overview `ErrorState` with retry.
- [x] Checkout return recovery — params stripped, queries invalidated, transient banner until refetch completes.

## Tests Required

- **Unit:** `billingCheckoutReturn.test.ts` (7) — outcome read/strip logic
- **Page:** `cancel/page.test.ts` (1) — redirect to `/billing?billing_checkout=cancelled`
- **Component:** `billing-content.test.tsx` (6, includes cancelled banner case)
- **API:** inherited from billing suite — `billing/route.test.ts` (5), `billing/orders/route.test.ts` (5)
- **E2E/manual:** Stripe test-mode checkout cancel return (see Manual Test Evidence)

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — overview retry via `refetchBilling` / `refetchOrders` (see `billing.md`).
- [x] Mutation errors are shown near the action — N/A on cancel route (no mutations).
- [x] Unknown errors fall back to safe customer copy — banner uses fixed customer strings only.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.
- [x] Checkout return recovery — return params stripped, queries invalidated, transient banner until refetch completes.

## Security And Privacy

- [x] Auth requirements are correct — members route; downstream GETs require auth cookie.
- [x] Account ownership is enforced — overview gateway redirect on unauthorized billing/orders GET.
- [x] No secrets, tokens, or internal payloads are exposed — `session_id` not forwarded to bookmarkable `/billing` URL.
- [x] Sensitive/destructive actions require confirmation — N/A (read-only redirect).

## Accessibility

- [x] Headings create a sensible page outline — overview `PageHeader` "Billing" after redirect.
- [ ] Form fields have labels and error associations — N/A on cancel route.
- [x] Buttons and links have clear accessible names — overview actions unchanged after redirect.
- [x] Status regions — `CheckoutReturnBanner` uses `role="status"`.
- [ ] Keyboard navigation works for the main flow — manual verification required (overview).
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required (overview redirect).

## Manual Test Evidence

Run in local or staging with a valid customer account and Stripe test mode. **Not executed in this pass** — requires authenticated browser session and Stripe checkout fixture.

- [ ] Start checkout → cancel in Stripe → lands on billing with cancelled banner.
- [ ] Pending order still visible after cancel return.
- [ ] Direct visit to `/o/{validAccountId}/billing/cancel` → redirects to billing with cancelled banner.
- [ ] CMS `cancel_url` configured per `billing-checkout-return-urls.md` comms doc.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual Stripe cancel return not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for checkout cancel return flow.
  - CMS/Stripe `cancel_url` checklist in comms doc still unchecked.
  - `useBillingOverviewLifecycle` hook not unit-tested directly (covered indirectly via util + component tests).
  - Keyboard/focus behavior not manually verified on overview after redirect.
- Test evidence:
  - `npm run test -- "billingCheckoutReturn" "billing/cancel/page" "billing-content.test"` — 14 tests passed (2026-07-04).
  - Unit: `billingCheckoutReturn.test.ts` (7).
  - Page: `cancel/page.test.ts` (1).
  - Component: `billing-content.test.tsx` (6, includes cancelled banner).
- Production decision: In review
