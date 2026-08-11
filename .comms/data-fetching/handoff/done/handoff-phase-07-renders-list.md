# Handoff — Phase 7: `GET /accounts/:accountId/renders` (list)

**Phase:** 7  
**Date:** 2026-04-06  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §14](../account-admin-api-contract.md#14-renders-list--get-accountsaccountidrenders-phase-7), [phase-07-accounts-renders-list.md](../phase-07-accounts-renders-list.md), implementation: [`src/api/account/controllers/services/getAccountRendersListPayload/index.js`](../../../../src/api/account/controllers/services/getAccountRendersListPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 7 adds a **paginated, filterable** renders **list** endpoint with **light rows** (ids, name, timestamps, processing/complete flags, derived `status`). Renders are scoped via the account’s **scheduler** (`render.scheduler`). The implementation uses **one `findMany` + one `count` per request** and does **not** load per-render relation counts (unlike the legacy hub’s `RenderService`).

---

## Endpoints

| Method | Path (suffix)                  | Purpose                                              |
| ------ | ------------------------------ | ---------------------------------------------------- |
| GET    | `/accounts/:accountId/renders` | Paginated render history for the authenticated owner |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/renders?page=1&pageSize=25` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountRenders`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountRenders** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

**Query parameters**

| Param      | Meaning                     | Default | Notes                                                                                        |
| ---------- | --------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `page`     | 1-based page index          | `1`     | Invalid or `<1` → **400**                                                                    |
| `pageSize` | Items per page              | `25`    | Max `100`; invalid → **400**                                                                 |
| `from`     | Range start for `createdAt` | —       | ISO 8601; optional; invalid → **400**                                                        |
| `to`       | Range end for `createdAt`   | —       | ISO 8601; optional; invalid → **400**                                                        |
| `status`   | Filter by derived status    | —       | Comma-separated: `processing`, `complete`, `pending` (OR semantics). Invalid token → **400** |

**Sort:** `createdAt` **desc** (newest first); not configurable in v1.

**Empty scheduler:** If the account has no linked scheduler, the response is **200** with `renders: []` and `total: 0`.

Example:

```http
GET /api/accounts/319/renders?page=1&pageSize=25&from=2026-01-01T00:00:00.000Z&status=complete,pending HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { "id", "renders", "meta" } }`.
- **`data.id`:** Account id (matches path).
- **`data.renders`:** Array of light rows (current page only).
- **`data.meta.pagination`:** `page`, `pageSize`, `pageCount`, `total` (total matching rows before pagination).

**Per-row fields (stable v1):** `id`, `Name`, `createdAt`, `Processing`, `Complete`, `status` (`complete` | `processing` | `pending`).

**Not included:** Hub-style `*_count` fields, formatted date strings, relations — use Phase 8 detail or legacy hub when needed.

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "renders": [
      {
        "id": 1001,
        "Name": "Weekly run",
        "createdAt": "2026-04-01T06:00:00.000Z",
        "Processing": false,
        "Complete": true,
        "status": "complete"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 25,
        "pageCount": 3,
        "total": 52
      }
    }
  }
}
```

---

## Errors

| Situation                                    | HTTP status | Notes                            |
| -------------------------------------------- | ----------- | -------------------------------- |
| Not authenticated                            | 401         | Missing/invalid JWT              |
| Role lacks `getAccountRenders`               | 403         | Valid JWT                        |
| Invalid `accountId` (not a positive integer) | 400         |                                  |
| Invalid `page` / `pageSize`                  | 400         |                                  |
| Invalid `from` / `to`                        | 400         |                                  |
| Invalid `status` token                       | 400         |                                  |
| Wrong owner or unknown account               | 404         | “Account not found”              |
| Server error                                 | 500         | Generic message; details in logs |

---

## Migration from legacy hub

- **Previously:** Render rows (with counts) came from **`GET /account/organisation/:accountId`** via `FixturaContentHubService` / `RenderService.getRendersDetails` (loads **all** renders for the scheduler and runs **multiple count queries per render**).
- **Now:** Use **`GET /accounts/:accountId/renders`** for the **table / history list** with pagination and filters. Do **not** expect `game_results_in_renders_count`, `downloads_count`, etc., on this endpoint.
- **Hub:** Still available for full aggregate until migrated; avoid using hub renders for large-account list views — use this endpoint.

---

## Caching and freshness

- No `ETag` / `Cache-Control` contract in v1 (Phase 0 §6). Treat as private account data.

---

## Open questions / follow-ups

- Single-render detail: see [`handoff-phase-08-accounts-render-detail.md`](./handoff-phase-08-accounts-render-detail.md).
- Phase 9: analytics — not derived from this list in v1.

---

## Links

- Phase plan: [`../phase-07-accounts-renders-list.md`](../phase-07-accounts-renders-list.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
