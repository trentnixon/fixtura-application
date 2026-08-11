# App: Account sponsors — `GET /api/accounts/:accountId/sponsors`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-04-07  
**Purpose:** Load published sponsors for an account (slim DTOs, with logo media and sponsorship allocations) without Strapi audit fields.

---

## Flow

1. **`GET /api/account/me`** — Bootstrap (user + account list).
2. **`GET /api/accounts/:accountId/sponsors`** — Sponsors for the selected account.

Ownership matches other account-scoped routes (`account.user` = JWT user).

---

## Endpoint

| Property       | Value                                            |
| -------------- | ------------------------------------------------ |
| **Method**     | `GET`                                            |
| **Path**       | `/api/accounts/:accountId/sponsors`              |
| **Path param** | `accountId` — positive integer Strapi account id |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`      |

**Users-permissions:** Enable **Authenticated** → Account → **`getAccountSponsors`**.  
**Reference scope:** `api::account.account.getAccountSponsors`

---

## Success response (HTTP 200)

Envelope: `{ "data": { "items": SponsorDto[] } }`.

Each **SponsorDto** includes:

- **`id`**, **`name`**, **`url`**, **`startDate`**, **`endDate`**, **`isActive`**, **`isPrimary`**, **`tagline`**, **`order`**, **`description`**, **`isVideo`**, **`isArticle`**
- **`logo`:** `null` or `{ id, url, width, height, mime, alternativeText }`
- **`sponsorshipAllocations`:** `{ id, allocation }[]` where **`allocation`** is the JSON from Strapi `Allocation` (may be `null`)

Only **published** sponsors are returned; drafts are admin-only.

---

## Error responses

| HTTP    | When                                          |
| ------- | --------------------------------------------- |
| **400** | `accountId` invalid                           |
| **401** | No or invalid JWT                             |
| **403** | Valid JWT but role lacks `getAccountSponsors` |
| **404** | Account not found or not owned                |
| **500** | Server error                                  |

---

## Backend reference

| Item    | Location                                                                  |
| ------- | ------------------------------------------------------------------------- |
| Route   | `src/api/account/routes/custom-account.js`                                |
| Handler | `src/api/account/controllers/account.js` → `getAccountSponsors`           |
| Payload | `src/api/account/controllers/services/getAccountSponsorsPayload/index.js` |
