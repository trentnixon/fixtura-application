# Handoff — Phase 5: `GET /accounts/:accountId/scheduler`

**Phase:** 5  
**Date:** 2026-04-06  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §12](../account-admin-api-contract.md#12-scheduler--get-accountsaccountidscheduler-phase-5), [phase-05-accounts-scheduler.md](../phase-05-accounts-scheduler.md), implementation: [`src/api/account/controllers/services/getAccountSchedulerPayload/index.js`](../../../../src/api/account/controllers/services/getAccountSchedulerPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 5 adds a **read-only** scheduler endpoint so the admin app can load **scheduler configuration**, **queue/rendering flags** (`Queued`, `isRendering`), and the linked **`days_of_the_week`** record **without** calling the legacy hub or loading the full **renders** list. Account-level **`isUpdating`** remains on **`GET /accounts/:accountId/settings`** only (contract §12.3).

---

## Endpoints

| Method | Path (suffix)                    | Purpose                                                  |
| ------ | -------------------------------- | -------------------------------------------------------- |
| GET    | `/accounts/:accountId/scheduler` | Sanitized scheduler document for the authenticated owner |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/scheduler` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountScheduler`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountScheduler** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/accounts/319/scheduler HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { ... } }` per Strapi convention.
- **`data.id`:** Account id (matches path).
- **`data.scheduler`:** `null` if the account has no linked scheduler; otherwise a **Content API–sanitized** `scheduler` object (Strapi `api::scheduler.scheduler`) including populated **`days_of_the_week`** when configured. Core scalar fields include **`Name`**, **`Time`**, **`Queued`**, **`isRendering`**, plus timestamps as exposed by the sanitizer.

**Stable for v1:** `id`, `scheduler` presence/shape per §12. **Not included:** `isUpdating` (use settings), `renders` array, `render_token`, hub rollups.

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "scheduler": {
      "id": 12,
      "Name": "Weekly",
      "Time": "06:00:00.000",
      "Queued": false,
      "isRendering": false,
      "days_of_the_week": {
        "id": 3,
        "Name": "Monday"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  }
}
```

Example when no scheduler is linked:

```json
{
  "data": {
    "id": 319,
    "scheduler": null
  }
}
```

---

## Errors

| Situation                                    | HTTP status | Notes                            |
| -------------------------------------------- | ----------- | -------------------------------- |
| Not authenticated                            | 401         | Missing/invalid JWT              |
| Role lacks `getAccountScheduler`             | 403         | Valid JWT                        |
| Invalid `accountId` (not a positive integer) | 400         |                                  |
| Wrong owner or unknown account               | 404         | “Account not found”              |
| Server error                                 | 500         | Generic message; details in logs |

---

## Migration from legacy hub

- **Previously:** Scheduler data was part of **`GET /account/organisation/:accountId`** (`fixturaContentHub`), together with **all renders** and other aggregates.
- **Now:** Use **`GET /accounts/:accountId/scheduler`** for scheduler config and flags; **do not** rely on this route for render history — that remains **Phase 7** (`/accounts/:accountId/renders`) or the hub until migrated.
- **Hub difference:** The hub still loads the full **renders** list for rollup metrics; this endpoint **never** loads renders as a side effect.

---

## Caching and freshness

- No `ETag` / `Cache-Control` contract in v1 (Phase 0 §6). Treat as private account data; short TTL or no-store on the client if needed.

---

## Open questions / follow-ups

- Optional read-only hints (e.g. “has a render today”) are **not** in v1; add only with a contract bump if product requires them.

---

## Links

- Phase plan: [`../phase-05-accounts-scheduler.md`](../phase-05-accounts-scheduler.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
