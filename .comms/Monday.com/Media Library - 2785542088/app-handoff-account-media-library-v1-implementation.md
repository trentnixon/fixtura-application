# App handoff: Account Media Library v1 — CMS implementation complete

**From:** CMS (Strapi) Backend  
**To:** Fixtura Application  
**Date:** 2026-07-17  
**Monday parent:** [Media Library — Account-scoped CMS mutation API](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2787952849) (`2787952849`)  
**CMS authority:** `.comms/Monday.com/Media Library — Account-scoped CMS mutation API/01-CMS-DEVELOPMENT-HANDOFF.md`  
**Status:** Implemented in CMS backend. Manual smoke test pending. Generic upload/CRUD cutover deferred until App launch.

---

## What changed

The CMS now exposes a complete account-scoped Media Library API. Authenticated account owners can list, view, upload, edit metadata, activate/deactivate, and delete images for their selected account.

**Previously:** two GET endpoints existed with a loose mapper (nullable fields, `alternativeText`, invalid legacy rows visible).

**Now:**

- Both GET endpoints return a normalized v1 DTO.
- Three new mutation endpoints: POST (create/upload), PATCH (metadata/activation), DELETE (scoped record).
- Structured error envelope with stable `code` and optional `details.fields`.
- Strict route ID parsing (all-digits only).
- Upload validation before S3 (`sharp`, JPEG/PNG/WebP, 10 MiB, dimension limits).

**Not in this release:** alternative-text editing, image replacement on PATCH, pagination, search/filter, two-step upload (`/api/upload` then create).

---

## Authentication

All five endpoints require a Fixtura JWT. Each route enforces a dedicated Users & Permissions scope on the Account controller.

The App must send the user's bearer token on every request. Account ownership is enforced server-side from the route `:accountId` — never send `account`, `accountId`, or `imageId` in create/update bodies.

---

## Endpoints

Base path: `/api/accounts/:accountId/media-library`

| Method   | Path                                              | Scope                                                | Success       |
| -------- | ------------------------------------------------- | ---------------------------------------------------- | ------------- |
| `GET`    | `/api/accounts/:accountId/media-library`          | `api::account.account.getAccountMediaLibrary`        | `200`         |
| `GET`    | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.getAccountMediaLibrary`        | `200`         |
| `POST`   | `/api/accounts/:accountId/media-library`          | `api::account.account.createAccountMediaLibraryItem` | `201`         |
| `PATCH`  | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.updateAccountMediaLibraryItem` | `200`         |
| `DELETE` | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.deleteAccountMediaLibraryItem` | `204` no body |

Route IDs (`accountId`, `mediaId`) must be all-digits positive integers. Values like `12abc`, `12.5`, `+12`, `0`, and whitespace-padded strings return `400 INVALID_REQUEST`.

---

## TypeScript types

Use these in the App client:

```ts
type MediaLibraryMarkerPosition = [] | [{ top: number; left: number }];

type MediaLibraryImage = {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
  mime: string;
};

type MediaLibraryItem = {
  id: number;
  title: string;
  isActive: boolean;
  tags: string[];
  ageGroup: "Seniors" | "Juniors" | "Both";
  assetType:
    | "ALL"
    | "Upcoming Fixtures"
    | "Weekend Results"
    | "Top 5 Run Scorers"
    | "Top 5 Bowlers"
    | "League Tables"
    | "Team List";
  markerPosition: MediaLibraryMarkerPosition;
  image: MediaLibraryImage;
};

type MediaLibraryListResponse = {
  data: {
    items: MediaLibraryItem[];
  };
};

type MediaLibraryItemResponse = {
  data: MediaLibraryItem;
};

type MediaLibraryFieldErrors = Record<string, string[]>;

