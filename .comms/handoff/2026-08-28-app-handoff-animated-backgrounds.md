# App handoff — Animated background presets (additive)

**From:** CMS (Strapi) Backend
**To:** Fixtura App (frontend) Team
**Date:** 2026-08-28
**Re:** Add **Animated** to the existing template builder — same auth, same GET/PUT flow, new catalogue fields.

---

## Summary

This is an **additive change** to the template-var system you already use.

- **No new auth**, account flow, or BFF routes required (unless you want a thin passthrough only).
- **Same endpoints:** `GET …/all-template-options` and `PUT …/put-template-options/:accountId`.
- **New:** background mode **`Animated`**, preset catalogue in **`data.animations`**, account selection via **`currentSelection.templateAnimation`** relation ref, save via **`templateAnimationId`** on PUT (same pattern as `templateParticleId`, `templatePatternId`, etc.).

CMS has **25 presets** synced (`template-animation` collection). Production default: **`snow-field`**. Accounts do **not** store per-account animation JSON — the linked catalogue row supplies preset defaults at scheduler/render time.

---

## What CMS shipped (code — done)

| Area                                                                                | Status                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `template-animation` catalogue (25 presets)                                         | Done — sync via `npm run template-animation:sync` |
| Aggregate GET includes `animations` + `defaultAnimationPresetId`                    | Done                                              |
| `currentSelection.templateAnimation` on GET (relation ref, like `templateParticle`) | Done                                              |
| PUT accepts `useBackground: "Animated"` + `templateAnimationId`                     | Done                                              |
| PUT rejects legacy writes (`Graphics`, `Particle`, `Pattern`, `Noise`, `Generated`) | Done                                              |
| Scheduler `templateVariation.animation` for Animated accounts                       | Done                                              |
| New accounts default to `snow-field`                                                | Done                                              |

---

## CMS ops before app ships (your side first)

Complete these in Strapi admin before asking app to go live:

- [ ] **Operator visibility** — set `operatorVisible` on approved presets only (Content Manager → **[tpl] BG Animation**).
- [ ] **Default** — confirm exactly one row has `isDefault: true` (`snow-field`).
- [ ] **Publish** — presets are published (sync sets `publishedAt`).
- [ ] **Permissions** — Authenticated role already has `getAllTemplateOptions` + `putTemplateOptions` (no change expected).
- [ ] **Optional:** enable `getTemplateAnimationsForUi` if app wants preset-only GET (not required — aggregate GET is enough).

Re-sync after Creator contract updates:

```bash
npm run template-animation:generate-contract   # if using generator
npm run template-animation:sync
```

---

## App changes (same pipeline you have today)

### Load (unchanged URL)

```
GET /api/template-categories/all-template-options?accountId={id}&templateOptionId={id}
Authorization: Bearer <JWT>
```

**New fields on `data`:**

```typescript
interface AllTemplateOptionsPayload {
  // … existing categories, modes, palettes, etc. …
  animations: AnimationPresetCatalogItem[];
  defaultAnimationPresetId: string | null;
  currentSelection: CurrentTemplateSelection | null;
}

interface AnimationPresetCatalogItem {
  id: number; // Strapi row id — send as templateAnimationId on PUT
  presetId: string | null; // Creator wire id, e.g. "snow-field"
  name: string | null;
  description: string | null;
  defaultConfiguration: Record<string, unknown>; // for client preview only — not PUT
  isDefault: boolean;
  sortOrder: number;
}

interface CurrentTemplateSelection {
  id: number;
  useBackground: string | null;
  templateAnimation: { id: number; presetId: string | null; name: string | null } | null; // NEW
  // … existing templateCategory, templatePalette, templateParticle, …
}
```

**Type note:** `useBackground` is a **string enumeration**, never a boolean. Legacy handoff typo (`boolean | null`) in `handoff-all-template-options.md` is wrong — use `TemplateUseBackground | null` (see below).

```typescript
/** Values returned on GET currentSelection (includes legacy reads) */
type TemplateUseBackgroundRead =
  "Solid" | "Gradient" | "Video" | "Image" | "Graphics" | "Texture" | "Particle" | "Animated";

/** Values accepted on PUT useBackground (legacy writes rejected) */
type TemplateUseBackgroundWrite = "Solid" | "Gradient" | "Video" | "Image" | "Texture" | "Animated";
```

**Legacy arrays** (`particles`, `patterns`, `noises`, …) still returned for old accounts. **Do not use for new saves.** New UI: **`Animated` only.**

**Relation id rule:** on PUT send **`templateAnimationId`** = Strapi numeric **`animations[].id`**, exactly like `templateParticleId`. Do **not** send a per-account `animation` config object.

---

### Save (unchanged URL)

