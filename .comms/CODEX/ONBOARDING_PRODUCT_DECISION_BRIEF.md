# Onboarding Product Decision Brief

## Purpose

Turn the current onboarding analysis into a short decision document for product, app, and CMS stakeholders.

This document focuses on:

- the rules that should govern onboarding
- the decisions that still need sign-off
- the operational outcomes required for release confidence

---

## Current Position

Fixtura now has a stronger onboarding lifecycle model than it has route enforcement.

In practical terms:

- the CMS lifecycle design is mostly correct
- the app has most of the required pieces
- the live route flow still allows unfinished accounts too far into the product

The main decision now is not whether the lifecycle model is right.

The main decision is whether stakeholders agree to fully enforce it.

---

## Recommended Product Rules

These should be treated as the final product rules unless stakeholders explicitly choose otherwise.

## Rule 1: Dashboard access requires account readiness

The dashboard and all scoped organisation routes should only be available when:

- `isSetup === true`

This should be the single product rule for account readiness.

### Implication

- wizard completion alone is not enough
- users may finish onboarding form steps but still remain outside the dashboard until setup is complete

---

## Rule 2: Account selection must resolve lifecycle before navigation

When a user selects an organisation from `/select-organisation`, the system should first resolve:

- `GET /api/accounts/:accountId/onboarding/onboarding-state`

Then route the user based on lifecycle state.

### Implication

Selecting an account should no longer blindly open the dashboard.

---

## Rule 3: Unfinished accounts must return to onboarding recovery

If an account is not fully ready, the user should be directed to:

- onboarding wizard if not started or in progress
- setup/preparation screen if wizard is complete but setup is still running
- failure recovery screen if setup has failed

### Implication

There should be no “half-entered” dashboard state for unfinished accounts.

---

## Rule 4: Failed onboarding must provide a next action

When onboarding fails, the user must not be left in an ambiguous state.

The system should offer one or more of:

- `Retry setup`
- `Delete account`
- `Contact support`

### Implication

Failure states must be product-defined, not ad hoc.

---

## Rule 5: Deep links must obey the same readiness rules

If a user attempts to open:

- `/o/[accountId]/dashboard`
- `/o/[accountId]/settings`
- any other scoped route

for an unfinished account, they should be redirected back into onboarding recovery.

### Implication

Readiness must be enforced at the route layer, not only during happy-path account selection.

---

## Decisions Requiring Sign-off

These are the key stakeholder decisions still needing a clear yes/no answer.

## Decision 1: Is `isSetup === true` the only dashboard-ready condition?

### Recommendation

Yes.

### Why

This preserves the distinction between:

- wizard complete
- account operationally ready

### Sign-off needed from

- Product
- App team
- CMS team

---

## Decision 2: Should users ever enter the scoped app before `isSetup === true`?

### Recommendation

No.

### Why

Allowing unfinished accounts into the scoped app creates:

- confusing UX
- inconsistent state expectations
- higher support cost

### Sign-off needed from

- Product

---

## Decision 3: Where should setup/preparation UI live?

### Recommendation

Keep preparation and recovery in the gateway layer first.

Suggested route style:

- `/create-organisation/setup?accountId=:id`

### Why

This keeps unfinished accounts outside the full scoped app shell until they are actually ready.

### Sign-off needed from

- Product
- App team

---

## Decision 4: When should delete account be allowed?

### Recommendation

Allow delete only when:

- `isSetup === false`

### Optional tighter policy

Delete is shown only when:

- setup failed, or
- onboarding is incomplete and the user explicitly wants to abandon it

### Sign-off needed from

- Product
- CMS team

---

## Decision 5: What failure actions should the UI show?

### Recommendation

Use this order:

1. `Retry setup` when failure is retryable
2. `Delete account` when deletion is allowed
3. `Contact support` when neither retry nor delete is appropriate

### Sign-off needed from

- Product
- CMS team
- Support / operations if applicable

---

## Decision 6: Should `/api/account/me` expose richer onboarding hints in future?

### Recommendation

Optional, not required now.

If added later, it should remain summary-only and should not replace:

- `onboarding-state`

as the route decision source.

### Sign-off needed from

- App team
- CMS team

---

## Required Outcomes For Release Confidence

These are the outcomes that should exist before onboarding is considered controlled and release-safe.

## Outcome 1

No account can enter the dashboard unless `isSetup === true`

## Outcome 2

Account selection resolves lifecycle before navigation

## Outcome 3

Users can resume onboarding cleanly when not started or in progress

## Outcome 4

Users see setup/preparation UI after confirm while backend setup is still running

## Outcome 5

Users get a clear failure recovery path

## Outcome 6

Deep links cannot bypass readiness rules

## Outcome 7

Delete-account behavior is defined and implemented, or explicitly postponed with an accepted temporary fallback

---

## Recommended Temporary Fallback If Delete Is Delayed

If delete-account is not ready yet, stakeholders should explicitly accept the temporary fallback:

- show `Retry setup`
- show support messaging
- do not expose dashboard access

This fallback is acceptable temporarily, but it is not a complete long-term recovery experience.

---

## Recommended Delivery Sequence

## First

1. Enforce route readiness using `isSetup`
2. Add setup/preparation route
3. stop dashboard entry on wizard completion alone

## Second

4. Wire failure recovery UX
5. centralize lifecycle route resolution
6. add lifecycle route tests

## Third

7. Add delete-account support
8. finalise support and operational policy

---

## Stakeholder Sign-off Questions

These are the short questions that should be answered explicitly.

1. Do we agree that `isSetup === true` is the only dashboard-ready condition?
2. Do we agree that wizard completion alone must not open the dashboard?
3. Do we agree that unfinished accounts should remain in the gateway flow, not the scoped app shell?
4. Do we agree that setup failure must offer a defined recovery path?
5. Do we agree that delete-account should be supported for unfinished accounts?
6. If delete is delayed, do we accept retry-plus-support as the temporary fallback?

---

## Final Recommendation

Stakeholders should approve the stricter onboarding model and treat it as the release rule:

```text
Account selected
-> resolve onboarding lifecycle
-> if ready: dashboard
-> if unfinished: onboarding recovery
-> if failed: retry/delete/support
```

This is the clearest, safest, and most supportable model for the Fixtura members onboarding journey.

---

## Related Documents

- [`ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md)
