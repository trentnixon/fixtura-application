# Template particles — UI integration handoff

This document describes the app-facing endpoint used to load the **published** template particle catalog for the UI. It is narrower than the generic Strapi CRUD API: no timestamps, no CMS meta, stable shape aligned with app-facing particle settings (`ui.type`, `ui.animation`, etc.).

---

## Endpoint

| Item                        | Value                                      |
| --------------------------- | ------------------------------------------ |
| Method                      | `GET`                                      |
| Path (relative to API base) | `/template-particles/ui`                   |
| Full URL                    | `{API_BASE_URL}/api/template-particles/ui` |

The REST prefix is `/api` (see Strapi `config/api.js`). Replace `{API_BASE_URL}` with your environment root (e.g. `https://api.example.com` — no trailing slash).

**Example:** `GET https://<your-api-host>/api/template-particles/ui`

---

## Authentication

- **Required.** Send a valid **JWT** for a logged-in user (same pattern as other authenticated BFF/CMS calls).
- Typical header: `Authorization: Bearer <jwt>`
- **Users & Permissions:** the authenticated role used by the app must have **Template-particle → `getTemplateParticlesForUi`** enabled. If this permission is missing, expect **403** even with a valid token.

Requests without a valid token or without the action enabled for the role are typically rejected by Strapi with **401** or **403** depending on the case; treat non-2xx as an auth/configuration issue.

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
      "name": "Soft Dots",
      "ui": {
        "type": "dots",
        "particleCount": 80,
        "speed": 1.2,
        "direction": "up",
        "animation": "fade"
      }
    }
  ]
}
```

### Top-level

| Field  | Type    | Notes                    |
| ------ | ------- | ------------------------ |
| `data` | `array` | Sorted by `id` ascending |

### Each item (`data[]`)

| Field  | Type             | Notes                                |
| ------ | ---------------- | ------------------------------------ |
| `id`   | `number`         | Use for selection / persistence keys |
| `name` | `string \| null` | Display label                        |
| `ui`   | `object`         | App-shaped render configuration      |

### `ui` object

| Field           | Type                        | Notes                         |
| --------------- | --------------------------- | ----------------------------- |
| `type`          | `ParticleType \| null`      | Maps from CMS `particleType`  |
| `particleCount` | `number \| null`            | Coerced from CMS biginteger   |
| `speed`         | `number \| null`            | Coerced from CMS decimal      |
| `direction`     | `ParticleDirection \| null` | Maps from CMS `direction`     |
| `animation`     | `ParticleAnimation \| null` | Maps from CMS `animationType` |

### String unions (CMS enumerations)

Use these as the allowed values when typing or validating in the client (source: `template-particle` content-type schema).

**`ParticleType` (`ui.type`):**

`"lines"` | `"dots"` | `"bubbles"` | `"snow"` | `"confetti"`

**`ParticleDirection` (`ui.direction`):**

`"up"` | `"down"` | `"left"` | `"right"` | `"random"`

**`ParticleAnimation` (`ui.animation`):**

`"scale"` | `"fade"` | `"slide"` | `"none"`

**Not included in the response:** `createdAt`, `updatedAt`, `publishedAt`, Strapi `meta`, or raw entity wrappers beyond `{ data: [...] }`.

**Data rules:** Only **published** (`live`) particles are returned; drafts are excluded.

---

## Error responses

| Situation                                 | Typical HTTP | Notes                                               |
| ----------------------------------------- | ------------ | --------------------------------------------------- |
| No or invalid JWT / not allowed           | 401 or 403   | Depends on Strapi users-permissions handling        |
| Valid JWT but action not allowed for role | 403          | Enable `getTemplateParticlesForUi` for the app role |
| Server failure                            | 500          | e.g. `Failed to load template particles.`           |

Exact error JSON may follow your global Strapi error format; handle by status code in the client.

---

## Example (fetch)

```javascript
const res = await fetch(`${apiBaseUrl}/api/template-particles/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  throw new Error(`template-particles/ui failed: ${res.status}`);
}

const { data } = await res.json();
// data: Array<{
//   id: number;
//   name: string | null;
//   ui: {
//     type: string | null;
//     particleCount: number | null;
//     speed: number | null;
//     direction: string | null;
//     animation: string | null;
//   };
// }>
```

---

## Alignment with saved account settings

Particle settings returned elsewhere in the app (e.g. scheduler/template options) use the same vocabulary under a nested `particle` object: `type`, `particleCount`, `speed`, `direction`, `animation`. This endpoint exposes **`ui.type`** and **`ui.animation`** (not `particleType` / `animationType`) so the picker payload matches that app-facing shape.

---

## Related (backend)

- Route: `src/api/template-particle/routes/custom-template-particle.js`
- Controller: `src/api/template-particle/controllers/template-particle.js` → `getTemplateParticlesForUi`
- Request / spec: `src/api/template-particle/.docs/request/template-particles-ui-request.md`
