# App handoff: Account Media Library v1 contract

**From:** CMS (Strapi) Backend  
**To:** Fixtura App  
**Date:** 17 July 2026  
**Monday parent:** `2785542088`  
**Status:** Contract recommendation ready for approval. The two `GET` routes exist in the current working tree; mutation routes, validation, permission changes, file cleanup, scheduler filtering, and tests described below are not yet implemented.

## Contract summary

All member operations are nested under an account and require a Fixtura JWT.

| Method   | Path                                              | Permission action                                    | Status                 |
| -------- | ------------------------------------------------- | ---------------------------------------------------- | ---------------------- |
| `GET`    | `/api/accounts/:accountId/media-library`          | `api::account.account.getAccountMediaLibrary`        | Exists in working tree |
| `GET`    | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.getAccountMediaLibrary`        | Exists in working tree |
| `POST`   | `/api/accounts/:accountId/media-library`          | `api::account.account.createAccountMediaLibraryItem` | To implement           |
| `PATCH`  | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.updateAccountMediaLibraryItem` | To implement           |
| `DELETE` | `/api/accounts/:accountId/media-library/:mediaId` | `api::account.account.deleteAccountMediaLibraryItem` | To implement           |

There is no member-facing create-from-existing-upload endpoint in v1. This keeps upload IDs out of the ownership contract and lets generic authenticated upload access be disabled.

## Canonical DTO

```json
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
    "mime": "image/jpeg",
    "alternativeText": "Club rooms"
  }
}
```

For every item returned by these account-scoped APIs, `image`, `image.id`, and `image.url` are non-null. Rows with a missing upload relation, missing upload ID, or blank URL are invalid legacy rows and are omitted from list/render results; fetching one returns non-disclosing `404 MEDIA_NOT_FOUND`.

Successful single-item reads and mutations use `{ "data": MediaLibraryItem }`. The list uses `{ "data": { "items": MediaLibraryItem[] } }` until pagination is added.

## Data contract decisions

### `tags`

- Canonical shape: array of strings, never `null` in an account-scoped response.
- Omitted or explicit `null` on create becomes `[]`. Explicit `null` on update clears tags to `[]`.
- Maximum 20 tags; each tag is trimmed, must contain 1–40 Unicode characters after trimming, and is stored without surrounding whitespace.
- Empty strings are rejected. Exact duplicates after case-insensitive comparison are removed while preserving first occurrence and spelling.
- Objects, nested arrays, numbers, and booleans are rejected.
- Legacy database `null` is read as `[]`; valid legacy string arrays are normalized on output.

### `markerPosition`

Keep the renderer-compatible legacy shape:

```ts
type MarkerPosition = [] | [{ top: number; left: number }];
```

- `top` and `left` are percentages in the inclusive range `0..100`.
- Both coordinates are required together. No extra object keys are accepted.
- Values must be finite JSON numbers, not numeric strings.
- The API rounds stored/output values to at most four decimal places.
- Omitted or explicit `null` on create becomes `[]`. Explicit `null` on update clears the marker to `[]`.
- Arrays containing zero or one marker are accepted; multiple markers are rejected.
- Legacy `null` is returned as `[]`. A malformed legacy value is treated as `[]` for reads/renders and should be reported by a migration audit rather than causing a render failure.

### Required fields and defaults

The only client-required create field is multipart `file`. The server derives `account` from the route and publishes the record immediately.

| Field            | Create default                               | Required in stored v1 records             |
| ---------------- | -------------------------------------------- | ----------------------------------------- |
| `imageId`        | Newly uploaded image                         | Yes                                       |
| `title`          | Uploaded filename without extension, trimmed | Yes, 1–120 characters                     |
| `isActive`       | `true`                                       | Yes                                       |
| `AgeGroup`       | `Both`                                       | Yes                                       |
| `AssetType`      | `ALL`                                        | Yes                                       |
| `tags`           | `[]`                                         | Yes; never database `null` for new writes |
| `markerPosition` | `[]`                                         | Yes; never database `null` for new writes |
| `account`        | Route `:accountId`                           | Yes                                       |
| `publishedAt`    | Current server time                          | Yes                                       |