type MediaLibraryErrorResponse = {
  error: {
    status: number;
    name: string;
    message: string;
    code: string;
    details?: {
      fields: MediaLibraryFieldErrors;
    };
  };
};
```

**Removed from GET responses:** `alternativeText` (and any other non-contract fields).

---

## GET — list

```http
GET /api/accounts/:accountId/media-library
Authorization: Bearer <jwt>
```

**Response `200`:**

```json
{
  "data": {
    "items": [
      {
        "id": 123,
        "title": "Club background",
        "isActive": true,
        "tags": ["clubhouse"],
        "ageGroup": "Both",
        "assetType": "ALL",
        "markerPosition": [{ "top": 27.8733, "left": 33.283 }],
        "image": {
          "id": 456,
          "url": "https://example-bucket/image.jpg",
          "width": 1920,
          "height": 1080,
          "mime": "image/jpeg"
        }
      }
    ]
  }
}
```

**Behavior:**

- Published records only; inactive items included.
- Ordered by `updatedAt` descending (newest first).
- Legacy invalid rows (missing image, blank URL, blank/non-image MIME) are **omitted** from the list.
- Read-time fallbacks: null tags/marker → `[]`; null/invalid enums → defaults; null title → filename stem or `Media item ${id}`; null `isActive` → `false`.

---

## GET — single item

```http
GET /api/accounts/:accountId/media-library/:mediaId
Authorization: Bearer <jwt>
```

**Response `200`:** `{ "data": MediaLibraryItem }`

**Response `404`:** `MEDIA_NOT_FOUND` when the item is missing, draft, cross-account, or has an invalid image.

---

## POST — create / upload

One atomic operation. **Do not** use `/api/upload` followed by a separate create call.

```http
POST /api/accounts/:accountId/media-library
Authorization: Bearer <jwt>
Content-Type: multipart/form-data
```

### Multipart fields

| Field            | Required | Format                                               |
| ---------------- | -------- | ---------------------------------------------------- |
| `file`           | Yes      | Exactly one binary image (field name must be `file`) |
| `title`          | No       | Plain string; default = filename without extension   |
| `isActive`       | No       | JSON-encoded boolean; default `true`                 |
| `tags`           | No       | JSON-encoded string array; default `[]`              |
| `ageGroup`       | No       | Plain string enum; default `"Both"`                  |
| `assetType`      | No       | Plain string enum; default `"ALL"`                   |
| `markerPosition` | No       | JSON-encoded `[]` or `[{ top, left }]`; default `[]` |

**Example (JavaScript `FormData`):**

```js
const form = new FormData();
form.append("file", fileBlob, "club-background.jpg");
form.append("title", "Club background");
form.append("isActive", JSON.stringify(true));
form.append("tags", JSON.stringify(["clubhouse"]));
form.append("ageGroup", "Both");
form.append("assetType", "ALL");
form.append("markerPosition", JSON.stringify([{ top: 27.8733, left: 33.283 }]));
```

### Upload limits

- Formats: JPEG, PNG, WebP only (`.jpg`/`.jpeg`, `.png`, `.webp` + matching MIME).
- Max size: **10 MiB** (`10 * 1024 * 1024` bytes) — configure the App upload UI to this limit, not the shared 8 MiB default.
- Dimensions: 1–8192 px per axis; max 40 megapixels total.
- Validation runs on decoded image content before upload reaches S3.

### Response `201`

```json
{ "data": MediaLibraryItem }
```

Rejected fields: `account`, `accountId`, `imageId`, `publishedAt`, `id`, timestamps, `data` wrapper, extra file fields, unknown metadata fields.

---

## PATCH — metadata and activation

```http
PATCH /api/accounts/:accountId/media-library/:mediaId
Authorization: Bearer <jwt>
Content-Type: application/json
```

**Flat JSON only.** Do **not** wrap in Strapi `{ "data": { ... } }`.

**Example — deactivate:**

```json
{ "isActive": false }
```

**Example — full metadata update:**

```json
{
  "title": "Updated club background",
  "tags": ["clubhouse", "seniors"],
  "ageGroup": "Seniors",
  "assetType": "Weekend Results",
  "markerPosition": [{ "top": 50, "left": 50 }]
}
```

| Rule           | Detail                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Allowlist      | `title`, `isActive`, `tags`, `ageGroup`, `assetType`, `markerPosition` |
| Partial update | Send only fields to change                                             |
| Minimum        | At least one allowlisted field required                                |
| `title`        | Trimmed string, 1–120 Unicode characters                               |
| `isActive`     | JSON boolean only (no `"true"` string)                                 |
| Not supported  | Image replacement, alternative-text editing                            |

**Response `200`:** `{ "data": MediaLibraryItem }`

---

## DELETE

```http
DELETE /api/accounts/:accountId/media-library/:mediaId
Authorization: Bearer <jwt>
```

**Response `204`:** empty body — treat as success; do not parse JSON.

Deletes the Media Library record only. The underlying Strapi upload and S3 object are retained (deactivation is PATCH `{ "isActive": false }`, not DELETE).

---

## Field validation reference

### `tags`

- Always `string[]` in responses (never `null`).
- Max 20 tags; each trimmed, 1–40 Unicode characters.
- Case-insensitive dedupe; first spelling preserved.
- Rejects empty strings, non-strings, nested values.

### `markerPosition`

- `[]` or exactly one `{ top, left }`.
- Both coordinates required; finite numbers; range `0..100` inclusive.
- Rounded to ≤4 decimal places; no extra keys.

### Enums

**`ageGroup`:** `Seniors` | `Juniors` | `Both` (default `Both`)

**`assetType`:** `ALL` | `Upcoming Fixtures` | `Weekend Results` | `Top 5 Run Scorers` | `Top 5 Bowlers` | `League Tables` | `Team List` (default `ALL`)

---

## Error contract

All Media Library endpoints use this envelope (not plain Strapi message strings):

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Request validation failed.",
    "code": "VALIDATION_ERROR",
    "details": {
      "fields": {
        "tags[2]": ["TAG_TOO_LONG"],
        "markerPosition[0].top": ["OUT_OF_RANGE"]
      }
    }
  }
}
```

