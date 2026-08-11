# Tickets — create-organisation / onboarding wizard

# Completed Tickets Index

- TKT-2026-ONB-001
- TKT-2026-ONB-002
- TKT-2026-ONB-003
- TKT-2026-ONB-004
- TKT-2026-ONB-005
- TKT-2026-ONB-006
- TKT-2026-ONB-007
- TKT-2026-ONB-008

---

## Active tickets

---

ID: TKT-2026-ONB-001
Status: Completed
Priority: High
Owner: FE
Created: 2026-04-07
Updated: 2026-04-07
Related: PhasedIntegrationPath-Phase0, Roadmap-create-organisation

---

## Overview

Establish the onboarding route shell and documentation so later phases can attach APIs without reworking structure.

## What We Need to Do

Deliver a non-destructive **layout + stepper** for `create-organisation` and keep the route usable (back to selection, help).

## Completion Summary

Implemented `CreateOrganisationWizard` (client step state, Get Started + four labelled steps, Back/Next/Finish-disabled on last step), `page.tsx` metadata, and gateway links to selection and help. No route `layout.tsx` or CMS calls; `readMe.md` updated. PRs touching this route should still reference `readMe.md` and `PhasedIntegrationPath.md` per team habit.

---

ID: TKT-2026-ONB-002
Status: Completed
Priority: High
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-A1, PhasedIntegrationPath-Phase1

---

## Overview

Integrate **first account** creation (A1) so zero-account users obtain a stable `accountId` for the wizard.

## What We Need to Do

Implement CMS + BFF + client + hooks for **A1**; invalidate `account.me` after success; align gateway entry with product (see CMS handoff §9.2).

## Completion Summary

Shipped BFF `POST /api/account/first`, `accountApi.createFirstAccount`, `useCreateFirstAccount` with `account.me` invalidation, and Get Started on `CreateOrganisationWizard` calling A1 when bootstrap has no account rows. Documented Strapi contract in `.comms/phase-1/app-handoff-post-account-first-endpoint.md`; upstream handler remains with CMS.

---

ID: TKT-2026-ONB-003
Status: Completed
Priority: High
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-L1-L3-W1, PhasedIntegrationPath-Phase2

---

## Overview

**Lookups** (L1–L3) and **Step 1** organisation + permission (**W1**).

## What We Need to Do

Dropdowns + form + persistence; invalidate relevant queries after W1.

## Completion Summary

Shipped v1 per [phase2-v1-data-matrix-assumptions.md](../.comms/phase-2/phase2-v1-data-matrix-assumptions.md): BFF `GET /api/account/onboarding/lookups/sports` and `…/organisation-types`, `PATCH /api/accounts/[accountId]/onboarding/step-1` → Strapi; `route-definitions` + `accountApi` + `useOnboardingLookupSports`, `useOnboardingLookupOrganisationTypes`, `useUpdateOnboardingStep1` (invalidates `account.me`, settings, organisation context); `WizardStepOrganisation` with Step 1 form; `apiClient.patch`. **L3** not in v1; pollable setup status shipped in TKT-2026-ONB-007.

---

ID: TKT-2026-ONB-004
Status: Completed
Priority: Medium
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-M1-W2, PhasedIntegrationPath-Phase3

---

## Overview

**Step 2** branding: **M1** upload + **W2** persistence.

## What We Need to Do

Implement **M1** (upload or reuse pipeline) per CMS contract; **W2** with clear sequence vs M1 (handoff §4.6); hydrate from `GET .../branding`.

## Completion Summary

Shipped sequence (a): BFF `POST /api/accounts/[accountId]/onboarding/step-2/upload` (M1) and `PATCH …/onboarding/step-2` (W2); `accountApi` + `useUpdateOnboardingStep2` (invalidates `account.me`, branding, settings); `apiClient.postFormData` for multipart; `WizardStepBranding` + wizard step 2 wiring (including branding DTO hydration for colours/logo per CMS handoff). Strapi contract: [app-handoff-onboarding-phase3-m1-w2.md](../.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md). **Read** `GET …/branding` was already in app. **Phase 3 is closed for app delivery;** remaining Strapi/CMS round-trip and edge-case behaviour are handled in testing and QA.

