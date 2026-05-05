# Billing UI states, routes, and create-subscription wizard

Date: 2026-05-05
Status: Planning / integration brief
Audience: LLM implementation agent

## Purpose

This is the integration-control brief for the account billing UI.

Use it to align product language, routes, and wizard behaviour with the current billing v1 frontend contract and code.

Canonical implementation references:

- `billing-state.ts` is the engineering state resolver.
- `BillingUiMode` is the current engineering mode enum.
- `deriveBillingUiMode()` is the single source of truth for billing UI behaviour.
- `billing-checkout-return.ts` is the canonical checkout return-query parser.
- `frontend-billing-api-contract-handoff.md` is the v1 API contract.
- `AccountBillingSummaryV1` in `src/types/api/account.ts` is the members UI GET billing shape.

Do not implement a second resolver from this document. Update `deriveBillingUiMode()` and its tests when product states change.

## Canonical GET billing shape

For the members billing UI, use billing summary v1 only:

```txt
GET /api/accounts/:accountId/billing -> { data: AccountBillingSummaryV1 }
```

Do not build new members UI work against the older consolidated GET billing handoff shape with `orders[]`, `summary`, `financialSummary`, or `meta`. That legacy shape exists in docs/types for historical context only.

Important v1 fields:

```ts
type AccountBillingSummaryV1 = {
  billingStatus: string;
  accessStatus: string;
  currentPlan: AvailableBillingTier | null;
  trial: BillingTrialSummaryV1 | null;
  activeOrder: AccountBillingOrderDto | null;
  latestInvoiceRequest: InvoiceRequestSummary | null;
  availableActions?: Partial<Record<string, boolean>>;
};
```

## Product states vs engineering modes

Product planning currently uses four primary states:

```txt
Activate Trial
Active Account
Pending
Create Subscription
```

The app currently implements richer engineering modes:

```ts
type BillingUiMode =
  | "free_trial_available"
  | "active_trial"
  | "trial_expired"
  | "paid_active"
  | "payment_pending"
  | "access_denied"
  | "no_billing"
  | "unknown";
```

Mapping:

| Product state       | Engineering mode(s)                                                                                  | Meaning                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Activate Trial      | `free_trial_available`                                                                               | Account may start a trial. Requires backend status/action permission.                         |
| Active Account      | `active_trial`, `paid_active`                                                                        | Account currently has active billing access.                                                  |
| Pending             | `payment_pending`                                                                                    | Checkout, invoice request, payment, or Stripe/order status is still unresolved.               |
| Create Subscription | `trial_expired`, `no_billing`, selected `access_denied`/`unknown` fallbacks when creation is allowed | Account does not currently have active access and should be led toward subscription creation. |

Implementation rule:

```txt
Render from BillingUiMode first.
Use product states as copy/UX groupings, not as a parallel state enum.
```

If a dedicated product-level grouping is useful, expose it as a thin mapping from `BillingUiMode`, not from raw API fields.

## API field mapping

Use the real v1 field names from `AccountBillingSummaryV1` and `AccountBillingOrderDto`.

| Planning term                | API field(s)                                                                                                                                               | Current comparison rule                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active order                 | `activeOrder.isActive`, `activeOrder.OrderPaid`, `activeOrder.stripe_status`, `activeOrder.payment_status`, `billingStatus`, `accessStatus`, `currentPlan` | Use `hasPaidActiveOrder()` and `hasPaidPlanWithoutPendingOrder()` in `billing-state.ts`; do not compare a raw `order.active` field.                                          |
| Trial active                 | `trial.isActive`, `billingStatus`, `accessStatus`, `trial.endDate`                                                                                         | Use `isActiveTrial()` in `billing-state.ts`. Current engineering mode name is `active_trial`, not `trial_active`.                                                            |
| Trial available              | `billingStatus`, `availableActions.canStartTrial` or `availableActions.can_start_trial`                                                                    | Use `qualifiesFreeTrialAvailable()` via `deriveBillingUiMode()`. Missing/empty actions do not allow trial start.                                                             |
| Pending checkout/order       | `activeOrder.checkout_status`, `activeOrder.stripe_status`, `activeOrder.payment_status`, `latestInvoiceRequest.status`                                    | Use `hasPaymentPending()` via `deriveBillingUiMode()`. Statuses are normalised before comparison.                                                                            |
| Checkout status `inComplete` | `activeOrder.checkout_status`                                                                                                                              | Preserve backend casing in payloads, but compare through `normalizeBillingCode()`; `inComplete`, `incomplete`, and similar app-normalised forms should resolve consistently. |
| Ending/cancellation marker   | `activeOrder.cancel_at_period_end`                                                                                                                         | Marker/banner only; does not override an active primary state.                                                                                                               |
| Hosted invoice               | `activeOrder.hosted_invoice_url`, `activeOrder.invoice_pdf`, `activeOrder.invoice_number`                                                                  | Links/details only; not a manage-billing portal.                                                                                                                             |

