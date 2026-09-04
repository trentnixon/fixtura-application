# Phase 1 Data Contract — Template Builder

**Status:** Phase 1 complete (documentation). CMS PUT **implemented** (2026-06-04); app BFF wired (see § Save payload contract).  
**Route:** `/o/[accountId]/template-builder`  
**Related:** [phase-1-recover-data-contract-llm-brief.md](./phase-1-recover-data-contract-llm-brief.md), [template-builder-route-plan.md](./template-builder-route-plan.md), [cms-request-put-template-options.md](../.comms/cms-request-put-template-options.md)

---

## Endpoint summary

### Full template catalog + optional saved row

| Layer   | Method | Path                                            | Notes                                                        |
| ------- | ------ | ----------------------------------------------- | ------------------------------------------------------------ |
| App BFF | `GET`  | `/api/accounts/:accountId/all-template-options` | Cookie JWT; forwards to Strapi                               |
| CMS     | `GET`  | `/api/template-categories/all-template-options` | Query: `accountId` (required), `templateOptionId` (optional) |

**App implementation:** `src/app/api/accounts/[accountId]/all-template-options/route.ts`  
**Client:** `useAllTemplateOptions` → `accountApi.getAllTemplateOptions`  
**Types:** `src/types/api/all-template-options.ts`  
**Canonical spec:** `.comms/API/handoff-all-template-options.md`  
**Narrative:** `.comms/data-fetching/handoff/handoff-template-all-template-options.md`

**BFF validation:**

- Missing auth → **401**
- Invalid `accountId` segment → **400**
- `templateOptionId` query present but not a positive integer → **400** (never forwarded to Strapi)
- Strapi errors forwarded with same status; message normalized from Strapi `error` field

**App gateway redirect (not thrown as query error):** HTTP **400**, **403**, **404** from BFF resolve to `SelectOrgGatewayReason` in `useAllTemplateOptions` (same pattern as branding). `template-builder-content.tsx` redirects to select-org gateway.

### Category list (includes private)

| Layer   | Method | Path                                                  |
| ------- | ------ | ----------------------------------------------------- |
| App BFF | `GET`  | `/api/account/template-categories/list-for-selection` |
| CMS     | `GET`  | `/api/template-categories/list-for-selection`         |

**Client:** `useTemplateCategoriesListForSelection`  
**Handoff:** `.comms/data-fetching/handoff/handoff-list-for-selection.md`

Use for dropdowns when private categories must be visible; full catalog `categories` omits `isPrivate: true` rows.

### Branding read (context only)

| Layer   | Method | Path                                |
| ------- | ------ | ----------------------------------- |
| App BFF | `GET`  | `/api/accounts/:accountId/branding` |

Supplies `templateOptionId` fallback and high-level template/theme labels. **`template_option`** on branding is scheduler-aligned `Record<string, unknown>` — not used to build editor `savedState`. Use catalog `currentSelection` instead.

### Account bootstrap

| Layer   | Method | Path              |
| ------- | ------ | ----------------- |
| App BFF | `GET`  | `/api/account/me` |

`accounts[].templateOptionId` (nullable) is the **primary** source for catalog hydration param.

---

## Option group inventory

Source of truth for frontend shapes: `src/types/api/all-template-options.ts`.  
Catalog arrays are **published-only**, sorted by `id` ascending. Arrays may be empty (`[]`).

**Display label convention (Phase 3):** `name ?? slug ?? String(id)` (categories/modes have `slug`; others may use `name` only).

### `categories` — `TemplateCategoryCatalogItem[]`

| Field              | Type    | Nullable | Notes                          |
| ------------------ | ------- | -------- | ------------------------------ |
| `id`               | number  | no       | Selection value                |
| `name`             | string  | yes      | Label                          |
| `slug`             | string  | yes      | Label fallback                 |
| `divideFixturesBy` | string  | yes      | CMS JSON field                 |
| `isPrivate`        | boolean | no       | Always `false` in this list    |
| `bundleAudio`      | object  | yes      | `id`, `name`, `audioOptions[]` |

