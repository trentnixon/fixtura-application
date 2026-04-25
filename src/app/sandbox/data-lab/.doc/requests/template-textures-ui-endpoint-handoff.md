# Template textures - UI integration handoff

This document describes the app-facing endpoint used to load the published template texture catalog for the UI.

It is intentionally narrower than default Strapi CRUD output: stable picker shape, no timestamps, no Strapi metadata wrappers beyond top-level `data`.

---

## Endpoint

- Method: `GET`
- Path (relative to API base): `/template-textures/ui`
- Full URL: `{API_BASE_URL}/api/template-textures/ui`

Strapi REST prefix is `/api` (see `config/api.js`).

Example:

`GET https://<your-api-host>/api/template-textures/ui`

---

## Authentication

- Required: valid JWT for an authenticated user.
- Header: `Authorization: Bearer <jwt>`
- Permission required on app role:
  - `Template-texture -> getTemplateTexturesForUi`

Without auth or permission, expect `401` or `403` depending on Strapi auth handling.

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
      "name": "Paper Grain",
      "opacity": "0.5",
      "blendMode": "multiply",
      "texture": {
        "id": 10,
        "url": "/uploads/paper_grain.png",
        "width": 2048,
        "height": 2048,
        "mime": "image/png",
        "alternativeText": "Paper grain texture"
      }
    }
  ]
}
```

### Response contract

- Top-level:
  - `data: TemplateTextureUiItem[]`
- Per item:
  - `id: number`
  - `name: string | null` (mapped from CMS `Name`)
  - `opacity: string | number | null` (CMS decimal; current backend returns raw value)
  - `blendMode: "multiply" | null` (current enum in CMS)
  - `texture: TextureMedia | null`
- `texture` object:
  - `id: number`
  - `url: string | null`
  - `width: number | null`
  - `height: number | null`
  - `mime: string | null`
  - `alternativeText: string | null`

Data rules:

- Published-only (`publicationState: "live"`).
- Sorted by `id` ascending.
- Excludes Strapi timestamps/publication metadata in response items.

---

## TypeScript types (frontend)

```ts
export type TemplateTextureBlendMode = "multiply";

export type TextureMedia = {
  id: number;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
};

export type TemplateTextureUiItem = {
  id: number;
  name: string | null;
  opacity: string | number | null;
  blendMode: TemplateTextureBlendMode | null;
  texture: TextureMedia | null;
};

export type GetTemplateTexturesForUiResponse = {
  data: TemplateTextureUiItem[];
};
```

If your UI expects `opacity` as a number, coerce it on read:

```ts
const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
```

---

## Error responses

- `401` / `403`: missing or invalid JWT, or missing role permission.
- `500`: unexpected server failure (`Failed to load template textures.`).

Handle errors by status code; payload shape follows your global Strapi error format.

---

## Fetch example

```ts
const res = await fetch(`${apiBaseUrl}/api/template-textures/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  throw new Error(`template-textures/ui failed: ${res.status}`);
}

const body = (await res.json()) as GetTemplateTexturesForUiResponse;
const textures = body.data;
```

---

## Backend references

- Route: `src/api/template-texture/routes/custom-template-texture.js`
- Controller: `src/api/template-texture/controllers/template-texture.js` -> `getTemplateTexturesForUi`
- Request/spec: `src/api/template-texture/.docs/request/template-textures-ui-request.md`
