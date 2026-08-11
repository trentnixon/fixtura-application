# Completed Tickets

### TKT-2026-ONB-008

Phase 7: Post-W4 **`router.replace`** to [`/o/[accountId]/dashboard`](../../o/[accountId]/dashboard/page.tsx) via [`accountScopedRoutes.dashboard`](../../../../lib/config/account-routes.ts) in [`create-organisation-wizard.tsx`](../_components/create-organisation-wizard.tsx). Immediate redirect; no middleware `isSetup` gating (waits on CMS §5 allowlist; soft S1 unchanged). Gateway Q1 remains product follow-up.

### TKT-2026-ONB-007

Phase 6 (S1, S2): BFF [`setup-status/route.ts`](../../../api/accounts/%5BaccountId%5D/onboarding/setup-status/route.ts); [`useOnboardingSetupStatus`](../../../../lib/api/hooks/account/useOnboardingSetupStatus.ts); [`SetupStatusCard`](../_components/setup-status-card.tsx) on Step 1 and review. Contract: [app-handoff-onboarding-phase6-s1-s2.md](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md). Strapi `GET` implementation pending.

### TKT-2026-ONB-006

Phase 5 (W4): BFF [`confirm/route.ts`](../../../api/accounts/%5BaccountId%5D/onboarding/confirm/route.ts); [`useConfirmOnboarding`](../../../../lib/api/hooks/account/useConfirmOnboarding.ts); [`wizard-step-review.tsx`](../_components/wizard-step-review.tsx) + wizard step 4 wiring. Contract: [app-handoff-onboarding-phase5-w4.md](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md). **R1** aggregate deferred; parallel GETs for review.

### TKT-2026-ONB-005

Phase 4 (W3): BFF [`step-3/route.ts`](../../../api/accounts/%5BaccountId%5D/onboarding/step-3/route.ts); [`useUpdateOnboardingStep3`](../../../../lib/api/hooks/account/useUpdateOnboardingStep3.ts); [`wizard-step-contact.tsx`](../_components/wizard-step-contact.tsx) + wizard step 3 wiring. Contract: [app-handoff-onboarding-phase4-w3.md](../.comms/phase-4/app-handoff-onboarding-phase4-w3.md). Canonical email rules (CMS §5 / Q13) still open.

### TKT-2026-ONB-004

Phase 3 (M1, W2): BFF [`upload/route.ts`](../../../api/accounts/%5BaccountId%5D/onboarding/step-2/upload/route.ts) and [`step-2/route.ts`](../../../api/accounts/%5BaccountId%5D/onboarding/step-2/route.ts); [`useUpdateOnboardingStep2`](../../../../lib/api/hooks/account/useUpdateOnboardingStep2.ts); [`wizard-step-branding.tsx`](../_components/wizard-step-branding.tsx) with branding hydration. Contract: [app-handoff-onboarding-phase3-m1-w2.md](../.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md). Phase 3 closed for delivery; further CMS E2E verification in testing.

### TKT-2026-ONB-003

Phase 2 (L1, L2, W1): BFF routes under [`api/account/onboarding/lookups/`](../../../api/account/onboarding/lookups/) and [`api/accounts/[accountId]/onboarding/step-1`](../../../api/accounts/%5BaccountId%5D/onboarding/step-1/route.ts); registry keys `account.onboardingLookupsSports`, `onboardingLookupsOrganisationTypes`, `accounts.onboardingStep1`; [`wizard-step-organisation.tsx`](../_components/wizard-step-organisation.tsx) + wizard wiring; [`useUpdateOnboardingStep1`](../../../../lib/api/hooks/account/useUpdateOnboardingStep1.ts). Contract: [app-handoff-onboarding-phase2-l1-l2-w1.md](../.comms/phase-2/app-handoff-onboarding-phase2-l1-l2-w1.md).

### TKT-2026-ONB-002

Phase 1 (A1): BFF route [`route.ts`](../../../api/account/first/route.ts) proxies `POST /api/account/first` to Strapi; [`route-definitions`](../../../../lib/api/routes/route-definitions.ts) entry `account.first`; [`accountApi.createFirstAccount`](../../../../lib/api/services/account.api.ts); [`useCreateFirstAccount`](../../../../lib/api/hooks/account/useCreateFirstAccount.ts) invalidates `account.me` on success; wizard Get Started calls A1 when bootstrap has no account rows, then advances to step 1. Upstream contract: [`.comms/phase-1/app-handoff-post-account-first-endpoint.md`](../.comms/phase-1/app-handoff-post-account-first-endpoint.md).

### TKT-2026-ONB-001

Phase 0 shell delivered: `CreateOrganisationWizard` (`_components/create-organisation-wizard.tsx`) with Get Started, four placeholder steps (static copy), internal step state, step strip with current/done/upcoming labels, “Wizard step X of 4”, Back/Next and disabled Finish on the last step, and links to organisation selection and help; `page.tsx` adds route metadata. No CMS or BFF calls. Full checklist: [`PhasedIntegrationPath.md`](./PhasedIntegrationPath.md) (_Phase 0_ section).