**Private categories:** excluded. See `list-for-selection`.

### `modes` — `TemplateModeItem[]`

| Field  | Type   | Nullable |
| ------ | ------ | -------- |
| `id`   | number | no       |
| `name` | string | yes      |
| `slug` | string | yes      |

### `palettes` — `TemplatePaletteItem[]`

| Field   | Type   | Nullable |
| ------- | ------ | -------- |
| `id`    | number | no       |
| `name`  | string | yes      |
| `value` | string | yes      |

### `gradients` — `TemplateGradientItem[]`

| Field       | Type   | Nullable |
| ----------- | ------ | -------- |
| `id`        | number | no       |
| `name`      | string | yes      |
| `type`      | string | yes      |
| `direction` | string | yes      |

### `images` — `TemplateImageItem[]`

| Field                | Type   | Nullable |
| -------------------- | ------ | -------- |
| `id`                 | number | no       |
| `name`               | string | yes      |
| `animationType`      | string | yes      |
| `animationDirection` | string | yes      |
| `overlayStyle`       | string | yes      |
| `gradientType`       | string | yes      |
| `overlayOpacity`     | number | yes      |

### `noises` — `TemplateNoiseItem[]`

| Field       | Type   | Nullable |
| ----------- | ------ | -------- |
| `id`        | number | no       |
| `name`      | string | yes      |
| `noiseType` | string | yes      |

### `particles` — `TemplateParticleItem[]`

| Field           | Type   | Nullable |
| --------------- | ------ | -------- |
| `id`            | number | no       |
| `name`          | string | yes      |
| `particleType`  | string | yes      |
| `particleCount` | number | yes      |
| `speed`         | number | yes      |
| `direction`     | string | yes      |
| `animationType` | string | yes      |

### `patterns` — `TemplatePatternItem[]`

| Field               | Type   | Nullable |
| ------------------- | ------ | -------- |
| `id`                | number | no       |
| `name`              | string | yes      |
| `patternType`       | string | yes      |
| `animation`         | string | yes      |
| `scale`             | number | yes      |
| `rotation`          | number | yes      |
| `opacity`           | number | yes      |
| `animationDuration` | number | yes      |
| `animationSpeed`    | number | yes      |

### `textures` — `TemplateTextureCatalogItem[]`

| Field | Type | Nullable |
| ----------- | ------------ | -------- | --------------------------------------------------------- |
| `id` | number | no |
| `name` | string | yes |
| `opacity` | number | yes |
| `blendMode` | string | yes |
| `texture` | MediaSummary | yes | `id`, `url`, `width`, `height`, `mime`, `alternativeText` |

### `videos` — `TemplateVideoItem[]`

| Field       | Type    | Nullable |
| ----------- | ------- | -------- |
| `id`        | number  | no       |
| `name`      | string  | yes      |
| `position`  | string  | yes      |
| `size`      | string  | yes      |
| `loop`      | boolean | yes      |
| `muted`     | boolean | yes      |
| `offthread` | boolean | yes      |
| `volume`    | number  | yes      |
| `rate`      | number  | yes      |
| `overlay`   | string  | yes      |

### `animations` — `AnimationPresetCatalogItem[]`

Operator-visible animated background presets (sorted by `sortOrder`). See `.comms/handoff/2026-08-28-app-handoff-animated-backgrounds.md`.

| Field                  | Type   | Nullable                 | Notes                                           |
| ---------------------- | ------ | ------------------------ | ----------------------------------------------- |
| `id`                   | number | no                       | Use as `templateAnimationId` on PUT             |
| `presetId`             | string | no                       | Creator preset key; preview `animation.type`    |
| `name`                 | string | yes                      | Label; fallback `presetId`                      |
| `defaultConfiguration` | object | no                       | Client preview — build local `animation` object |
| `configurationSchema`  | object | omitted on aggregate GET | Catalogue/operator only — not required in app   |
| `isDefault`            | bool   | no                       | Catalogue default marker                        |
| `sortOrder`            | number | no                       | Pre-sorted in API response                      |

