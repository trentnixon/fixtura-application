# Integration notes — Phase 3 Step 2 (members app ↔ Strapi)

**Date:** 2026-04-07  
**Canonical CMS contract:** [cms-handoff-onboarding-phase3-step2.md](./cms-handoff-onboarding-phase3-step2.md)

## JSON body shape

- **PATCH …/onboarding/step-2** — The members app sends a **flat** JSON object (`themeId`, `logoMediaId`). Strapi may also accept a `{ "data": { … } }` wrapper per the CMS handoff examples. Colours are **not** sent on W2; they live on the linked theme.

- **POST …/onboarding/step-2/theme** — The app sends **flat** `{ name, primary, secondary, dark, white }` (hex strings). The handoff states the `data` wrapper may be omitted.

## Smoke checklist (manual)

1. `GET /api/account/onboarding/lookups/themes` returns premade rows with **`theme`** shaped as `{ primary, secondary, dark, white }` when populated.
2. `POST …/onboarding/step-2/theme` creates a private theme and links the account.
3. `PATCH …/onboarding/step-2` persists `themeId` and `logoMediaId` (not standalone account colours).
4. `POST …/onboarding/step-2/upload` returns `{ data: { id } }`; `PATCH` with `logoMediaId` persists `onboardingLogo`.
5. `GET …/branding` includes **`data.theme.theme`** (palette) and **`onboardingLogo`** when set.
