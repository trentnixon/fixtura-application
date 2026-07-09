# Billing Create

Route: `/o/[accountId]/billing/create`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Billing checkout / order creation (Season Pass wizard).

## Customer Purpose

Let eligible customers start a Season Pass purchase: choose a pass tier, set a start date, pick card checkout or an online invoice request, and submit. This is the canonical purchase route (not legacy `plan-checkout`).

## Features To Prove

- [x] Loads available tiers. _(`useAccountBillingAvailableTiers` → step 1_ `SelectTimeframeStep` _; Club/Association toggle when multiple categories)_
- [x] Starts checkout with selected tier. _(`submitCardCheckout` →_ `POST …/billing/checkout` _→ Stripe redirect via_ `window.location.assign`_)_
- [x] Handles pending order resume/discard behavior. _(**Cross-route:** wizard redirects away when_ `payment_pending` _; resume/discard on billing overview_ `BillingPaymentPendingBanner` _— see_ `billing.md`_)_
- [x] Prevents duplicate checkout creation. _(`wizardBlocked` for_ `paid_active`_,_ `free_trial_available`_,_ `payment_pending` _→_ `router.replace(…/billing)`_)_
- [x] Submits online invoice requests. _(`submitInvoiceRequest` →_ `POST …/billing/invoice-requests` _→_ `InvoiceRequestSubmittedState`_)_
- [x] Skips payment-method step when only one path is allowed. _(`advancePastStep2` jumps to step 4 for card-only or invoice-only accounts)_
- [x] Shows safe copy when no purchase actions are available. _("No subscription actions available" card when neither card nor invoice path is allowed)_

## User Journeys

