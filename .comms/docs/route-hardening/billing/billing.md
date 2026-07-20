# Billing

Route: `/o/[accountId]/billing`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Billing overview and actions.

## Customer Purpose

Let customers understand billing status and take available billing actions: view plan/trial/access state, start a free trial, continue or discard pending checkout, withdraw or cancel invoice requests, and navigate to subscription creation or billing history.

## Features To Prove

- [x] Shows billing status, access status, current plan, trial, active order, and latest invoice request. _(read:_ `GET /billing` _via_ `useAccountBilling` _; orders via_ `GET /billing/orders` _; UI mode from_ `deriveBillingUiMode` _; status cards in_ `BillingSections` _; badge via_ `BillingProductStateBadge`_)_
- [x] Available actions match backend state. _(gated by_ `billingUiMode` _+_ `availableActions` _; CTAs in_ `BillingOverviewActions`_,_ `BillingTrialStartCard`_,_ `BillingCreateSeasonPassCard`_,_ `BillingPaymentPendingBanner`_)_
- [x] Start trial, checkout, resume checkout, invoice request, and cancel request states are safe. _(start trial on overview with confirm dialog; checkout/resume/discard/withdraw on payment-pending banner; create flow linked to_ `/billing/create` _; invoice submit lives on create wizard — not overview)_
- [x] Payment pending and ending/cancelled states are understandable. _(banners:_ `BillingPaymentPendingBanner`_,_ `BillingEndingBanner` _; copy from_ `paymentPendingBannerCopy` _and_ `billingEndingBanner` _utils)_
- [x] Billing errors do not expose payment provider internals. _(mutations use_ `ApiError.message` _or generic fallbacks; resume missing URL shows customer copy only)_
- [x] Customer-facing copy is plain-language on overview header and free-trial card. _(page subtitle in_ `page.tsx` _; trial card + confirm dialog from_ `BILLING_TRIAL_START_COPY` _and_ `_utils/trial/billingTrialStart` _formatters; trial description uses account name from org context with organisation fallback)_

## Customer-Facing Copy (overview)

**Page header** (`page.tsx`):

- Title: Billing
- Description: Manage your subscription, trial, invoices, and billing access for this organisation.

**Free trial card** (`BillingTrialStartCard`, `free_trial_available` mode):

- Badge: Activate trial _(via_ `labelForBillingProductState` → `activate_trial`_)_
- Eyebrow: 14-day free trial
- Title: Try Fixtura free for 14 days
- Description: Start **{account name}'s** trial with no upfront payment. Explore automated content, scheduled delivery, and premium workflow tools. _(falls back to "your organisation's" until_ `GET /organisation` _resolves)_
- Side note: No payment required.
- CTA: Start free trial

**Trial confirm dialog** (`BillingTrialStartConfirmDialog`):

- Title: Start your 14-day free trial?
- Body: **{account name}** will get full Fixtura access for 14 days. You will not be charged today, and no payment details are required to start.
- Dates: Starts / Ends with computed local dates when dialog opens.

**Copy constants:** `_constants/trial/billingTrialStart.ts`
**Personalisation:** `_utils/trial/billingTrialStart.ts` — `resolveBillingTrialAccountName`, `formatBillingTrialStartCardDescription`, `formatBillingTrialStartConfirmDescription`

