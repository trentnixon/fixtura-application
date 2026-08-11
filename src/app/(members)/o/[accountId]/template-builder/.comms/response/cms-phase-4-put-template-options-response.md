# CMS response — Phase 4: `PUT` template options save contract

> **Superseded** by [handoff-put-template-options.md](./handoff-put-template-options.md) (implemented contract, 2026-06-04). Keep for Q&A history only.

**From:** CMS / Strapi (Fixtura Backend)  
**To:** Fixtura App (template builder POC)  
**Date:** 2026-06-04  
**In reply to:** [cms-phase-4-put-template-options-questions.md](../cms-phase-4-put-template-options-questions.md)

---

## Summary

The Strapi route **`PUT /api/template-option/put-template-options/:accountId`** exists and can create or update an account’s `template-option` row. **It is not ready for BFF proxying as-is:**

- Request body uses a **legacy nested shape** (not your flat `templateCategoryId` placeholder).
- **`templateVideoId` is not saved** by the current handler.
- **`useBackground` is an enum string**, not boolean.
- **No JWT, ownership check, or users-permissions** on the route today.
- Errors return **`{ success: false, error }`** in the body, often with **HTTP 200**.

We recommend implementing the **Phase 4 target contract** documented in the handoff before you wire save. Below answers your checklist against **current code** and **planned contract**.

---

## 1. Request body — exact schema

### Current (legacy — live today)

Wrap fields in **`data`**. Use **numeric catalog ids** from GET arrays via nested objects:

| App editor field     | CMS PUT field (current)                           | Notes                        |
| -------------------- | ------------------------------------------------- | ---------------------------- |
| `templateCategoryId` | `data.selectedCategory.id`                        |                              |
| `templateModeId`     | `data.mode.id`                                    | **Required**                 |
| `templatePaletteId`  | `data.selectedTemplatePalette.id`                 |                              |
| `templateGradientId` | `data.selectedSecondaryFilterOptions.gradient.id` |                              |
| `templateImageId`    | `data.selectedSecondaryFilterOptions.image.id`    |                              |
| `templateNoiseId`    | `data.selectedSecondaryFilterOptions.noise.id`    |                              |
| `templateParticleId` | `data.selectedSecondaryFilterOptions.particle.id` |                              |
| `templatePatternId`  | `data.selectedSecondaryFilterOptions.pattern.id`  |                              |
| `templateTextureId`  | `data.selectedSecondaryFilterOptions.texture.id`  |                              |
| `templateVideoId`    | _(not implemented)_                               | Gap                          |
| `useBackground`      | `data.selectedBackgroundOptions`                  | **Enum string**, not boolean |

**Example (current — create and update use the same shape):**

```json
{
  "data": {
    "selectedCategory": { "id": 1 },
    "mode": { "id": 2 },
    "selectedTemplatePalette": { "id": 3 },
    "selectedBackgroundOptions": "Gradient",
    "selectedSecondaryFilterOptions": {
      "gradient": { "id": 4 },
      "image": { "id": 5 },
      "noise": { "id": 6 },
      "particle": { "id": 7 },
      "pattern": { "id": 8 },
      "texture": { "id": 9 }
    }
  }
}
```

Flat ids are **plain relation ids** (not `connect` / `disconnect`). **`templateOptionId` is not in the body.**

### Target (Phase 4 — to be implemented)

Your placeholder flat shape is the **intended** contract after CMS hardening:

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

`useBackground` values: `Solid` | `Gradient` | `Video` | `Image` | `Graphics` | `Texture` | `Particle`.

---

## 2. Create vs update

| Question                                          | Answer                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Creates when `templateOptionId: null` on account? | **Yes** — creates `template-option` and links via `account` relation |
| HTTP status on create                             | **200** today (not 201)                                              |
| Success body                                      | `{ "success": true, "templateOptionId": <number> }`                  |
| `GET /api/account/me` after create?               | **Yes** — refetch shows new `templateOptionId`                       |
| `templateOptionId` in PUT body?                   | **Omit** — not used; account linkage drives create vs update         |

---

## 3. Required fields, validation, and clears

### Current