## Precedence

The current resolver precedence in `deriveBillingUiMode()` is canonical:

```txt
1. payment_pending
2. paid_active
3. free_trial_available
4. active_trial
5. trial_expired
6. access_denied
7. no_billing
8. unknown
```

This precedence intentionally resolves mixed signals:

- Pending invoice request beats free-trial availability.
- Pending checkout/payment beats active paid display until the paid entitlement is confirmed.
- Paid entitlement beats free-trial eligibility.
- Trial active is shown only after paid and free-trial-start cases are ruled out.

If product wants a different precedence, change `billing-state.ts`, update `billing-state.test.ts`, then update this document.

## Invoice request interaction

Invoice request is part of Pending, not a separate primary product state.

Signals:

- `latestInvoiceRequest.status`
- `shouldShowInvoiceRequest()` in `billing-invoice-request.tsx`
- `INVOICE_REQUEST_PENDING_CODES` inside `billing-state.ts`
- `GET /billing/invoice-requests` for list/history if needed

Rules:

- A pending/submitted/processing/review invoice request maps to `payment_pending`.
- After submitting an invoice request, invalidate/refetch `GET /billing`.
- If the UI needs more than the latest invoice request, use `GET /billing/invoice-requests`.
- Do not create separate invoice-request entitlement logic outside `deriveBillingUiMode()`.

## Route model

Product route names:

```txt
/billing
/billing/create
/billing/history
```

Account-scoped app routes:

```txt
/o/{accountId}/billing
/o/{accountId}/billing/create
/o/{accountId}/billing/history
```

Do not create routes for wizard steps. The create-subscription wizard lives entirely inside `/o/{accountId}/billing/create`.

## Checkout return URLs

Current v1 standard is query-param return to the main billing route.

Canonical return patterns:

```txt
/o/{accountId}/billing?session_id={CHECKOUT_SESSION_ID}
/o/{accountId}/billing?checkout_session_id={CHECKOUT_SESSION_ID}
/o/{accountId}/billing?billing_checkout=success
/o/{accountId}/billing?billing_checkout=cancelled
```

`billing-checkout-return.ts` reads these markers. The billing page strips them from the URL and invalidates/refetches:

- `queryKeys.account.billing(accountId)`
- `queryKeys.account.billingAvailableTiers(accountId)`
- `queryKeys.account.billingInvoiceRequests(accountId)`

Dedicated routes such as these are optional future thin pages only:

```txt
/o/{accountId}/billing/checkout/success
/o/{accountId}/billing/checkout/cancelled
```

If implemented, they must immediately normalise to the canonical query-param/refetch flow or perform the same refetch/poll logic and redirect to `/o/{accountId}/billing`.

Do not change Stripe `success_url` / `cancel_url` to dedicated routes unless `billing-checkout-return-urls.md`, CMS config, and tests are updated together.

## `/o/{accountId}/billing`

This is the main billing route.

Responsibilities:

- Fetch `GET /billing`.
- Call `deriveBillingUiMode()`.
- Render from `BillingUiMode`.
- Render secondary markers such as `activeOrder.cancel_at_period_end`.
- Handle checkout return query markers.
- Refetch billing, tiers, and invoice requests after checkout return markers.
- Link to create subscription when allowed by the derived mode/actions.
- Link to history when implemented.
- Handle loading, empty, and API error states.

Mode rendering:

