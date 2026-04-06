# Handoff — Phase 8: `GET /accounts/:accountId/renders/:renderId` (render detail)

**Phase:** 8  
**Date:** 2026-04-06  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §15](../account-admin-api-contract.md#15-render-detail--get-accountsaccountidrendersrenderid-phase-8), [phase-08-accounts-render-detail.md](../phase-08-accounts-render-detail.md), implementation: [`src/api/account/controllers/services/getAccountRenderDetailPayload/index.js`](../../../../src/api/account/controllers/services/getAccountRenderDetailPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 8 adds a **single-render detail** endpoint for the job detail view. It returns render scalars, the same **derived `status`** as the Phase 7 list, **hub-style relation counts**, ISO timestamps, and a **light `downloads`** array (id, Name, URL, grouping_category) for asset links. Access is **account-scoped** via path `accountId` and ownership; the render must belong to the account’s **scheduler** (`render.scheduler`).

---

## Endpoints

| Method | Path (suffix)                            | Purpose                                                      |
| ------ | ---------------------------------------- | ------------------------------------------------------------ |
| GET    | `/accounts/:accountId/renders/:renderId` | Full detail for one render owned via the account’s scheduler |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/renders/1001` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Render ID:** Path parameter **`renderId`** (positive integer).
- **Access rule:** User must **own** the account (`account.user` = JWT user id). The render must exist and **`scheduler`** must equal the account’s linked scheduler. Unknown or non-owned account → **404** “Account not found”. Missing render, no scheduler on account, or render under another scheduler → **404** “Render not found” (no cross-account enumeration). Strapi permission: **`api::account.account.getAccountRenderDetail`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountRenderDetail** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

No query parameters in v1.

Example:

```http
GET /api/accounts/319/renders/1001 HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { "id", "render" } }`.
- **`data.id`:** Account id (matches path `accountId`).
- **`data.render`:** Single object:
  - **List-aligned:** `id`, `Name`, `createdAt` (ISO), `Processing`, `Complete`, `status` (`complete` | `processing` | `pending` — same rules as Phase 7).
  - **Scalars:** `sendEmail`, `hasTeamRosterRequest`, `hasTeamRosters`, `hasTeamRosterEmail`, `isCreatingRoster`, `rerenderRequested`, `EmailSent`, `forceRerender`, `forceRerenderEmail`, plus `updatedAt`.
  - **Counts:** `game_results_in_renders_count`, `upcoming_games_in_renders_count`, `grades_in_renders_count`, `downloads_count`, `ai_articles_count`.
  - **`downloads`:** Array ordered by `id` ascending; each item: `id`, `Name`, `URL`, `grouping_category` (or `null`).

**Stable v1:** Field names above for the detail screen; nested game/grade/AI rows are **not** included (counts only).

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "render": {
      "id": 1001,
      "Name": "Weekly run",
      "createdAt": "2026-04-01T06:00:00.000Z",
      "updatedAt": "2026-04-01T06:05:00.000Z",
      "Processing": false,
      "Complete": true,
      "status": "complete",
      "sendEmail": true,
      "hasTeamRosterRequest": false,
      "hasTeamRosters": true,
      "hasTeamRosterEmail": false,
      "isCreatingRoster": false,
      "rerenderRequested": false,
      "EmailSent": true,
      "forceRerender": false,
      "forceRerenderEmail": false,
      "game_results_in_renders_count": 12,
      "upcoming_games_in_renders_count": 3,
      "grades_in_renders_count": 2,
      "downloads_count": 8,
      "ai_articles_count": 0,
      "downloads": [
        {
          "id": 501,
          "Name": "Highlight reel",
          "URL": "https://…",
          "grouping_category": null
        }
      ]
    }
  }
}
```

---

## Errors

| Situation                                                                  | HTTP status | Notes                            |
| -------------------------------------------------------------------------- | ----------- | -------------------------------- |
| Not authenticated                                                          | 401         | Missing/invalid JWT              |
| Role lacks `getAccountRenderDetail`                                        | 403         | Valid JWT                        |
| Invalid `accountId` (not a positive integer)                               | 400         | “Invalid account id”             |
| Invalid `renderId` (not a positive integer)                                | 400         | “Invalid render id”              |
| Wrong owner or unknown account                                             | 404         | “Account not found”              |
| No scheduler, unknown render, or render not under this account’s scheduler | 404         | “Render not found”               |
| Server error                                                               | 500         | Generic message; details in logs |

---

## Migration from legacy hub

- **Previously:** Per-render summaries with counts came from **`GET /account/organisation/:accountId`** (`RenderService.getRendersDetails`) inside the full hub payload, with **formatted** date strings (`created`, `time`).
- **Now:** Use **`GET /accounts/:accountId/renders/:renderId`** for the detail screen. **`createdAt`** is **ISO** (align with Phase 7 list). Use **`downloads`** for file links instead of inferring from hub-only fields.
- **Hub:** Still available; the detail page does **not** require loading the hub or the full **`renders[]`** array.

---

## Caching and freshness

- No `ETag` / `Cache-Control` contract in v1 (Phase 0 §6). Treat as private account data.

---

## Open questions / follow-ups

- If **`downloads`** arrays become very large for some accounts, consider a cap + `meta` in a future revision (not in v1).

---

## Links

- Phase plan: [`../phase-08-accounts-render-detail.md`](../phase-08-accounts-render-detail.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
