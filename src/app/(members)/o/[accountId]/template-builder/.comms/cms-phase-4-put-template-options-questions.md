# CMS request — Phase 4: `PUT` template options save contract

**From:** Fixtura App (template builder POC)  
**To:** CMS / Strapi (template-option team)  
**Date:** 2026-06-04  
**Status:** Blocking Phase 4 implementation  
**Related:** [cms-request-put-template-options.md](./cms-request-put-template-options.md), [phase-1-data-contract.md](../.docs/phase-1-data-contract.md), [phase-4-save-pathway-llm-brief.md](../.docs/phase-4-save-pathway-llm-brief.md)

---

## Context

The members app route `/o/[accountId]/template-builder` can **read** the full template catalog and optional saved row via:

- App: `GET /api/accounts/:accountId/all-template-options`
- Strapi: `GET /api/template-categories/all-template-options?accountId=…&templateOptionId=…` (optional)

The editor normalizes `currentSelection` into draft state (category, mode, palette, gradient, image, noise, particle, pattern, texture, video, `useBackground`). **Save is not wired** until this PUT contract is confirmed.

Narrative reference: `.comms/data-fetching/handoff/handoff-template-all-template-options.md` (states PUT body is “unchanged” and to use catalog `id` values — **no request schema in repo**).

---

## Endpoint we plan to proxy

| Property        | Value                                                   |
| --------------- | ------------------------------------------------------- |
| **Method**      | `PUT`                                                   |
| **Strapi path** | `/api/template-option/put-template-options/:accountId`  |
| **Path param**  | `accountId` — positive integer; caller must own account |
| **Auth**        | `Authorization: Bearer <jwt>` (users-permissions)       |

Planned app BFF (after contract confirmed):

- `PUT /api/accounts/:accountId/template-options` → forwards JSON body + JWT to Strapi path above.

---

## What we need from you

Please answer every section below. **Sample request and response JSON** for create and update is strongly preferred.

### 1. Request body — exact schema

- List **exact field names** for each relation we persist.
- Are values **numeric catalog ids** from the GET `categories`, `modes`, `palettes`, etc. arrays?
- Flat ids (e.g. `templateCategoryId`) vs nested objects (e.g. `templateCategory: { id: 1 }`) vs Strapi v4 **`connect` / `disconnect`**?
- Is **`useBackground`** in the body? Type (`boolean` only, or string enum)?
- Is **`templateOptionId`** (saved row id) required in the body on update? How is **create** represented when the account has no row yet?

**Editor fields we will map (names on our side — confirm CMS keys):**

| App editor field     | GET `currentSelection` path | CMS PUT field name (confirm) |
| -------------------- | --------------------------- | ---------------------------- |
| `templateCategoryId` | `templateCategory?.id`      | ?                            |
| `templateModeId`     | `templateMode?.id`          | ?                            |
| `templatePaletteId`  | `templatePalette?.id`       | ?                            |
| `templateGradientId` | `templateGradient?.id`      | ?                            |
| `templateImageId`    | `templateImage?.id`         | ?                            |
| `templateNoiseId`    | `templateNoise?.id`         | ?                            |
| `templateParticleId` | `templateParticle?.id`      | ?                            |
| `templatePatternId`  | `templatePattern?.id`       | ?                            |
| `templateTextureId`  | `templateTexture?.id`       | ?                            |
| `templateVideoId`    | `templateVideo?.id`         | ?                            |
| `useBackground`      | `useBackground`             | ?                            |

**Placeholder only — do not treat as authoritative until you confirm:**

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
  "useBackground": true
}
```

---

### 2. Create vs update

- If `GET /api/account/me` has **`templateOptionId: null`** (no saved row), does this PUT **create** a `template-option` row and link it to the account?
- HTTP status on create: **200** or **201**?
- What does the success body return (at minimum: new row **`id`**)?
- After create, does **`GET /api/account/me`** expose the new `templateOptionId` on the account row?
- Can the client omit `templateOptionId` in the PUT body on create, or must it send something else?

---

### 3. Required fields, validation, and clears

- Which fields are **required on every save**?
- Server rules tying choices to **category** or **mode** (e.g. palette only valid for a given category)?
- To **clear** an optional relation, should the client send:
  - `null`
  - `0`
  - omit the key
  - Strapi `disconnect`
- Same question for **`useBackground`**.
- If a key is **omitted**, does the server **preserve** the previous value or **clear** it?
- Behavior for **unknown or unpublished** catalog ids (status code + error body).

---

### 4. Success response

- HTTP status(es).
- JSON envelope (e.g. `{ data: { … } }` vs flat).
- Which fields are echoed (ids only vs full nested relations vs slug labels).
- Is the response sufficient for the app to refetch via GET only, or must the client use PUT response as source of truth?

---

### 5. Error responses

Please document status + body shape for:

| Case                                 | Expected status? | Body shape? |
| ------------------------------------ | ---------------- | ----------- |
| Validation failure                   | ?                | ?           |
| No JWT                               | 401?             | ?           |
| Wrong account / forbidden            | 403?             | ?           |
| Account or template-option not found | 404?             | ?           |
| Invalid relation id                  | 400 vs 404?      | ?           |
| Missing Strapi permission            | 403?             | ?           |

---

### 6. Branding and account scope (boundary)

- Does this PUT update **only** the `template-option` entity and its relations?
- Or does it also update **account theme**, **template mode on account**, or other branding fields?
- Confirm this stays **separate** from app `PATCH /api/accounts/:accountId/branding` (palette + `templateModeId` only today).

---

### 7. Permissions

- Which users-permissions action must be enabled for Authenticated (or other roles) to call this PUT?
- Same role as `getAllTemplateOptions`, or different?

---

## App behavior after we have answers

1. Document contract in `phase-1-data-contract.md` and optional `.comms/API/` handoff.
2. Implement BFF `PUT /api/accounts/:accountId/template-options`.
3. Map normalized draft state → confirmed body (no guessed field names).
4. On success: invalidate/refetch `GET /account/me`, then `GET …/all-template-options?templateOptionId=…`, and branding if PUT affects branding display.

---

## References (Fixtura app repo)

- GET types: `src/types/api/all-template-options.ts`
- GET BFF: `src/app/api/accounts/[accountId]/all-template-options/route.ts`
- Branding PATCH: `src/app/api/accounts/[accountId]/branding/route.ts`
- Handoff: `.comms/API/handoff-all-template-options.md`

---

## Response checklist (for CMS team)

Please reply with:

- [ ] Confirmed PUT request JSON (create example)
- [ ] Confirmed PUT request JSON (update example)
- [ ] Confirmed success response JSON (create + update)
- [ ] Confirmed error examples (400, 403, 404 as applicable)
- [ ] Field name table completed (or “same as placeholder” with any exceptions)
- [ ] Create vs update rules
- [ ] Null / omit / clear semantics
- [ ] Permission name(s)
- [ ] Branding boundary confirmation

**Contact / ticket:** _(add your channel or Jira link)_