```txt
free_trial_available
- Trial activation card
- Trial details
- Activate trial button

active_trial
- Active Account product state
- Trial dates/details
- Subscription creation or invoice request actions where allowed

paid_active
- Active Account product state
- Active order summary
- Plan/tier
- Billing cadence if encoded by tier/backend data
- Hosted invoice links when present
- Ending banner if activeOrder.cancel_at_period_end is true

payment_pending
- Pending product state
- Pending checkout/payment/invoice summary
- Latest invoice request status if present
- Resume/return guidance based on available backend data

trial_expired / no_billing
- Create Subscription product state
- Create subscription action
- Invoice request action if allowed

access_denied / unknown
- Prefer explicit access-denied or support copy unless backend actions allow create/checkout
- Do not silently grant access
```

## `/o/{accountId}/billing/create`

This route is planned. It should be built as an in-page wizard.

Access guard:

- Use `deriveBillingUiMode()` from fresh `GET /billing`.
- If mode is `paid_active` or `active_trial`, redirect to `/o/{accountId}/billing`.
- If mode is `payment_pending`, redirect to `/o/{accountId}/billing` or show a resume/pending prompt.
- If mode is `free_trial_available`, redirect to `/o/{accountId}/billing` unless product explicitly allows skipping trial.
- Allow creation for `trial_expired` and `no_billing`, plus any future mode/action combination explicitly allowed by the backend.

Do not duplicate raw state checks in this route. Share the same resolver/helper used by the main billing page.

## Create-subscription wizard

The wizard is in-page. Do not create nested routes.

Current v1 checkout request:

```ts
type PostAccountBillingCheckoutRequest = {
  subscriptionTierId: string;
  startDate: string;
};
```

Current v1 checkout response:

```ts
type CreateCheckoutResponse = {
  checkoutSessionId: string;
  checkoutUrl?: string;
  orderId: string;
};
```

### Step 1: Select subscription tier

Goal:

- User chooses the subscription tier.

Data source:

```txt
GET /api/accounts/:accountId/billing/available-tiers
```

Output:

```ts
subscriptionTierId;
```

Notes:

- If cadence is encoded by separate tier rows or Stripe price IDs, the tier selection UI may visually group monthly/annual variants.
- Do not invent a separate `billingOption` API field in v1.

### Step 2: Select start date

Goal:

- User chooses when the subscription should begin.

Output:

```ts
startDate;
```

Validation:

- Must satisfy backend/business rules.
- Prefer backend-provided constraints over frontend-only assumptions.

### Step 3: Billing option / payment path

This step needs product/backend confirmation before implementation.

Current v1 facts:

- Card checkout only accepts `subscriptionTierId` and `startDate`.
- Invoice request uses a separate endpoint with billing contact/address fields.
- There is no v1 `billingOption` field on `POST /billing/checkout`.

Allowed v1 interpretation:

```txt
Billing option = choose payment path:
- Card checkout
- Invoice request, if shouldShowInvoiceRequest() allows it
```

If product means monthly vs annual cadence, backend must confirm one of:

- Monthly/annual are separate subscription tiers.
- Cadence is encoded in `subscription_items` or Stripe price data exposed on the tier.
- A future checkout request field will be added.

Until confirmed, do not send `billingOption` to `POST /billing/checkout`.

### Step 4: Review and create/start checkout

Goal:

- User reviews the selected tier, start date, and payment path.

For card checkout:

```ts
postBillingCheckout({
  subscriptionTierId,
  startDate,
});
```

Then:

```txt
1. Receive checkoutSessionId/orderId/checkoutUrl.
2. Redirect to checkoutUrl when present.
3. Stripe returns to /o/{accountId}/billing with canonical query markers.
4. Billing page refetches GET /billing.
5. Webhook-updated backend state determines Pending or Active Account.
```

Important:

- v1 does not define a separate "create draft order only" frontend step.
- The wizard should call `POST /billing/checkout`, not create a local pending state.
- The backend may create an incomplete order as part of checkout session creation, but the frontend observes it only through refetched `GET /billing`.

For invoice request:

```ts
postBillingInvoiceRequest({
  subscriptionTierId,
  requestedStartDate,
  billingContactName,
  billingEmail,
  billingOrganisationName,
  billingAddress,
  purchaseOrderNumber,
  notes,
});
```

