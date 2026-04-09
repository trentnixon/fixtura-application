# CMS Onboarding Scorecard And Workplan

## Purpose

Provide a CMS-focused assessment of the current onboarding lifecycle from the Strapi side, including:

- current CMS score out of 100
- what the CMS is doing well
- what needs work
- what is still missing
- what the frontend needs from Strapi next

This document is intended for the Strapi / CMS side of the Fixtura onboarding flow.

---

## Executive Score

## CMS Score: 78 / 100

The CMS lifecycle model is ahead of the frontend enforcement layer. Strapi is already carrying most of the right concepts and endpoints, but a few operational and product-contract gaps still need to be closed before the onboarding journey is fully reliable end-to-end.

### Plain-language assessment

- The data model is in much better shape than the current user journey.
- The lifecycle contract is mostly strong.
- The remaining work is less about inventing the model and more about tightening operational behavior and adding the missing recovery actions.

---

## Scorecard

| Category                    | Score | Assessment                                                                                                      |
| --------------------------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| Lifecycle model             | 88    | Strong. Wizard completion and account readiness are now separated correctly.                                    |
| API contract clarity        | 82    | Good overall. The main app-facing endpoints exist and are documented.                                           |
| Resume and recovery support | 74    | Reasonable base. Retry exists, but delete and full recovery policy are still incomplete.                        |
| Background setup support    | 76    | Good direction, but worker/status alignment still needs operational confidence.                                 |
| App integration readiness   | 80    | Strong enough to support the intended frontend flow, assuming the app now consumes it properly.                 |
| Failure-state completeness  | 61    | Retry exists, but delete and support policy are still missing or unresolved.                                    |
| Operational confidence      | 68    | The model is good, but consistency across environments, backfills, and long-running jobs still needs attention. |

---

## What CMS Does Well

## 1. The lifecycle model is now fundamentally correct

Strapi now models onboarding as multiple milestones rather than one flat completion flag.

That includes:

- wizard status
- current step
- wizard completion
- initial setup status
- initial data fetch status
- account readiness via `isSetup`

Relevant references:

- [`.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md)
- [`.comms/onBoarding/app-open-questions-onboarding-lifecycle-v1.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-open-questions-onboarding-lifecycle-v1.md)

Why this is good:

- the backend now reflects real onboarding state instead of forcing the app to infer it
- setup and fetch work can run asynchronously without pretending the account is already usable

---

## 2. The key app-facing endpoints already exist

The CMS already supports the important lifecycle endpoints:

- `GET /api/accounts/:accountId/onboarding/onboarding-state`
- `GET /api/accounts/:accountId/onboarding/setup-status`
- `POST /api/accounts/:accountId/onboarding/retry-setup`
- existing onboarding step endpoints
- confirm endpoint

Why this is good:

- the frontend does not need backend invention for lifecycle-based gating
- the right shape for resume and setup polling is already present

---

## 3. The contract correctly treats `isSetup` as the readiness headline

This is one of the most important strengths in the CMS handoff.

The contract already states that:

- `hasCompletedOnboardingWizard` is not enough for dashboard access
- `isSetup` remains the main readiness flag

This is the right rule and should remain the canonical product rule.

---

## 4. Retry support already exists

The backend already includes a recovery path for failed setup:

- `POST .../retry-setup`

That is an important operational capability and reduces the need for manual intervention.

---

## What Needs Work

## 1. Delete-account support is still missing

### Current issue

The system does not yet appear to expose a supported account deletion or archive path for unfinished onboarding.

### Why this matters

Without delete support, users and support teams can be left with accounts that are:

- failed
- unwanted
- partially configured
- no longer worth recovering

### Needed CMS work

Add one supported action such as:

- `DELETE /api/accounts/:accountId`
- `POST /api/accounts/:accountId/delete`

### Recommended rule

Delete should only be allowed when:

- `isSetup === false`

### Recommended response behavior