Also on payload: `defaultAnimationPresetId: string | null`.

### `currentSelection` — `CurrentTemplateSelection | null`

Present when `templateOptionId` is supplied to CMS and the row exists and belongs to the account. Otherwise `null`.

| Field               | Type                       | Nullable | Notes                                                               |
| ------------------- | -------------------------- | -------- | ------------------------------------------------------------------- |
| `id`                | number                     | no       | Template-option row id                                              |
| `useBackground`     | string enum                | yes      | Includes legacy read values; write rejects legacy modes             |
| `templateAnimation` | `{ id, presetId, name }`   | yes      | Linked preset relation — hydration source for Animated              |
| `templateCategory`  | TemplateCategoryRef        | yes      | Subset: `id`, `name`, `slug`, `divideFixturesBy` (no `bundleAudio`) |
| `templateMode`      | TemplateModeItem           | yes      | Full mode shape                                                     |
| `templatePalette`   | TemplatePaletteItem        | yes      |                                                                     |
| `templateGradient`  | TemplateGradientItem       | yes      |                                                                     |
| `templateImage`     | TemplateImageItem          | yes      |                                                                     |
| `templateNoise`     | TemplateNoiseItem          | yes      |                                                                     |
| `templateParticle`  | TemplateParticleItem       | yes      |                                                                     |
| `templatePattern`   | TemplatePatternItem        | yes      |                                                                     |
| `templateTexture`   | TemplateTextureCatalogItem | yes      |                                                                     |
| `templateVideo`     | TemplateVideoItem          | yes      |                                                                     |

Unset relations are `null` (not omitted).

---

## Saved state hydration

### `templateOptionId` resolution (app)

Implemented in `template-builder-content.tsx`:

1. `GET /api/account/me` → `accounts[]` row matching route `accountId` → `templateOptionId`
2. Else `GET /api/accounts/:accountId/branding` → `data.templateOptionId`
3. Else omit param (`null` → hook does not send `templateOptionId`)

Hook only forwards **positive integers** (`Number.isInteger(n) && n > 0`).

### CMS behavior (GET catalog)

| Scenario                         | `templateOptionId` query | `currentSelection`                           | Catalog arrays |
| -------------------------------- | ------------------------ | -------------------------------------------- | -------------- |
| No saved row / id unknown to app | Omitted                  | `null`                                       | Loaded         |
| Valid id, owned by account       | Set                      | Populated row                                | Loaded         |
| Invalid id format                | —                        | BFF **400** before CMS                       | —              |
| Id not found / wrong account     | Set                      | CMS **404** / **403** → app gateway redirect | —              |
| Missing Strapi permission        | —                        | CMS **403**                                  | —              |

**Trust model for Phase 2 `savedState`:** When hydration param is valid and GET succeeds without gateway redirect, map `currentSelection` to normalized ids. If `currentSelection` is `null`, treat as empty saved state (all relation ids `null`, `useBackground` as returned or default per Phase 2).

**Do not use** branding `template_option` destruct shape for editor normalization.

### HTTP status reference (CMS GET)

| Status | When                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 200    | Success                                                                              |
| 400    | Invalid `accountId` or `templateOptionId`                                            |
| 401    | No JWT                                                                               |
| 403    | Missing `getAllTemplateOptions` permission, or `templateOptionId` on another account |
| 404    | Account not found / not owned, or `templateOptionId` not found                       |

---

## Normalized field mapping

Phase 2 editor shape (draft/saved). Unset relations → `null` id.

