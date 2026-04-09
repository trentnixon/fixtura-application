# Onboarding Scorecard Post-Epics

## Purpose

Reassess the Fixtura onboarding flow after completion of Epics 1 through 7.

This document updates the earlier onboarding scorecards and focuses on:

- current score out of 100
- what the onboarding flow now does well
- what has materially improved
- what still needs work
- what further improvements are worth considering

---

## Executive Score

## Updated Overall Score: 88 / 100

The onboarding system has moved from a promising but partially enforced architecture to a mostly production-ready lifecycle flow.

### Plain-language assessment

- The app now enforces the lifecycle rules it previously only documented.
- Recovery is materially stronger and more deliberate.
- The CMS and app are now aligned enough that onboarding behaves like a controlled product flow rather than a loose collection of states.
- Remaining work is mostly refinement, observability, and operational hardening rather than foundational correction.

---

## Scorecard

| Category                                  | Previous | Current | Assessment                                                                         |
| ----------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------- |
| Lifecycle model and contract              | 85       | 91      | Strong and now properly exercised by the app.                                      |
| Frontend onboarding wizard                | 74       | 88      | Wizard resume, post-confirm routing, and delete gating are now much more coherent. |
| Route gating and access control           | 42       | 92      | Biggest improvement. Lifecycle is now enforced before scoped app entry.            |
| Recovery and resume UX                    | 55       | 86      | Retry, delete gating, preparation flow, and clearer next actions are now in place. |
| Setup progress and background preparation | 68       | 87      | Preparation flow is live and connected to setup-status and onboarding-state.       |
| CMS readiness and API shape               | 78       | 88      | Epic 6 closed the main recovery contract gaps needed by the app.                   |
| Operational completeness                  | 46       | 81      | Much stronger now, with QA docs and sign-off structure in place.                   |
| Product clarity in code                   | 60       | 89      | The code now reflects the product rules much more consistently.                    |

---

## What We Are Doing Well Now

## 1. Lifecycle enforcement is now real

This is the single biggest improvement.

The system now routes accounts by actual lifecycle state instead of assuming dashboard access too early.

That means:

- account selection resolves onboarding state first
- deep links into `/o/[accountId]/...` are lifecycle-gated
- wizard completion alone no longer unlocks the dashboard
- only `isSetup === true` opens the scoped app

This is a major maturity improvement over the earlier state.

---

## 2. The route architecture is now behaving as designed

The app’s three-layer route model is no longer just a design concept.

It now works operationally as:

- public layer
- authenticated gateway layer
- authenticated scoped app layer

This matters because multi-organisation onboarding only works cleanly when:

- authentication
- account selection
- account readiness

are treated as separate stages.

That separation is now much clearer in both routing and user flow.

---

## 3. The onboarding wizard is much more correct

The wizard now respects the distinction between:

- form completion
- account readiness

This was one of the biggest product correctness gaps before.

What is now better:

- resume works for incomplete onboarding
- wizard-complete but unready accounts go to preparation
- delete is restricted to incomplete-wizard states
- retry is reserved for setup-failure states

That makes the recovery model much cleaner.

---

## 4. Recovery behavior is now significantly stronger

The system now has a clearer recovery story:

- retry for failed setup where allowed
- delete for unfinished accounts where allowed
- blocked-delete messaging
- no delete on the preparation screen when CMS forbids it

This is much closer to a supportable production flow.

Previously, the codebase had fragments of recovery behavior. Now it has a much more coherent recovery policy.

---

## 5. The app and CMS are better aligned

One of the strongest signals of improvement is that the app-side logic now follows the CMS contract more closely.

That includes:

- `isSetup` as the readiness rule
- retry/delete policy separation
- error-code-driven behavior
- BFF pass-through handling for lifecycle and delete responses

This reduces hidden assumptions and makes the system easier to reason about.

---

## 6. QA structure is now much more serious

The addition of Epic 7 materials is a meaningful improvement.

You now have:

- frontend route-flow QA guidance
- CMS lifecycle-state QA guidance
- recovery-path QA guidance
- a sign-off document tying them together

That is a step up from having only implementation logic and no structured verification path.

---

