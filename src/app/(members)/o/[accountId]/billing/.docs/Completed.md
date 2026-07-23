# Completed Tickets

### TKT-2026-001

Migrated `AvailableBillingTier` to camelCase v1 per `frontend-handoff-billing-available-tiers.md`; updated all billing tier consumers (wizard, checkout/invoice radios, current plan card, trial label helper); added `PlanTierCard` and upgraded create-subscription step 1 to a 3-up grid with optional Club/Association toggle when multiple categories are returned.

### APP-TRIAL-001

Aligned frontend billing types and fixtures with CMS org-trial contract: added `OrganisationTrialBlock`, renamed `trial.eligible` to `trial.isEligible`, froze start-trial response/error unions, and extended Route Lab fixtures.

### APP-TRIAL-002

Implemented pure fail-closed `deriveOrganisationTrialPresentation` with six presentation states, 14 unit tests, and Organisation trial debug panel section.

### APP-TRIAL-003

Wired org-trial presentation into billing overview: Start card gated on `start_available`, privacy-safe notices for used/active-elsewhere/unavailable with paid/pending suppression, and expanded unit/component tests.

### APP-TRIAL-004

Added org-trial error code parser and stable user copy; invalidate billing on start-trial success and org conflicts; 503 kill-switch mapped from `details.error.code` with retry-after hint; unit and mutation tests added.

### APP-TRIAL-005

Removed client-predicted Starts/Ends calendar dates from the pre-start confirm dialog; confirm copy now shows duration and no-charge wording only; active trial dates continue to come from refreshed GET billing via existing active-trial UI.

### APP-TRIAL-006

Added six org-trial Route Lab scenarios with lab-to-production adapter, org-trial debug panel, and production-equivalent Start gating; fixture matrix, component, and BFF tests cover CTA visibility, privacy, and Retry-After passthrough.
