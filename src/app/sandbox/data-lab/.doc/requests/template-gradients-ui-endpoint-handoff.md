# Template gradients — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template gradient catalog for the UI. It is narrower than the generic Strapi CRUD API: no timestamps, no CMS meta, stable shape for labels and styling.

---

## Endpoint

| Item                        | Value                                      |
| --------------------------- | ------------------------------------------ |
| Method                      | `GET`                                      |
| Path (relative to API base) | `/template-gradients/ui`                   |
| Full URL                    | `{API_BASE_URL}/api/template-gradients/ui` |

The REST prefix is `/api` (see Strapi `config/api.js`). Replace `{API_BASE_URL}` with your environment root (e.g. `https://api.example.com` — no trailing slash).

**Example:** `GET https://<your-api-host>/api/template-gradients/ui`

---

## Authentication

- **Required.** Send a valid **JWT** for a logged-in user (same pattern as other authenticated BFF/CMS calls).
- Typical header: `Authorization: Bearer <jwt>`
- **Users & Permissions:** the authenticated role used by the app must have **Template-gradient → `getTemplateGradientsForUi`** enabled. If this permission is missing, expect **403** even with a valid token.

Unauthenticated requests return **401** (`Authentication required`).

---

## Query parameters

None for v1.

---

## Success response

**HTTP 200**

Body shape:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Sunset",
      "ui": {
        "type": "linear",
        "direction": "to right"
      }
    }
  ]
}
```

| Field                 | Type   | Notes                                             |
| --------------------- | ------ | ------------------------------------------------- |
| `data`                | array  | Sorted by `id` ascending                          |
| `data[].id`           | number | Use for selection / persistence keys              |
| `data[].name`         | string | Display label                                     |
| `data[].ui.type`      | string | Gradient type (e.g. CSS-oriented value from CMS)  |
| `data[].ui.direction` | string | Direction string (e.g. for CSS `linear-gradient`) |

**Not included:** `createdAt`, `updatedAt`, `publishedAt`, Strapi `meta`, or raw entity wrappers.

**Data rules:** Only **published** (`live`) gradients are returned; drafts are excluded.

---

## Error responses

| Situation                                 | Typical HTTP | Notes                                               |
| ----------------------------------------- | ------------ | --------------------------------------------------- |
| No or invalid JWT                         | 401          | e.g. `Authentication required`                      |
| Valid JWT but action not allowed for role | 403          | Enable `getTemplateGradientsForUi` for the app role |
| Server failure                            | 500          | e.g. `Failed to load template gradients.`           |

Exact error JSON may follow your global Strapi error format; handle by status code in the client.

---

## Example (fetch)

```javascript
const res = await fetch(`${apiBaseUrl}/api/template-gradients/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  // handle 401 / 403 / 500
  throw new Error(`template-gradients/ui failed: ${res.status}`);
}

const { data } = await res.json();
// data: Array<{ id: number; name: string; ui: { type: string; direction: string } }>
```

---

## Related (backend)

- Route: `src/api/template-gradient/routes/custom-template-gradient.js`
- Controller: `src/api/template-gradient/controllers/template-gradient.js` → `getTemplateGradientsForUi`
