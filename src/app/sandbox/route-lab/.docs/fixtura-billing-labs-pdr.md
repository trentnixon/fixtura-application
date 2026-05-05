# Fixtura Billing LABS Frontend PDR

## 1. Purpose

Build a LABS-only billing prototype that tracks the intended account billing journey without connecting to the CMS, Stripe, invoice systems, or live account access logic.

This LABS version is a route and interaction exploration. Its job is to make the billing path visible, testable, and easy to discuss before the production backend contracts are ready.

The LABS experience should:

- Show the account billing journey from not-started through checkout or invoice request.
- Let users select a mocked plan/package.
- Let users choose a mocked season/pass start date.
- Simulate starting card payment without creating a Stripe Checkout session.
- Simulate requesting an invoice without creating an invoice request record.
- Simulate success, cancelled, pending, failed, and invoice states.
- Track the current path/state in local UI state, query params, or mock fixtures.
- Provide enough structure that the production billing page can later reuse the same user flow.

The LABS experience should not:

- Call CMS billing endpoints.
- Call Stripe or load Stripe.js.
- Create orders, invoices, checkout sessions, subscriptions, or trials.
- Update account access.
- Persist billing state outside the lab unless explicitly added for demo convenience.

---

## 2. LABS Goal

The goal is to prove the path, not the payment system.

The lab should answer:

- Does the billing hub communicate the user's current state clearly?
- Can the user understand the difference between card payment and invoice request?
- Is the start-date and pass-duration model clear enough?
- Do success and cancelled return states feel safe and truthful?
- Are pending states visible enough for payment/invoice review scenarios?
- Do the frontend components align with the future backend contract?

---

## 3. Recommended LABS Routes

Primary route:

```txt
/sandbox/route-lab/accounts/[accountId]/billing
```

Return-state routes:

```txt
/sandbox/route-lab/accounts/[accountId]/billing/success
/sandbox/route-lab/accounts/[accountId]/billing/cancelled
```

Alternative if the existing route lab prefers the organisation shape:

```txt
/sandbox/route-lab/o/[accountId]/billing
/sandbox/route-lab/o/[accountId]/billing/success
/sandbox/route-lab/o/[accountId]/billing/cancelled
```

The LABS route should make it visually obvious that this is a prototype surface, not a live billing page.

---

## 4. LABS Screens/Sections

### 4.1 Billing Lab Page

Route:

```txt
/sandbox/route-lab/accounts/[accountId]/billing
```

Sections:

- Mock billing status
- Mock current plan
- Mock trial state, when relevant
- Mock available plans
- Season/pass start date selector
- Simulated payment actions
- Simulated invoice request form
- Pending payment/invoice state
- Scenario/state switcher for testing
- Path tracker showing the user's current journey step

---

### 4.2 Scenario Switcher

The lab should include a developer-facing scenario selector so each important state can be previewed quickly.

Suggested scenarios:

- Not started
- Trial available
- Trial active
- Trial ended
- Plan selected
- Checkout started
- Payment pending
- Payment failed
- Invoice requested
- Invoice under review
- Invoice sent
- Active season pass
- Expired season pass
- Cancelled

The switcher can be a segmented control, select menu, or compact sidebar control depending on the existing sandbox pattern.

---

### 4.3 Path Tracker

The lab should show the current user journey step.

Suggested path steps:

```txt
View billing
Select plan
Choose start date
Choose payment method
Card checkout started
Stripe return simulated
Invoice request submitted
Billing state refreshed
```

The path tracker should help the team see where the user is in the journey without implying any real billing event occurred.

---

### 4.4 Mock Billing Status Card

Show a user-facing summary driven by mock `billingStatus`, `accessStatus`, and `availableActions`.

The lab should preserve the production rule:

```txt
The frontend displays the state; it does not derive account truth from raw billing records.
```

Even in LABS, avoid building the UI around raw orders, customers, trial instances, or subscription tier records.

---

### 4.5 Mock Plan Selection

The lab should expose mocked available tiers that resemble the future backend contract.

Required behaviours:

- Show multiple mocked plans.
- Allow one selected plan at a time.
- Show price, duration, included assets, sponsor inclusion, and plan category.
- Allow the selected plan to feed both simulated checkout and simulated invoice request.

The mock data may include Club and Association plans, but the UI should still behave as if the backend has already returned valid plans for the account.

---

### 4.6 Mock Start Date Selection

The lab should preserve Fixtura's season/pass model.

User selects:

```txt
requestedStartDate
```

The UI can estimate:

```txt
estimatedEndDate = requestedStartDate + daysInPass
```

This estimate should be labelled as mock/lab output. The production backend will be the final source of truth.

---

### 4.7 Simulated Card Payment

User pathway:

1. User selects a mocked plan.
2. User selects a start date.
3. User clicks `Pay with card`.
4. Lab records a simulated checkout state.
5. Lab shows a fake checkout-started panel.
6. User can choose simulated return outcomes:
   - Success
   - Processing
   - Failed
   - Cancelled
7. Lab updates the mock billing summary.

No Stripe Checkout URL should be created.

Suggested fake response:

```ts
type MockCheckoutResponse = {
  checkoutSessionId: string;
  checkoutUrl: null;
  orderId: string;
  labOnly: true;
};
```

---

### 4.8 Simulated Invoice Request

User pathway:

1. User selects a mocked plan.
2. User selects a start date.
3. User clicks `Request invoice`.
4. Lab shows an invoice request form.
5. User submits mocked billing details.
6. Lab shows `invoice_requested` or `invoice_under_review`.

Important rule:

```txt
Submitting a LABS invoice request must not activate billing/account access.
```

Suggested fake response:

```ts
type MockInvoiceRequestResponse = {
  invoiceRequestId: string;
  status: "submitted";
  submittedAt: string;
  message: string;
  labOnly: true;
};
```

---

### 4.9 Simulated Success Page

Route:

```txt
/sandbox/route-lab/accounts/[accountId]/billing/success
```

Behaviour:

- Read mock `session_id` from query params when present.
- Do not assume payment is complete just because the user reached this page.
- Show a simulated refreshed billing state.
- Allow the tester to toggle between:
  - Payment successful/account active
  - Payment processing
  - Payment not found/needs support

The copy should reinforce that this is a LABS-only simulation.

---

### 4.10 Simulated Cancelled Page

Route:

```txt
/sandbox/route-lab/accounts/[accountId]/billing/cancelled
```

Behaviour:

- Read mock `session_id` from query params when present.
- Show a checkout cancelled/not completed state.
- Let the user return to the billing lab.
- Let the user simulate trying again or requesting an invoice.

---

## 5. Mock Data Contracts

The LABS version should use the same broad contract shape as the production PDR so the UI can later move toward the real API with less churn.

### 5.1 Mock Billing Summary

```ts
type LabBillingSummary = {
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
  currentPlan: LabBillingTier | null;
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
    labOnly: true;
  } | null;
  latestInvoiceRequest: {
    id: string;
    status: string;
    submittedAt: string;
    selectedPlanName: string;
    labOnly: true;
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

### 5.2 Mock Available Tiers

```ts
type LabBillingTier = {
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
  labOnly: true;
};
```

---

## 6. LABS Implementation Approach

### Phase 1 - Create Mock Fixtures

Create fixtures for:

- Billing summary states
- Available tiers
- Checkout simulation responses
- Invoice request simulation responses
- Success/cancelled return simulations

---

### Phase 2 - Build Billing Lab UI

Build:

- Billing lab route
- Scenario switcher
- Path tracker
- Billing status card
- Current plan card
- Trial state card
- Plan selector
- Start date picker
- Payment method actions
- Invoice request form
- Pending state view

---

### Phase 3 - Build Mock Client Functions

Create lab-only functions:

```txt
getLabBillingSummary(accountId, scenario)
getLabAvailableBillingTiers(accountId)
createLabCheckout(accountId, payload)
createLabInvoiceRequest(accountId, payload)
applyLabReturnState(accountId, returnState)
```

These should not call network endpoints unless a local mock route is intentionally added for the sandbox.

---

### Phase 4 - Add Simulated Return Pages

Build:

```txt
/sandbox/route-lab/accounts/[accountId]/billing/success
/sandbox/route-lab/accounts/[accountId]/billing/cancelled
```

Both pages should use mock summary refresh behaviour and provide links back to the main billing lab.

---

### Phase 5 - Compare Against Production PDR

Before connecting production endpoints, compare the LABS path against the production PDR and confirm:

- The same user decisions are represented.
- The same status states are visible.
- The same major actions are present.
- The UI does not depend on lab-only implementation details.

---

## 7. Definition of Done

The LABS billing prototype is complete when:

- User can view a mocked account billing state.
- User can switch between major billing scenarios.
- User can select a mocked plan and start date.
- User can simulate card checkout.
- User can simulate checkout success, processing, failure, and cancellation.
- User can submit a mocked invoice request.
- User can see pending invoice/payment states.
- Success and cancelled routes work as simulations.
- Path tracker clearly shows the current journey step.
- No CMS endpoint is called.
- No Stripe dependency is loaded.
- No real billing/access state is persisted or mutated.
- The mock contracts remain close to the production PDR contracts.

---

## 8. Out of Scope for LABS

The LABS prototype should not:

- Integrate with CMS billing endpoints.
- Integrate with Stripe.
- Use Stripe.js.
- Create real checkout sessions.
- Create real invoice requests.
- Send invoice emails.
- Activate, restrict, or cancel accounts.
- Persist billing decisions to the CMS.
- Replace backend entitlement logic.

---

## 9. Notes for Cursor/LLM Implementation

- Treat this as a route-lab prototype.
- Keep everything visibly LABS-only.
- Use mock data first and keep the mock contract close to the production PDR.
- Make the journey easy to test through scenario controls.
- Preserve Fixtura's season/pass model: `requestedStartDate`, estimated `endDate`, and `daysInPass`.
- Avoid copying old `/members/account` code directly.
- Prefer small, composed components that can later inform the production billing page.
- Keep all simulated payment and invoice actions explicit; never make fake success look like a real billing event.