| Editor field          | Catalog source                                                                    | `currentSelection` path               | CMS save field                                     |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| `templateCategoryId`  | `data.categories` (public only) or `list-for-selection` if product allows private | `templateCategory?.id ?? null`        | **TBD**                                            |
| `templateModeId`      | `data.modes`                                                                      | `templateMode?.id ?? null`            | **TBD**                                            |
| `templatePaletteId`   | `data.palettes`                                                                   | `templatePalette?.id ?? null`         | **TBD**                                            |
| `templateGradientId`  | `data.gradients`                                                                  | `templateGradient?.id ?? null`        | **TBD**                                            |
| `templateImageId`     | `data.images`                                                                     | `templateImage?.id ?? null`           | **TBD**                                            |
| `templateNoiseId`     | `data.noises`                                                                     | `templateNoise?.id ?? null`           | **TBD**                                            |
| `templateParticleId`  | `data.particles`                                                                  | `templateParticle?.id ?? null`        | **TBD**                                            |
| `templatePatternId`   | `data.patterns`                                                                   | `templatePattern?.id ?? null`         | **TBD**                                            |
| `templateTextureId`   | `data.textures`                                                                   | `templateTexture?.id ?? null`         | **TBD**                                            |
| `templateVideoId`     | `data.videos`                                                                     | `templateVideo?.id ?? null`           | **TBD**                                            |
| `useBackground`       | —                                                                                 | `useBackground` (enum string \| null) | `useBackground`                                    |
| `templateAnimationId` | `data.animations` (`id`)                                                          | `templateAnimation?.id ?? null`       | `templateAnimationId` (Animated; omit to preserve) |
| `animation` (preview) | catalogue `defaultConfiguration` + `currentSelection.templateAnimation`           | built client-side                     | **not sent on PUT** (CMS ignores legacy JSON)      |

**Animated save:** `useBackground: "Animated"` requires `templateAnimationId` when selecting or switching preset (`data.animations[].id`). Omit `templateAnimationId` on later saves to preserve the link. Do not send PUT `animation` JSON — CMS does not persist it. Build preview `animation` from GET + catalogue defaults.

**Legacy migration:** PUT rejects `Graphics`, `Particle`, `Pattern`, `Noise`, `Generated`. App blocks save until user selects an allowed mode.

**Preview:** App assembly writes `templateVariation.animation` for Animated accounts. Creator/Remotion package preset rendering remains a separate dependency (see handoff §8).

Row id for refetch after save: `currentSelection.id` when present; also track `templateOptionId` from `/account/me` and branding after CMS creates a row.

---

## Save payload contract

**Status (2026-06-04):** **Live** — canonical [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md).

| Layer   | Endpoint                                                   |
| ------- | ---------------------------------------------------------- |
| App BFF | `PUT /api/accounts/:accountId/template-options`            |
| Strapi  | `PUT /api/template-option/put-template-options/:accountId` |

**Types:** `src/types/api/template-options.ts`  
**Mapper:** `template-builder/_utils/template-builder-save-payload.ts`

| Editor field         | PUT body field       | CMS save                            |
| -------------------- | -------------------- | ----------------------------------- |
| `templateCategoryId` | `templateCategoryId` | Required; public published category |
| `templateModeId`     | `templateModeId`     | Required                            |
| `templatePaletteId`  | `templatePaletteId`  | Optional; `null` clears             |
| `templateGradientId` | `templateGradientId` | Optional; `null` clears             |
| `templateImageId`    | `templateImageId`    | Optional; `null` clears             |
| `templateNoiseId`    | `templateNoiseId`    | Optional; `null` clears             |
| `templateParticleId` | `templateParticleId` | Optional; `null` clears             |
| `templatePatternId`  | `templatePatternId`  | Optional; `null` clears             |
| `templateTextureId`  | `templateTextureId`  | Optional; `null` clears             |
| `templateVideoId`    | `templateVideoId`    | Optional; `null` clears             |
| `useBackground`      | `useBackground`      | Required enum string                |

| Rule       | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Create     | **201** `{ "data": { "templateOptionId" } }`             |
| Update     | **200** same body                                        |
| Errors     | `{ "error": { "code", "message" } }`                     |
| Permission | `putTemplateOptions` on Authenticated                    |
| Refetch    | `account/me` → `all-template-options?templateOptionId=…` |

**Separate write path:** `PATCH …/branding` — palette + `templateModeId` only; avoid conflicting mode saves.

**Ops:** Enable **putTemplateOptions** in Strapi Admin before E2E smoke.

---

