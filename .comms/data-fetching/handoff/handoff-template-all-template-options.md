# Handoff — Templating: `GET /template-categories/all-template-options`

**Canonical API spec (request/response/errors, TypeScript types):** [`.comms/API/handoff-all-template-options.md`](../../API/handoff-all-template-options.md). Prefer that document for integration; this file retains narrative context from the original CMS handoff.

**Date:** 2026-04-06
**Author:** Backend (Fixtura CMS)
**Implementation:** [`src/api/template-category/controllers/services/getAllTemplateOptions/index.js`](../../../../src/api/template-category/controllers/services/getAllTemplateOptions/index.js), route [`custom-template-category.js`](../../../../src/api/template-category/routes/custom-template-category.js), controller [`template-category.js`](../../../../src/api/template-category/controllers/template-category.js)

**Audience:** Fixtura application / frontend developers

---

## Summary

This endpoint returns a **single payload** for building **template / branding pickers** in the client: all **published** catalog rows for template modes, palettes, gradients, images, noises, particles, patterns, textures, videos, and **non-private** template categories (with nested bundle audio + audio options). Optionally, it returns the **current saved** `template-option` row for the account when the client passes **`templateOptionId`**.

Saving user choices remains the existing **PUT** on template-option (see below). This GET is **read-only** and scoped by **account ownership**.

---

## Endpoints

| Method | Path (suffix)                               | Purpose                                                 |
| ------ | ------------------------------------------- | ------------------------------------------------------- |
| GET    | `/template-categories/all-template-options` | Load full template catalog + optional current selection |

| Method | Path (suffix)                                      | Purpose (existing)                 |
| ------ | -------------------------------------------------- | ---------------------------------- |
| PUT    | `/template-option/put-template-options/:accountId` | Persist flattened template choices |

Full URL example:

`GET {CMS_BASE_URL}/api/template-categories/all-template-options?accountId=319&templateOptionId=42`

(Use your Strapi API prefix if not `/api`.)

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Query:** **`accountId`** (required, positive integer). The JWT user must **own** that account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration).
- **Permission:** **`api::template-category.template-category.getAllTemplateOptions`** (403 if the role lacks this action).

**Post-deploy:** Enable **Template-category → getAllTemplateOptions** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Template-category).

---

## Request details

**Query parameters**

| Param              | Required | Meaning                                                                                                                               |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `accountId`        | Yes      | Account to scope access and to validate `templateOptionId` when provided.                                                             |
| `templateOptionId` | No       | If set, load that saved `template-option` as `data.currentSelection`. Must belong to the same `accountId` or the API returns **403**. |

**Invalid `templateOptionId`** (non-numeric, etc.) → **400**.

Example:

```http
GET /api/template-categories/all-template-options?accountId=319 HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

With current selection:

```http
GET /api/template-categories/all-template-options?accountId=319&templateOptionId=42 HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Where to get `templateOptionId`

Each account in **`GET /api/account/me`** now includes **`templateOptionId`** (nullable if no saved `template-option` yet). Use that value when calling this endpoint with `templateOptionId` to hydrate the form.

---

## Response shape

- **Envelope:** `{ "data": { ... } }` (Strapi-style).

**Top-level keys**

| Key                | Description                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `categories`       | Public categories only (`isPrivate === false`), each with `bundleAudio` (`id`, `name`, `audioOptions`).                                          |
| `modes`            | `id`, `name`, `slug`                                                                                                                             |
| `palettes`         | `id`, `name`, `value`                                                                                                                            |
| `gradients`        | `id`, `name`, `type`, `direction`                                                                                                                |
| `images`           | Image preset fields (animation, overlay, etc.)                                                                                                   |
| `noises`           | `id`, `name`, `noiseType`                                                                                                                        |
| `particles`        | Particle preset fields                                                                                                                           |
| `patterns`         | Pattern preset fields                                                                                                                            |
| `textures`         | `id`, `name`, `opacity`, `blendMode`, `texture` (minimal media: `url`, dimensions, `mime`, …)                                                    |
| `videos`           | Video preset fields (`position`, `size`, `loop`, `muted`, `offthread`, `volume`, `rate`, `overlay`)                                              |
| `currentSelection` | `null` if `templateOptionId` omitted or invalid id; otherwise nested objects for each linked relation (`templateCategory`, `templatePalette`, …) |

**Design notes**

- Catalog lists are **published-only** (`publicationState: live`). Categories with **`isPrivate: true`** are **excluded** from `categories`.
- `createdAt` / `updatedAt` / `publishedAt` are **not** returned in these DTOs.
- **`currentSelection`** is loaded from the database for the owning account (drafts are visible to the owner).

Example (truncated):

```json
{
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Example",
        "slug": "example",
        "divideFixturesBy": null,
        "isPrivate": false,
        "bundleAudio": {
          "id": 2,
          "name": "Bundle A",
          "audioOptions": [
            {
              "id": 3,
              "name": "Track",
              "url": "https://...",
              "compositionId": "CricketUpcoming",
              "componentName": "CricketUpcoming"
            }
          ]
        }
      }
    ],
    "modes": [],
    "palettes": [],
    "gradients": [],
    "images": [],
    "noises": [],
    "particles": [],
    "patterns": [],
    "textures": [],
    "videos": [],
    "currentSelection": null
  }
}
```

---

## HTTP status reference

| Status | When                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| 200    | Success                                                                            |
| 400    | Missing/invalid `accountId`, or invalid `templateOptionId`                         |
| 401    | No JWT                                                                             |
| 403    | Valid JWT but missing permission, or `templateOptionId` belongs to another account |
| 404    | Account not found / not owned, or `templateOptionId` not found                     |

---

## Related

- **Save:** `PUT /api/template-option/put-template-options/:accountId` — body shape expected by the PUT handler is unchanged; use catalog `id` values from this GET when building saves.
- **Branding (narrower):** `GET /api/accounts/:accountId/branding` — still available for template/theme/branding screen; this new endpoint is optimized for **full picker catalogs** and optional `template-option` hydration.

---

## Open questions

- **Private categories:** Only non-private categories appear in `categories`. If the product later needs admins to see private rows, that will require a backend change or role-based branching.
