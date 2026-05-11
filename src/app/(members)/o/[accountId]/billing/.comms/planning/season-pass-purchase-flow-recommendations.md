# Season Pass Purchase Flow Recommendations

Date: 2026-05-09
Status: Planning / implementation brief
Route: `/o/{accountId}/billing` and `/o/{accountId}/billing/create`

## Purpose

This document captures the recommended product, UX, engineering, and QA work needed to move the billing Season Pass purchase flow from functional implementation to release-polished experience.

Target outcome:

```txt
Users can purchase a Season Pass by selecting:
1. Timeframe / pass option
2. Start date
3. Payment method
```

The current implementation is already close: the create wizard supports tier selection, start date selection, card checkout, invoice request, and review. The main gaps are clarity, consolidation, release confidence, and a few missing user-facing states.

## Current State Summary

The production billing overview route loads billing status and directs eligible users into the create flow.

Key surfaces:

- `/o/{accountId}/billing`
- `/o/{accountId}/billing/create`
- `/o/{accountId}/billing/history`

Current purchase flow:

```txt
Step 1: Select subscription tier
Step 2: Select subscription start date
Step 3: Select payment path, when both card and invoice are available
Step 4: Review and pay / submit invoice request
```

Current strengths:

- Billing state is resolved centrally through `deriveBillingUiMode`.
- Checkout and invoice request APIs are already wired through the account-scoped BFF.
- Stripe return handling is implemented on the billing overview route.
- The wizard already uses real tier data, start date, payment path, and review data.
- Tests cover many state and pending-payment edge cases.

## Main Problems To Solve

### 1. Product Polish And Consolidation

Problem:

There are older/simple checkout components under `plan-checkout`, while the active purchase experience appears to be the newer `/billing/create` wizard. This creates conceptual duplication and makes it harder to know which path should own future work.

Recommendation:

Make `/billing/create` the canonical Season Pass purchase flow and explicitly retire or repurpose the older `plan-checkout` surface.

Implementation notes:

- Audit all imports of `BillingPlanCheckout`.
- If unused, either remove it or mark it as legacy/internal with a clear comment.
- Move any useful small utilities from `plan-checkout` into shared create-flow utilities if still needed.
- Keep one product path for purchase: billing overview CTA -> create wizard -> Stripe/invoice -> billing overview/history.

Acceptance criteria:

- There is one documented canonical purchase flow.
- No user-facing route renders both old and new purchase UI patterns.
- Future work knows whether to edit `/billing/create` or shared billing utilities.

### 2. Text Encoding Defects

Problem:

The wizard contains mojibake such as:

```txt
Redirecting mojibake
Starting checkout mojibake
Broken dash mojibake
Broken middle-dot mojibake
```

These should display as normal punctuation or ASCII equivalents. Current output will look broken to users.

Recommendation:

Replace corrupted characters with repo-safe display strings.

Preferred replacements:

```txt
Redirecting...
Starting checkout...
-
.
Payment recorded - you can return to billing.
```

Implementation notes:

- Search the billing feature for mojibake patterns and replacement characters.
- Replace with ASCII unless the file already intentionally uses Unicode.
- Add a small lint/check script later if this keeps recurring after copied docs or generated content.

Acceptance criteria:

- No visible corrupted punctuation remains in the billing create wizard.
- Billing create, overview, history, and pending banners render cleanly.

### 3. Wizard Size And State Complexity

Problem:

`create-subscription-wizard.tsx` is large and owns data loading, redirects, step state, payment submission, invoice submission, staff-only invoice generation, polling, layout, and debug state in one component. It works, but the file is difficult to maintain and risky to change.

Recommendation:

Refactor the wizard into a small orchestrator plus focused step components/hooks.

Suggested structure:

```txt
billing/create/
  create-subscription-wizard.tsx
  _components/
    CreateWizardProgress.tsx
    SelectTimeframeStep.tsx
    SelectStartDateStep.tsx
    SelectPaymentMethodStep.tsx
    ReviewCardPaymentStep.tsx
    ReviewInvoiceRequestStep.tsx
    StaffImmediateInvoicePanel.tsx
  _hooks/
    useCreateSubscriptionWizard.ts
    useCreateSubscriptionCheckout.ts
    useCreateSubscriptionInvoiceRequest.ts
    useStaffImmediateStripeInvoice.ts
  _utils/
    createSubscriptionWizardState.ts
```

