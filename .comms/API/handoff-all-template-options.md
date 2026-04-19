# Handoff: `GET /api/template-categories/all-template-options`

Backend aggregate endpoint for template builder UIs: returns **published (“live”)** catalog pick lists (template categories, modes, palettes, gradients, images, noises, particles, patterns, textures, videos) in one response, and optionally the **current** `template-option` row for an account when `templateOptionId` is supplied.

**Implementation:** [`routes/custom-template-category.js`](../routes/custom-template-category.js), [`controllers/template-category.js`](../controllers/template-category.js), [`controllers/services/getAllTemplateOptions/index.js`](../controllers/services/getAllTemplateOptions/index.js).

---

## Request

| Item                | Value                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Method              | `GET`                                                                                                                                           |
| Path                | `/api/template-categories/all-template-options` (Strapi REST prefix is `/api`; see [`config/api.js`](../../../../config/api.js))                |
| Auth                | `Authorization: Bearer <JWT>`                                                                                                                   |
| Users & Permissions | Enable **Authenticated** → **Template-category** → **getAllTemplateOptions** (`api::template-category.template-category.getAllTemplateOptions`) |

### Query parameters

| Name               | Required | Description                                                                                                                                                                       |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accountId`        | Yes      | Positive integer. Used to verify the caller may access that account and, when loading a template option, that the option belongs to that account.                                 |
| `templateOptionId` | No       | If set, loads that `template-option` document and returns it as `currentSelection`. Omit or leave empty to get `currentSelection: null` while still receiving all catalog arrays. |

### Processing order

1. User must be authenticated; otherwise **401**.
2. `accountId` must parse to a finite integer `> 0`; otherwise **400** (`Invalid or missing accountId`).
3. `validateAccountOwnership` must pass for `(user.id, accountId)`; otherwise **404** (`Account not found`).
4. Service loads all catalog lists in parallel, then optionally loads `template-option` by id when `templateOptionId` is present.

---

## Success response

HTTP **200**. Body shape:

```json
{
  "data": {
    "categories": [],
    "modes": [],
    "palettes": [],
    "gradients": [],
    "images": [],
    "noises": [],
    "particles": [],
    "patterns": [],
    "textures": [],
    "videos": [],
    "currentSelection": null
  }
}
```

`data` matches the object returned by `GetAllTemplateOptionsService.load()` (see service file). Nested field names are **camelCase** in JSON (e.g. `bundleAudio`, `audioOptions`, `templateCategory`).

---

## Payload fields (conceptual)

- **`categories`**: Non-private template categories (`isPrivate: false`), sorted by `id` ascending. Each item includes nested **`bundleAudio`** (may be `null`) with **`audioOptions`**.
- **`modes`**, **`palettes`**, **`gradients`**, **`images`**, **`noises`**, **`particles`**, **`patterns`**, **`textures`**, **`videos`**: Published-only lists, sorted by `id` ascending.
- **`textures`**: Each entry includes a nested **`texture`** media object (or `null`) with `id`, `url`, `width`, `height`, `mime`, `alternativeText`.
- **`currentSelection`**: `null` if `templateOptionId` was not provided. Otherwise a trimmed `template-option` with relations mapped to **`templateCategory`**, **`templatePalette`**, **`templateGradient`**, **`templateImage`**, **`templateNoise`**, **`templateParticle`**, **`templatePattern`**, **`templateTexture`**, **`templateVideo`**, **`templateMode`** (each relation may be `null` if unset).

---

## TypeScript types (frontend)

Types mirror the mapper output. Strapi may return numbers/booleans for some attributes; `null` is used where the backend applies `?? null`. Adjust unions if your OpenAPI or runtime differs.

```typescript
/** Success body from ctx.send */
export interface AllTemplateOptionsResponse {
  data: AllTemplateOptionsPayload;
}

export interface AllTemplateOptionsPayload {
  categories: TemplateCategoryCatalogItem[];
  modes: TemplateModeItem[];
  palettes: TemplatePaletteItem[];
  gradients: TemplateGradientItem[];
  images: TemplateImageItem[];
  noises: TemplateNoiseItem[];
  particles: TemplateParticleItem[];
  patterns: TemplatePatternItem[];
  textures: TemplateTextureCatalogItem[];
  videos: TemplateVideoItem[];
  currentSelection: CurrentTemplateSelection | null;
}

