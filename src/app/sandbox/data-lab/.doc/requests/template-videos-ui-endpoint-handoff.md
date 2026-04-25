# Template videos — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template video **configuration** catalog for the UI (playback behaviour, layout, overlay JSON). It is narrower than default Strapi CRUD: stable picker shape, no timestamps, no Strapi metadata wrappers beyond top-level `data`.

**Important:** This content type does **not** store a video file or URL. The response does not include `videoUrl`, `url`, or `fallbackUrl`. If the product later adds media fields, the contract would be updated in a separate change.

---

## What the backend shipped

- Custom route: `GET /template-videos/ui`
- Controller action: `getTemplateVideosForUi` on `api::template-video.template-video`
- **Published rows only** (`publicationState: "live"`)
- **Sorted** by `id` ascending
- **Auth required**; Strapi Users & Permissions action: `getTemplateVideosForUi`
- Field mapping from CMS → app UI shape: `offthread` → `ui.useOffthreadVideo`, `rate` → `ui.playbackRate` (aligned with existing app-facing template option vocabulary)

---

## Endpoint

- Method: `GET`
- Path (relative to API prefix): `/template-videos/ui`
- Full URL: `{API_BASE_URL}/api/template-videos/ui`

Strapi REST prefix is `/api` (see `config/api.js`).

Example:

`GET https://<your-api-host>/api/template-videos/ui`

---

## Authentication

- Required: valid JWT for an authenticated user.
- Header: `Authorization: Bearer <jwt>`
- Permission required on the app role (Strapi Admin → **Authenticated** → **Template-video**):
  - **`getTemplateVideosForUi`**

Without a valid user session, the handler returns **`401`** (`Authentication required`). If the JWT is valid but the role lacks permission, expect **`403`** from Users & Permissions.

---

## Query parameters

None for v1.

---

## Success response

HTTP `200`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Background Motion",
      "ui": {
        "position": "center",
        "size": "cover",
        "loop": true,
        "muted": true,
        "overlay": {},
        "useOffthreadVideo": true,
        "volume": 0.8,
        "playbackRate": 1
      }
    }
  ]
}
```

### Response contract

- Top-level:
  - `data: TemplateVideoUiItem[]`
- Per item:
  - `id: number`
  - `name: string | null`
  - `ui: TemplateVideoUiSettings`
- `ui` object (app-shaped; matches normalised video settings used elsewhere in the app conceptually):

| Field               | Notes                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| `position`          | CMS enum: `center` \| `left` \| `right` \| `top` \| `bottom` \| `null`               |
| `size`              | CMS enum: `cover` \| `contain` \| `null`                                             |
| `loop`              | boolean \| `null`                                                                    |
| `muted`             | boolean \| `null`                                                                    |
| `useOffthreadVideo` | maps CMS `offthread`; boolean \| `null`                                              |
| `volume`            | CMS **decimal**; backend passes Strapi value — often `string` \| `number` \| `null`  |
| `playbackRate`      | maps CMS `rate` (decimal); often `string` \| `number` \| `null`                      |
| `overlay`           | CMS **json**; backend defaults missing/null to `{}`; otherwise arbitrary JSON object |

Data rules:

- Published-only (`draft` entries that are not live are excluded).
- Sorted by `id` ascending.
- No `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`, or Strapi entity wrappers inside list items.

---

## TypeScript types (frontend)

```ts
/** CMS enumeration values exposed through the UI contract */
export type TemplateVideoPosition = "center" | "left" | "right" | "top" | "bottom";

export type TemplateVideoSize = "cover" | "contain";

/**
 * Arbitrary overlay payload from CMS JSON.
 * Narrow this when the app defines a fixed overlay schema.
 */
export type TemplateVideoOverlay = Record<string, unknown>;

export type TemplateVideoUiSettings = {
  position: TemplateVideoPosition | null;
  size: TemplateVideoSize | null;
  loop: boolean | null;
  muted: boolean | null;
  overlay: TemplateVideoOverlay;
  useOffthreadVideo: boolean | null;
  /** Strapi decimal — coerce if the UI needs a number */
  volume: string | number | null;
  /** Strapi decimal — coerce if the UI needs a number */
  playbackRate: string | number | null;
};

export type TemplateVideoUiItem = {
  id: number;
  name: string | null;
  ui: TemplateVideoUiSettings;
};

export type GetTemplateVideosForUiResponse = {
  data: TemplateVideoUiItem[];
};
```

If the UI expects numeric decimals, coerce on read (same pattern as template-textures):

```ts
const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
```

---

## Error responses

- **`401`**: no authenticated user (`Authentication required`).
- **`403`**: authenticated but missing `getTemplateVideosForUi` permission on the role.
- **`500`**: unexpected failure (`Failed to load template videos.`).

Error body shape follows your global Strapi / BFF error format.

---

## Fetch example

```ts
const res = await fetch(`${apiBaseUrl}/api/template-videos/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    Accept: "application/json",
  },
});

if (!res.ok) {
  throw new Error(`template-videos/ui failed: ${res.status}`);
}

const body = (await res.json()) as GetTemplateVideosForUiResponse;
const videos = body.data;
```

---

## Comparison with aggregate catalog (`getAllTemplateOptions`)

The template category **all-options** payload still exposes video rows with **flat CMS names** (`offthread`, `rate`, etc.) under `videos` / `currentSelection.templateVideo`. This **`/template-videos/ui`** route is the dedicated picker contract with nested **`ui`** and renamed fields for the app. Prefer this endpoint for a video-only picker; use the aggregate endpoint when you need every template dimension in one call.

---

## Backend references

- Route: `src/api/template-video/routes/custom-template-video.js`
- Controller: `src/api/template-video/controllers/template-video.js` → `getTemplateVideosForUi`
- Schema: `src/api/template-video/content-types/template-video/schema.json`
- Product / spec request: `src/api/template-video/.docs/request/template-videos-ui-request.md`

---

## Deploy checklist (CMS / ops)

After deploy, enable **Authenticated → Template-video → `getTemplateVideosForUi`** in Strapi Admin so the app role can call this route.
