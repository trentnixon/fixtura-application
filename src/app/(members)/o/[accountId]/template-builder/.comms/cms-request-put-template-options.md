# CMS request: `PUT /api/template-option/put-template-options/:accountId`

**From:** Fixtura App (members template builder POC)  
**To:** CMS / Strapi (template-option) team  
**Date:** 2026-06-04  
**Purpose:** Confirm the write contract for persisting flattened template-option choices. The app has **GET** wired; **PUT** is not implemented in the Next BFF until this contract is documented.

**Canonical contract (implemented):** [handoff-put-template-options.md](./response/handoff-put-template-options.md)  
**Phase 4 questionnaire (historical):** [cms-phase-4-put-template-options-questions.md](./cms-phase-4-put-template-options-questions.md)  
**Product questionnaire:** [product-phase-4-template-builder-questions.md](./product-phase-4-template-builder-questions.md)

**App context:**

- Route: `/o/[accountId]/template-builder` (read-only diagnostic today)
- Catalog + hydration: `GET /api/accounts/:accountId/all-template-options` → Strapi `GET /api/template-categories/all-template-options`
- Phase 1 contract: [phase-1-data-contract.md](../.docs/phase-1-data-contract.md)

**Existing narrative reference:** `.comms/data-fetching/handoff/handoff-template-all-template-options.md` (states PUT body is “unchanged” and to use catalog `id` values — no schema included).

---

## Strapi endpoint (expected)

| Property       | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **Method**     | `PUT`                                                           |
| **Path**       | `/api/template-option/put-template-options/:accountId`          |
| **Path param** | `accountId` — positive integer; caller must own the account     |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>` (users-permissions) |

The app will add a BFF route that forwards the JSON body with the session cookie JWT, matching other account-scoped proxies.

---

## What we need from CMS

Please document or confirm each item below. A sample request/response JSON is ideal.

### 1. Request body shape

- Exact field names for each relation (e.g. `templateCategoryId` vs `templateCategory` vs nested Strapi `connect` / `disconnect`).
- Are values **numeric ids** from the GET catalog lists?
- Is **`useBackground`** included? Type (`boolean`, string enum, etc.)?
- Is **`templateOptionId`** (row id) required on update? How is create represented?

### 2. Create vs update

- If the account has **no** `template-option` row yet (`templateOptionId` null on `GET /api/account/me`), does PUT **create** a row and link it to the account?
- If yes, what is returned (new id)? Does `GET /account/me` then expose `templateOptionId`?

### 3. Required fields and clears

- Which fields are required on every save?
- Can the client clear an optional relation by sending `null`, `0`, or omitting the key?
- Any server validation tying choices to **category** or **mode**?

### 4. Success response

- HTTP status (**200** vs **201** on create).
- JSON envelope (e.g. `{ data: { ... } }`) and which fields are echoed (ids, slugs, full row).

### 5. Error responses

- Status codes and body shape for:
  - Validation failure (**400**)
  - Unauthorized (**401**)
  - Forbidden / wrong account (**403**)
  - Not found (**404**)
- Unknown relation id or unpublished catalog id — which status?

### 6. Branding overlap

- Does this PUT update only **`template-option`**, or also **theme** / **template mode** on the account?
- The app already has **`PATCH /api/accounts/:accountId/branding`** for palette + `templateModeId`. Confirm these stay separate from template-option PUT.

---

## Illustrative payload (placeholder — replace with CMS truth)

Do **not** treat this as authoritative until CMS confirms:

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

## App expectations after contract is agreed

1. Implement Next BFF `PUT /api/accounts/:accountId/template-options` (or agreed path) proxying to Strapi.
2. Map Phase 2 **normalized `draftState`** to the confirmed CMS body (no guessed field names).
3. On success, invalidate/refetch:
   - `all-template-options` (with current `templateOptionId`)
   - `account/me` and branding if `templateOptionId` can change on create
4. Disable save in UI unless dirty (Phase 4).

---

## References (this repo)

- GET types: `src/types/api/all-template-options.ts`
- GET BFF: `src/app/api/accounts/[accountId]/all-template-options/route.ts`
- Branding PATCH types: `src/types/api/account.ts` (`PatchAccountBrandingBody`)
- `.comms/API/handoff-all-template-options.md`

---

## Document history

| Date       | Change                         |
| ---------- | ------------------------------ |
| 2026-06-04 | Initial CMS request (Phase 1). |