---

ID: TKT-2026-ONB-005
Status: Completed
Priority: Medium
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-W3, PhasedIntegrationPath-Phase4

---

## Overview

**Step 3** contact / delivery (**W3**).

## What We Need to Do

Hydrate contact fields; integrate **W3** mutation; align with settings and auth reads.

## Completion Summary

Shipped BFF `PATCH /api/accounts/[accountId]/onboarding/step-3`, `accountApi.updateOnboardingStep3`, `useUpdateOnboardingStep3` (invalidates `account.me`, `settings`, `auth.me`); `WizardStepContact` hydrates from `GET …/settings`, shows email from `useCurrentUser`, and wires wizard step 3. App handoff for Strapi: [app-handoff-onboarding-phase4-w3.md](../.comms/phase-4/app-handoff-onboarding-phase4-w3.md). **Canonical email / Q13 conflict rules** remain for CMS semantics doc; **409** surfaced inline when present.

---

ID: TKT-2026-ONB-006
Status: Completed
Priority: Medium
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-W4-R1, PhasedIntegrationPath-Phase5

---

## Overview

**Step 4** review + **W4** confirm; optional **R1** aggregate.

## What We Need to Do

Build review UI from parallel GETs or R1; integrate **W4** confirm; align PDR (wizard vs setup).

## Completion Summary

Shipped BFF `POST /api/accounts/[accountId]/onboarding/confirm`, `accountApi.confirmOnboarding`, `useConfirmOnboarding` (invalidates `account.me`, settings, organisation context, branding, `auth.me`); `WizardStepReview` composes parallel GETs per §4.5 (R1 deferred), read-only summary, **Finish** wiring and success state; **409** / validation surfaced. Strapi contract: [app-handoff-onboarding-phase5-w4.md](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md). Post-wizard redirect delivered in TKT-2026-ONB-008.

---

ID: TKT-2026-ONB-007
Status: Completed
Priority: High
Created: 2026-04-07
Updated: 2026-04-07
Related: CMS-S1-S2, PhasedIntegrationPath-Phase6

---

## Overview

**S1** setup status read + **S2** polling behaviour; **SetupStatusCard** wired to server.

## What We Need to Do

Pollable setup state, terminal stop conditions, and setup card on Step 1 and review.

## Completion Summary

Shipped BFF `GET /api/accounts/[accountId]/onboarding/setup-status`, `parseOnboardingSetupStatusPayload`, `useOnboardingSetupStatus` (poll until `ready` / `blocked` / `abandoned`), `queryKeys.account.setupStatus`, invalidation from `useUpdateOnboardingStep1` and `useConfirmOnboarding`; `SetupStatusCard` on `wizard-step-organisation` and `wizard-step-review` (including post-W4). S2 defaults and Strapi contract: [`.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md`](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md). Upstream Strapi handler remains with CMS.

---

ID: TKT-2026-ONB-008
Status: Completed
Priority: Medium
Owner: FE
Created: 2026-04-07
Updated: 2026-04-08
Related: PhasedIntegrationPath-Phase7, CMS-semantics-flags

---

## Overview

Post-**W4** redirect to **`/o/[accountId]/…`** and gateway alignment; gating only with signed semantics.

## What We Need to Do

Navigate into the scoped members app after wizard confirmation; defer hard middleware gating until CMS publishes flag allowlists (§5, §9.4).

## Completion Summary

After successful **W4**, `CreateOrganisationWizard` calls `router.replace(accountScopedRoutes.dashboard(accountId))` so users land on **`/o/[accountId]/dashboard`** (same default as organisation selection). **Immediate redirect** (no intermediate success screen). **`useConfirmOnboarding`** already invalidates `account.me` and related queries. **Middleware** is unchanged: no hard redirects on legacy fields such as `isSetup`; hard vs soft product gating by route waits on CMS **§5** allowlist. Gateway **Q1** (zero-account default entry) remains a product follow-up.

---
