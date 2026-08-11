# Integration notes — Phase 4 Step 3 (W3)

**Date:** 2026-04-07

- BFF: `PATCH /api/accounts/[accountId]/onboarding/step-3` proxies Strapi `PATCH …/accounts/:accountId/onboarding/step-3`.
- UI: `WizardStepContact` hydrates from `useAccountSettings` (`FirstName`, `LastName`, `DeliveryAddress`); shows email from `useCurrentUser` (auth/me) read-only; **maxLength** on fields matches Strapi (255 / 255 / 4000).
- **CMS reply:** [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md) — permission `updateOnboardingStep3`; **no 409** from W3 in v1; **409** handling in UI remains defensive.
- **Deploy (Strapi):** first deploy may migrate **`DeliveryAddress`** column (email → text); smoke: PATCH step-3 → GET settings.
