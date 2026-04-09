# State

_Last updated: 2026-04-09 (episode — `LOG:` onboarding wizard-complete → dashboard)._

## Current focus

- **Onboarding lifecycle (shipped):** Wizard completion → dashboard — [`resolve-account-entry.ts`](src/lib/onboarding/resolve-account-entry.ts) (`dashboard` \| `wizard` only); [`ScopedOnboardingSyncBanner`](src/components/scoped-onboarding-sync-banner.tsx) on scoped routes when **`!isSetup`** or pipeline failed; review — [`.comms/CODEX/ONBOARDING_STRUCTURE_REVIEW_SETUP_REDIRECT.md`](.comms/CODEX/ONBOARDING_STRUCTURE_REVIEW_SETUP_REDIRECT.md); decision [`.memory/decisions.md`](.memory/decisions.md) (2026-04-09).
- **Onboarding Epic 7 (in progress — manual QA):** Repeatable checklists — [`.comms/CODEX/EPIC_7_TICKET_7_1_FRONTEND_ROUTE_QA.md`](.comms/CODEX/EPIC_7_TICKET_7_1_FRONTEND_ROUTE_QA.md), [`EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md`](.comms/CODEX/EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md), [`EPIC_7_TICKET_7_3_RECOVERY_QA.md`](.comms/CODEX/EPIC_7_TICKET_7_3_RECOVERY_QA.md); sign-off — [`EPIC_7_QA_SIGNOFF.md`](.comms/CODEX/EPIC_7_QA_SIGNOFF.md). **Automated:** [`org-access-boundary.test.tsx`](src/components/auth/org-access-boundary.test.tsx) (wizard-complete allowed without **`isSetup`**).
- **Gateway `/select-organisation` (shipped):** Lifecycle card tones — [`select-org-card-tone.ts`](src/lib/onboarding/select-org-card-tone.ts); [`select-organisation-content.tsx`](<src/app/(members)/select-organisation/select-organisation-content.tsx>); dev sim [`select-organisation-sim.ts`](src/lib/dev/select-organisation-sim.ts); logo `onError` → initials in [`grid-card.tsx`](src/components/ui/grid-card.tsx).
- **Delete unfinished account (shipped):** BFF [`DELETE …/api/accounts/[accountId]`](src/app/api/accounts/[accountId]/route.ts); [`useDeleteUnfinishedAccount`](src/lib/api/hooks/account/useDeleteUnfinishedAccount.ts); gating — [`can-delete-unfinished-onboarding-account.ts`](src/lib/onboarding/can-delete-unfinished-onboarding-account.ts).
- **Onboarding Epic 5 (implemented):** Shared Strapi→BFF mapping — [`next-response-from-strapi-fetch.ts`](src/lib/api/bff/next-response-from-strapi-fetch.ts); onboarding lifecycle routes under [`src/app/api/accounts/[accountId]/onboarding/`](src/app/api/accounts/[accountId]/onboarding/).
- **Optional setup route:** [`setup-client.tsx`](<src/app/(members)/create-organisation/setup/setup-client.tsx>) — recovery/manual; wizard-complete visits redirect to dashboard.
- **UI primitives:** Default **`Card`** / **`Surface`** — **`ring-1 ring-border` + `shadow-xl`** app-wide.
- **L3 premade themes:** Catalogue row **`sport`** + **`theme`** JSON; Step 2 branding — [`wizard-step-branding.tsx`](<src/app/(members)/create-organisation/_components/wizard-step-branding.tsx>).
- **Create-organisation wizard:** Phases shipped; follow-ups: Strapi permissions; **§5** allowlist; gateway **Q1**. [`PhasedIntegrationPath.md`](<src/app/(members)/create-organisation/.docs/PhasedIntegrationPath.md>).
- **CMS account data:** Hooks + BFFs; billing, media library, sponsors on **`/o/[accountId]/…`**.
- **Members nav:** [`app-sidebar.tsx`](src/components/app-sidebar.tsx).

## Next actions

- [ ] **Epic 7:** Run ticket **7.1** / **7.2** / **7.3** checklists in **staging** (minimum); complete [`.comms/CODEX/EPIC_7_QA_SIGNOFF.md`](.comms/CODEX/EPIC_7_QA_SIGNOFF.md) (confirm flows match wizard-complete → dashboard).
- [ ] **QA (optional):** `/select-organisation` multi-account lifecycle mix in staging; `?orgSim=multiple` with org simulator.
- [ ] **QA (optional):** Staging parity — BFF vs direct Strapi for **onboarding-state**, **setup-status**, **retry-setup** (see [`epic-5-bff-contract-verification.md`](<src/app/(members)/create-organisation/.comms/epic-5-bff-contract-verification.md>)).
- [ ] **CMS:** Confirm Strapi theme POST / GET branding / L3 **`theme`** four-key shape in target env.
- [ ] **Product/CMS:** **§5** semantics; gateway **Q1**.
- [ ] Replace temp JSON drilling with product UI when ready.

## Blockers / risks

- **Strapi** upstream handlers and worker behaviour required for full **7.2** CMS QA — see [`EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md`](.comms/CODEX/EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md) and [`DevelopmentRoadMap.md`](<src/app/(members)/create-organisation/.docs/DevelopmentRoadMap.md>).