Implementation notes:

- Keep the existing behavior first; refactor before adding larger new features.
- Preserve `deriveBillingUiMode` as the guard source.
- Keep mutation side effects in hooks and UI in components.
- Keep dev/debug panel, but feed it a smaller serializable state object.

Acceptance criteria:

- The main wizard component primarily coordinates route state and renders step components.
- Card checkout, invoice request, and staff immediate invoice logic are isolated.
- Existing tests still pass, with new unit tests for extracted state helpers where useful.

### 4. Backend / Staging Confirmation

Problem:

The readiness handoff marks engineering criteria as done, but formal sign-off is blank and the staging QA checklist is not completed. This means the feature is implemented but not release-confirmed.

Recommendation:

Treat staging QA and sign-off as a release blocker for billing changes.

Required checks:

- Stripe Checkout success returns to billing and refreshes state.
- Stripe Checkout cancel returns to billing and does not show false paid state.
- Invoice request submission updates latest invoice request / pending state.
- Cross-account access is denied safely.
- Mobile layout is readable.
- No customer portal CTA appears unless Product deliberately enables it.
- Staff immediate Stripe invoice is tested only for eligible staff users.

Acceptance criteria:

- `staging-qa-checklist.md` is completed for the current release.
- `bill-0606-frontend-readiness-handoff.md` sign-off table is filled or linked to release approval.
- Any failed QA items are converted into tracked tickets before release.

## Missing Core Features

### 1. Explicit Timeframe Selection

Problem:

The user goal asks users to select a timeframe. Today, timeframe is implied by subscription tier metadata such as `daysInPass`. That may be technically correct, but it is not product-clear.

Recommendation:

Rename/reframe Step 1 around Season Pass timeframe, not just subscription tier.

Possible UX:

```txt
Step 1: Choose Season Pass

[365-day Season Pass]
Coverage: 365 days
Starts: selected in next step
Total: $...
Per week: $...

[Other available pass duration]
Coverage: ...
```

If backend provides monthly/annual variants as separate tiers, visually group them under timeframe/cadence. If backend does not expose cadence, do not invent a new checkout field; make the tier card explain the included duration.

Implementation notes:

- Use `daysInPass`, price, and `priceByWeekInPass` to create clear timeframe labels.
- Consider `SelectTimeframeStep` as the renamed/extracted Step 1.
- Add empty/fallback copy for tiers that do not include duration metadata.

Acceptance criteria:

- Users can understand the pass duration before selecting it.
- The selected review screen clearly shows timeframe/coverage.
- No new API field is sent until backend confirms one.

### 2. Cadence / Monthly-Annual Selector

Problem:

There is no clear monthly/annual/cadence selector unless those options are represented as distinct backend tier rows.

Recommendation:

Confirm the backend model before building a cadence control.

Decision required:

```txt
Does cadence come from:
1. Separate subscription tier rows?
2. Tier metadata / Stripe price metadata?
3. A future checkout request field?
```

Implementation guidance:

- If cadence is separate tier rows, group tiers visually by cadence.
- If cadence is tier metadata, expose a filtered segmented control.
- If cadence requires a future checkout field, wait for API contract update.
- Do not send a local `billingOption`, `cadence`, or `timeframe` field to `POST /billing/checkout` until the BFF/CMS contract supports it.

Acceptance criteria:

- Product and backend agree how cadence/timeframe is represented.
- UI labels match the actual API behavior.

### 3. Payment Method Wording When Only One Path Exists

Problem:

When only card or invoice is allowed, the wizard skips the payment path step. This is efficient, but users may not explicitly see what payment method will be used until review.

Recommendation:

Always show payment method clearly, even if there is only one available option.

Possible UX:

- If both are available: show Step 3 selection.
- If only one is available: show a compact locked payment method summary before review.

