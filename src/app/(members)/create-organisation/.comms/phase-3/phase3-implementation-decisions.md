# Phase 3 themes + branding — recorded implementation decisions (members app)

**Date:** 2026-04-07  
**Inputs:** [cms-response-phase3-themes-and-logo.md](./cms-response-phase3-themes-and-logo.md), [cms-request-onboarding-phase3-themes-and-logo.md](./cms-request-onboarding-phase3-themes-and-logo.md)

These defaults unblock BFF + FE work while CMS finalises Strapi handlers. Replace or amend after a formal workshop if product disagrees.

| Topic                        | Decision                                                                                                                                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Premade theme list**       | **Option A** — align with L1/L2: Strapi `GET /api/account/onboarding/lookups/themes` returning `{ data: [{ id, label, sortOrder?, slug? }] }`; members BFF `GET /api/account/onboarding/lookups/themes` proxies it.                                                   |
| **W2 payload**               | Single **`themeId`** (number \| null) on `PATCH …/onboarding/step-2` — maps to `account.theme`; server validates `api::theme.theme` row (`isPublic` true for catalogue pick, false for custom).                                                                       |
| **Custom theme cardinality** | No extra enforcement in the app until CMS exposes rules; UI allows one create flow per session; Strapi may enforce limits later.                                                                                                                                      |
| **Logo persistence**         | **Unchanged** — CMS must choose schema ([response §6–7](./cms-response-phase3-themes-and-logo.md)); members keeps logo UI as placeholder until then. **M1** BFF remains; after logo decision, invalidate **`account.mediaLibrary`** when uploads affect library rows. |

## Custom theme API

- **Strapi (target):** `POST /api/accounts/:accountId/onboarding/step-2/theme` — creates `isPublic: false` theme and sets `account.theme` (or equivalent single operation).
- **BFF:** `POST /api/accounts/[accountId]/onboarding/step-2/theme` forwards JSON body.
