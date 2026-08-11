# Deploy: `getOnboardingSetupStatus` permission (Phase 6 S1)

**Date:** 2026-04-07

After each deploy that includes `GET /api/accounts/:accountId/onboarding/setup-status` on Strapi:

1. Open **Settings → Users & permissions → Roles → Authenticated**.
2. Under **Account**, enable **`getOnboardingSetupStatus`** (same pattern as `getAccountSettings`, `confirmOnboarding`).
3. Save.

Without this grant, authenticated users receive **403** when calling the endpoint (via the BFF or directly on Strapi).

**Strapi implementation (CMS codebase):** `src/api/account/controllers/services/getOnboardingSetupStatusPayload/index.js` — v1 state mapping is documented in file header comments.

**Related:** [app-handoff-onboarding-phase6-s1-s2.md](./app-handoff-onboarding-phase6-s1-s2.md)
