# Fixtura Billing Frontend PDR

## 1. Purpose

Build the new Fixtura frontend billing experience for account-based subscription management, Stripe checkout, and invoice request flows.

This frontend should not directly recreate the old `/members/account` billing implementation. Instead, it should use clean account-scoped billing APIs supplied by the CMS/backend.

The frontend's job is to:

- Show the account's billing/access state.
- Show trial, plan, invoice, and payment status clearly.
- Let users select a valid plan/package.
- Let users choose a season/pass start date.
- Let users pay via Stripe Checkout.
- Let users request an invoice instead of paying by card.
- Handle success/cancel return states from Stripe.
- Refresh account billing state after user actions.

The frontend should not decide whether an account is paid, active, expired, cancelled, or allowed to access paid features. Those decisions belong to the CMS/backend.

---

## 2. Background

The old Fixtura frontend used a members account flow that routed users into states such as:

- `available_trial`
- `active_trial`
- `ended_trial`
- `pending_subscriber`
- `account_active_pending`
- `subscribed`
- `ended_paid_subscription`

The old purchase flow was season/pass based:

1. User selected a season start date.
2. User selected a subscription tier.
3. Frontend calculated/displayed the pass window using `DaysInPass`.
4. Frontend called a Strapi order/invoice endpoint.
5. Stripe success/cancel pages confirmed or cancelled the order.

For the new frontend, we want to preserve the useful business flow but simplify the integration.

---

## 3. New frontend route

Recommended primary route:

```txt
/o/[accountId]/billing
```

Recommended return routes:

```txt
/o/[accountId]/billing/success
/o/[accountId]/billing/cancelled
```

Optional future routes:

```txt
/o/[accountId]/billing/invoices
/o/[accountId]/billing/history
```

---

## 4. Frontend screens/sections to build

### 4.1 Billing overview page

Route:

```txt
/o/[accountId]/billing
```

This page should be the single billing hub for the account.

Sections:

- Billing status card
- Current plan card
- Trial status card, when relevant
- Available plans section
- Season/pass start date selector
- Payment option actions
- Invoice request form
- Pending payment/invoice state
- Invoice/order links, when available

---

### 4.2 Billing status card

Show a simple user-facing summary of the account's current billing state.

Possible display states:

- No plan selected
- Free trial available
- Free trial active
- Trial ended
- Payment pending
- Payment failed
- Invoice requested
- Invoice under review
- Invoice sent
- Active season pass
- Season pass expired
- Cancelled

This card should be driven by the backend-provided `billingStatus`, `accessStatus`, and `availableActions` fields.

The frontend should not manually inspect raw orders/trials and derive these states itself.

---

### 4.3 Current plan card

Show the current active plan or selected pending plan.

Fields to display when available:

- Plan name
- Plan category: Club or Association
- Price
- Currency
- Pass duration
- Start date
- End date
- Days remaining
- Sponsor inclusion
- Asset/package summary

---

### 4.4 Plan selection section

The frontend should show only plans returned by the backend for the current account.

The frontend should not manually decide whether the account is a club or association if the backend can filter the plan list.

Required behaviours:

- Show available tiers/plans.
- Allow one selected plan at a time.
- Show price, duration, and included features.
- Allow the selected plan to be used for either Stripe checkout or invoice request.

---

### 4.5 Season/pass start date selector

The old Fixtura model is pass-duration based, using `DaysInPass`.

The new frontend should keep the season/pass start date selection.

User selects:

```txt
requestedStartDate
```

The backend should confirm the final pass window during checkout or invoice request creation.

The frontend can display an estimated end date for UX, but the backend response is the final source of truth.

---

### 4.6 Stripe checkout action

User pathway:

1. User selects a plan.
2. User selects a start date.
3. User clicks `Pay with card`.
4. Frontend calls account-scoped checkout endpoint.
5. Backend returns a Stripe Checkout URL or session ID.
6. Frontend redirects to Stripe.
7. Stripe returns user to success/cancel route.
8. Frontend refreshes billing summary.

Frontend endpoint:

```txt
POST /api/accounts/:accountId/billing/checkout
```

Request body:

```ts
type CreateCheckoutRequest = {
  subscriptionTierId: string;
  startDate: string;
  couponId?: string | null;
};
```

Expected response:

```ts
type CreateCheckoutResponse = {
  checkoutSessionId: string;
  checkoutUrl?: string;
  orderId: string;
};
```

Frontend handling:

- Prefer redirecting to `checkoutUrl` when provided.
- If only `checkoutSessionId` is provided, use Stripe.js `redirectToCheckout`.
- Show loading while checkout is being created.
- Show error state if checkout creation fails.

---

### 4.7 Invoice request action

This is a new user-facing alternative to Stripe/card payment.

User pathway:

1. User selects a plan.
2. User selects a start date.
3. User clicks `Request invoice`.
4. Frontend shows invoice request form.
5. User submits billing details.
6. Backend creates an invoice request record.
7. Frontend shows an `invoice_requested` / `under_review` state.

Frontend endpoint:

```txt
POST /api/accounts/:accountId/billing/invoice-requests
```

Request body:

```ts
type CreateInvoiceRequest = {
  subscriptionTierId: string;
  requestedStartDate: string;

  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  notes?: string;
};
```

Expected response:

```ts
type CreateInvoiceRequestResponse = {
  invoiceRequestId: string;
  status: "submitted";
  submittedAt: string;
  message: string;
};
```

Important rule:

```txt
Submitting an invoice request must not automatically activate billing/account access.
```

