# Template noises — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template noise catalog (grain, digital rain, etc.) for the UI. It is narrower than the generic Strapi CRUD API: no timestamps, no CMS metadata wrappers, and a stable shape where the CMS field `noiseType` is exposed to the app as **`ui.type`** (aligned with scheduler/account destructuring).

---

## What was implemented

| Area              | Detail                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Route             | `GET /template-noises/ui` registered in [`src/api/template-noise/routes/custom-template-noise.js`](../../routes/custom-template-noise.js) |
| Handler           | [`getTemplateNoisesForUi`](../../controllers/template-noise.js) on the `template-noise` controller                                        |
| Data source       | Collection type `api::template-noise.template-noise` — CMS fields `name`, `noiseType` (enumeration)                                       |
| Filtering         | **Published only** (`publicationState: live`); draft rows are excluded                                                                    |
| Ordering          | Sorted by numeric `id` ascending                                                                                                          |
| Response contract | Top-level `{ data: [...] }`; each item `{ id, name, ui: { type } }` where `ui.type` is the published `noiseType` value                    |

Cross-project alignment:

- Aggregated catalog [`getAllTemplateOptions`](../../../template-category/controllers/services/getAllTemplateOptions/index.js) maps noises as `{ id, name, noiseType }` (`mapNoise`). This endpoint adds the **`ui.type`** alias for the same value so the public contract matches app vocabulary.
- Account/scheduler flows reduce the selected noise to `{ noise: { type } }` from `template_noise.noiseType` — see [`templateOptionDestruct.js`](../../../account/controllers/workers/getAccountDetailsForScheduler/utils/templateOptionDestruct.js). **`ui.type` in this response matches that `type` string.**

---

## Endpoint

| Item                           | Value                                   |
| ------------------------------ | --------------------------------------- |
| Method                         | `GET`                                   |
| Path (relative to REST prefix) | `/template-noises/ui`                   |
| Full URL                       | `{API_BASE_URL}/api/template-noises/ui` |

The REST prefix is `/api` (see [`config/api.js`](../../../../../config/api.js)). Replace `{API_BASE_URL}` with your environment root (e.g. `https://api.example.com` — no trailing slash).

**Example:** `GET https://<your-api-host>/api/template-noises/ui`

---

## Authentication

- **Required.** Send a valid **JWT** for a logged-in user (same pattern as other authenticated app/BFF calls).
- Typical header: `Authorization: Bearer <jwt>`
- **Users & Permissions:** the role used by the app (usually **Authenticated**) must allow **Template-noise → `getTemplateNoisesForUi`**. If this permission is missing, expect **403** even with a valid token.

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
      "name": "Soft Grain",
      "ui": {
        "type": "grain"
      }
    },
    {
      "id": 2,
      "name": "Digital Rain",
      "ui": {
        "type": "digitalRain"
      }
    }
  ]
}
```

### Field reference

| Field            | Type             | Notes                                                                                                                                                                      |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`           | `array`          | Ordered by `id` ascending                                                                                                                                                  |
| `data[].id`      | `number`         | Stable key; use for selection and persistence when the product stores noise by id                                                                                          |
| `data[].name`    | `string \| null` | Human-readable label for pickers and settings copy                                                                                                                         |
| `data[].ui`      | `object`         | App-shaped wrapper for render settings                                                                                                                                     |
| `data[].ui.type` | `string \| null` | **Canonical noise identifier for the app** — same enumeration as CMS `noiseType` (see below). Use when comparing to persisted `noise.type` from account/scheduler payloads |

**Not included:** `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`, Strapi `meta`, or nested default entity envelopes beyond `{ data: [...] }`.

**Data rules:** Only **published** (`live`) rows are returned.

---

## `ui.type` — allowed values (CMS enum)

Values come from [`schema.json`](../../content-types/template-noise/schema.json) attribute `noiseType`. The API returns these exact string literals (or `null` if the field were ever empty):

