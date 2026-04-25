# Template modes — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template mode catalog (Light / Dark–style options) for the UI. It is narrower than the generic Strapi CRUD API: no timestamps, no CMS metadata wrappers, and a stable, normalized shape aligned with other template pickers.

---

## What was implemented

| Area              | Detail                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Route             | `GET /template-modes/ui` registered in [`src/api/template-mode/routes/custom-template-mode.js`](../../routes/custom-template-mode.js) |
| Handler           | [`getTemplateModesForUi`](../../controllers/template-mode.js) on `template-mode` controller                                           |
| Data source       | Collection type `api::template-mode.template-mode` — fields stored as `Name` (PascalCase in CMS) and `slug`                           |
| Filtering         | **Published only** (`publicationState: live`); draft rows are excluded                                                                |
| Ordering          | Sorted by numeric `id` ascending                                                                                                      |
| Response contract | Top-level `{ data: [...] }` with `{ id, name, slug }` per row (`Name` mapped to `name` for the API)                                   |

Cross-project alignment:

- The same logical shape appears in aggregated catalog code: `mapMode` in `getAllTemplateOptions` (`id`, `name` from `Name`, `slug`).
- Scheduler/account flows already treat the persisted value as the **slug** (e.g. `mode: template_mode?.slug || "light"`).

---

## Endpoint

| Item                           | Value                                  |
| ------------------------------ | -------------------------------------- |
| Method                         | `GET`                                  |
| Path (relative to REST prefix) | `/template-modes/ui`                   |
| Full URL                       | `{API_BASE_URL}/api/template-modes/ui` |

The REST prefix is `/api` (see [`config/api.js`](../../../../../config/api.js)). Replace `{API_BASE_URL}` with your environment root (e.g. `https://api.example.com` — no trailing slash).

**Example:** `GET https://<your-api-host>/api/template-modes/ui`

---

## Authentication

- **Required.** Send a valid **JWT** for a logged-in user (same pattern as other authenticated app/BFF calls).
- Typical header: `Authorization: Bearer <jwt>`
- **Users & Permissions:** the role used by the app (usually **Authenticated**) must allow **Template-mode → `getTemplateModesForUi`**. If this permission is missing, expect **403** even with a valid token.

Unauthenticated requests return **401** (message along the lines of `Authentication required`).

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
      "name": "Light",
      "slug": "light"
    },
    {
      "id": 2,
      "name": "Dark",
      "slug": "dark"
    }
  ]
}
```

### Field reference

| Field         | Type             | Notes                                                                                                           |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `data`        | `array`          | Ordered by `id` ascending                                                                                       |
| `data[].id`   | `number`         | Stable key for lists; use for selection UI state if needed                                                      |
| `data[].name` | `string \| null` | Human-readable label for dropdowns and settings screens                                                         |
| `data[].slug` | `string \| null` | **Canonical app value** — use this when persisting or comparing mode (matches existing backend usage of `slug`) |

**Not included:** `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`, Strapi `meta`, or nested default entity envelopes beyond `{ data: [...] }`.

**Data rules:** Only **published** (`live`) modes are returned.

---

## TypeScript (client)

You can model the success payload as:

```typescript
export type TemplateModeUiItem = {
  id: number;
  name: string | null;
  slug: string | null;
};

export type TemplateModesUiResponse = {
  data: TemplateModeUiItem[];
};
```

**UI guidance:**

- Display **`name`** in labels.
- Save and send **`slug`** to APIs that store mode (consistent with account/scheduler destructuring).
- Treat **`id`** as optional for persistence unless your product explicitly keys modes by id.

---

## Error responses

| Situation                                 | Typical HTTP | Notes                                           |
| ----------------------------------------- | ------------ | ----------------------------------------------- |
| No or invalid JWT                         | `401`        | e.g. authentication required                    |
| Valid JWT but action not allowed for role | `403`        | Enable `getTemplateModesForUi` for the app role |
| Server failure                            | `500`        | e.g. `Failed to load template modes.`           |

Exact error JSON follows your global Strapi error format; prefer handling by **HTTP status** in the client.

---

## Example (`fetch`)

```javascript
const res = await fetch(`${apiBaseUrl}/api/template-modes/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    Accept: "application/json",
  },
});

if (!res.ok) {
  // 401 / 403 / 500 — surface to user or retry as appropriate
  throw new Error(`template-modes/ui failed: ${res.status}`);
}

const body = await res.json();
/** @type {{ data: Array<{ id: number; name: string | null; slug: string | null }> }} */
const { data } = body;

for (const mode of data) {
  // mode.slug — persist; mode.name — label
}
```

---

## Permission checklist (deploy / new environments)

1. Strapi Admin → **Settings** → **Users & permissions** → **Roles** → **Authenticated** (or the role your app uses).
2. Under **Template-mode**, enable **`getTemplateModesForUi`**.
3. Confirm Auth scope used by the route matches Strapi’s generated action (see route: `api::template-mode.template-mode.getTemplateModesForUi`).

---

## Related (backend)

| File                                                                                                                                                              | Role                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`src/api/template-mode/routes/custom-template-mode.js`](../../routes/custom-template-mode.js)                                                                    | Registers `GET /template-modes/ui` and auth scope |
| [`src/api/template-mode/controllers/template-mode.js`](../../controllers/template-mode.js)                                                                        | `getTemplateModesForUi` implementation            |
| [`src/api/template-mode/content-types/template-mode/schema.json`](../../content-types/template-mode/schema.json)                                                  | CMS schema (`Name`, `slug`, draft/publish)        |
| [`src/api/template-category/controllers/services/getAllTemplateOptions/index.js`](../../../template-category/controllers/services/getAllTemplateOptions/index.js) | Same mode mapping in the aggregated catalog       |

Request / spec (pre-implementation): [template-modes-ui-request.md](../request/template-modes-ui-request.md).