Example:

```txt
Payment method
Card via Stripe Checkout
This is the only payment method currently available for this account.
```

Acceptance criteria:

- Review step always names the payment method/path.
- Single-path accounts do not feel like payment choice disappeared.
- If a method is unavailable, optional support copy explains why where possible.

## Nice-To-Have Improvements

### 1. Cleaner Progress Indicator

Recommendation:

Add a dedicated wizard progress component.

Requirements:

- Show four steps with current/completed/upcoming states.
- Collapse cleanly on mobile.
- Do not rely only on `Step {step} of 4` at the bottom.
- Use accessible labels for current step.

### 2. Mobile QA / Dense Review Polish

Recommendation:

Run mobile viewport QA specifically on:

- Tier cards
- Calendar step
- Card review step
- Invoice review form
- Staff invoice panel, if visible

Likely improvements:

- Reduce overly large uppercase button text on narrow screens.
- Ensure review card columns stack cleanly.
- Keep totals and selected plan labels readable without overflow.
- Avoid excessive card nesting and heavy shadows if it feels cramped.

### 3. Clear Season Pass Explanation

Recommendation:

Add concise product copy before or within Step 1 explaining what a Season Pass includes.

Copy should answer:

- What does the pass cover?
- How long does it last?
- When does coverage start?
- What happens after payment?

Keep it short and attached to the purchase decision, not a marketing landing section.

### 4. Invoice Request Confirmation Screen

Problem:

After invoice request submission, the user is redirected back to billing immediately. That is functional, but it can feel abrupt.

Recommendation:

Show a confirmation state after successful invoice request submission, then offer:

- Back to billing
- View billing history

Acceptance criteria:

- User sees clear confirmation that the invoice request was submitted.
- Billing state is still invalidated/refetched.
- The latest request appears on billing/history after returning.

### 5. Payment Retry Guidance

Recommendation:

Improve failure and pending states with clear next actions:

- Resume Stripe checkout when available.
- Discard abandoned pending checkout when allowed.
- Withdraw invoice request when allowed.
- Contact support if backend state blocks self-service.

Acceptance criteria:

- Failed checkout/payment states do not dead-end.
- Error messages separate user-fixable problems from service/support problems.

### 6. Admin / Support Availability Notes

Recommendation:

When plans or payment paths are unavailable, show safe, non-sensitive guidance.

Examples:

```txt
No card checkout is available for this account right now.
Contact support if you expected to purchase online.
```

```txt
Invoice requests are not enabled for this organisation.
```

Do not expose internal permission names or cross-account details to normal users.

### 7. End-To-End Tests

Recommendation:

Add E2E coverage for the full wizard path using mocked BFF responses or a staging-safe test setup.

Suggested scenarios:

- No billing -> create -> select pass -> select date -> card checkout redirect attempted.
- No billing -> create -> select pass -> select date -> invoice request submitted -> confirmation.
- Only card available -> payment method is still visible in review.
- Only invoice available -> payment method is still visible in review.
- Pending payment -> create route redirects back to billing.
- Paid active -> create route redirects back to billing.

## Proposed Delivery Plan

### Phase 1: Polish And Confidence - implementation done

Goal: fix obvious user-facing quality issues without changing product behavior.

Tasks:

- [x] Fix mojibake/encoding strings.
- [x] Add payment method wording on review for single-path flows.
- [x] Add clear Season Pass duration/coverage copy to Step 1 and review.
- [x] Add Phase 1 purchase-flow checks to the staging QA checklist.
- [ ] Execute the staging QA checklist against staging accounts and record Pass / Fail / N/A.

Suggested priority: High.

### Phase 2: Consolidate And Refactor - implementation done

Goal: make the implementation easier to maintain before adding more purchase options.

Tasks:

- [x] Declare `/billing/create` canonical.
- [x] Audit/remove or deprecate old `plan-checkout` UI.
- [x] Extract wizard step components and hooks.
- [x] Preserve existing tests and add helper tests for extracted state logic.

Suggested priority: High.

#### Phase 2 Required Work

Required outcome:

