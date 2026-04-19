# Handoff: `GET /api/assets/list-for-selection`

Backend endpoint for UIs that need a **compact, published-only** list of assets (e.g. pickers, test harnesses). Returns fixed fields only; no pagination or filters.

**Implementation:** [`routes/custom-asset.js`](../../routes/custom-asset.js) (route `asset.listForSelection`), [`controllers/asset.js`](../../controllers/asset.js) (`listForSelection`). The core router [`routes/asset.js`](../../routes/asset.js) uses `except: ['findOne']` so the default `GET /assets/:id` does not take precedence over static paths (same pattern as [`asset-category`](../../../asset-category/routes/asset-category.js)).

**Broader API reference:** [`API.md`](./API.md) (includes this endpoint in the overview table).

---

## Request

| Item   | Value                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| Method | `GET`                                                                                                                |
| Path   | `/api/assets/list-for-selection` (Strapi REST prefix is `/api`; see [`config/api.js`](../../../../../config/api.js)) |
| Query  | None                                                                                                                 |
| Body   | None                                                                                                                 |
| Auth   | None (`auth: false` on the route)                                                                                    |

### Users & permissions (Strapi Admin)

Anonymous callers still need the action allowed for **Public**:

1. **Settings → Users & permissions → Roles → Public**
2. Under **Asset**, enable **`listForSelection`** (wording may vary slightly by Strapi version).

If this is not enabled, unauthenticated requests return **403**.

---

## Behaviour

- **Published only:** Rows where `publishedAt` is set. Draft / unpublished assets are **not** returned.
- **Sort:** `Name` ascending.
- **Field names** match the Strapi schema (PascalCase attributes): `Name`, `CompositionID`, `Metadata`, etc. The schema field is **`CompositionID`** (composition identifier string), not “competition” id.

---

## Success response

HTTP **200**.

```json
{
  "data": [
    {
      "id": 1,
      "Name": "Example asset",
      "Sport": "Cricket",
      "CompositionID": "comp-123",
      "Metadata": {},
      "description": "Optional short description",
      "asset_category": {
        "id": 2,
        "Name": "Category name",
        "Identifier": "cat-id",
        "description": null
      }
    }
  ]
}
```

- **`id`:** Integer primary key.
- **`Name`:** Display name.
- **`Sport`:** One of `Cricket` \| `AFL` \| `Hockey` \| `Netball` \| `Basketball` \| `null` if unset.
- **`CompositionID`:** String identifier used with composition flows; may be `null`.
- **`Metadata`:** JSON object; may be `null`.
- **`description`:** Plain text; may be `null`.
- **`asset_category`:** Related category or `null`. When present, includes `id`, `Name`, `Identifier`, `description` (see `api::asset-category.asset-category`).

---

## TypeScript types (frontend)

```typescript
export interface AssetListForSelectionResponse {
  data: AssetListForSelectionItem[];
}

export interface AssetListForSelectionItem {
  id: number;
  Name: string | null;
  Sport: "Cricket" | "AFL" | "Hockey" | "Netball" | "Basketball" | null;
  CompositionID: string | null;
  Metadata: Record<string, unknown> | null;
  description: string | null;
  asset_category: AssetCategorySummary | null;
}

export interface AssetCategorySummary {
  id: number;
  Name: string | null;
  Identifier: string | null;
  description: string | null;
}
```

---

## Errors

| HTTP    | When                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| **403** | Public role does not allow `listForSelection`, or permission misconfiguration. |
| **500** | Server error while loading assets (generic message from controller).           |

There is no **400** for this route (no inputs to validate).

---

## Related endpoints

| Endpoint               | Use when                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `GET /api/assets/list` | Pagination, filters, populate — full admin-style listing (see [`API.md`](./API.md)). |
| `GET /api/assets/:id`  | Single asset by id with optional populate.                                           |

---

## Open questions / follow-ups

- If the UI must include **draft** assets, the backend would need a separate authenticated route or a query flag — not supported on this public endpoint.
