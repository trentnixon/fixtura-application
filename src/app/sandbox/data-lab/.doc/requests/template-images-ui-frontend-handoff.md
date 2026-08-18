# Handoff: `GET /api/template-images/ui`

App-facing catalog endpoint for **template image** picker UIs. Returns only **published (“live”)** rows, **sorted by `id` ascending**, in a narrow JSON shape. This is **not** the default Strapi content API; it omits timestamps, publication metadata, and raw Strapi entity wrappers.

**Implementation:** [`routes/custom-template-image.js`](../../routes/custom-template-image.js), [`controllers/template-image.js`](../../controllers/template-image.js).

---

## Request

| Item                | Value                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Method              | `GET`                                                                                                                                           |
| Path                | `/api/template-images/ui` (Strapi REST prefix is `/api`; see [`config/api.js`](../../../../../config/api.js))                                   |
| Auth                | **Required.** `Authorization: Bearer <JWT>`                                                                                                     |
| Users & Permissions | Enable **Authenticated** → **Template-image** → **getTemplateImagesForUi** (scope: `api::template-image.template-image.getTemplateImagesForUi`) |

### Query parameters

None. v1 is a global published catalog (no `accountId`).

---

## Behaviour

1. Caller must be authenticated; otherwise **401** (`"Authentication required"`).
2. If the JWT is valid but the **Authenticated** role does not have this action enabled, Strapi Users & Permissions typically responds with **403** (forbidden).
3. Only **published** template images are returned (`publicationState: "live"`). Drafts never appear.
4. Results are **sorted by `id` ascending**.
5. Server errors are logged; the client receives **500** with a generic message (see below).

---

## Success response

HTTP **200**. Body:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Parallax Drift",
      "ui": {
        "type": "pan",
        "direction": "left",
        "overlayStyle": "gradient",
        "gradientType": "linear",
        "overlayOpacity": 0.4
      }
    }
  ]
}
```

- **`id`**, **`name`**: top-level for labels and storing the user’s selection.
- **`ui`**: display configuration only. Field names **`type`** and **`direction`** map from CMS fields `animationType` and `animationDirection` (same vocabulary as scheduler payload shaping elsewhere).
- **`overlayOpacity`**: numeric when valid; may be **`null`** if missing or not coercible to a finite number.

---

## Error responses

| HTTP    | When                                                       | Typical body                                                                                                      |
| ------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **401** | No user / invalid session                                  | Strapi auth error payload                                                                                         |
| **403** | User authenticated but role lacks `getTemplateImagesForUi` | Strapi permission error payload                                                                                   |
| **500** | Unexpected server failure                                  | `{ "error": { "message": "Failed to load template images.", ... } }` (exact shape follows Strapi error formatter) |

---

## TypeScript types (frontend)

Unions match the Strapi schema enumerations for [`template-image`](../../content-types/template-image/schema.json). If the CMS adds enum values later, widen these unions when you confirm runtime values.

```typescript
/** Success body from ctx.send */
export interface TemplateImagesUiResponse {
  data: TemplateImageUiItem[];
}

export interface TemplateImageUiItem {
  id: number;
  name: string | null;
  ui: TemplateImageUiConfig;
}

export interface TemplateImageUiConfig {
  type: TemplateImageAnimationType | null;
  direction: TemplateImageAnimationDirection | null;
  overlayStyle: TemplateImageOverlayStyle | null;
  gradientType: TemplateImageGradientType | null;
  overlayOpacity: number | null;
}

export type TemplateImageAnimationType =
  "none" | "zoom" | "pan" | "kenburns" | "breathing" | "focusblur";

export type TemplateImageAnimationDirection =
  "up" | "down" | "left" | "right" | "in" | "out" | "pulse";

export type TemplateImageOverlayStyle =
  "none" | "solid" | "gradient" | "vignette" | "duotone" | "pattern" | "colorFilter";

export type TemplateImageGradientType = "linear" | "radial";
```

### Example fetch (browser / React)

```typescript
const baseUrl = import.meta.env.VITE_STRAPI_URL; // or your config
const res = await fetch(`${baseUrl}/api/template-images/ui`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  },
});

if (!res.ok) {
  // handle 401 / 403 / 500
  throw new Error(`template-images/ui failed: ${res.status}`);
}

const body = (await res.json()) as TemplateImagesUiResponse;
```

---

## Integration notes

- **Not the default Strapi collection route:** Do not rely on `GET /api/template-images` for this UI; use **`/api/template-images/ui`** for the stable, trimmed contract.
- **Alignment with other APIs:** The aggregate endpoint `GET /api/template-categories/all-template-options` includes an `images` array with **CMS field names** (`animationType`, `animationDirection`). This endpoint uses **`ui.type`** and **`ui.direction`** on purpose for app-facing consistency (see `templateOptionDestruct` / scheduler payloads).
- **Caching:** Safe to cache per user session if desired; catalog is global (not per account). Invalidate when product requirements change.

---

## Related docs

- Backend request / acceptance criteria: [template-images-ui-handoff.md](../request/template-images-ui-handoff.md)