`AgeGroup` values are `Seniors`, `Juniors`, and `Both`. `AssetType` values are `ALL`, `Upcoming Fixtures`, `Weekend Results`, `Top 5 Run Scorers`, `Top 5 Bowlers`, `League Tables`, and `Team List`.

The content-type schema should be tightened to match new writes:

- `imageId`: `required: true`, `allowedTypes: ["images"]`;
- `title`: `required: true`, `minLength: 1`, `maxLength: 120`;
- `isActive`: `required: true`, `default: true`;
- `account`: `required: true`;
- `tags`: `required: true`, `default: []`;
- `AgeGroup`: `required: true`, `default: "Both"`;
- `AssetType`: `required: true`, `default: "ALL"`;
- `markerPosition`: `required: true`, `default: []`.

Strapi's JSON attribute declaration cannot enforce the tag and marker sub-shapes, so the custom create/update service remains the authoritative validator. Schema tightening must be deployed with an audited legacy backfill or a migration order that avoids rejecting existing null rows during startup/administration.

## Upload and creation

Creation is one atomic-looking application operation:

`POST /api/accounts/:accountId/media-library`

Content type is `multipart/form-data` with exactly one binary `file` field and an optional `metadata` field containing a JSON object encoded as a string.

```text
file: <binary>
metadata: {"title":"Club background","alternativeText":"Club rooms","isActive":true,"tags":["clubhouse"],"ageGroup":"Both","assetType":"ALL","markerPosition":[{"top":27.8733,"left":33.283}]}
```

`metadata` may contain only `title`, `alternativeText`, `isActive`, `tags`, `ageGroup`, `assetType`, and `markerPosition`. `account`, `accountId`, `imageId`, `publishedAt`, IDs, timestamps, and unknown fields are rejected. `alternativeText` is optional, trimmed, nullable, and limited to 255 characters.

V1 accepts images only:

- MIME/extension pairs: `image/jpeg` with `.jpg` or `.jpeg`; `image/png` with `.png`; `image/webp` with `.webp`.
- SVG, GIF, audio, video, documents, and MIME/extension mismatches are rejected.
- Maximum file size: 10 MiB (`10 * 1024 * 1024` bytes).
- Decoded image dimensions must be from 1 to 8192 pixels on each axis and at most 40 megapixels total.
- Validation must inspect the decoded file, not trust browser-supplied MIME, extension, width, or height.

The server validates account ownership before uploading. If the upload succeeds and record creation fails, it attempts to delete the new Strapi upload immediately. A failed compensation is logged with the upload ID for an orphan-cleanup job; the API still returns the record-creation failure and never returns an unattached upload ID to the browser.

Create response: HTTP `201` with `{ "data": MediaLibraryItem }`.

## Editing

`PATCH /api/accounts/:accountId/media-library/:mediaId` accepts JSON, either as a flat object or `{ "data": { ... } }`.

Allowlisted fields are `title`, `isActive`, `tags`, `ageGroup`, `assetType`, and `markerPosition`. This operation is partial and last-write-wins. At least one allowlisted field must be supplied. Unknown/system/relationship fields are rejected.

Activation and deactivation use the same patch:

```json
{ "isActive": false }
```

`alternativeText` is not updateable in v1. In Strapi it belongs to the upload record and changing it can affect every relation that shares that upload. It can only be set during this endpoint's creation of a new, dedicated upload. A future per-library-item alt-text field should be added if editable alt text is required.

Patch response: HTTP `200` with `{ "data": MediaLibraryItem }`.

## Deletion and file lifecycle

`DELETE /api/accounts/:accountId/media-library/:mediaId` permanently deletes the account-media-library record and returns HTTP `204` with no body. Deactivation is a separate, reversible `PATCH` operation and is not deletion.

The request does not synchronously delete the Strapi/S3 upload. After the record is removed, an asynchronous cleanup process may delete the upload only when no Strapi relation references it. Shared files are retained. Failed cleanup leaves a recoverable orphan and is retried/audited; it does not turn a successful record deletion into an API error.

