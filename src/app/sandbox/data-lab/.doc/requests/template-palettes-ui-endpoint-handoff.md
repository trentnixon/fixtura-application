# Template palettes — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template palette catalog for the UI. It is narrower than the generic Strapi CRUD API: no timestamps, no CMS meta, stable shape for labels and colour values.

---

## Endpoint

| Item                        | Value                                     |
| --------------------------- | ----------------------------------------- |
| Method                      | `GET`                                     |
| Path (relative to API base) | `/template-palettes/ui`                   |
| Full URL                    | `{API_BASE_URL}/api/template-palettes/ui` |

The REST prefix is `/api` (see Strapi `config/api.js`). Replace `{API_BASE_URL}` with your environment root (e.g. `https://api.example.com` — no trailing slash).

**Example:** `GET https://<your-api-host>/api/template-palettes/ui`

---

## Authentication

- **Required.** Send a valid **JWT** for a logged-in user (same pattern as other authenticated BFF/CMS calls).
- Typical header: `Authorization: Bearer <jwt>`
- **Users & Permissions:** the authenticated role used by the app must have **Template-palette → `getTemplatePalettesForUi`** enabled. If this permission is missing, expect **403** even with a valid token.

Unauthenticated requests return **401** (`Authentication required`).

---

## Query parameters

None for v1.

---

## Request body

None (`GET`).

---

## Success response

**HTTP 200**

Body shape:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ocean Blue",
      "ui": {
        "value": "#0f4c81"
      }
    },
    {
      "id": 2,
      "name": "Sunset Orange",
      "ui": {
        "value": "#f97316"
      }
    }
  ]
}
```

| Field             | Type   | Notes                                                                   |
| ----------------- | ------ | ----------------------------------------------------------------------- |
| `data`            | array  | Sorted by `id` ascending                                                |
| `data[].id`       | number | Use for selection / persistence keys                                    |
| `data[].name`     | string | Display label                                                           |
| `data[].ui.value` | string | Colour token as stored in CMS (typically a CSS colour string, e.g. hex) |

**Not included:** `createdAt`, `updatedAt`, `publishedAt`, Strapi `meta`, or raw entity wrappers.

**Data rules:** Only **published** (`live`) palettes are returned; drafts are excluded.

---

## TypeScript types (frontend)

Use these as a starting point; tighten `ui.value` if you standardise on hex-only or a union of known tokens.

```typescript
/** Root JSON body for GET /api/template-palettes/ui (200). */
export interface TemplatePalettesUiResponse {
  data: TemplatePaletteUiItem[];
}

/** One palette option in the catalog. */
export interface TemplatePaletteUiItem {
  id: number;
  name: string;
  ui: TemplatePaletteUiFields;
}

/** App-shaped palette fields (avoids a raw CMS field at the top level). */
export interface TemplatePaletteUiFields {
  /** CSS-ready colour string from CMS (e.g. `#0f4c81`). */
  value: string;
}
```

---

## Error responses

| Situation                                 | Typical HTTP | Notes                                              |
| ----------------------------------------- | ------------ | -------------------------------------------------- |
| No or invalid JWT                         | 401          | e.g. `Authentication required`                     |
| Valid JWT but action not allowed for role | 403          | Enable `getTemplatePalettesForUi` for the app role |
| Server failure                            | 500          | e.g. `Failed to load template palettes.`           |

Exact error JSON may follow your global Strapi error format; handle by status code in the client.

---

## Example (fetch)

```typescript
const res = await fetch(`${apiBaseUrl}/api/template-palettes/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  // handle 401 / 403 / 500
  throw new Error(`template-palettes/ui failed: ${res.status}`);
}

const body = (await res.json()) as TemplatePalettesUiResponse;
const { data } = body;
// data: TemplatePaletteUiItem[]
// Selected colour for CSS: item.ui.value
```

---

## Consistency with other template `/ui` pickers

This endpoint follows the same conventions as other app-facing catalog routes (e.g. template gradients, modes, images, noise): `GET` … `/ui`, JWT required, published-only list, `{ data: [...] }` payload. Palette-specific fields live under `ui` to keep the contract app-shaped.

---

## Related (backend)

- Route: `src/api/template-palette/routes/custom-template-palette.js`
- Controller: `src/api/template-palette/controllers/template-palette.js` → `getTemplatePalettesForUi`
- Product/request notes: `src/api/template-palette/.docs/request/template-palettes-ui-request.md`