Return:

- `200` or `204` on success
- `403` if delete is not allowed by policy
- `404` if account not found or not owned
- clear error code for invalid state, for example:
  - `ACCOUNT_DELETE_NOT_ALLOWED`

---

## 2. Failure-state policy needs to be tighter

### Current issue

Retry exists, but the full recovery policy is not yet complete.

Important questions that need final backend/product clarity:

- when is retry allowed
- when should delete be allowed
- when should support be the only path
- what exact failure states count as recoverable vs terminal

### Needed CMS work

Document and enforce the policy for:

- retryable failures
- non-retryable failures
- delete-eligible failures
- support-only failures

### Why this matters

The frontend should not have to guess whether a failed account should show:

- retry
- delete
- contact support

The CMS contract should make that decision predictable.

---

## 3. Worker-to-status alignment still needs operational confidence

### Current issue

The lifecycle docs already note that background workers may still be evolving in how they move fields between:

- `queued`
- `running`
- `completed`
- `failed`

### Why this matters

The app can only trust lifecycle gating if the status transitions are reliable.

If the worker state and the lifecycle payload drift apart, the app can:

- hold users too long in preparation
- expose retry too early or too late
- show confusing or stale readiness states

### Needed CMS work

Validate in each environment that:

- confirm moves setup into queued/running correctly
- retry resets failure fields and re-queues correctly
- terminal success produces `isSetup === true`
- terminal failure produces consistent failure fields

### Recommendation

Treat this as an operational verification stream, not just a code stream.

---

## 4. Endpoint semantics for frontend routing should be explicit

### Current issue

The lifecycle contract is good, but there is still some room for ambiguity in how the app should interpret certain failure or transition combinations.

### Needed CMS work

Clarify and keep stable:

- whether `onboarding-state` is the authoritative bootstrap route resolver
- whether `setup-status` is purely polling-friendly and should not be used as the primary bootstrap source
- whether any states can momentarily disagree after confirm or retry
- what the frontend should consider terminal vs in-progress vs failed

### Recommended rule set

- `onboarding-state` is the bootstrap and resume source of truth
- `setup-status` is the lightweight polling source
- `isSetup === true` is the only dashboard-ready condition

---

## 5. Account summary payload strategy may need future improvement

### Current issue

The current app still uses `GET /api/account/me` for account listing and then must fetch onboarding-state per selected account.

That is acceptable, but it may be inefficient or ambiguous for account-selection UX if the selector wants richer readiness indicators.

### Optional CMS enhancement

In future, consider including a compact lifecycle summary on each account row in `/api/account/me`, such as:

- `onboardingWizardStatus`
- `isSetup`
- `initialSetupStatus`

### Important caveat

This is optional.

It should not replace `onboarding-state` as the decision authority.

---

## What Is Missing

## Missing CMS capabilities

- delete-account or archive-unfinished-account endpoint
- explicit delete eligibility rules
- explicit retry/delete/support recovery matrix
- stronger environment validation for worker-to-status consistency
- clearer app-facing failure semantics for difficult edge states

## Missing operational guarantees

- confirmed backfill completion across all target environments
- confidence that old accounts do not sit in partial lifecycle states
- confidence that confirm and retry become visible quickly enough for frontend polling assumptions

---

## What The Frontend Needs From CMS

The frontend now needs the CMS side to be explicit and stable in the following areas.

## 1. Readiness rule

Keep this rule stable:

- only `isSetup === true` means account ready for dashboard

This should remain the primary readiness signal.

## 2. Recovery rule

Expose a consistent recovery policy:

- retry when failed and retryable
- delete when failed or unfinished and delete-eligible
- support-only when neither retry nor delete should be shown

## 3. Delete path

Provide a supported API for account deletion or archival during onboarding failure or abandonment.

## 4. Environment confidence

Confirm that lifecycle endpoints behave consistently in:

- development
- staging
- production

