# Handoff — Phase 4: `PUT` template options save (Fixtura App)

**From:** CMS / Strapi (Fixtura Backend)  
**To:** Fixtura App (template builder)  
**Date:** 2026-06-04  
**Status:** Implemented — ready for E2E after Strapi permission enabled (see [Permissions](#permissions))

This is the **canonical** PUT save contract. Supersedes [cms-phase-4-put-template-options-questions.md](../cms-phase-4-put-template-options-questions.md) and [cms-phase-4-put-template-options-response.md](./cms-phase-4-put-template-options-response.md).

---

## Summary

`PUT /api/template-option/put-template-options/:accountId` persists an account’s **`template-option`** row (category, mode, palette, background type, secondary filters including video).

| Topic              | Contract                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Body               | **Flat camelCase** ids aligned with GET `currentSelection` (legacy nested shape **removed**) |
| Auth               | `Authorization: Bearer <JWT>` + account ownership                                            |
| Create             | **201** `{ "data": { "templateOptionId": <n> } }`                                            |
| Update             | **200** same body shape                                                                      |
| Errors             | `{ "error": { "code", "message" } }` with real HTTP status                                   |
| `useBackground`    | **Enum string**, not boolean                                                                 |
| Refetch after save | `GET /api/account/me` → `GET …/all-template-options?templateOptionId=…`                      |

---

## Context

**Read (wired in app):**

| Layer   | Endpoint                                                                           |
| ------- | ---------------------------------------------------------------------------------- |
| App BFF | `GET /api/accounts/:accountId/all-template-options`                                |
| Strapi  | `GET /api/template-categories/all-template-options?accountId=…&templateOptionId=…` |

Handoff: `.comms/API/handoff-all-template-options.md` (repo root)

**Save (wired in app):**

| Layer   | Endpoint                                                   |
| ------- | ---------------------------------------------------------- |
| App BFF | `PUT /api/accounts/:accountId/template-options`            |
| Strapi  | `PUT /api/template-option/put-template-options/:accountId` |

Implementation: `src/app/api/accounts/[accountId]/template-options/route.ts`

---

## Request

| Item         | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Method       | `PUT`                                                                    |
| Path         | `/api/template-option/put-template-options/:accountId`                   |
| Path param   | `accountId` — positive integer; JWT user must **own** account            |
| Auth         | `Authorization: Bearer <JWT>`                                            |
| Body wrapper | Optional `{ "data": { … } }` (Strapi-style); inner object uses flat keys |

### Full example (create and update)

```json
{
  "templateCategoryId": 1,
  "templateModeId": 2,
  "templatePaletteId": 3,
  "templateGradientId": 4,
  "templateImageId": 5,
  "templateNoiseId": 6,
  "templateParticleId": 7,
  "templatePatternId": 8,
  "templateTextureId": 9,
  "templateVideoId": 10,
  "useBackground": "Gradient"
}
```

### Partial update example (omit preserves palette)

```json
{
  "templateCategoryId": 1,
  "templateModeId": 2,
  "useBackground": "Solid"
}
```

Omitted `templatePaletteId` → existing palette unchanged on update.

### Clear optional relation

```json
{
  "templateCategoryId": 1,
  "templateModeId": 2,
  "useBackground": "Gradient",
  "templateGradientId": null
}
```

### Field mapping (GET → PUT → Strapi)

| App editor / GET `currentSelection` | PUT body field       | Required | Notes                           |
| ----------------------------------- | -------------------- | -------- | ------------------------------- |
| `templateCategory.id`               | `templateCategoryId` | Yes      | Published, non-private category |
| `templateMode.id`                   | `templateModeId`     | Yes      | Published mode                  |
| `templatePalette.id`                | `templatePaletteId`  | No       | Catalog numeric id              |
| `templateGradient.id`               | `templateGradientId` | No       | `null` clears                   |
| `templateImage.id`                  | `templateImageId`    | No       |                                 |
| `templateNoise.id`                  | `templateNoiseId`    | No       |                                 |
| `templateParticle.id`               | `templateParticleId` | No       |                                 |
| `templatePattern.id`                | `templatePatternId`  | No       |                                 |
| `templateTexture.id`                | `templateTextureId`  | No       |                                 |
| `templateVideo.id`                  | `templateVideoId`    | No       |                                 |
| `useBackground`                     | `useBackground`      | Yes      | Enum string (see below)         |

- Values are **plain numeric catalog ids** from GET arrays (not Strapi `connect` / `disconnect`).
- **`templateOptionId` is not in the body.** Create vs update = whether account already has a linked `template-option` row.

### `useBackground` (enum string)

`Solid` | `Gradient` | `Video` | `Image` | `Graphics` | `Texture` | `Particle`

---

## Validation rules

| Rule                     | Behaviour                                                  |
| ------------------------ | ---------------------------------------------------------- |
| Required every save      | `templateCategoryId`, `templateModeId`, `useBackground`    |
| Optional `*Id` fields    | Validated when present; must be **published** catalog rows |
| Private category         | **400** `CATEGORY_NOT_AVAILABLE`                           |
| Omit key on update       | **Preserve** previous relation                             |
| `null` on optional `*Id` | **Clear** that relation                                    |
| Category/mode pairing    | **Not** enforced in v1                                     |
| Publish                  | Row gets `publishedAt` on create and update                |

---

## Create vs update

| Question                                                       | Answer                                         |
| -------------------------------------------------------------- | ---------------------------------------------- |
| Account has `templateOptionId: null` on `GET /api/account/me`? | PUT **creates** row and links to account       |
| HTTP status                                                    | **201** create, **200** update                 |
| Success body                                                   | `{ "data": { "templateOptionId": <number> } }` |
| After create, `account/me`?                                    | Refetch — new `templateOptionId` appears       |
| `templateOptionId` in PUT body?                                | **Never** — omit                               |

PUT does **not** return full `currentSelection` — refetch GET catalog after save.

---

## Error responses

Shape: `{ "error": { "code": "<CODE>", "message": "<text>" } }`

| HTTP    | When                                    | Example `code`                                                                                                                                       |
| ------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **401** | No JWT                                  | (Strapi default)                                                                                                                                     |
| **403** | Missing `putTemplateOptions` permission | (Strapi default)                                                                                                                                     |
| **400** | Invalid body / validation               | `INVALID_BODY`, `MISSING_REQUIRED_FIELD`, `INVALID_USE_BACKGROUND`, `INVALID_TEMPLATE_*_ID`, `UNKNOWN_OR_DRAFT_TEMPLATE_*`, `CATEGORY_NOT_AVAILABLE` |
| **404** | Account missing or not owned            | `ACCOUNT_NOT_FOUND`                                                                                                                                  |
| **500** | Save failed                             | `SAVE_FAILED`                                                                                                                                        |

---

## Permissions

| Endpoint    | Users-permissions action                                         |
| ----------- | ---------------------------------------------------------------- |
| GET catalog | `api::template-category.template-category.getAllTemplateOptions` |
| PUT save    | `api::template-option.template-option.putTemplateOptions`        |

**Strapi Admin (required once per environment):**  
Settings → Users & Permissions → **Authenticated** → **Template-option** → enable **putTemplateOptions**  
(Same role that has **getAllTemplateOptions** on Template-category.)

Restart Strapi if the action does not appear after deploy.

---

## Branding boundary

| Topic                 | Answer                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| What PUT updates      | **Only** `template-option` and its relations                                                     |
| Account theme colours | **Not** updated (use branding PATCH)                                                             |
| Overlap               | Branding `PATCH` may also set `template_mode` on the same row — avoid parallel conflicting saves |

---

## App integration checklist

- [ ] Enable **putTemplateOptions** for Authenticated in Strapi Admin (ops)
- [x] BFF `PUT /api/accounts/:accountId/template-options` → Strapi with JWT + flat body
- [x] Map draft state → flat fields; `useBackground` as enum string
- [x] On **201/200**: refetch `account/me`, `all-template-options`, branding
- [ ] E2E smoke — [phase-4-integration-smoke-checklist.md](../../.docs/phase-4-integration-smoke-checklist.md)

---

## Manual verification

1. PUT without JWT → **401**
2. PUT another user’s `accountId` → **404** `ACCOUNT_NOT_FOUND`
3. First save → **201**; refetch `account/me` + catalog with `templateOptionId`
4. Partial PUT (omit palette) → **200**; palette unchanged in GET `currentSelection`
5. `templateGradientId: null` → gradient cleared in GET
6. Unpublished catalog id → **400** `UNKNOWN_OR_DRAFT_*`

---

## Out of scope (v1)

- Category/mode pairing validation beyond published + non-private category
- `useBackground: Video` requires `templateVideoId` (not enforced)
