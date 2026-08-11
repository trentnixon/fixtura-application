# App: Account media library — `GET /api/accounts/:accountId/media-library`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-04-07  
**Purpose:** Load all published gallery / media-library items for the selected account.

---

## Flow

1. **`GET /api/account/me`** — Bootstrap (user + account list).
2. **`GET /api/accounts/:accountId/media-library`** — Media items for the selected account.

Ownership matches other account-scoped routes (`account.user` = JWT user).

---

## Endpoint

| Property       | Value                                            |
| -------------- | ------------------------------------------------ |
| **Method**     | `GET`                                            |
| **Path**       | `/api/accounts/:accountId/media-library`         |
| **Path param** | `accountId` — positive integer Strapi account id |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`      |

**Users-permissions:** Enable **Authenticated** → Account → **`getAccountMediaLibrary`**.  
**Reference scope:** `api::account.account.getAccountMediaLibrary`

---

## Success response (HTTP 200)

Envelope: `{ "data": { "items": [ ... ] } }`.

Each item:

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

Only **published** entries are returned (`publishedAt` set). Drafts are not included.

Ordering: **`updatedAt` descending** (newest first).

---

## Error responses

| HTTP    | When                                              |
| ------- | ------------------------------------------------- |
| **400** | `accountId` invalid                               |
| **401** | No or invalid JWT                                 |
| **403** | Valid JWT but role lacks `getAccountMediaLibrary` |
| **404** | Account not found or not owned                    |
| **500** | Server error                                      |

---

## Backend reference

| Item    | Location                                                                      |
| ------- | ----------------------------------------------------------------------------- |
| Route   | `src/api/account/routes/custom-account.js`                                    |
| Handler | `src/api/account/controllers/account.js` → `getAccountMediaLibrary`           |
| Payload | `src/api/account/controllers/services/getAccountMediaLibraryPayload/index.js` |
