# App handoff — Phase 3 onboarding Step 2 (M1 upload, W2 branding write)

**From:** CMS (Strapi) backend  
**To:** Fixtura members app (BFF + frontend)  
**Date:** 2026-04-07  
**Related:** [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.2 (W2), §4.6 (M1 + sequencing), [PhasedIntegrationPath.md](../../.docs/PhasedIntegrationPath.md) Phase 3 · **CMS contract (implemented routes):** [cms-handoff-onboarding-phase3-step2.md](./cms-handoff-onboarding-phase3-step2.md) · **Theme catalogue + custom theme (request):** [cms-request-onboarding-phase3-themes-and-logo.md](./cms-request-onboarding-phase3-themes-and-logo.md) · **Integration notes:** [integration-notes-phase3-step2.md](./integration-notes-phase3-step2.md)

## Summary

Upstream should implement **sequence (a)** from §4.6: **M1** returns a **media id**; **W2** persists branding fields including that id. Hydration continues to use **`GET /api/accounts/:accountId/branding`** (read-only; already in app).

**Base URL:** `{STRAPI_URL}/api` (same as existing account routes).

---

## Auth

All endpoints require the same **JWT (Bearer)** as `GET /api/account/me`.

**Strapi permissions:** Authenticated role must allow the custom actions used by:

| Action                                      | Used by |
| ------------------------------------------- | ------- |
| `uploadOnboardingStep2Logo` (or equivalent) | M1      |
| `updateOnboardingStep2` (or equivalent)     | W2      |

If an action is disabled, the client receives **403** with a valid JWT.

---

## M1 — POST logo / onboarding media upload

- **Upstream:** `POST {STRAPI_URL}/api/accounts/:accountId/onboarding/step-2/upload`
- **Content-Type:** `multipart/form-data`
- **Auth:** Bearer JWT; user must own the account.

### Request

- Form field **`file`**: one image file (product: logo).
- **Constraints (document actual limits in Strapi):** e.g. max size (e.g. 5 MB), allowed MIME (`image/png`, `image/jpeg`, `image/webp`, …).

### Success: **200** or **201**

```json
{
  "data": {
    "id": 123
  }
}
```

- **`id`:** Strapi `upload` / media id to pass to **W2** as `logoMediaId`.

### Errors

- **400** — missing file, invalid MIME, oversize, etc. (prefer structured `error` / `message` consistent with W1).

---

## W2 — PATCH Step 2 branding fields

- **Upstream:** `PATCH {STRAPI_URL}/api/accounts/:accountId/onboarding/step-2`
- **Content-Type:** `application/json`
- **Auth:** Bearer JWT; user must own the account.

### Request body

Send a JSON object (optionally wrapped in `{ "data": { ... } }` — both accepted if consistent with W1).

| Field         | Type           | Notes                                                                                                                                                                                                  |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `themeId`     | number \| null | Optional. Sets `account.theme` → `api::theme.theme` id (premade `isPublic: true` or custom `isPublic: false`). See [cms-response-phase3-themes-and-logo.md](./cms-response-phase3-themes-and-logo.md). |
| `logoMediaId` | number \| null | Optional. References uploaded media from **M1**; `null` clears a previously set logo if product allows.                                                                                                |

Brand colours are **not** on W2; they are stored on the linked theme (`Theme` JSON on `api::theme.theme`).

At least **one** field must be present; otherwise **400** with `code: "EMPTY_UPDATE"` (mirror W1).

**Idempotency:** Repeating the same PATCH should yield **200** with the same logical outcome.

### Success: **200**

```json
{
  "data": {
    "accountId": 42,
    "updated": {
      "themeId": 7,
      "logoMediaId": 123
    }
  }
}
```

### Errors

- Same general patterns as W1 (validation, 403, 404).

---

## BFF (members app) — mirror paths

| Method | App path                                             | Upstream                                                                    |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/account/onboarding/lookups/themes`             | `GET …/account/onboarding/lookups/themes` (premade catalogue)               |
| POST   | `/api/accounts/[accountId]/onboarding/step-2/theme`  | `POST …/accounts/:accountId/onboarding/step-2/theme` (custom private theme) |
| POST   | `/api/accounts/[accountId]/onboarding/step-2/upload` | `POST …/accounts/:accountId/onboarding/step-2/upload`                       |
| PATCH  | `/api/accounts/[accountId]/onboarding/step-2`        | `PATCH …/accounts/:accountId/onboarding/step-2`                             |

Implementation references:

- BFF themes lookup: [`src/app/api/account/onboarding/lookups/themes/route.ts`](../../../../api/account/onboarding/lookups/themes/route.ts)
- BFF custom theme: [`src/app/api/accounts/[accountId]/onboarding/step-2/theme/route.ts`](../../../../api/accounts/[accountId]/onboarding/step-2/theme/route.ts)
- BFF upload: [`src/app/api/accounts/[accountId]/onboarding/step-2/upload/route.ts`](../../../../api/accounts/[accountId]/onboarding/step-2/upload/route.ts)
- BFF PATCH: [`src/app/api/accounts/[accountId]/onboarding/step-2/route.ts`](../../../../api/accounts/[accountId]/onboarding/step-2/route.ts)
- Client: [`accountApi.getOnboardingLookupsThemes`](../../../../../lib/api/services/account.api.ts), [`accountApi.createOnboardingStep2Theme`](../../../../../lib/api/services/account.api.ts), [`accountApi.uploadOnboardingStep2Logo`](../../../../../lib/api/services/account.api.ts), [`accountApi.updateOnboardingStep2`](../../../../../lib/api/services/account.api.ts)

---

## FE flow (wizard Step 2)

1. **`GET /api/account/onboarding/lookups/themes`** — premade dropdown; hydrate current **`themeId`** from **`GET …/branding`** `data.theme.id` when present.
2. **`POST …/onboarding/step-2/theme`** — optional “custom theme”; then **`PATCH` W2** with `themeId` (and `logoMediaId` when applicable).
3. Hydrate from **`GET /api/accounts/[accountId]/branding`**: template/poster preview if present.
4. Logo: when enabled, `POST` **M1** then `PATCH` **W2** with `logoMediaId`; until schema is fixed, UI may keep a placeholder.

---

## Document history

| Date       | Change                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| 2026-04-07 | Initial Phase 3 M1/W2 handoff for BFF + app implementation.                          |
| 2026-04-07 | `themeId` on W2; GET themes + POST custom theme BFF paths; CMS response cross-links. |
