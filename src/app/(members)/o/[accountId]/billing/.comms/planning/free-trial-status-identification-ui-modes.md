# Free trial status identification, UI modes, and CMS integration plan

Date: 2026-05-05
Owner: Frontend billing
Scope: Members billing page at `/o/{accountId}/billing`

## Purpose

Define the next implementation phase after the billing v1 commit: make the members billing page correctly identify and present an account in an active free trial period, while preserving the account-scoped checkout and invoice-request flows.

This plan covers:

- Free trial status identification from `GET /billing`
- UI modes for active trial, expired trial, no trial, and paid states
- Button/click processing for checkout and invoice request actions
- CMS/Strapi contract expectations
- UI handling after checkout, invoice request, and refreshed billing responses

## Current frontend baseline

The billing page already uses account-scoped v1 endpoints:

- `GET /api/accounts/{accountId}/billing`
- `GET /api/accounts/{accountId}/billing/available-tiers`
- `POST /api/accounts/{accountId}/billing/checkout`
- `GET /api/accounts/{accountId}/billing/invoice-requests`
- `POST /api/accounts/{accountId}/billing/invoice-requests`

The UI already renders:

- Billing/access status labels
- Current plan
- Trial card
- Active order
- Latest invoice request
- Card checkout form
- Invoice request form

The next work is to make the trial state explicit, reliable, and easy to QA.

## Trial status source of truth

`GET /billing` remains the single source of truth.

The frontend should infer free-trial state from this data, in order:

1. `trial?.isActive === true`
2. `billingStatus` code maps to a trial state, for example `trial`, `trialing`, `active_trial`, `free_trial`
3. `accessStatus` code maps to trial access, for example `trial`, `trial_access`
4. Date fallback: `trial.endDate` exists and is greater than now, if CMS does not reliably send `isActive`

Preferred CMS contract:

```ts
{
  data: {
    billingStatus: "trialing",
    accessStatus: "trial",
    currentPlan: null,
    trial: {
      id: 123,
      startDate: "2026-05-01T00:00:00.000Z",
      endDate: "2026-05-15T23:59:59.000Z",
      isActive: true,
      eligible: true,
      subscriptionTier: {
        id: 12,
        Name: "Trial",
        Title: "Free trial"
      }
    },
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: {
      canCheckout: true,
      canRequestInvoice: true
    }
  }
}
```

## Proposed frontend helper

Add a small derived-state helper near billing presentation code.

Suggested file:

`src/app/(members)/o/[accountId]/billing/billing-state.ts`

Suggested API:

```ts
export type BillingUiMode =
  | "active_trial"
  | "trial_expired"
  | "paid_active"
  | "payment_pending"
  | "access_denied"
  | "no_billing"
  | "unknown";

export function deriveBillingUiMode(summary: AccountBillingSummaryV1): BillingUiMode;

export function isActiveTrial(summary: AccountBillingSummaryV1): boolean;
```

Rules:

- `active_trial`: `trial.isActive === true` or known trial status code with valid future `trial.endDate`
- `trial_expired`: trial exists, `trial.isActive === false`, and no active paid order
- `paid_active`: active paid order exists or billing/access status clearly indicates paid active access
- `payment_pending`: latest invoice request pending/submitted or checkout/order state is incomplete/pending
- `access_denied`: access status denied, locked, none, or billing status unpaid/past due with no trial
- `no_billing`: no current plan, no active order, no active trial, no pending invoice request
- `unknown`: response is valid but does not match a known mode

Keep this helper pure and covered by focused unit tests or route-lab fixtures.

## UI modes

### Mode: active trial

Expected account state:

- `trial.isActive === true`
- `accessStatus` is available/granted/trial
- `activeOrder` is usually `null`
- `currentPlan` may be `null`, or CMS may provide `trial.subscriptionTier`

UI handling:

- Show a positive status: "Trial active"
- Show access badge as secondary: "Trial access" or "Access granted"
- Trial card is prominent and shows:
  - start date
  - end date
  - days remaining if simple to derive
  - eligibility
  - trial tier name if available
- Current plan card should not imply a paid subscription if `currentPlan` is null.
  - Suggested copy: "No paid plan yet"
  - Supporting copy: "This account is currently using a free trial."
- Show checkout if `availableActions.canCheckout` or `availableActions.canSubscribe` is true.
- Show invoice request if `availableActions.canRequestInvoice` or `availableActions.can_request_invoice` is true.

### Mode: trial expired

Expected account state:

- trial exists but is inactive or ended
- no active paid order
- access may be denied/restricted

UI handling:

- Show "Trial ended" or CMS-provided billing/access labels
- Trial card shows ended date
- Primary action should be plan checkout if allowed
- Invoice request can show if allowed

### Mode: paid active

Expected account state:

- active paid order exists, or current plan exists with active access

UI handling:

- Current plan and active order remain the main billing state
- Trial card can still show historical trial details, but should not compete with paid state
- Checkout/change-plan actions only show if CMS action flags allow them

### Mode: payment pending

Expected account state:

- latest invoice request exists with `submitted`, `pending`, or equivalent
- or checkout/order status indicates incomplete/pending

UI handling:

- Latest invoice request card should make pending state clear
- Avoid implying paid access unless `accessStatus` says access is granted
- Keep actions driven by `availableActions`

### Mode: access denied / no billing

Expected account state:

- no active trial
- no active order
- access denied/locked/none, or billing status none/inactive

UI handling:

- Show clear status and available next actions
- Do not show a paid active order or plan if response does not provide one

## Available action handling

Current action keys should be made tolerant of camelCase and snake_case.

Checkout should show when:

- `availableActions` is missing
- `availableActions` is empty
- `availableActions.canCheckout === true`
- `availableActions.can_checkout === true`
- `availableActions.canSubscribe === true`
- `availableActions.can_subscribe === true`

Invoice request should show when:

- `availableActions` is missing
- `availableActions` is empty
- `availableActions.canRequestInvoice === true`
- `availableActions.can_request_invoice === true`

Do not show unmapped actions as user-facing text unless `billing-summary-labels.ts` has a label for that action key.

## On-click processing

### Card checkout

User action:

1. User selects a tier.
2. User chooses a start date.
3. User clicks "Continue to payment".

Frontend processing:

1. Validate selected tier and start date.
2. Call `POST /billing/checkout`.
3. If `checkoutUrl` exists, redirect browser to Stripe.
4. If `checkoutUrl` is missing, show inline error.
5. On Stripe return, detect return params:
   - `session_id`
   - `checkout_session_id`
   - `billing_checkout=success`
   - `billing_checkout=cancelled`
6. Invalidate:
   - `queryKeys.account.billing(accountId)`
   - `queryKeys.account.billingAvailableTiers(accountId)`
7. Strip return params from the URL.
8. Render refreshed `GET /billing` response.

Active trial detail:

- Checkout from trial should not require ending trial client-side.
- CMS/Stripe decides whether the paid plan starts now, at trial end, or on selected start date.
- Frontend only sends selected `subscriptionTierId` and `startDate`.

### Invoice request

User action:

1. User selects a tier.
2. User enters requested start datetime.
3. User enters billing contact and address.
4. User clicks "Submit invoice request".

Frontend processing:

1. Validate required fields.
2. Validate requested start is not in the past.
3. Build `PostAccountBillingInvoiceRequestBody`.
4. Omit optional empty fields:
   - `billingAddress.line2`
   - `purchaseOrderNumber`
   - `notes`
5. Submit `POST /billing/invoice-requests`.
6. On success, show response `message` or fallback success copy.
7. Mutation invalidates:
   - `queryKeys.account.billing(accountId)`
   - `queryKeys.account.billingInvoiceRequests(accountId)`
8. Latest invoice request card should update from refreshed `GET /billing`.

Active trial detail:

- Invoice request during active trial should be allowed only if CMS sends the action flag.
- UI should present invoice request as a transition from trial to paid invoice billing, not as an immediate paid state.

## CMS integration requirements

CMS should provide stable, account-scoped billing summary values.

Required for active trial:

- `trial.isActive`
- `trial.startDate`
- `trial.endDate`
- `accessStatus`
- `billingStatus`
- `availableActions`

Recommended:

- `trial.subscriptionTier`
- `availableActions.canCheckout`
- `availableActions.canRequestInvoice`
- `currentPlan` should be null unless there is a real paid/current plan
- `activeOrder` should be null unless there is a real active paid entitlement

Open CMS questions:

- What exact `billingStatus` string is returned for active trial?
- What exact `accessStatus` string is returned for active trial?
- Does `currentPlan` remain null during trial, or does CMS expose a trial plan there?
- Should checkout start date default to today or trial end date?
- Should invoice requested start default to trial end date?
- Are action flags camelCase, snake_case, or mixed?
- Can active trial accounts request invoice billing?

## UI response handling

After every mutation or return flow, `GET /billing` wins.

Expected response handling:

- If trial remains active, keep showing active trial mode.
- If checkout creates an active paid order, switch to paid active mode.
- If checkout is cancelled, keep the previous mode and show no false paid state.
- If invoice request is submitted, show latest invoice request and keep trial state until CMS changes access/billing state.
- If CMS/webhook lags, show the best current `GET /billing` data and allow manual refresh/retry.
- If account access changes to denied/locked, redirect or show safe access state according to existing gateway behavior.

## Implementation steps

1. Confirm staging/CMS active-trial JSON for one owned account.
2. Add `billing-state.ts` helper for derived UI mode.
3. Add or update labels for known trial codes in `billing-summary-labels.ts`.
4. Harden action checks for snake_case and camelCase.
5. Update billing summary cards for active trial copy:
   - trial card
   - current plan empty state
   - available action labels
6. Add a route-lab or local fixture for active trial.
7. Run:
   - `npm run typecheck`
   - focused ESLint on billing files
8. Run staging QA using `.comms/staging-qa-checklist.md`.

## Acceptance criteria

- Active trial account shows a clear trial state.
- Trial access is presented as available access, not an error.
- Paid plan is not implied unless CMS returns paid/current plan data.
- Checkout and invoice request visibility are driven by `availableActions`.
- Both camelCase and snake_case action flags work.
- Stripe return refresh still invalidates and strips checkout params.
- Invoice request success updates latest invoice request after refetch.
- No legacy `/orders` or `/subscription-tiers` client routes are introduced.

## Suggested active trial QA payload

```json
{
  "data": {
    "billingStatus": "trialing",
    "accessStatus": "trial",
    "currentPlan": null,
    "trial": {
      "id": 101,
      "startDate": "2026-05-05T00:00:00.000Z",
      "endDate": "2026-05-19T00:00:00.000Z",
      "isActive": true,
      "eligible": true,
      "subscriptionTier": {
        "id": 1,
        "Name": "Free Trial",
        "Title": "14 day trial",
        "SubTitle": null,
        "description": "Temporary access for evaluation.",
        "price": 0,
        "currency": "AUD",
        "stripe_product_id": null,
        "stripe_price_id": null,
        "isActive": true
      }
    },
    "activeOrder": null,
    "latestInvoiceRequest": null,
    "availableActions": {
      "canCheckout": true,
      "canRequestInvoice": true
    }
  }
}
```