- **Happy path:** Customer opens billing overview; summary and orders load; product-state badge and mode-specific cards/banners render; eligible user starts trial via confirm dialog and sees success feedback; paid/trial user sees status card and can open billing history or create-subscription link when allowed.
- **Empty / partial data:** `no_billing` or `trial_expired` shows season-pass CTA; orders section shows empty copy when history is empty; badge hidden while product-state snapshot is loading/unavailable; billing summary can render before orders finish loading.
- **Error/retry path:** Billing GET failure → `ErrorState` ("Could not load billing") with retry; unexpected empty → same with safe copy; orders GET failure → inline `ErrorState` in orders section with retry via `refetchOrders`; payment-pending actions show inline `role="alert"` errors; trial start shows inline error in card and confirm dialog.
- **Unauthorized or wrong-account path:** Invalid `accountId` segment → redirect to select-organisation; billing or orders gateway redirect → redirect with reason; Stripe checkout return params stripped and queries invalidated on return.

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/billing/page.tsx`
- **Key components:** `BillingContent`, `BillingOverviewStatusState`, `BillingOverviewActions`, `BillingSections`, `BillingProductStateBadge`, `BillingTrialStartCard`, `BillingTrialStartConfirmDialog`, `BillingCreateSeasonPassCard`, `BillingPaymentPendingBanner`, `BillingEndingBanner`, `CheckoutReturnBanner`, `OrdersTableSection`
- **Key hooks:** `useBillingOverviewContentState`, `useBillingOverviewLifecycle`, `useBillingTrialStart`, `useBillingPaymentPendingBannerActions`, `useBillingProductStateSnapshot`, `useAccountBilling`, `useAccountBillingOrders`, `useAccountOrganisationContext` _(trial copy account name)_
- **Key utilities:** `deriveBillingUiMode`, `deriveBillingProductState`, `paymentPendingBannerCopy`, `resolveWithdrawableInvoiceRequestId`, `resolveDeletablePendingOrderId`, `readBillingCheckoutReturnOutcome`, `buildBillingSectionsViewModel`, `formatBillingTrialStartCardDescription`, `formatBillingTrialStartConfirmDescription`, `resolveBillingTrialAccountName`, `getBillingTrialScheduleLabelsForStartToday`

## Related API Routes

**Production UI (overview read):**

- `GET /api/accounts/[accountId]/billing` — consolidated summary (plan, trial, access, active order, invoice request, available actions)
- `GET /api/accounts/[accountId]/billing/orders` — order history for status cards and orders table
- `GET /api/accounts/[accountId]/organisation` — account display name for personalised free-trial copy (`useAccountOrganisationContext`)

**Production UI (overview mutations):**

- `POST /api/accounts/[accountId]/billing/start-trial` — free-trial start from `BillingTrialStartCard`
- `POST /api/accounts/[accountId]/billing/checkout/resume` — continue payment from payment-pending banner
- `POST /api/accounts/[accountId]/billing/orders/[orderId]/delete` — discard pending checkout
- `POST /api/accounts/[accountId]/billing/invoice-requests/[invoiceRequestId]/cancel` — withdraw/cancel invoice request

**Related but not invoked directly on overview (child routes / create wizard):**

- `GET /api/accounts/[accountId]/billing/available-tiers` — create wizard and standalone invoice-request component
- `POST /api/accounts/[accountId]/billing/checkout` — create wizard
- `GET /api/accounts/[accountId]/billing/invoice-requests` — billing history route
- `POST /api/accounts/[accountId]/billing/invoice-requests` — create wizard invoice path

## Data States

- [x] Loading — `BrandedLoader` while billing summary pending; second loader while orders pending after summary ready.
- [x] Empty — `no_billing` / empty orders table copy; badge hidden when snapshot unavailable.
- [x] Partial data — summary renders with orders error/empty handled separately in `OrdersTableSection`.
- [x] Success — mode-specific cards, banners, actions, and orders table when data present.
- [x] Validation error — trial and payment-pending mutations show inline alerts; trial confirm dialog blocks close while pending.
- [x] Permission denied — gateway redirect on billing/orders GET (handled in lifecycle hook).
- [x] Not found / wrong account — invalid segment redirect to select-organisation.
- [x] API failure — billing load `ErrorState` with retry; orders load `ErrorState` with retry in ready state.
- [x] Unexpected empty — customer `ErrorState` with retry.

## Tests Required

- **Unit:** `billing-state.test.ts` (57), `billingPaymentPending.test.ts` (13), `billingHistoryOrderUtils.test.ts` (17), `resolveDeletablePendingOrderId.test.ts` (6), `resolveWithdrawableInvoiceRequestId.test.ts` (6), `billingEndingBanner.test.ts` (3), `billingInvoiceRequestPrefill.test.ts` (2), `billingTrialDetails.test.ts` (1), `billingTrialStart.test.ts` (4), plus create-wizard display/stripe helpers
- **Component:** `billing-content.test.tsx` (6) — invalid segment, loading, billing error retry, unexpected-empty retry, ready state (free-trial-available), checkout return banner
- **API:** `billing/route.test.ts` (5), `billing/orders/route.test.ts` (5), `billing/start-trial/route.test.ts` (6), `billing/checkout/resume/route.test.ts` (6), `billing/orders/[orderId]/delete/route.test.ts` (6), `billing/invoice-requests/[invoiceRequestId]/cancel/route.test.ts` (6), `normalize-invoice-request-post-body.test.ts` (5)
- **E2E/manual:** Stripe test-mode checkout return and trial start (see Manual Test Evidence)

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — orders section retry wired via `refetchOrders`; billing summary retry via `refetchBilling` from `useBillingOverviewContentState`.
- [x] Mutation errors are shown near the action — payment-pending and trial-start inline `role="alert"` banners.
- [x] Unknown errors fall back to safe customer copy — generic "Something went wrong. Try again." and `ApiError.message` only.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.
- [x] Checkout return recovery — return params stripped, queries invalidated, transient banner until refetch completes.

## Security And Privacy

- [x] Auth requirements are correct — members route; BFF routes require auth cookie (401 without token).
- [x] Account ownership is enforced — invalid segment redirect; gateway redirect on unauthorized billing/orders GET; Strapi proxy enforces ownership on mutations.
- [x] No secrets, tokens, or internal payloads are exposed — customer copy only; no dev debug UI on overview route.
- [x] Sensitive/destructive actions require confirmation — trial start confirm dialog; discard/withdraw are single-click but scoped to withdrawable/deletable IDs from summary.

## Accessibility

- [x] Headings create a sensible page outline — `PageHeader` "Billing"; card titles for trial, season pass, status, orders.
- [x] Form fields have labels and error associations — trial confirm dialog; invoice form on create route (not overview).
- [x] Buttons and links have clear accessible names — "Start free trial", "Continue payment", "View billing history", etc.
- [x] Status regions — checkout return, ending banner, payment-pending banner, trial feedback use `role="status"` or `role="alert"`.
- [x] Billing badge — `aria-label={`Billing status: ${label}`}` on product-state badge.
- [ ] Keyboard navigation works for the main flow — manual verification required.
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required.

## Manual Test Evidence

Run in local or staging with a valid customer account. **Not executed in this pass** — requires authenticated browser session and billing test fixtures.

- [x] Load `/o/{validAccountId}/billing` — badge, mode-appropriate cards/banners, actions visible; page subtitle shows customer copy (not dev/technical wording).
- [x] Free-trial-available account — trial card visible with account name in description when org context loads; confirm dialog shows account name in body; success feedback; state updates after reload.
- [ ] Payment-pending checkout — continue payment opens provider URL; discard removes pending order.
- [ ] Payment-pending invoice — withdraw/cancel request succeeds; banner copy updates.
- [ ] Paid active with cancel-at-period-end — ending banner shows period end date.
- [ ] Return from Stripe checkout — success/cancel banner briefly shown; URL params stripped.
- [ ] Visit `/o/not-a-number/billing` — redirects to select-organisation.
- [ ] Network offline on billing load — error state and retry works.
- [ ] Orders load failure while summary succeeds — orders section error with working retry.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual browser checklist not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for this route.
  - Keyboard/focus behavior not manually verified.
  - Create wizard hardening tracked in `docs/route-hardening/billing/create.md` (In review; manual Stripe checklist pending).
  - Season-pass card, paid/trial status cards, and billing history page copy not yet refreshed (see child route docs).
- Test evidence:
  - `npm run test -- "src/app/(members)/o/[accountId]/billing" "src/app/api/accounts/[accountId]/billing" "src/lib/api/utils/normalize-billing-checkout-post-response.test.ts"` — 155 billing UI tests passed (2026-07-05); full slice including API previously 160 (2026-07-04).
  - Component: `billing-content.test.tsx` (6).
  - Unit (trial copy): `billingTrialStart.test.ts` (4) — account name resolution, card/confirm formatters, organisation fallback.
  - API: `billing/route.test.ts` (5), `billing/orders/route.test.ts` (5), `billing/start-trial/route.test.ts` (6), `billing/checkout/resume/route.test.ts` (6), `billing/orders/[orderId]/delete/route.test.ts` (6), `billing/invoice-requests/[invoiceRequestId]/cancel/route.test.ts` (6), `normalize-invoice-request-post-body.test.ts` (5).
  - Unit highlights: `billing-state.test.ts` (57), `billingPaymentPending.test.ts` (13), `billingHistoryOrderUtils.test.ts` (17).
- Recent changes (2026-07-05):
  - Refreshed billing overview page subtitle and free-trial card/dialog customer copy.
  - Trial card and confirm dialog personalise copy with account name from `GET /organisation` (fallback to generic organisation wording).
- Production decision: In review
