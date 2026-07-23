# Completed Tickets Index

- TKT-2026-001
- APP-TRIAL-001
- APP-TRIAL-002
- APP-TRIAL-003
- APP-TRIAL-004
- APP-TRIAL-005
- APP-TRIAL-006

---

## Active tickets

---

## APP-TRIAL-007 (In Progress)

```md
---
ID: APP-TRIAL-007
Status: In Progress
Priority: Low
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-006, app-trial-frontend-handoff.md, staging-qa-checklist.md
---
```

### Overview

Staging QA and frontend handoff sign-off for organisation free trial integration.

### What We Need to Do

Verify eligible, active-here, active-elsewhere, used, unresolved, billing-blocked, idempotent, and temporary-disable cases against live CMS.

### Phases & Tasks

#### Phase 1: Prepare QA artifacts

- [x] Save frontend handoff to `.comms/handoff/app-trial-frontend-handoff.md`
- [x] Extend staging checklist with org-trial matrix and frontend sign-off rows

#### Phase 2: Local verification

- [x] Run typecheck and org-trial vitest suite
- [x] Confirm no legacy `trial-instances` usage; dashboard has no Start mutation

#### Phase 3: Staging verification

- [ ] Run org-trial QA matrix against staging CMS (see `.comms/resources/staging-qa-checklist.md`)
- [ ] Record Pass/Fail for each scenario and update `app-trial-007-sign-off.md`

#### Phase 4: Close out

- [ ] Archive completion summary in `.docs/Completed.md` (after staging Pass)
- [ ] Mark APP-TRIAL-007 Done in Monday and parent epic sign-off

### Constraints, Risks, Assumptions

- Requires APP-TRIAL-004 through APP-TRIAL-006 complete
- Live staging accounts required for Phase 3; Route Lab covers contract matrix locally only

---

## APP-TRIAL-006 (Completed)

```md
---
ID: APP-TRIAL-006
Status: Completed
Priority: Medium
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-003, APP-TRIAL-004
---
```

### Overview

Expand Route Lab fixtures and automated tests for full org-trial contract matrix.

### What We Need to Do

Cover all contract states, contradictions, conflicts, 503, CTA visibility, privacy, and accessibility in Route Lab and component/integration tests.

### Completion Summary

Added six org-trial Route Lab scenarios, lab-to-production summary adapter, org-trial debug panel with derived presentation, and production-equivalent Start gating; fixture matrix, notice/start-card/content, and BFF Retry-After tests added.

---

## APP-TRIAL-005 (Completed)

```md
---
ID: APP-TRIAL-005
Status: Completed
Priority: Medium
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-004
---
```

### Overview

Remove client-predicted trial dates from pre-start confirm dialog; show active dates only from refreshed CMS data.

### What We Need to Do

Replace `getBillingTrialScheduleLabelsForStartToday()` usage in confirm flow with CMS-backed dates after start or from summary when active.

### Completion Summary

Removed client-predicted Starts/Ends calendar lines from the pre-start confirm dialog; confirm copy now shows duration and no-charge wording only; deleted unused schedule helpers; active trial dates continue from refreshed GET billing via existing active-trial UI.

---

## APP-TRIAL-004 (Completed)

```md
---
ID: APP-TRIAL-004
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-003, cms-handoff-bill-trial-012-013
---
```

### Overview

Parse stable `error.code` from POST start-trial; refetch GET billing after `started`, `already_active`, and org conflict outcomes.

### What We Need to Do

Wire mutation conflict handling for `TRIAL_ALREADY_CONSUMED`, `TRIAL_ORGANISATION_UNAVAILABLE`, and `TRIAL_ALLOCATION_DISABLED` while preserving BFF passthrough.

### Completion Summary

Added org-trial error code parser and stable user copy in billingTrialStart utils; invalidate billing queries on success and org-conflict onError; 503 kill-switch reads `details.error.code` with optional retry-after hint; unit and mutation tests added.

---

## APP-TRIAL-003 (Completed)

```md
---
ID: APP-TRIAL-003
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-002, cms-handoff-bill-trial-012-013
---
```

### Overview

Wire organisation-trial presentation into billing overview: notices for used / active-elsewhere / unavailable, and tighter Start gating on `start_available`.

### What We Need to Do

Integrate `deriveOrganisationTrialPresentation` into overview while preserving paid_active and payment_pending precedence.

### Completion Summary

Wired org-trial presentation into billing overview ready state; Start card now requires `start_available` plus existing account gates; added privacy-safe notices for used, active-elsewhere, and unavailable with suppression under paid/pending; extended unit and component tests.

---

## APP-TRIAL-002 (Completed)

```md
---
ID: APP-TRIAL-002
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: APP-TRIAL-001
---
```

### Overview

Pure fail-closed derivation of six organisation-trial presentation states from GET billing summary.

### What We Need to Do

Implement `deriveOrganisationTrialPresentation` with unit tests and debug panel exposure.

### Completion Summary

Added six-state presentation model, pure deriver with fail-closed rules, 14 unit tests, and Organisation trial section in billing debug panel.

---

## APP-TRIAL-001 (Completed)

```md
---
ID: APP-TRIAL-001
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-07-22
Updated: 2026-07-22
Related: cms-handoff-bill-trial-012-013
---
```

### Overview

Align frontend billing types and fixtures with CMS org-trial contract.

### What We Need to Do

Add `OrganisationTrialBlock`, rename `trial.eligible` to `trial.isEligible`, freeze start-trial response/error unions, and update fixtures.

### Completion Summary

Updated production types in `src/types/api/account.ts`, renamed `eligible` to `isEligible` across fixtures and components, and extended Route Lab billing fixtures with `organisationTrial`.

---

## TKT-2026-001 (Completed)

```md
---
ID: TKT-2026-001
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-05-06
Updated: 2026-05-06
Related: frontend-handoff-billing-available-tiers.md
---
```

### Overview

Migrate `AvailableBillingTier` and all consumers to the camelCase v1 wire shape live on staging; replace create-subscription wizard step 1 with the route-lab-style tier card grid.

### What We Need to Do

Restore correct tier rendering after CMS contract change; ship improved plan selection UX on `/billing/create`.

### Completion Summary

- Rewrote `AvailableBillingTier` and added `SubscriptionTierCategory` in `src/types/api/account.ts`; linked main billing handoff to `frontend-handoff-billing-available-tiers.md`.
- Migrated tier UI reads to `name`/v1 fields across wizard, plan-checkout and invoice tier radios, current plan card, and trial tier label helper; fixed billing state test fixtures.
- Introduced `PlanTierCard`, `_utils/create-subscription/planTierCard.ts`, category toggle when multiple tiers categories exist, and replaced wizard step 1 list with responsive card grid.