Then:

```txt
1. Refetch GET /billing.
2. latestInvoiceRequest should appear.
3. deriveBillingUiMode() should resolve to payment_pending when status is pending/submitted/processing/review.
```

## Pending semantics

Product language:

```txt
New order started but not completed.
```

Engineering v1 language:

```txt
BillingUiMode.payment_pending
```

Signals include:

- Incomplete/open checkout.
- Pending Stripe status.
- Pending/unpaid/processing payment status.
- Pending/submitted/processing/review invoice request.

This broader v1 definition is intentional because the user-facing outcome is the same: billing is in progress and entitlement is not final.

## History route

Planned route:

```txt
/o/{accountId}/billing/history
```

Data reality:

- `GET /billing` v1 exposes only `activeOrder` and `latestInvoiceRequest`.
- Full order/subscription history is not present in `AccountBillingSummaryV1`.
- `GET /billing/invoice-requests` can provide invoice request history.

Minimum viable v1 history:

- Invoice request list from `GET /billing/invoice-requests`.
- Active order details from `GET /billing`, if present.
- Hosted invoice/PDF links from `activeOrder`, if present.

Future history needs a backend contract for:

- Orders list.
- Subscription lifecycle list.
- Cancellations.
- Payment attempts.
- Receipts/invoices beyond the active order.

Do not build rich order/subscription history until a list endpoint or expanded payload is confirmed.

## Manage billing

Stripe Customer Portal is deferred in v1.

Do not render "Manage billing" if it implies a portal flow unless an account-scoped endpoint exists.

Allowed v1 alternatives:

- Show read-only active order summary.
- Show hosted invoice link if `activeOrder.hosted_invoice_url` exists.
- Show invoice PDF link if `activeOrder.invoice_pdf` exists.
- Show contact/support guidance.
- Link to history once implemented.

## Secondary markers

Secondary markers decorate the primary mode. They are not standalone UI states.

### Ending banner

Use when:

```ts
activeOrder?.cancel_at_period_end === true;
```

Rules:

- Show only as a banner/notice.
- Do not override `paid_active`.
- Historical cancellations belong in history.

## Implementation quality bar

Resolver:

- Use one resolver for main billing, create guards, and any future checkout pages.
- Do not copy/paste raw field checks across screens.

Mutations:

- After `POST /billing/start-trial`, refetch `GET /billing`.
- After `POST /billing/checkout`, redirect to Stripe when `checkoutUrl` exists.
- After return from Stripe, invalidate/refetch billing, tiers, and invoice requests.
- After `POST /billing/invoice-requests`, refetch `GET /billing` and invoice requests.

Tests:

- Extend `billing-state.test.ts` for the product four-state groupings.
- Cover mixed-signal precedence: trial eligible + incomplete checkout, pending invoice + trial available, paid active + stale trial data.
- Cover normalised checkout statuses, including `inComplete`/`incomplete`.
- Cover inactive trial + inactive order mapping to create subscription grouping.
- Cover `cancel_at_period_end` as marker-only.

QA/release gates:

- Keep `staging-qa-checklist.md` updated.
- Keep `bill-0606-frontend-readiness-handoff.md` updated.
- Keep `frontend-billing-api-contract-handoff.md` aligned with any endpoint or route changes.
- Keep `billing-checkout-return-urls.md` aligned with CMS/Stripe return URL configuration.

## Open decisions

These must be resolved before implementing `/billing/create` fully:

1. Cadence selection: is monthly/annual represented by tier rows, tier metadata, `subscription_items`, or a future checkout request field?
2. Create flow: v1 assumes wizard review calls `POST /billing/checkout` and redirects to Stripe. Confirm there is no separate draft-order-only step.
3. History: confirm whether v1 history is invoice-request history only, or whether an orders/subscriptions list endpoint will be added.
4. Manage billing: confirm whether v1 should show hosted invoice/support only, or whether a Stripe Customer Portal endpoint will be added.
5. Checkout routing: keep query-param returns as canonical unless CMS/Stripe configuration is deliberately moved to dedicated success/cancel pages.