## 5. Stable failure codes

Use stable backend error codes so the app can render correct UX without relying on fragile string matching.

Examples:

- `RETRY_NOT_ALLOWED`
- `ACCOUNT_DELETE_NOT_ALLOWED`
- `ACCOUNT_NOT_FOUND`
- `ONBOARDING_RESTART_BLOCKED`

---

## CMS Workstreams

## Workstream 1: Add delete-account capability

### Goal

Allow the app and support workflows to remove unfinished accounts cleanly.

### Tasks

1. Define delete or archive behavior
2. Decide eligibility rule
3. Implement endpoint
4. Return stable success and error codes
5. Document the contract for frontend consumption

### Recommendation

Use:

- `isSetup === false`

as the main deletion eligibility guardrail.

---

## Workstream 2: Formalize recovery-state policy

### Goal

Give the app a deterministic contract for failure handling.

### Tasks

1. Define which states are retryable
2. Define which states are delete-eligible
3. Define which states should show support-only messaging
4. Encode those rules in endpoint semantics and error codes

### Result

The frontend can render the correct next action without inventing business logic.

---

## Workstream 3: Verify lifecycle-worker consistency

### Goal

Ensure worker execution and lifecycle fields stay aligned in real environments.

### Tasks

1. Test confirm flow through queued/running/completed
2. Test failure flow through failed state
3. Test retry flow after failed setup
4. Confirm final successful state sets `isSetup === true`
5. Check for stale or inconsistent fields after backfills and migrations

### Result

The app can trust the lifecycle payloads as an operational control surface.

---

## Workstream 4: Tighten integration contract language

### Goal

Remove ambiguity between frontend and CMS teams.

### Tasks

1. Re-state the canonical readiness rule
2. Re-state bootstrap vs polling endpoint responsibilities
3. Document delete flow once available
4. Document failure-state action mapping
5. Keep app handoff docs aligned with real controller behavior

---

## Priority Order

## Immediate

1. Confirm readiness rule remains `isSetup === true`
2. Verify lifecycle transitions are reliable after confirm and retry
3. Finalize delete-account product and API contract

## Next

4. Implement delete endpoint
5. Publish stable recovery-state rules and error codes
6. Validate environment consistency and backfill status

## Later

7. Consider compact lifecycle hints on `/api/account/me`

---

## Risk Register

## Risk 1

The app gates correctly, but backend lifecycle fields are stale or inconsistent.

### Severity

High

### Mitigation

Environment-level verification of worker transitions and payload outputs

---

## Risk 2

Failed onboarding has retry but no clean exit path.

### Severity

High

### Mitigation

Add delete-account support for unfinished accounts

---

## Risk 3

Frontend and CMS use slightly different interpretations of readiness and recovery states.

### Severity

Medium to high

### Mitigation

Keep readiness, polling, retry, and delete rules explicit in the contract

---

## Recommended CMS Acceptance Standard

The CMS side of onboarding should be considered complete when:

1. `onboarding-state` is stable and authoritative for bootstrap and resume
2. `setup-status` is reliable for polling
3. `isSetup === true` remains the only dashboard-ready condition
4. retry behavior is stable and documented
5. delete behavior exists and is documented
6. failure-state action rules are explicit
7. behavior is verified in all target environments

---

## Final CMS Assessment

The CMS side is in better shape than the app side.

That is a good sign.

It means the main backend challenge is not rethinking the lifecycle model. The main backend challenge is finishing the operational and recovery contract so the frontend can consume it safely and predictably.

### Final interpretation of the CMS score

`78 / 100` means:

- the model is strong
- the key lifecycle endpoints are already in place
- the major remaining gaps are recovery completeness and operational confidence

---

## Related Documents

- [`ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md)
- [`.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md)
- [`.comms/onBoarding/app-open-questions-onboarding-lifecycle-v1.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/onBoarding/app-open-questions-onboarding-lifecycle-v1.md)
