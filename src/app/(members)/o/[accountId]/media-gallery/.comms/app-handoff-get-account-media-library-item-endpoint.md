# App: Account media library item — `GET /api/accounts/:accountId/media-library/:mediaId`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-04-07  
**Purpose:** Load one published gallery / media-library row by Strapi id for the selected account.

---

## Flow

1. **`GET /api/account/me`** — Bootstrap (user + account list).
2. **`GET /api/accounts/:accountId/media-library/:mediaId`** — Single item (same permission as the list endpoint).

Ownership matches other account-scoped routes (`account.user` = JWT user).

For loading all items, see [app-handoff-get-account-media-library-endpoint.md](./app-handoff-get-account-media-library-endpoint.md).

---

## Endpoint

| Property        | Value                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Method**      | `GET`                                                                                                               |
| **Path**        | `/api/accounts/:accountId/media-library/:mediaId`                                                                   |
| **Path params** | `accountId` — positive integer Strapi account id; `mediaId` — positive integer id of an `account-media-library` row |
| **Auth**        | **Required.** `Authorization: Bearer <jwt>`                                                                         |

**Users-permissions:** Enable **Authenticated** → Account → **`getAccountMediaLibrary`** (same scope as the list route).  
**Reference scope:** `api::account.account.getAccountMediaLibrary`

---

## Success response (HTTP 200)

Envelope: `{ "data": { ... } }` — one item object.

| Field            | Type            | Notes                                               |
| ---------------- | --------------- | --------------------------------------------------- |
| `id`             | number          | Strapi id                                           |
| `title`          | string \| null  |                                                     |
| `isActive`       | boolean \| null |                                                     |
| `tags`           | JSON \| null    |                                                     |
| `ageGroup`       | string \| null  | `Seniors`, `Juniors`, or `Both`                     |
| `assetType`      | string \| null  | e.g. `ALL`, `Upcoming Fixtures`, …                  |
| `markerPosition` | JSON \| null    |                                                     |
| `image`          | object \| null  | `{ id, url, width, height, mime, alternativeText }` |

Only **published** entries are returned (`publishedAt` set). If the row is a draft, the API responds with **404**.

The item must belong to `accountId`; otherwise **404** (`Media item not found`).

---

## Error responses

| HTTP    | When                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------- |
| **400** | `accountId` or `mediaId` invalid                                                               |
| **401** | No or invalid JWT                                                                              |
| **403** | Valid JWT but role lacks `getAccountMediaLibrary`                                              |
| **404** | Account not found or not owned; or media id not found for this account; or unpublished (draft) |
| **500** | Server error                                                                                   |

---

## Backend reference

| Item    | Location                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------ |
| Route   | `src/api/account/routes/custom-account.js`                                                       |
| Handler | `src/api/account/controllers/account.js` → `getAccountMediaLibraryItem`                          |
| Payload | `src/api/account/controllers/services/getAccountMediaLibraryPayload/index.js` → `loadOneForUser` |
