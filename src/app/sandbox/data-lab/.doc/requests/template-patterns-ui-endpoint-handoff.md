# Template patterns - UI integration handoff

This document describes the app-facing endpoint used to load the **published** template pattern catalog for the UI. It is intentionally narrower than the default Strapi CRUD API: no timestamps, no CMS metadata, and a stable UI-shaped payload (`ui.type`, `ui.animation`, etc.).

---

## What this endpoint is

- A custom authenticated catalog endpoint for template patterns.
- Designed for frontend picker/dropdown UI use.
- Returns only published (`live`) rows, sorted by `id` ascending.

---

## Endpoint

- Method: `GET`
- Relative path: `/template-patterns/ui`
- Full URL: `{API_BASE_URL}/api/template-patterns/ui`

Strapi REST prefix is `/api` (see `config/api.js`), so callers should include that prefix.

Example:

`GET https://<your-api-host>/api/template-patterns/ui`

---

## Authentication and permissions

- Authentication is required (`Authorization: Bearer <jwt>`).
- The role used by the app must have this action enabled in Users & Permissions:
  - `template-pattern.getTemplatePatternsForUi`

If JWT is missing/invalid or permission is not enabled, expect auth errors (typically `401` or `403` depending on Strapi handling path).

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
      "name": "Chevron Sweep",
      "ui": {
        "type": "Chevron",
        "animation": "panRight",
        "scale": 1,
        "rotation": 0,
        "opacity": 0.5,
        "animationDuration": 8,
        "animationSpeed": 1.2
      }
    }
  ]
}
```

Data rules:

- `data` is sorted by `id` ascending.
- only published (`live`) records are returned.
- no Strapi metadata fields are included.

---

## Payload types (frontend)

Suggested TypeScript contracts:

```ts
export type PatternType = "Triangles" | "lines" | "grid" | "dots" | "Crosshatch" | "Chevron";

export type PatternAnimation =
  | "none"
  | "panDown"
  | "panUp"
  | "panRight"
  | "panLeft"
  | "rotate"
  | "pulse";

export type TemplatePatternUi = {
  type: PatternType | null;
  animation: PatternAnimation | null;
  scale: number | null;
  rotation: number | null;
  opacity: number | null;
  animationDuration: number | null;
  animationSpeed: number | null;
};

export type TemplatePatternUiItem = {
  id: number;
  name: string | null;
  ui: TemplatePatternUi;
};

export type GetTemplatePatternsUiResponse = {
  data: TemplatePatternUiItem[];
};
```

Notes:

- `ui.type` maps from CMS `patternType`.
- Decimal fields (`scale`, `rotation`, `opacity`, `animationSpeed`) can arrive as numbers or numeric-like values depending on ORM/database behavior; client should defensively parse/coerce if strict numeric operations are required.

---

## Error responses

- `401` / `403`: auth/permission issue.
- `500`: unexpected backend failure (message: `Failed to load template patterns.`).

Error body shape may follow your global Strapi error format. Frontend should branch primarily on status code.

---

## How to use it (example)

```ts
const res = await fetch(`${apiBaseUrl}/api/template-patterns/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  throw new Error(`template-patterns/ui failed: ${res.status}`);
}

const body = (await res.json()) as GetTemplatePatternsUiResponse;
// body.data -> TemplatePatternUiItem[]
```

---

## Integration notes

- This endpoint is a global lookup catalog (not account-owned records).
- Payload naming is intentionally app-facing (`ui.type`) instead of raw CMS naming (`patternType`).
- Keep this endpoint aligned with other template `/ui` picker endpoints (`template-noise`, `template-palette`, `template-particle`, etc.).

---

## Related backend files

- Route: `src/api/template-pattern/routes/custom-template-pattern.js`
- Controller: `src/api/template-pattern/controllers/template-pattern.js` (`getTemplatePatternsForUi`)
- Request/spec: `src/api/template-pattern/.docs/request/template-patterns-ui-request.md`