Omit `details` when there are no field errors. Branch on `error.code`.

|  HTTP | Code                     | When                                                                        |
| ----: | ------------------------ | --------------------------------------------------------------------------- |
| `400` | `INVALID_REQUEST`        | Malformed route IDs, multipart shape, empty PATCH, unknown/protected fields |
| `400` | `VALIDATION_ERROR`       | Field-level validation failure (`details.fields` present)                   |
| `401` | `UNAUTHENTICATED`        | Missing JWT (when request reaches controller)                               |
| `403` | (Strapi)                 | Authenticated role lacks scope                                              |
| `404` | `ACCOUNT_NOT_FOUND`      | Account missing or not owned (non-disclosing)                               |
| `404` | `MEDIA_NOT_FOUND`        | Item missing, draft, invalid image, or cross-account (non-disclosing)       |
| `413` | `FILE_TOO_LARGE`         | File exceeds 10 MiB                                                         |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Invalid MIME/extension/decoded format                                       |
| `500` | `UPLOAD_FAILED`          | Upload provider failure                                                     |
| `500` | `CREATE_FAILED`          | Record creation failed after successful upload                              |

Cross-account and missing-resource failures are intentionally indistinguishable (`404` with the same codes).

---

## App integration checklist

- [ ] Point Media Library UI at the five account-scoped routes above (not generic `account-media-library` CRUD).
- [ ] Use `POST .../media-library` with `FormData` and field name `file` for uploads.
- [ ] JSON-encode `isActive`, `tags`, and `markerPosition` in multipart create requests.
- [ ] Send PATCH as flat JSON (no `data` wrapper).
- [ ] Handle `204` DELETE as bodyless success.
- [ ] Parse structured `error.code` and `error.details.fields` for validation UX.
- [ ] Set client upload limit to **10 MiB**.
- [ ] Do not display or depend on `alternativeText` from these endpoints.
- [ ] Use strict positive integer route IDs (no loose `parseInt` on the client for display URLs).

---

## Cutover notes

**Currently still enabled (legacy):**

- Generic `GET/POST/PATCH/DELETE` on `api::account-media-library`
- Authenticated `POST /api/upload`

These remain for the legacy member UI until coordinated Application cutover. The new App should use only the account-scoped routes in this document.

**At App launch (CMS side, coordinated):**

- Disable generic Media Library CRUD for Authenticated and Public.
- Disable generic authenticated upload creation.
- Strapi admin and internal upload-service flows stay available.

---

## CMS implementation reference

| Module                                                                              | Purpose                           |
| ----------------------------------------------------------------------------------- | --------------------------------- |
| `src/api/account/controllers/services/mediaLibrary/parseMediaLibraryId.js`          | Strict route ID parser            |
| `src/api/account/controllers/services/mediaLibrary/mediaLibraryErrors.js`           | Structured error envelope         |
| `src/api/account/controllers/services/mediaLibrary/mediaLibraryFieldRules.js`       | Field validators/normalizers      |
| `src/api/account/controllers/services/mediaLibrary/mediaLibraryDto.js`              | Canonical DTO mapper              |
| `src/api/account/controllers/services/mediaLibrary/validateUploadImage.js`          | Pre-upload sharp validation       |
| `src/api/account/controllers/services/mediaLibrary/accountMediaLibraryMutations.js` | POST/PATCH/DELETE services        |
| `src/api/account/routes/custom-account.js`                                          | Route definitions                 |
| `src/api/account/controllers/account.js`                                            | Controller actions                |
| `src/index.js`                                                                      | Bootstrap permission registration |

**Dependency added:** `sharp@0.32.6` (direct production dependency).

---

## Out of scope (not delivered)

- Alternative-text editing
- Image replacement on PATCH
- Pagination, search, sort/filter beyond `updatedAt DESC` list order
- Schema migration / legacy data backfill
- Scheduler render-filter changes (separate ticket)
- Automated test plan
- Generic CRUD/upload permission disable (deferred to cutover)

---

## Questions / conflicts

If anything in `src/api/account/.comms/app-handoff-account-media-library-v1-contract.md` conflicts with this document, **this implementation handoff and `01-CMS-DEVELOPMENT-HANDOFF.md` take precedence** — especially:

- POST metadata is **flat multipart fields**, not a single `metadata` JSON string.
- **`alternativeText` is not in the v1 DTO** and is not editable.