- **Happy path (card):** Eligible account loads billing summary → tiers load → customer selects pass → start date → card path (step 3 skipped if card-only) → review → `Continue to payment` → Stripe Checkout redirect.
- **Happy path (invoice):** Same through start date → invoice path → review with contact fields → submit → `InvoiceRequestSubmittedState` with link back to billing.
- **Blocked modes:** `paid_active`, `free_trial_available`, or `payment_pending` → wizard redirects to `/billing` (pending checkout resume/discard handled on overview).
- **Empty tiers:** Step 1 shows "No Season Pass plans are available…" with guidance to return to billing or contact support.
- **No actions:** Neither `canCheckout` nor invoice action flags → dedicated card with back-to-billing link.
- **Error/retry:** Billing GET failure → `ErrorState` "Could not load billing" with retry; tiers GET failure → "Could not load plans" with retry; checkout mutation failure → inline alert on review step; missing checkout URL → customer copy near submit action.
- **Wrong account:** Invalid `accountId` segment → redirect to select-organisation; billing/tiers gateway markers → redirect with reason.
- **Staff immediate invoice (optional):** When `shouldShowStripeImmediateInvoiceCreate` → staff panel on invoice review step (dev/staff gated).

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/billing/create/page.tsx`
- **Wizard:** `create-subscription-wizard.tsx`, `create-subscription-wizard-state-panel.tsx`
- **Steps:** `SelectTimeframeStep`, `SelectStartDateStep`, `SelectPaymentMethodStep`, `ReviewCardPaymentStep`, `ReviewInvoiceRequestStep`, `InvoiceRequestSubmittedState`, `StaffImmediateInvoicePanel`
- **Hooks:** `useCreateSubscriptionReviewDisplay`, `useBillingInvoiceContactPrefill`, `useAccountBilling`, `useAccountBillingAvailableTiers`, `usePostAccountBillingCheckout`, `usePostAccountBillingInvoiceRequest`, `useAccountMe`
- **Utils:** `checkoutActionGate`, `createSubscriptionWizardDisplay`, `passEndDateFromWizardStart`, `shouldShowStripeImmediateInvoice`, `orderedDistinctSubscriptionCategories`, `deriveBillingUiMode`
- **Cross-route (pending checkout):** `BillingPaymentPendingBanner`, `useBillingPaymentPendingBannerActions` on `/billing` overview
- **Dev-only:** `BillingDebugPanel`, `CreateSubscriptionWizardStatePanel` (visible in development or `?debug=1`)

## Related API Routes

**Invoked on create wizard:**

- `GET /api/accounts/[accountId]/billing` — summary + `availableActions` gating before tiers load
- `GET /api/accounts/[accountId]/billing/available-tiers` — tier list for step 1
- `POST /api/accounts/[accountId]/billing/checkout` — start Stripe Checkout session
- `POST /api/accounts/[accountId]/billing/invoice-requests` — submit online invoice request

**Overview only (pending checkout — not called from create wizard):**

- `POST /api/accounts/[accountId]/billing/checkout/resume` — continue payment from overview banner
- `POST /api/accounts/[accountId]/billing/orders/[orderId]/delete` — discard pending checkout from overview banner

## Data States

- [x] Loading — `BrandedLoader` for billing summary and for available tiers.
- [x] Empty — no tiers in step 1; no actions card when flags disallow both paths.
- [x] Partial data — billing summary loads before tiers query enables.
- [x] Success — wizard steps through to Stripe redirect, invoice submitted state, or staff invoice panel success.
- [x] Validation error — date input min/max; invoice required fields; checkout/invoice mutation inline alerts.
- [x] Permission denied — gateway redirect on billing or tiers GET (400/403/404 markers).
- [x] Not found / wrong account — invalid segment redirect to select-organisation.
- [x] API failure — billing/tiers `ErrorState` with retry.
- [x] Wizard blocked — redirect to billing for incompatible billing modes.

## Tests Required

- **Unit:** `createSubscriptionWizardDisplay.test.ts` (5), `billingStripeInvoiceWizard.test.ts` (7), `checkoutActionGate` via `billing-state.test.ts`, `normalize-billing-checkout-post-response.test.ts` (create checkout normalizer)
- **Component:** `create-subscription-wizard.test.tsx` — invalid segment, loading, billing error, wizard blocked, tiers loading/error, empty tiers, no actions, invoice submitted
- **API:** `checkout/route.test.ts`, `available-tiers/route.test.ts`, `invoice-requests/route.test.ts` (POST guard + forward); resume/delete covered on overview (`checkout/resume/route.test.ts`, `orders/[orderId]/delete/route.test.ts`)
- **E2E/manual:** Stripe test-mode wizard checkout and invoice submit (see Manual Test Evidence)

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — billing and tiers `ErrorState` with `refetch`.
- [x] Mutation errors are shown near the action — checkout and invoice errors on review steps (`role="alert"`).
- [x] Unknown errors fall back to safe customer copy — `ApiError.message` or `AUTH_ERROR_MESSAGES.network`.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.
- [x] Missing checkout URL — customer copy via `missingCheckoutUrl` on card review step (no provider internals).

## Security And Privacy

- [x] Auth requirements are correct — members route; BFF routes require auth cookie (401 without token).
- [x] Account ownership is enforced — invalid segment redirect; gateway redirect on unauthorized billing/tiers GET; Strapi proxy on mutations.
- [x] No secrets, tokens, or internal payloads are exposed — customer copy only; debug panels gated (`useBillingDevToolsVisible`: dev or `?debug=1`).
- [x] Sensitive/destructive actions require confirmation — discard pending checkout is on overview only; create redirects blocked accounts away.
- [x] Staff Stripe immediate invoice — gated by CMS flag or staff/admin role (`shouldShowStripeImmediateInvoiceCreate`).

## Accessibility

- [x] Headings create a sensible page outline — page `h1` "Create Season Pass"; step headings `h2` in each step component.
- [x] Form fields have labels and error associations — start date `Label`; invoice contact fields on `ReviewInvoiceRequestStep`; checkout errors use `role="alert"`.
- [x] Buttons and links have clear accessible names — "Back to billing", "Continue to payment", tier selection tiles, etc.
- [x] Status regions — loading/redirect states use `role="status"`; empty tiers copy uses `role="status"`.
- [ ] Keyboard navigation works for the main flow — manual verification required.
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required.

## Manual Test Evidence

Run in local or staging with a valid customer account and Stripe test mode. **Not executed in this pass** — requires authenticated browser session and billing test fixtures.

- [ ] Eligible account loads tiers on `/o/{validAccountId}/billing/create`.
- [ ] Select tier + date + card → redirects to Stripe Checkout.
- [ ] Cancel Stripe → cancel return flow → overview pending banner (see `cancel.md`).
- [ ] Complete Stripe → success return (see `success.md` when hardened).
- [ ] Account with `payment_pending` visiting create → redirected to overview with pending banner.
- [ ] Invoice path: submit request → submitted confirmation state.
- [ ] Empty tiers account → empty copy, no crash.
- [ ] Network error on tiers load → retry works.
- [ ] Invalid segment `/o/not-a-number/billing/create` → select-organisation redirect.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual Stripe wizard checklist not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for create wizard flow.
  - Pending resume/discard owned by billing overview — cross-route dependency documented.
  - Legacy `plan-checkout` remains in repo (non-canonical; no redirect).
  - Keyboard/focus behavior not manually verified.
  - Invalid tier / duplicate order server rules enforced by CMS/Strapi — BFF tests prove forwarding only.
- Test evidence:
  - `npx vitest run "src/app/(members)/o/[accountId]/billing/create" "src/app/api/accounts/[accountId]/billing/checkout/route.test.ts" "src/app/api/accounts/[accountId]/billing/available-tiers/route.test.ts" "src/app/api/accounts/[accountId]/billing/invoice-requests/route.test.ts" "src/app/(members)/o/[accountId]/billing/_utils/create-subscription" "src/lib/api/utils/normalize-billing-checkout-post-response.test.ts"` — 49 tests passed (2026-07-05).
  - Component: `create-subscription-wizard.test.tsx` (11).
  - API: `checkout/route.test.ts` (7), `available-tiers/route.test.ts` (5), `invoice-requests/route.test.ts` (8).
  - Unit: `createSubscriptionWizardDisplay.test.ts` (5), `billingStripeInvoiceWizard.test.ts` (7), `normalize-billing-checkout-post-response.test.ts` (6).
- Production decision: In review