```txt
The Season Pass create flow has one canonical implementation path, and the wizard is split into maintainable components/hooks without changing current behavior.
```

Required implementation:

- Confirm `/o/{accountId}/billing/create` is the canonical Season Pass purchase route.
- Audit `BillingPlanCheckout` and `plan-checkout` imports/usages.
- Decide whether `plan-checkout` should be removed, kept as legacy, or reduced to shared utilities only.
- Extract step UI from `create-subscription-wizard.tsx` into focused components:
  - `SelectTimeframeStep`
  - `SelectStartDateStep`
  - `SelectPaymentMethodStep`
  - `ReviewCardPaymentStep`
  - `ReviewInvoiceRequestStep`
  - `StaffImmediateInvoicePanel`, if keeping the staff-only tool in this flow
- Extract wizard state/submission behavior into hooks or small utilities:
  - route/billing guard state
  - selected tier and coverage display state
  - card checkout submit state
  - invoice request submit state
  - staff immediate Stripe invoice state
- Keep `deriveBillingUiMode` as the only billing-mode guard source.
- Keep the same user-visible behavior while refactoring.
- Update or add focused tests for any extracted non-trivial helpers.
- Run formatting, lint, and typecheck after the refactor.

Phase 2 acceptance criteria:

- `create-subscription-wizard.tsx` becomes a thin orchestrator instead of owning all UI and side effects inline.
- The active purchase path is documented as `/billing/create`.
- There is no confusing user-facing duplication between `plan-checkout` and the create wizard.
- Existing card checkout and invoice request behavior still works.
- Existing billing tests pass, and any new helper logic has targeted test coverage.

### Phase 3: Timeframe Display Refinement

Goal: make the fixed Season Pass timeframe obvious without adding a redundant cadence selector.

Product decision:

```txt
There are only three Season Pass tiers:
1. 1 month
2. 3 months
3. 12 months
```

The selected tier already contains the pass duration. The subscription window should be derived
from:

```txt
selected start date + selected tier daysInPass
```

Do not add a separate monthly/annual/cadence selector unless the product model changes.

Tasks:

- Ensure the three fixed tiers are labelled clearly as 1 month, 3 months, and 12 months.
- Show the derived subscription window in review: start date through calculated end date.
- Keep Step 1 as tier selection; do not add another timeframe/cadence control.
- Add/update helper tests for timeframe/end-date display where useful.

Suggested priority: Low-medium, because the main selection model is already correct.

### Phase 4: Post-Purchase And Recovery UX

Goal: reduce user uncertainty after invoice/checkout events.

Tasks:

- Add invoice request confirmation state.
- Improve payment retry/pending guidance.
- Add support notes for unavailable plan/payment actions.
- Consider future manage-billing/customer-portal work only after API contract is confirmed.

Suggested priority: Medium.

### Phase 5: E2E Coverage

Goal: protect the purchase funnel.

Tasks:

- Add E2E tests for card and invoice paths.
- Add route-guard tests for paid/pending/trial-available states.
- Add mobile screenshot checks if the local tooling supports it.

Suggested priority: Medium.

## Open Product / Backend Questions

1. Is “timeframe” intended to mean pass duration, billing cadence, or both?
2. Are monthly/annual options separate subscription tiers, tier metadata, or a future checkout parameter?
3. Should users be allowed to skip a free trial and purchase immediately?
4. Should invoice request success show an in-wizard confirmation screen or always return to billing?
5. Should unavailable payment methods show generic support copy, or should the backend return a safe reason?
6. Is Stripe Customer Portal still deferred for this release?

## Recommended Definition Of Done

The Season Pass purchase flow should be considered release-ready when:

- A user can clearly select a pass/timeframe, start date, and payment method.
- Single-method flows still clearly identify the payment method.
- The wizard has no visible text encoding defects.
- `/billing/create` is the documented canonical purchase path.
- Staging QA checklist is completed.
- Stripe success/cancel and invoice request paths are verified.
- Mobile layout is checked for tier selection, date selection, and review screens.
- E2E or equivalent regression coverage exists for card and invoice happy paths.