`default` · `subtle` · `grain` · `wave` · `fog` · `static` · `floatingParticles` · `dynamicParticles` · `triangleSwarm` · `pulsingCircles` · `digitalRain` · `gradientGrid` · `spokes`

New enum values added in the CMS will appear here automatically once published.

---

## TypeScript (client)

You can model the success payload as:

```typescript
/** Matches CMS template-noise.noiseType enum; keep in sync with Backend schema. */
export type TemplateNoiseUiType =
  | "default"
  | "subtle"
  | "grain"
  | "wave"
  | "fog"
  | "static"
  | "floatingParticles"
  | "dynamicParticles"
  | "triangleSwarm"
  | "pulsingCircles"
  | "digitalRain"
  | "gradientGrid"
  | "spokes";

export type TemplateNoiseUiItem = {
  id: number;
  name: string | null;
  ui: {
    /** Same as persisted noise.type in scheduler/account flows */
    type: TemplateNoiseUiType | null;
  };
};

export type TemplateNoisesUiResponse = {
  data: TemplateNoiseUiItem[];
};
```

**UI guidance:**

- Display **`name`** in labels.
- Use **`ui.type`** (or **`id`**, depending on product rules) when persisting or comparing to existing `noise.type` from account APIs.
- If you only need a picker list, **`id`** is sufficient when the backend stores foreign keys to `template-noise`.

---

## Error responses

| Situation                                 | Typical HTTP | Notes                                            |
| ----------------------------------------- | ------------ | ------------------------------------------------ |
| No or invalid JWT                         | `401`        | e.g. authentication required                     |
| Valid JWT but action not allowed for role | `403`        | Enable `getTemplateNoisesForUi` for the app role |
| Server failure                            | `500`        | e.g. `Failed to load template noises.`           |

Exact error JSON follows your global Strapi error format; prefer handling by **HTTP status** in the client.

---

## Example (`fetch`)

```javascript
const res = await fetch(`${apiBaseUrl}/api/template-noises/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    Accept: "application/json",
  },
});

if (!res.ok) {
  // 401 / 403 / 500 — surface to user or retry as appropriate
  throw new Error(`template-noises/ui failed: ${res.status}`);
}

const body = await res.json();
/** @type {{ data: Array<{ id: number; name: string | null; ui: { type: string | null } }> }} */
const { data } = body;

for (const noise of data) {
  // noise.name — label; noise.ui.type — app noise kind
}
```

---

## Permission checklist (deploy / new environments)

1. Strapi Admin → **Settings** → **Users & permissions** → **Roles** → **Authenticated** (or the role your app uses).
2. Under **Template-noise**, enable **`getTemplateNoisesForUi`**.
3. Confirm the route auth scope matches Strapi’s action id: `api::template-noise.template-noise.getTemplateNoisesForUi` (see [`custom-template-noise.js`](../../routes/custom-template-noise.js)).

---

## Related (backend)

| File                                                                                                                              | Role                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`src/api/template-noise/routes/custom-template-noise.js`](../../routes/custom-template-noise.js)                                 | Registers `GET /template-noises/ui` and auth scope                              |
| [`src/api/template-noise/controllers/template-noise.js`](../../controllers/template-noise.js)                                     | `getTemplateNoisesForUi` implementation                                         |
| [`src/api/template-noise/content-types/template-noise/schema.json`](../../content-types/template-noise/schema.json)               | CMS schema (`name`, `noiseType`, draft/publish)                                 |
| [`getAllTemplateOptions` … `mapNoise`](../../../template-category/controllers/services/getAllTemplateOptions/index.js)            | Same catalog rows in aggregated `{ noises: [...] }` with `noiseType` field name |
| [`templateOptionDestruct.js`](../../../account/controllers/workers/getAccountDetailsForScheduler/utils/templateOptionDestruct.js) | Selected noise as `{ noise: { type } }` from `noiseType`                        |

Request / spec (pre-implementation): [template-noises-ui-request.md](../request/template-noises-ui-request.md).