## Error contract

Errors use a stable Strapi-compatible envelope:

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

|  HTTP | Stable code              | Use                                                       |
| ----: | ------------------------ | --------------------------------------------------------- |
| `400` | `INVALID_REQUEST`        | Malformed IDs, JSON, multipart fields, or empty patch     |
| `400` | `VALIDATION_ERROR`       | Field-level validation failure                            |
| `400` | `UNSUPPORTED_MEDIA_TYPE` | Invalid MIME/extension/decoded image                      |
| `413` | `FILE_TOO_LARGE`         | File exceeds 10 MiB                                       |
| `401` | `UNAUTHENTICATED`        | Missing or invalid JWT                                    |
| `403` | Strapi permission error  | Authenticated role lacks the custom action scope          |
| `404` | `ACCOUNT_NOT_FOUND`      | Account is missing or not owned                           |
| `404` | `MEDIA_NOT_FOUND`        | Item is missing, draft, invalid, or outside route account |
| `500` | `UPLOAD_FAILED`          | Upload provider failure                                   |
| `500` | `CREATE_FAILED`          | Record creation failed after upload                       |

Cross-account failures must not disclose whether the account, item, or upload exists.

## Ownership and permissions

Every custom operation must:

1. require `ctx.state.user.id`;
2. parse positive integer route IDs strictly (`"1x"` is invalid, not account `1`);
3. verify JWT user to route account ownership;
4. query item operations by both media item ID and route account ID;
5. treat missing and non-owned resources as the same `404` class;
6. set the account relation exclusively from the route;
7. reject browser-supplied ownership, upload-relation, publication, ID, and timestamp fields.

Enable only the custom Account controller scopes listed in the endpoint table for the Authenticated role. Disable Authenticated and Public permissions for generic `api::account-media-library.account-media-library` `find`, `findOne`, `create`, `update`, and `delete`, plus generic upload creation. Public must have no account-media-library permissions.

## Publication, active state, and legacy behavior

- Member-created records publish immediately.
- Drafts are always excluded from member reads and scheduler/render payloads.
- Inactive items remain visible in the management list and item endpoint so users can reactivate them, but are excluded from scheduler/render payloads.
- Scheduler loading must explicitly filter `publishedAt != null`, `isActive = true`, and valid non-null image ID/URL before mapping.
- Existing records are supported with read-time fallbacks: `tags null -> []`, `markerPosition null -> []`, `AgeGroup null -> Both`, and `AssetType null -> ALL`.
- A one-time audited backfill should normalize linked legacy rows. Unlinked legacy rows require a separate ownership/cleanup decision and must not be attached to an account by inference.

## Focused test matrix

At minimum, automated tests must cover:

1. owner list/get success and empty list;
2. absent JWT (`401`) and missing permission (`403`);
3. non-owned account returns the same `404` class as a missing account;
4. an owned account cannot get, patch, or delete another account's item;
5. route account/ownership fields in create and patch are rejected and never persisted;
6. create defaults and immediate publication;
7. each allowed image format plus MIME spoof, unsupported type, oversize, invalid dimensions, and corrupt image;
8. upload failure creates no library record;
9. record-create failure invokes upload compensation; compensation failure is logged for orphan cleanup;
10. tag normalization, count/length/type limits, and marker empty/valid/range/precision/multiple-marker cases;
11. patch allowlist, empty patch, activation, deactivation, and immutable image/alt text;
12. delete returns `204`, removes only the scoped record, retains shared uploads, and queues unreferenced cleanup;
13. generic content-type CRUD and generic authenticated upload are forbidden;
14. drafts and inactive records are absent from scheduler/render payloads;
15. legacy null/default parsing and malformed marker fallback do not break rendering.

## Current implementation gaps

The current schema leaves `imageId`, `title`, `isActive`, `AssetType`, `tags`, and `markerPosition` optional and permits non-image media. The current account read mapper can emit a partial image object. The scheduler relation population does not explicitly filter inactive records or drafts. These must be changed before this document can be marked implemented.