export interface MediaSummary {
  id: number;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
}

export interface AudioOptionItem {
  id: number;
  name: string | null;
  url: string | null;
  compositionId: string | null;
  componentName: string | null;
}

export interface BundleAudioSummary {
  id: number;
  name: string | null;
  audioOptions: AudioOptionItem[];
}

export interface TemplateCategoryCatalogItem {
  id: number;
  name: string | null;
  slug: string | null;
  divideFixturesBy: string | null;
  isPrivate: boolean;
  bundleAudio: BundleAudioSummary | null;
}

export interface TemplateModeItem {
  id: number;
  name: string | null;
  slug: string | null;
}

export interface TemplatePaletteItem {
  id: number;
  name: string | null;
  value: string | null;
}

export interface TemplateGradientItem {
  id: number;
  name: string | null;
  type: string | null;
  direction: string | null;
}

export interface TemplateImageItem {
  id: number;
  name: string | null;
  animationType: string | null;
  animationDirection: string | null;
  overlayStyle: string | null;
  gradientType: string | null;
  overlayOpacity: number | null;
}

export interface TemplateNoiseItem {
  id: number;
  name: string | null;
  noiseType: string | null;
}

export interface TemplateParticleItem {
  id: number;
  name: string | null;
  particleType: string | null;
  particleCount: number | null;
  speed: number | null;
  direction: string | null;
  animationType: string | null;
}

export interface TemplatePatternItem {
  id: number;
  name: string | null;
  patternType: string | null;
  animation: string | null;
  scale: number | null;
  rotation: number | null;
  opacity: number | null;
  animationDuration: number | null;
  animationSpeed: number | null;
}

export interface TemplateTextureCatalogItem {
  id: number;
  name: string | null;
  opacity: number | null;
  blendMode: string | null;
  texture: MediaSummary | null;
}

export interface TemplateVideoItem {
  id: number;
  name: string | null;
  position: string | null;
  size: string | null;
  loop: boolean | null;
  muted: boolean | null;
  offthread: boolean | null;
  volume: number | null;
  rate: number | null;
  overlay: string | null;
}

/** Subset of category on template-option (mapCategoryRef) */
export interface TemplateCategoryRef {
  id: number;
  name: string | null;
  slug: string | null;
  divideFixturesBy: string | null;
}

/** Current template-option row for forms (mapCurrentSelection) */
export interface CurrentTemplateSelection {
  id: number;
  useBackground: boolean | null;
  templateCategory: TemplateCategoryRef | null;
  templatePalette: TemplatePaletteItem | null;
  templateGradient: TemplateGradientItem | null;
  templateImage: TemplateImageItem | null;
  templateNoise: TemplateNoiseItem | null;
  templateParticle: TemplateParticleItem | null;
  templatePattern: TemplatePatternItem | null;
  templateTexture: TemplateTextureCatalogItem | null;
  templateVideo: TemplateVideoItem | null;
  templateMode: TemplateModeItem | null;
}
```

---

## Errors

| HTTP    | When                                                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **401** | No authenticated user (`Authentication required`).                                                                                      |
| **400** | Invalid or missing `accountId`; invalid `templateOptionId` (service throws `BadRequestError`, message e.g. `Invalid templateOptionId`). |
| **404** | Account ownership check failed (`Account not found`); or template option id not found (`Template option not found`).                    |
| **403** | Template option exists but belongs to a different account than `accountId` (`Forbidden`).                                               |
| **500** | Unexpected error (`Failed to load template options.`).                                                                                  |

---

## Behaviour notes for integrators

- All catalog queries use **`publicationState: "live"`** only (draft content is excluded).
- **`categories`** excludes rows with **`isPrivate: true`**.
- If **`templateOptionId`** is omitted, **`currentSelection`** is **`null`**; catalog arrays are still fully populated.
- Lists are ordered by **`id` ascending** (as queried in the service).