## Edge cases

| Case                                    | Handling                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Private categories                      | Omitted from `categories`; included in `list-for-selection`. Product decision pending (hide vs diagnostic vs selectable). |
| Empty catalog arrays                    | Valid; UI must handle no options for a group.                                                                             |
| Invalid route `accountId` segment       | Redirect to select-org (`invalidOrg`).                                                                                    |
| Catalog GET 400/403/404                 | Gateway redirect; queries removed for account.                                                                            |
| Stale `templateOptionId` on me/branding | May 404/403 from CMS → redirect; user re-selects org context.                                                             |
| No `templateOptionId`                   | `currentSelection: null`; editor starts from empty normalized state.                                                      |
| Save with no existing row               | CMS **creates** row and links to account; refetch `/account/me` for new `templateOptionId`                                |
| Branding vs catalog                     | Two read paths; editor uses catalog `currentSelection` only.                                                              |
| Strapi permission                       | **Authenticated** → **Template-category** → **getAllTemplateOptions** must be enabled or catalog returns **403**.         |

---

## Verified

### Static (code review — 2026-06-04)

| Check                                       | Result                                                   |
| ------------------------------------------- | -------------------------------------------------------- |
| BFF rejects non-positive `templateOptionId` | Confirmed in `all-template-options/route.ts`             |
| Hook omits invalid/null `templateOptionId`  | Confirmed in `useAllTemplateOptions.ts`                  |
| Hydration order me → branding → omit        | Confirmed in `template-builder-content.tsx`              |
| Gateway redirect on 400/403/404             | Confirmed in `useAllTemplateOptions` + content redirects |
| Types match handoff catalog keys            | Confirmed in `all-template-options.ts`                   |

### Live CMS (manual — pending)

Run at `/o/{accountId}/template-builder` when logged in against an environment with Strapi + permissions.

| Case                                  | Expected                                                                       | Result  | Date |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------- | ---- |
| Account with `templateOptionId`       | Dump shows `templateOptionId={id}`; `currentSelection: object`; catalog counts | Pending | —    |
| Account without `templateOptionId`    | `templateOptionId=(omitted)`; `currentSelection: null`                         | Pending | —    |
| Invalid `templateOptionId` (optional) | Gateway redirect or error                                                      | Pending | —    |
| Strapi permission enabled             | Catalog GET 200                                                                | Pending | —    |

If **403** on catalog: enable `getAllTemplateOptions` for Authenticated role in Strapi (ops blocker, not app defect).

---

## Unresolved questions

1. **Product:** Should private categories appear in the builder picker (via `list-for-selection`) or stay diagnostic-only? — [product-phase-4-template-builder-questions.md](../.comms/product-phase-4-template-builder-questions.md)
2. **Ops:** Enable `putTemplateOptions` + run [phase-4-integration-smoke-checklist.md](./phase-4-integration-smoke-checklist.md).
3. **Ops:** Confirm `getAllTemplateOptions` enabled in target environments.

---

## Phase gate recommendation

| Phase                      | Proceed?  | Notes                                                                   |
| -------------------------- | --------- | ----------------------------------------------------------------------- |
| Phase 2 — Normalize state  | **Yes**   | Use `currentSelection` → normalized mapping above                       |
| Phase 3 — Simple picker UI | **Yes**   | After Phase 2 helpers; use public `categories` unless product picks (1) |
| Phase 4 — Save pathway     | **Smoke** | CMS + app wired; ops permission + checklist                             |
| Phase 5 — POC validation   | Partial   | Read path smoke; save tests after Phase 4                               |

---

## References

- `src/app/(members)/o/[accountId]/template-builder/template-builder-content.tsx`
- `src/lib/api/hooks/account/useAllTemplateOptions.ts`
- `src/lib/api/hooks/account/useTemplateCategoriesListForSelection.ts`
- `.comms/API/handoff-all-template-options.md`
- `.comms/data-fetching/handoff/handoff-template-all-template-options.md`
- `.comms/data-fetching/handoff/handoff-list-for-selection.md`