```
PUT /api/template-option/put-template-options/{accountId}
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Animated body example:**

```json
{
  "templateCategoryId": 1,
  "templateModeId": 2,
  "templatePaletteId": 3,
  "useBackground": "Animated",
  "templateAnimationId": 12
}
```

CMS links the `template_animation` relation on `template-option`. Preset defaults live on the catalogue row only.

**Required when `useBackground` is `Animated`:** `templateAnimationId` (positive integer referencing a published, operator-visible preset).

**Legacy `animation` JSON:** ignored if present — CMS does **not** read or persist it. App may omit it entirely; only `templateAnimationId` is used (same as sending `templateParticleId` without embedding particle config).

**Do not send on new saves:** `useBackground: "Graphics" | "Particle" | "Pattern" | "Noise" | "Generated"`.

---

### After save (unchanged)

Refetch:

1. `GET /api/account/me`
2. `GET …/all-template-options?accountId=…&templateOptionId=…`

---

## UI checklist (app team) — done 2026-08-28

- [x] Add **Animated** to background mode selector (or replace legacy modes when ready).
- [x] Preset dropdown from `data.animations` (`id` + `name`; show `presetId` as subtitle if useful).
- [x] On save, send `templateAnimationId` = selected catalogue row `id` (same as particle/pattern pickers).
- [x] If no selection, default to row where `isDefault` / `defaultAnimationPresetId`.
- [x] Preview/branding reads `currentSelection.templateAnimation`, not legacy `particle` / `pattern` / `noise`.
- [x] Do **not** build or POST per-account `animation` JSON — CMS derives render payload from the linked preset.

---

## Error codes (PUT)

| Code                                      | Meaning                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `MISSING_TEMPLATE_ANIMATION_ID`           | `Animated` with no `templateAnimationId` and no existing linked preset |
| `UNKNOWN_OR_FORBIDDEN_TEMPLATE_ANIMATION` | `templateAnimationId` not operator-visible / not in catalogue          |
| `FORBIDDEN_USE_BACKGROUND`                | Legacy background mode on write                                        |

---

## Render / Creator contract

Scheduler builds this from the linked **`template_animation`** catalogue row (`presetId` + `defaultConfiguration`):

```json
{
  "useBackground": "Animated",
  "animation": {
    "type": "snow-field",
    "particleCount": 300,
    "speed": 1,
    "direction": "random"
  }
}
```

Under `AccountTheme.templateVariation.animation`.

---

## Optional endpoint (not required)

```
GET /api/template-animations/ui
```

Same preset list as `data.animations`. Use only if you want presets without loading full catalog.

Permission: **Template-animation** → `getTemplateAnimationsForUi`.

---

## Out of scope for app (CMS later)

- Batch migration of existing accounts from legacy backgrounds → `Animated` (separate CMS script/runbook).
- Removing legacy catalogue arrays from GET (kept for read compatibility).

---

## Backend references

| Item                  | Path                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Aggregate GET service | `src/api/template-category/controllers/services/getAllTemplateOptions/index.js`                     |
| PUT service           | `src/api/template-option/controllers/services/putTemplateOptions/`                                  |
| Animation catalogue   | `src/api/template-animation/`                                                                       |
| Scheduler mapper      | `src/api/account/controllers/workers/getAccountDetailsForScheduler/utils/templateOptionDestruct.js` |
| Existing GET handoff  | `src/api/template-category/.docs/handoff-all-template-options.md`                                   |
| Existing PUT handoff  | `src/api/template-option/.docs/handoff-put-template-options.md`                                     |

---

## CMS answers to app review (2026-08-28)

Authoritative answers from current CMS implementation. **Blockers: 1, 2, 8** called out below (§4 schema is catalogue reference only — not a blocker).

### App / BFF scope

**Confirmed:** no new routes or auth. Update existing BFF passthrough + TypeScript types + PUT validation only.

| App BFF                                             | CMS Strapi                                                 |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `GET /api/accounts/:accountId/all-template-options` | `GET /api/template-categories/all-template-options`        |
| `PUT /api/accounts/:accountId/template-options`     | `PUT /api/template-option/put-template-options/:accountId` |

---

### 1. Default behaviour (`currentSelection` null) — **BLOCKER**

**CMS always creates a saved `template-option` for new accounts** with:

- `useBackground: "Animated"`
- `template_animation` relation → default preset (`snow-field`)

(Account creation + `saveAccountBranding` when it creates a template row.)

**App should not treat `snow-field` as an unsaved local draft** when the account already has a linked template option.

`currentSelection: null` on GET only when:

- `templateOptionId` query param is **omitted**, or
- account truly has no template row (legacy edge case).

**App rule:** always pass `templateOptionId` from `GET /api/account/me` (or branding). If `currentSelection` is null but `templateOptionId` exists, refetch with the id. If both missing, show default preset as **create** state and first save creates/updates via existing PUT.

---

### 2. Legacy accounts (Graphics, Particle, etc.) — **BLOCKER**

**Reads:** legacy `useBackground` + relation fields still returned on GET / scheduler. No change required to display old configs read-only.

**Writes:** PUT **always requires `useBackground`** in the body. These modes are **rejected on write**:

`Graphics`, `Particle`, `Pattern`, `Noise`, `Generated` → `FORBIDDEN_USE_BACKGROUND`

**Still allowed on write:** `Solid`, `Gradient`, `Video`, `Image`, `Texture`, `Animated`

**Implication:** an account on `Graphics` **cannot save any PUT** that re-sends `useBackground: "Graphics"`, including “palette-only” saves. The user must choose a **new** allowed mode (`Animated` recommended) on the next save.

**App UX:** detect forbidden `currentSelection.useBackground` → show migration banner; block save until user picks `Animated` (or another allowed non-legacy mode). Unrelated field edits must go out with the new `useBackground` + required fields for that mode.

There is **no** partial PATCH that preserves forbidden legacy backgrounds.

---

### 3. Animation selection (relation only)

**Same pattern as particle/pattern:** user picks a catalogue row; PUT sends `templateAnimationId`. No per-account overrides or `animation` JSON on `template-option`.

**After successful PUT:** refetch; use `currentSelection.templateAnimation` as source of truth.

**Strapi admin:** Content Manager → **[tpl] Style Option** → set **useBackground** = `Animated` and link **template_animation** to a catalogue preset (not a JSON field).

---

### 4. `configurationSchema` — catalogue reference only (not editor UI)

> **Not a PUT or editor requirement.** Phase 1 app: preset dropdown only. Per-account overrides are **not** supported. Use `defaultConfiguration` from `data.animations[]` to build **client-side preview** (`{ type: presetId, ...defaultConfiguration }`). Do **not** POST overrides or merge config on save.

`configurationSchema` lives on CMS catalogue rows for Creator/operator tooling. It is **not** returned on aggregate GET today. Examples below document the synced preset shape — **not** form fields the app must render in phase 1.

**Not JSON Schema.** Custom CMS map keyed by control name (without `animation.` prefix):

```typescript
{
  [field: string]: {
    type: "number" | "enum" | "unknown";
    label: string;
    enumValues?: string[];
    affectsRendering?: boolean;
  };
  _catalogue?: { rendererAdapter, inventoryKey, discovery, ... }; // metadata — ignore for form rendering
}
```

**No `min` / `max` / `step` in CMS today.** Reserved for future operator tooling — not app validation in phase 1.

**Future editor UI (out of scope):** if CMS later adds per-account overrides, schema may drive controls. Today, ignore schema for save/render; preview uses `defaultConfiguration` only.

#### Example A — `dot-field` (pattern)

```json
{
  "presetId": "dot-field",
  "name": "Dot field",
  "defaultConfiguration": { "scale": 1, "rotation": 0 },
  "configurationSchema": {
    "scale": { "type": "number", "label": "Scale", "affectsRendering": true },
    "rotation": { "type": "number", "label": "Rotation", "affectsRendering": true },
    "motion": {
      "type": "enum",
      "label": "Animation",
      "enumValues": ["none", "panUp", "panDown", "panLeft", "panRight", "rotate", "pulse"],
      "affectsRendering": true
    },
    "duration": { "type": "number", "label": "Animation duration", "affectsRendering": true },
    "speed": { "type": "number", "label": "Animation speed", "affectsRendering": true },
    "opacity": { "type": "number", "label": "Opacity", "affectsRendering": false }
  }
}
```

#### Example B — `snow-field` (particle)

```json
{
  "presetId": "snow-field",
  "name": "Snow",
  "defaultConfiguration": { "particleCount": 300, "speed": 1, "direction": "random" },
  "configurationSchema": {
    "particleCount": { "type": "number", "label": "Particle count", "affectsRendering": true },
    "speed": { "type": "number", "label": "Speed", "affectsRendering": true },
    "direction": {
      "type": "enum",
      "label": "Direction",
      "enumValues": ["up", "down", "left", "right", "random"],
      "affectsRendering": true
    },
    "animation": {
      "type": "enum",
      "label": "Animation",
      "enumValues": ["fade", "scale", "slide", "none"],
      "affectsRendering": false
    }
  }
}
```

Note: particle preset uses control key `animation` inside the `animation` object (particle animation style, not preset type).

---

### 5. Save semantics when leaving Animated

Switching e.g. `Animated` → `Solid`:

- Send `useBackground: "Solid"` (plus existing required ids).
- **Omit `templateAnimationId`** — CMS clears `template_animation` automatically.

Legacy `animation` JSON in the PUT body is ignored regardless of mode.

**CMS automatically clears `template_animation`** on the stored row when saving a non-Animated mode. App does **not** need to send `templateAnimationId: null` unless switching away from Animated explicitly.

---

### 6. Validation

| Check                        | CMS behaviour                                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `templateAnimationId`        | Required on **first** Animated save (or when no preset linked yet); optional on update if relation already set. Must reference **operator-visible** published catalogue row when sent. |
| `animation` JSON in PUT body | **Ignored** — not stored; safe to omit                                                                                                                                                 |
| Per-account overrides        | **Not supported** — preset config comes from catalogue row only                                                                                                                        |

---

### 7. Retired / hidden presets

**GET:** `currentSelection.templateAnimation` may reference a preset no longer in `data.animations` (e.g. `operatorVisible: false`).

**PUT:** saving with that `templateAnimationId` fails with `UNKNOWN_OR_FORBIDDEN_TEMPLATE_ANIMATION` if preset is not operator-visible.

**App UX:** show current selection read-only with “preset unavailable — choose a new animation”; user must pick from `data.animations` before save succeeds.

---

### 8. Preview / Remotion — **BLOCKER (Creator confirmation)**

**CMS (done):** Scheduler payload includes:

```json
{
  "templateVariation": {
    "useBackground": "Animated",
    "animation": { "type": "snow-field", "particleCount": 300, "speed": 1, "direction": "random" }
  }
}
```

Mapped in `templateOptionDestruct.js` for `useBackground === "Animated"`.

**Creator / Remotion package:** **not verified in this Backend repo.** App team must confirm with Creator whether the installed Remotion preview package already consumes `templateVariation.animation`. CMS cannot answer version pinning here — treat as a **Creator dependency** parallel to app BFF work.

**App preview draft shape (target):** mirror scheduler — top-level `useBackground: "Animated"` + `animation` object; do not map through legacy `particle` / `pattern` / `noise` branches for Animated accounts.

---

### 9. Catalogue ordering and labels

**Sort:** use API order — `sortOrder` ascending, then id. `data.animations` is pre-sorted; app may rely on array order.

**Label:** use `name`; if null/empty, fall back to `presetId`.

**Default marker:** `defaultAnimationPresetId` on payload and/or preset `isDefault: true`.

---

## Documentation clarifications (2026-08-28 review)

### `currentSelection.useBackground` type

**Always a string enum value** from Strapi (`template-option.useBackground`), e.g. `"Graphics"`, `"Animated"`. **Never a boolean.**

Mapper: `useBackground: opt.useBackground ?? null` — no coercion.

If the app types file uses `boolean | null`, that is a **frontend bug** (likely copied from an old handoff typo). Replace with `TemplateUseBackgroundRead | null`.

### PUT vs GET enum sets

| Context                                  | Values                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GET** `currentSelection.useBackground` | Any stored value, including legacy: `Graphics`, `Particle`, `Pattern`, `Noise`, plus `Solid`, `Gradient`, `Video`, `Image`, `Texture`, `Animated` |
| **PUT** `useBackground`                  | Only: `Solid`, `Gradient`, `Video`, `Image`, `Texture`, `Animated`                                                                                |

(`Generated` is forbidden on write if ever present in stored data.)

### Open blocker — Creator / Remotion (unchanged)

CMS scheduler + `templateOptionDestruct` emit `templateVariation.animation` for Animated accounts. **Creator must confirm** the app’s installed Remotion preview package reads that field. Track separately from BFF/types work; CMS cannot close this from Backend alone.

**Suggested Creator question:** “Does preview composition `Background` read `templateVariation.useBackground === 'Animated'` and `templateVariation.animation` (with `type` = preset id)? Minimum package/version if not.”

---

## App alignment note (2026-08-28)

**App diagnosis was correct:** the original 400 was Strapi rejecting Animated PUTs without `templateAnimationId`. The early handoff mention of PUT `animation` JSON was superseded by the **relation model** — same as `templateParticleId`.

**CMS accepts the app fix:**

```json
{
  "useBackground": "Animated",
  "templateAnimationId": 42
}
```

**Optional:** app may still send legacy `animation: { type: "snow-field" }` during migration — CMS **ignores** it (not stored). Safe to remove from the app once stable; only `templateAnimationId` matters.

**After first successful save:** `templateAnimationId` may be omitted on later PUTs if the preset did not change (CMS preserves the existing link). The app may always send it — compatible and stricter.

**App types:** prefer `currentSelection.templateAnimation` over any legacy `currentSelection.animation` field in types (save/hydration source of truth).

**Restart Strapi** after pulling latest CMS changes before retesting.

## Questions

Contact CMS backend. Preset approval / visibility is configured in Strapi **[tpl] BG Animation**, not in app code.
