# Completed Tickets Index

- TKT-2026-001
- TKT-2026-004
- TKT-2026-005
- TKT-2026-006

---

ID: TKT-2026-001
Status: Completed
Priority: High
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute, Comms-admin-frontend-trigger-association-single-integration

---

## Overview

Add a season overview action for association accounts that queues a single association scrape via the new app BFF endpoint.

## What We Need to Do

Wire a guarded action into `/o/[accountId]/season` using existing API service and hook patterns so association users can trigger a scrape safely.

## Completion Summary

Implemented route registry/type wiring, BFF proxy endpoint, account API service method, mutation hook with season query invalidation, and season overview association-only action feedback.

---

ID: TKT-2026-002
Status: Draft
Priority: Medium
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute

---

## Overview

Confirm selection strategy when multiple `associationIds` exist in season recon scope.

## What We Need to Do

Define deterministic association selection behavior and align with backend expectations.

### Phase 1: Validation

#### Tasks

- [ ] Validate live recon payloads where more than one association id exists
- [ ] Confirm expected association id choice with backend/API owner
- [ ] Document selected strategy in season docs

## Constraints, Risks, Assumptions

- Assumes first association id is correct in current implementation until confirmed.

---

ID: TKT-2026-003
Status: Draft
Priority: Medium
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute

---

## Overview

Add direct tests for the association-trigger BFF route handler.

## What We Need to Do

Cover payload validation and upstream passthrough behavior for the new POST endpoint.

### Phase 1: Route Test Coverage

#### Tasks

- [ ] Add invalid JSON request test
- [ ] Add invalid associationId validation test
- [ ] Add successful upstream passthrough test
- [ ] Add upstream non-JSON fallback test

## Constraints, Risks, Assumptions

- Route test harness must align with existing Next route testing conventions in this repo.

---

ID: TKT-2026-004
Status: Completed
Priority: High
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute, Comms-admin-frontend-trigger-club-single-integration

---

## Overview

Add route plumbing for club single-scrape trigger so the app can invoke the CMS club queue endpoint through the standard BFF and API layers.

## What We Need to Do

Implement route registry entry, typed contracts, BFF proxy endpoint, service method, and reusable mutation hook for club single scrape.

## Completion Summary

Implemented club trigger route definition, request/response types, BFF proxy route, account API service method, and a reusable mutation hook with season query invalidation plus hook test coverage.

---

ID: TKT-2026-005
Status: Completed
Priority: Medium
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute

---

## Overview

Define and implement unified season onClick orchestration for association and club trigger endpoints.

## What We Need to Do

Compose one org-aware click action that selects the correct trigger route and id source safely.

## Completion Summary

Implemented unified sync orchestration with strict orgType mapping (`Association`/`Club`) and trigger-only confirm behavior using resolved org id from account state.

## Constraints, Risks, Assumptions

- Uses account-level organisation id from account state for trigger payload.

---

ID: TKT-2026-006
Status: Completed
Priority: High
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute

---

## Overview

Refactor season Sync confirm action to use a dedicated org-aware hook that routes to association or club trigger endpoint by org type.

## What We Need to Do

Resolve org id/name/type from account state, enforce strict routing, block unsupported types, and remove confirm-time season refetch behavior.

## Completion Summary

Added `useTriggerOrgSingleScrape` hook, wired season sync dialog to trigger-only behavior, retained refresh refetch separately, and added targeted hook tests for association/club/unsupported/missing-id cases.

---

ID: TKT-2026-007
Status: Draft
Priority: Medium
Owner: Frontend Team
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-SeasonRoute

---

## Overview

Add direct tests for the club-trigger BFF route handler.

## What We Need to Do

Cover request validation and upstream passthrough behavior for `POST /api/club/trigger-club-single-scrape`.

### Phase 1: Route Test Coverage

#### Tasks

- [ ] Add invalid JSON request test
- [ ] Add invalid clubId validation test
- [ ] Add successful upstream passthrough test
- [ ] Add upstream non-JSON fallback test

## Constraints, Risks, Assumptions

- Route test harness must align with existing Next route testing conventions in this repo.
