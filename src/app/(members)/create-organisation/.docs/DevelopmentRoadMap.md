# Development RoadMap — create-organisation (onboarding wizard)

## Current Focus

- **Follow-ups (not phased tickets):** Middleware **hard** gating when CMS publishes **§5** allowlist; gateway **Q1** zero-account default entry (product).

## Completed

- **Phase 7** — TKT-2026-ONB-008: `CreateOrganisationWizard` `router.replace` to `accountScopedRoutes.dashboard(accountId)` after successful W4; immediate redirect; no new middleware flags. `PhasedIntegrationPath.md` Phase 7.
- **Phase 6** — TKT-2026-ONB-007: BFF `GET /api/accounts/[accountId]/onboarding/setup-status`, `useOnboardingSetupStatus`, `SetupStatusCard`; S2 notes in [app-handoff-onboarding-phase6-s1-s2.md](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md). Strapi upstream GET pending.
- **Phase 5** — TKT-2026-ONB-006: BFF `POST /api/accounts/[accountId]/onboarding/confirm`, `WizardStepReview` (parallel GETs §4.5), `useConfirmOnboarding`. Strapi: [app-handoff-onboarding-phase5-w4.md](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md). **R1** optional / deferred.
- **Phase 4** — TKT-2026-ONB-005: BFF `PATCH /api/accounts/[accountId]/onboarding/step-3`, `WizardStepContact`, hydration from settings + `auth/me` for email display. Strapi: [app-handoff-onboarding-phase4-w3.md](../.comms/phase-4/app-handoff-onboarding-phase4-w3.md). Semantics Q13 (email) still with CMS.
- **Phase 0** — TKT-2026-ONB-001: Get Started + four-step shell, internal step state, gateway links; no API. Details: [`PhasedIntegrationPath.md`](./PhasedIntegrationPath.md) (section _Phase 0_) · summary: [`Completed.md`](./Completed.md).
- **Phase 1** — TKT-2026-ONB-002: BFF `POST /api/account/first`, `accountApi.createFirstAccount`, `useCreateFirstAccount`, Get Started wires A1 when bootstrap has no account rows; `account.me` invalidated after success. Requires Strapi `POST /api/account/first` per [`.comms/phase-1/app-handoff-post-account-first-endpoint.md`](../.comms/phase-1/app-handoff-post-account-first-endpoint.md).
- **Phase 2** — TKT-2026-ONB-003: L1/L2 BFF GETs, W1 PATCH, Step 1 form (`wizard-step-organisation`), query hooks + invalidation. Strapi: [app-handoff-onboarding-phase2-l1-l2-w1.md](../.comms/phase-2/app-handoff-onboarding-phase2-l1-l2-w1.md).
- **Phase 3** — TKT-2026-ONB-004: **closed** — M1 upload + W2 PATCH BFF, `WizardStepBranding`, hydration via `GET …/branding`. Strapi: [app-handoff-onboarding-phase3-m1-w2.md](../.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md). Remaining CMS E2E in testing.

## To Do (easy → hard)

_(No open phased wizard tickets; see **Current Focus** and **Blocked**.)_

## Blocked / Waiting

- Strapi (or upstream) handler for **POST /api/account/first** — app BFF and client are implemented; see [`.comms/phase-1/app-handoff-post-account-first-endpoint.md`](../.comms/phase-1/app-handoff-post-account-first-endpoint.md).
- Strapi handler for **POST /api/accounts/:accountId/onboarding/confirm** (W4) — app BFF implemented; see [`.comms/phase-5/app-handoff-onboarding-phase5-w4.md`](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md).
- Strapi handler for **GET /api/accounts/:accountId/onboarding/setup-status** (S1) — app BFF and client implemented; see [`.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md`](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md).
- Remaining CMS/OpenAPI gaps as described in `../../.comms/cms-handoff-onboarding-api-requirements.md` (e.g. semantics **§5** flags for optional middleware gating).

## Recommendations

- Work through `PhasedIntegrationPath.md` **one phase at a time** with product/CMS before expanding scope.
- Do not hard-gate routing on legacy flags until semantics doc is signed (`cms-handoff` §5).