## What Improved The Most

## Biggest jump: route gating

This moved from one of the weakest areas to one of the strongest.

Before:

- account rows linked too directly into the dashboard
- scoped routes only checked ownership
- onboarding readiness was not truly enforced

Now:

- lifecycle routing happens before scoped entry
- unfinished accounts are redirected correctly
- the dashboard boundary matches the product rule

This is the largest single quality gain in the onboarding system.

---

## Second biggest jump: recovery correctness

The delete and retry model is now much closer to the intended product policy.

The important nuance is now respected:

- delete is for unfinished / incomplete-wizard recovery
- retry is for failed setup after wizard completion

That is a meaningful improvement in user-state correctness.

---

## What Still Needs Work

## 1. End-to-end execution evidence still matters

You now have much stronger QA documentation and better automated coverage, but a high-quality onboarding flow still benefits from confirmed execution in:

- development
- staging
- production

The remaining risk is less in local implementation and more in real environment behavior.

### Improvement opportunity

Actually complete and record the Epic 7 sign-off tables across environments, not just create them.

---

## 2. Observability and support tooling can still improve

The product is now more correct, but diagnosing failures in live environments may still be harder than it should be.

### Improvement opportunity

Add stronger operational visibility around:

- confirm success/failure
- preparation duration
- retry attempts
- delete attempts
- blocked delete responses
- repeated recovery loops

That would make support and QA much faster.

---

## 3. Support messaging could still be refined

The recovery actions are stronger now, but some user-facing copy can likely be tightened for clarity and confidence.

### Improvement opportunity

Review:

- blocked delete messaging
- retry-blocked messaging
- support-only messaging
- preparation-state copy for long-running setups

This is not a correctness issue now. It is a UX quality issue.

---

## 4. There may still be room for more integration-level test coverage

The current automated coverage is materially better than before, especially around route resolution, delete gating, and error handling.

But future confidence would improve further with:

- more app-level route integration tests
- more recovery-flow tests spanning multiple components
- more BFF route tests if the API surface grows

This is optional hardening, not a major gap.

---

## 5. The `.comms` document structure may now need consolidation

You have a strong onboarding documentation set, but it is also becoming large.

### Improvement opportunity

Add a short index file in `.comms/CODEX` linking:

- scorecards
- backlog
- decision brief
- Epic 6 handoffs
- Epic 7 QA docs

That would make the document set easier for future contributors to navigate.

---

## What Is No Longer A Major Concern

These were previously meaningful risks and are now much less concerning:

- wizard completion being mistaken for readiness
- unfinished accounts entering the dashboard by default
- lack of recovery distinction between retry and delete
- route logic drifting across pages
- missing BFF delete path planning

Those areas have improved enough that they are no longer the primary weaknesses in the onboarding flow.

---

## Recommended Next Improvements

## Priority 1

Complete real environment sign-off for Epic 7 and record outcomes in:

- [`EPIC_7_QA_SIGNOFF.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_7_QA_SIGNOFF.md)

## Priority 2

Add operational instrumentation for:

- confirm
- retry
- delete
- blocked delete
- long-running preparation

## Priority 3

Tighten support and error-state copy for recovery flows.

## Priority 4

Add a `.comms/CODEX` onboarding index file to improve document discoverability.

## Priority 5

Expand integration-style tests if you want even stronger confidence before major rollout.

---

## Updated Assessment

The onboarding system is now in a much healthier state.

It is no longer mainly a design exercise with partial implementation. It now behaves much more like a controlled onboarding platform with:

- explicit lifecycle routing
- stronger route safety
- cleaner recovery semantics
- clearer separation of wizard vs setup vs dashboard
- a documented QA and sign-off path

That is a substantial improvement.

### Final interpretation of the score

`88 / 100` means:

- the onboarding flow is now strong
- the most important structural issues have been resolved
- remaining work is mostly refinement and operational confidence
- the system is much closer to a production-grade onboarding experience

---

## Related Documents

- [`ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md)
- [`EPIC_6_APP_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_6_APP_WORKPLAN.md)
- [`EPIC_7_QA_SIGNOFF.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/EPIC_7_QA_SIGNOFF.md)