---

### 4.8 Pending payment/invoice state

The frontend needs a clear pending state for:

- Checkout started
- Payment pending
- Payment failed
- Invoice requested
- Invoice under review
- Invoice sent
- Invoice unpaid

Possible actions:

- Continue payment
- View hosted invoice
- Download invoice PDF
- Request invoice instead
- Contact support
- Choose another plan, if allowed

All actions should come from backend-provided `availableActions` where possible.

---

### 4.9 Success page

Route:

```txt
/o/[accountId]/billing/success
```

Behaviour:

- Read `session_id` from query params when present.
- Do not assume payment is complete just because the user reached this page.
- Refresh billing summary from the backend.
- Show one of:
  - Payment successful / account active
  - Payment processing / pending confirmation
  - Payment not found / needs support

The Stripe webhook should be the source of truth.

---

### 4.10 Cancelled page

Route:

```txt
/o/[accountId]/billing/cancelled
```

Behaviour:

- Read `session_id` from query params when present.
- Refresh billing summary.
- Show a clear message that checkout was cancelled or not completed.
- Let the user return to billing, try again, or request an invoice.

---

## 5. Required frontend data contracts

### 5.1 Billing summary

Endpoint:

```txt
GET /api/accounts/:accountId/billing
```

Expected shape:

```ts
type BillingSummary = {
  accountId: string;
  accountName: string;

  accessStatus: "pending" | "active" | "restricted" | "cancelled";

  billingStatus:
    | "not_started"
    | "trial_available"
    | "trialing"
    | "trial_ended"
    | "checkout_started"
    | "payment_pending"
    | "payment_failed"
    | "invoice_requested"
    | "invoice_under_review"
    | "invoice_sent"
    | "active"
    | "expired"
    | "cancelled";

  currentPlan: {
    id: string;
    name: string;
    category: "Club" | "Association";
    price: number;
    currency: string;
    daysInPass: number;
    includeSponsors: boolean;
  } | null;

  trial: {
    isEligible: boolean;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
  };

  activeOrder: {
    id: string;
    status: string;
    paymentStatus: string;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
  } | null;

  latestInvoiceRequest: {
    id: string;
    status: string;
    submittedAt: string;
    selectedPlanName: string;
  } | null;

  availableActions: {
    canStartTrial: boolean;
    canSelectPlan: boolean;
    canStartCheckout: boolean;
    canRequestInvoice: boolean;
    canViewInvoice: boolean;
    canDownloadInvoice: boolean;
    canContactSupport: boolean;
  };
};
```

---

### 5.2 Available tiers

Endpoint:

```txt
GET /api/accounts/:accountId/billing/available-tiers
```

Expected shape:

```ts
type AvailableBillingTier = {
  id: string;
  name: string;
  description: string;
  category: "Club" | "Association";
  price: number;
  currency: string;
  daysInPass: number;
  priceByWeekInPass?: number;
  isActive: boolean;
  includeSponsors: boolean;
  includedAssetTypes: string[];
  packageName?: string;
  stripePriceId?: string;
};
```

---

## 6. Frontend implementation approach

### Phase 1 — Mock contract locally

Create mock data for:

- Billing summary states
- Available tiers
- Invoice request response
- Checkout response

Build the page against these contracts before the CMS endpoint work is complete.

---

### Phase 2 — Build billing page UI

Build:

- Billing page route
- Billing status card
- Current plan card
- Trial state card
- Plan selector
- Start date picker
- Payment method actions
- Invoice request form
- Pending state view

---

### Phase 3 — Build API hooks/client functions

Create frontend data functions/hooks for:

```txt
getBillingSummary(accountId)
getAvailableBillingTiers(accountId)
createCheckout(accountId, payload)
createInvoiceRequest(accountId, payload)
```

These should call the BFF/API layer used by the new app.

---

### Phase 4 — Add Stripe return pages

Build:

```txt
/o/[accountId]/billing/success
/o/[accountId]/billing/cancelled
```

Both pages should refresh billing state and then guide the user back to billing.

---

### Phase 5 — Connect to real CMS endpoints

Once CMS contracts are available:

- Replace mocks with real API calls.
- Test all status states.
- Test Stripe sandbox checkout.
- Test invoice request submission.
- Test refresh after success/cancel.

---

## 7. Definition of done

Frontend is complete when:

- User can view current billing state for an account.
- User can view valid plans for the account.
- User can select a plan and start date.
- User can start Stripe checkout.
- User can submit an invoice request.
- User can see pending invoice/payment states.
- Success and cancelled return pages work.
- UI does not consume raw `orders`, `customers`, `trial-instances`, or `subscription-tiers` directly.
- UI does not decide account access/payment truth independently from the backend.
- All major states are testable with mock data and real CMS responses.

---

## 8. Out of scope for frontend

The frontend should not:

- Create Stripe customers directly.
- Create Stripe invoices directly.
- Store Stripe secret keys.
- Mark orders as paid.
- Activate/deactivate accounts.
- Decide whether payment succeeded.
- Use unauthenticated admin billing routes.
- Derive final account access from raw order/trial records.

---

## 9. Notes for Cursor/LLM implementation

- Keep the new frontend account-scoped.
- Prefer composed backend billing endpoints over raw CMS collection reads.
- Build with mock data first if endpoints are not ready.
- Keep the UI state-driven and componentised.
- Do not copy old `/members/account` code directly; use it as behaviour reference only.
- Preserve Fixtura's season/pass model, especially `startDate`, `endDate`, and `DaysInPass`.
