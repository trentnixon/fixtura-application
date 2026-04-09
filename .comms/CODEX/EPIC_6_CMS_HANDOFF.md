# Epic 6 CMS Handoff

## Purpose

Define the CMS / Strapi work required to complete **Epic 6: CMS Recovery Completion** for onboarding.

This document is CMS-only. It focuses on:

- the backend decisions that must be resolved
- the Strapi implementation work required
- the contract the app and BFF need from CMS

---

## Epic 6 Goal

Allow unfinished onboarding accounts to recover cleanly through a backend-supported policy for:

- retry
- delete account
- support-only states

Epic 6 is complete when Strapi provides a clear and stable contract for those outcomes.

---

## Scope

Epic 6 in the backlog contains:

- Ticket 6.1: Finalize delete-account contract for unfinished accounts
- Ticket 6.2: Implement delete-account endpoint
- Ticket 6.3: Formalize retry/delete/support policy

Related backlog file:

- [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md)

---

## What CMS Must Decide

## 1. Delete-account contract

CMS needs to decide and document:

- HTTP method
- path
- eligibility rules
- success response
- failure responses

### Recommended contract

- Method: `DELETE`
- Path: `/api/accounts/:accountId`

If Strapi conventions or permissions make that awkward, acceptable alternative:

- `POST /api/accounts/:accountId/delete`

### Recommended eligibility rule

Allow delete only when:

- `isSetup === false`

Optional refinement:

- allow only when onboarding is incomplete or failed

### Required failure conditions

CMS must define responses for:

- account not found
- account not owned by user
- delete not allowed for current state
- invalid account id

### Recommended error codes

- `ACCOUNT_NOT_FOUND`
- `ACCOUNT_DELETE_NOT_ALLOWED`
- `UNAUTHORIZED`
- `INVALID_ACCOUNT_ID`

---

## 2. Retry policy

CMS needs to define exactly when retry is allowed.

Questions that must be answered:

- is retry allowed when `initialSetupStatus === "failed"` only
- is retry allowed when `initialDataFetchStatus === "failed"` only
- is retry allowed when both failed
- is retry allowed after partial recovery
- can retry be blocked by certain failure types

### Required contract behavior

When retry is not allowed, CMS should return a stable response such as:

- `409`
- code: `RETRY_NOT_ALLOWED`

This is already the expected direction and should be preserved consistently.

---

## 3. Recovery matrix

CMS must define which backend states map to which user actions.

The app should not have to guess this.

### Recommended matrix

1. setup running or queued
   - user action: wait
2. setup failed and retry is valid
   - user action: retry
3. setup failed and delete is allowed
   - user action: delete
4. setup failed and neither retry nor delete is allowed
   - user action: contact support

### Required output

CMS should either:

- make this unambiguous from current lifecycle fields and status codes

or

- explicitly add a machine-readable field later if needed

For now, clear status and error-code semantics are enough.

---

## What CMS Must Build

## Ticket 6.1

Finalize delete-account contract for unfinished accounts

### Deliverables

- agreed path and method
- agreed eligibility rule
- agreed response shapes
- agreed error codes
- written handoff doc for app/BFF teams

### Minimum acceptance

- app and BFF teams can implement the route without making assumptions

---

## Ticket 6.2

Implement delete-account endpoint

### Deliverables

- Strapi controller/service route
- ownership validation
- account-state validation
- deletion or archival behavior
- stable response status and error codes

### Required behavior

- unfinished account can be deleted safely
- ready account cannot be deleted through onboarding recovery flow

### Recommended response behavior

- success: `200` or `204`
- invalid state: `403` or `409` with `ACCOUNT_DELETE_NOT_ALLOWED`
- missing/not owned: `404` or `403` based on CMS security policy

---

## Ticket 6.3

Formalize retry/delete/support policy

### Deliverables

- documented rule set for which action is valid in which state
- backend consistency with that rule set
- stable failure semantics for frontend UX

### Minimum acceptance

- frontend can decide whether to show retry, delete, or support without guessing

---

## API Contract Needed By App And BFF

The frontend/BFF needs the CMS contract to include:

- endpoint path and method
- auth and ownership rules
- allowed account states
- success response shape
- failure response shape
- stable error codes

For delete-account, the BFF is expected to mirror the Strapi route once this is finalized.

---

## Operational Verification CMS Should Run

CMS should verify the lifecycle behaves correctly after:

1. confirm onboarding
2. setup enters queued/running
3. setup succeeds
4. setup fails
5. retry succeeds
6. delete is attempted in valid and invalid states

### Required outcomes

- `isSetup === true` remains the only ready state
- failed accounts produce stable failure semantics
- retry resets and re-queues correctly
- delete removes or archives unfinished accounts safely

---

## Recommended CMS Acceptance Criteria

Epic 6 should be considered complete on the CMS side when:

1. delete-account contract is finalized and documented
2. delete-account endpoint is implemented
3. retry eligibility is explicitly defined
4. retry/delete/support policy is documented
5. error codes are stable
6. lifecycle behavior is verified in real environments

---

## Questions CMS Must Answer

1. What is the final delete endpoint path and method?
2. Is delete allowed for all `isSetup === false` accounts, or only some subsets?
3. What exact status code and error code should delete return when blocked?
4. When is retry allowed?
5. Can a failed account offer both retry and delete, or only one?
6. Are there any states where support is the only allowed recovery path?

---

## Recommended Next Step

The CMS team should respond with:

1. the final Epic 6 API contract
2. the delete eligibility rule
3. the retry/delete/support matrix
4. expected response examples

Once that is done, the BFF and frontend can complete delete-account integration cleanly.

---

## Related Documents

- [`CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/CMS_ONBOARDING_SCORECARD_AND_WORKPLAN.md)
- [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md)
- [`ONBOARDING_PRODUCT_DECISION_BRIEF.md`](/D:/htdoc/Fixtura/Fixtura.com.au/application/.comms/CODEX/ONBOARDING_PRODUCT_DECISION_BRIEF.md)