- **Required:** effectively `data.mode.id` only.
- **Validation:** none on catalog ids or category/mode pairing.
- **Clear / omit:** undefined behaviour; omitted nested objects likely leave prior relations unchanged.

### Target (planned)

| Topic                   | Planned rule                                            |
| ----------------------- | ------------------------------------------------------- |
| Required every save     | `templateModeId`, `templateCategoryId`, `useBackground` |
| Clear optional relation | Send **`null`** for that `*Id` field                    |
| Omit key                | **Preserve** previous value                             |
| Unknown/unpublished id  | **400** with structured error code                      |

---

## 4. Success response

### Current

HTTP **200**:

```json
{
  "success": true,
  "templateOptionId": 42
}
```

No `{ data: … }` envelope. No echoed relations — **refetch GET** for full `currentSelection`.

### Target

```json
{
  "data": {
    "templateOptionId": 42
  }
}
```

HTTP **200** (or **201** on first create — TBC when implemented).

---

## 5. Error responses

### Current

| Case                  | Status          | Body                                                                |
| --------------------- | --------------- | ------------------------------------------------------------------- |
| Account not found     | Often **200**   | `{ "success": false, "error": "Account not found" }`                |
| Update/create failure | Often **200**   | `{ "success": false, "error": "Failed to update template_option" }` |
| No JWT                | Allowed         | No auth                                                             |
| Wrong account         | Not checked     | —                                                                   |
| Invalid relation id   | Generic failure | `{ "success": false, "error": "…" }`                                |

### Target (aligned with GET)

| Case                           | Status  | Body                                             |
| ------------------------------ | ------- | ------------------------------------------------ |
| Validation failure             | **400** | `{ "error": { "message", "code" } }` (shape TBC) |
| No JWT                         | **401** | `Authentication required`                        |
| Wrong account                  | **404** | `Account not found`                              |
| Forbidden template option      | **403** | `Forbidden`                                      |
| Missing permission             | **403** | —                                                |
| Invalid/unpublished catalog id | **400** | e.g. `UNKNOWN_OR_DRAFT_TEMPLATE_*`               |

---

## 6. Branding boundary

- PUT updates **only** `template-option` and its relations.
- Does **not** update theme / organisation colour JSON.
- **Separate** from app `PATCH /api/accounts/:accountId/branding` (palette + `templateModeId`).
- **Note:** branding PATCH may also write `template_mode` on the same `template-option` row — avoid conflicting parallel saves for mode.

---

## 7. Permissions

| Endpoint                           | Permission                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| GET `all-template-options`         | `api::template-category.template-category.getAllTemplateOptions`                                |
| PUT `put-template-options` (today) | **None** (`auth: false`)                                                                        |
| PUT (target)                       | New action e.g. `api::template-option.template-option.putTemplateOptions` for **Authenticated** |

---

## Response checklist

- [x] **PUT request JSON (current legacy)** — nested `data` example above
- [ ] **PUT request JSON (target flat)** — pending CMS implementation; use placeholder from questions doc
- [x] **Success response (current)** — `{ success, templateOptionId }`
- [ ] **Success response (target)** — `{ data: { templateOptionId } }` pending implementation
- [x] **Errors (current)** — `{ success: false, error }`, often HTTP 200
- [ ] **Errors (target)** — proper 4xx/5xx pending implementation
- [x] **Field name table** — legacy paths above; flat ids **not supported yet**
- [x] **Create vs update rules** — by account linkage; omit body `templateOptionId`
- [x] **Null / omit / clear** — undefined today; target: `null` clears, omit preserves
- [x] **Permission names** — none today; target scope documented in handoff
- [x] **Branding boundary** — template-option only; branding PATCH is separate (shared `template_mode` caveat)

---

## Recommended next steps

**CMS**

1. Implement Phase 4 target contract (flat body, auth, ownership, validation, `templateVideoId`, publish on create).
2. Add structured errors matching GET.

**App**

1. Hold BFF save until target contract ships (or temporarily map to legacy nested body if urgent — not recommended).
2. Map `useBackground` as enum string, not boolean.
3. After save: refetch `/account/me` and `all-template-options`.

**Contact / ticket:** _(add channel or Jira link)_
