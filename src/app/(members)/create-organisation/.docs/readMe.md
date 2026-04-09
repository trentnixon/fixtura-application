# Folder Overview

Authenticated **create-organisation / onboarding wizard** route under `src/app/(members)/create-organisation/`. Replaces the placeholder page with the contract-first onboarding flow aligned to the members PDR.

## Files

- `../page.tsx`: Route entry — metadata and `CreateOrganisationWizard` shell.
- `../_components/create-organisation-wizard.tsx`: Client wizard — Get Started (sport card grid, optional `{ sport }` on A1 when bootstrap has no account rows), internal step index, stepper chrome, gateway links; after **W4** success **`router.replace`** to **`/o/[accountId]/dashboard`**.
- `../_components/wizard-step-organisation.tsx`: Step 1 — `sportId` from Get Started; L2 lookups, associations-by-sport + clubs-by-association, W1 PATCH; `onboardingOrganisationName` derived from selected association or club label, hydration from settings (non-sport fields), `SetupStatusCard` (S1 polling).
- `../_components/wizard-step-branding.tsx`: Step 2 — `GET …/branding` hydrate (theme id, `theme.theme` palette, onboarding logo vs template poster), `useOnboardingLookupThemes` + fallback list, W2 `themeId` + M1 logo upload (`useUpdateOnboardingStep2`), custom theme (`useCreateOnboardingStep2Theme` with `primary`/`secondary`/`dark`/`white`), gateway redirect handling for branding fetch.
- `../_components/wizard-step-contact.tsx`: Step 3 — `GET …/settings` hydrate (first/last name, delivery address), email display from `useCurrentUser`, W3 `useUpdateOnboardingStep3`, gateway redirect handling for settings fetch.
- `../_components/wizard-step-review.tsx`: Step 4 — parallel GETs (settings, organisation context, branding, `account/me`, `auth/me`) per §4.5; read-only summary; W4 `useConfirmOnboarding` + partial failure / retry UX; `SetupStatusCard` + post-W4 success state.
- `../_components/setup-status-card.tsx`: S1 — `useOnboardingSetupStatus` until terminal; maps phase/status to copy.
- `DevelopmentRoadMap.md`: High-level status and priorities for this route.
- `PhasedIntegrationPath.md`: Phased integration plan — wizard steps, existing vs new endpoints, FE work.
- `Tickets.md`: Active tickets and execution tasks.
- `Completed.md`: Archive of completed ticket summaries.

## Child Modules

- `../_components/` — route-scoped UI for the onboarding wizard.
- `../.comms/` — cross-team notes by phase (`phase-1/` … `phase-6/`); Phase 2: [`cms-phase2-backend-signoff.md`](../.comms/phase-2/cms-phase2-backend-signoff.md) (backend contract vs ops checklist), [`cms-request-onboarding-associations-and-clubs.md`](../.comms/phase-2/cms-request-onboarding-associations-and-clubs.md); Phase 4 W3: [`app-handoff-onboarding-phase4-w3.md`](../.comms/phase-4/app-handoff-onboarding-phase4-w3.md), [`cms-request-phase4-w3-contact-and-open-questions.md`](../.comms/phase-4/cms-request-phase4-w3-contact-and-open-questions.md), [`cms-response-phase4-w3-contact-and-delivery.md`](../.comms/phase-4/cms-response-phase4-w3-contact-and-delivery.md) (CMS reply); Phase 5 W4: [`app-handoff-onboarding-phase5-w4.md`](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md); Phase 6 S1/S2: [`app-handoff-onboarding-phase6-s1-s2.md`](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md), [`deploy-get-onboarding-setup-status-permission.md`](../.comms/phase-6/deploy-get-onboarding-setup-status-permission.md).
- `../.research/` — spikes and investigations; empty until used.

## Relations

- Parent: `src/app/(members)/`
- Product + API context: [handoff-onboarding.md](../../.comms/handoff-onboarding.md), [cms-handoff-onboarding-api-requirements.md](../../.comms/cms-handoff-onboarding-api-requirements.md)
- Account app shell: `src/app/(members)/o/[accountId]/…`
