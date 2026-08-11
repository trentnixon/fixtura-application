# Handoff: `GET /api/template-categories/list-for-selection`

Returns a **published (“live”)** list of **template categories** for dropdowns and selection UIs. Same per-item JSON shape as each entry in `data.categories` from [`GET /api/template-categories/all-template-options`](./handoff-all-template-options.md), but **only** the category array—no modes, palettes, or `accountId` / `templateOptionId`.

**Implementation:** [`routes/custom-template-category.js`](../routes/custom-template-category.js), [`controllers/template-category.js`](../controllers/template-category.js) (`getTemplateCategoriesForSelection`), mapper `mapCategory` from [`controllers/services/getAllTemplateOptions/index.js`](../controllers/services/getAllTemplateOptions/index.js).

---

## Request

| Item                | Value                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method              | `GET`                                                                                                                                                                   |
| Path                | `/api/template-categories/list-for-selection` (Strapi REST prefix is `/api`; see [`config/api.js`](../../../../config/api.js))                                          |
| Auth                | `Authorization: Bearer <JWT>`                                                                                                                                           |
| Users & Permissions | Enable **Authenticated** → **Template-category** → **getTemplateCategoriesForSelection** (`api::template-category.template-category.getTemplateCategoriesForSelection`) |

### Query parameters

None.

### Processing order

1. User must be authenticated; otherwise **401**.
2. Load all published template categories, sorted by `id` ascending, map with `mapCategory`, return `{ data }`.

---

## Success response

HTTP **200**. Body shape:

```json
{
  "data": [
    {
      "id": 1,
      "name": "…",
      "slug": "…",
      "divideFixturesBy": null,
      "isPrivate": false,
      "bundleAudio": {
        "id": 1,
        "name": "…",
        "audioOptions": [
          {
            "id": 1,
            "name": "…",
            "url": "…",
            "compositionId": "…",
            "componentName": "…"
          }
        ]
      }
    }
  ]
}
```

Nested field names are **camelCase** in JSON (`bundleAudio`, `audioOptions`). `bundleAudio` may be `null` if no bundle is linked.

---

## Payload fields (per item)

| Field              | Description                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Category document id (use for selection value).                                                                                                                                          |
| `name`             | From CMS `Name`.                                                                                                                                                                         |
| `slug`             | Category slug.                                                                                                                                                                           |
| `divideFixturesBy` | JSON field from CMS (structure as authored).                                                                                                                                             |
| `isPrivate`        | Boolean. **This list includes private categories** so the client can hide, disable, or label them. Contrast: `all-template-options` **omits** private categories from `data.categories`. |
| `bundleAudio`      | Summary of linked `bundle-audio` with nested `audioOptions`, or `null`.                                                                                                                  |

---

## TypeScript types (frontend)

Aligned with `TemplateCategoryCatalogItem` and related types in the [all-template-options handoff](./handoff-all-template-options.md#typescript-types-frontend).

```typescript
export interface TemplateCategoriesForSelectionResponse {
  data: TemplateCategoryCatalogItem[];
}

/** Same shape as one element of AllTemplateOptionsPayload.categories */
export interface TemplateCategoryCatalogItem {
  id: number;
  name: string | null;
  slug: string | null;
  divideFixturesBy: string | null;
  isPrivate: boolean;
  bundleAudio: BundleAudioSummary | null;
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
```

---

## Errors

| HTTP    | When                                                      |
| ------- | --------------------------------------------------------- |
| **401** | No authenticated user (`Authentication required`).        |
| **500** | Unexpected error (`Failed to load template categories.`). |

---

## Behaviour notes for integrators

- Only **`publicationState: "live"`** rows are returned (draft categories are excluded).
- **Private categories** (`isPrivate: true`) **are included** in this endpoint; filter in the UI if you only want public options.
- List order: **`id` ascending**.
- For the full template builder catalog (modes, palettes, `currentSelection`, etc.), use [`GET /api/template-categories/all-template-options`](./handoff-all-template-options.md) with `accountId` (and optional `templateOptionId`).
