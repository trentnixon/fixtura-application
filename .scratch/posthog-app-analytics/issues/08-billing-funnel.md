# 08 — Billing and subscription funnel

**What to build:** Full revenue funnel events for trial start, Season Pass checkout, Stripe return handling, and invoice requests.

**Blocked by:** 02 — Identity lifecycle (shipped)

**Status:** ready-for-agent

**Related:** `phase-2-plan.md` (Q4 billing depth)

## Events

| Event                                        | Properties                                  | Trigger                                                       |
| -------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `conversion` `trial_started`                 | `accountId`                                 | Trial confirm dialog success                                  |
| `conversion` `subscription_checkout_started` | `accountId`, `tier_id`, `payment_path`      | Before `window.location.assign(checkoutUrl)` in create wizard |
| `conversion` `billing_checkout_return`       | `accountId`, `result`, `session_id_present` | `useBillingOverviewLifecycle` when checkout return detected   |
| `conversion` `invoice_requested`             | `accountId`                                 | Invoice request submit success in create wizard               |

## Tasks

### Phase 1: Trial

- [ ] `useBillingTrialStart.ts` — after `mutation.mutateAsync()` succeeds in `confirmStartTrial`, capture `trial_started`

### Phase 2: Create subscription wizard

- [ ] `create-subscription-wizard.tsx` — before Stripe redirect (~line 393), capture `subscription_checkout_started` with `tier_id: selectedTierId`, `payment_path: 'card'`
- [ ] Same file — on `invoiceMutation.mutateAsync` success, capture `invoice_requested` with `payment_path: 'invoice'` on checkout_started if fired at invoice path start instead (pick one consistent point per path)

### Phase 3: Checkout return

- [ ] `useBillingOverviewLifecycle.ts` — when `readBillingCheckoutReturnOutcome` returns non-null, capture `billing_checkout_return` with `result: 'success' | 'cancelled'` and `session_id_present: searchParams.has('session_id')` (boolean only)
- [ ] Guard with existing `stripeReturnSignatureRef` to avoid duplicate capture

### Phase 4: Catalog & tests

- [ ] Update `.comms/handoff/analytics-app-events.md`
- [ ] Extend `billing-content.test.tsx` or lifecycle test with mocked capture if feasible

## Constraints

- Never send Stripe checkout URLs, session IDs as values, or billing contact email/name
- `tier_id` is internal subscription tier id string from CMS
- Support read-only billing: no capture when actions are gated

## Completion criteria

- Trial start → `trial_started`
- Card checkout redirect → `subscription_checkout_started`
- Return from Stripe → `billing_checkout_return` with correct `result`
