# Handoff — Phase 0: Contract, transport, and errors

**Phase:** 0  
**Date:** 2026-04-05  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md](../account-admin-api-contract.md)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 0 did **not** ship new HTTP handlers; it produced a **single normative contract** so every later phase (bootstrap, settings, branding, organisation, scheduler, render token, renders list/detail, analytics) implements the same **JWT + path `accountId`**, **ownership checks**, **404 for wrong account**, and **pagination / analytics parameter** rules. This removes ad hoc questions during parallel frontend and backend work.

---

## Endpoints

No new routes in Phase 0. Future account-scoped endpoints will follow the paths below (after the API prefix, e.g. `/api`).

| Method | Path (suffix)                             | Purpose                                                     |
| ------ | ----------------------------------------- | ----------------------------------------------------------- |
| GET    | `/account/me`                             | Bootstrap: user + account list + light summaries (existing) |
| GET    | `/accounts/:accountId/settings`           | Phase 2                                                     |
| GET    | `/accounts/:accountId/branding`           | Phase 3                                                     |
| GET    | `/accounts/:accountId/organisation`       | Phase 4                                                     |
| GET    | `/accounts/:accountId/scheduler`          | Phase 5                                                     |
| GET    | `/accounts/:accountId/render-token`       | Phase 6                                                     |
| GET    | `/accounts/:accountId/renders`            | Phase 7 (paginated)                                         |
| GET    | `/accounts/:accountId/renders/:renderId`  | Phase 8                                                     |
| GET    | `/accounts/:accountId/analytics/overview` | Phase 9                                                     |
| GET    | `/account/organisation/:accountId`        | **Legacy hub** (retained; heavy aggregate)                  |

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (same as existing Strapi authenticated routes).
- **Account ID:** **Path only** for new `/accounts/:accountId/...` APIs — positive integer Strapi account id. Bootstrap stays on **`GET /account/me`** without path `accountId`.
- **Access rule:** User must **own** the account (`account.user` = JWT user id), using the same idea as `validateAccountOwnership` / current hub behaviour. Non-owner membership is **out of scope** until product changes the matrix.

---

## Request details

- **Query params:** None for Phase 0 itself. Phase 7 will add `page`, `pageSize`, and filters per contract. Phase 9 will add `from` / `to` per contract.
- **Example (illustrative, route not implemented until later phases):**

```http
GET /api/accounts/319/settings HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

Phase 0 does not define response bodies for new routes; those are fixed in Phases 2–9 handoffs. **Success** responses remain JSON with conventional wrapping as each handler defines (typically `{ data: ... }` where already established).

---

## Errors

| Situation                                               | HTTP status | Notes                                                                             |
| ------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| Not authenticated                                       | **401**     | Missing/invalid JWT.                                                              |
| Valid JWT, role missing permission for action           | **403**     | Strapi users-permissions scope.                                                   |
| Invalid `accountId` (not positive integer)              | **400**     | Bad request.                                                                      |
| Valid JWT, user does **not** own account (or no access) | **404**     | **“Account not found”** — same as legacy hub; do not distinguish from unknown id. |
| Sub-resource not found (with valid account access)      | **404**     | Per-endpoint in later phases.                                                     |
| Server error                                            | **500**     | Generic client message.                                                           |

**Error body:** Prefer Strapi default JSON error shape for new routes.

---

## Migration from legacy hub

- The app may still use **`GET /account/organisation/:accountId`** for the full dashboard until feature-specific endpoints exist.
- Phase 0 only locks **transport and failure semantics** for **new** `/accounts/:accountId/...` routes so migration can proceed screen-by-screen using [account-admin-api-contract.md](../account-admin-api-contract.md) §7 map.
- Do not expect new behaviour on `GET /account/me` from Phase 0; Phase 1 covers bootstrap contract.

---

## Caching and freshness

- **v1:** No requirement for `ETag` / `Cache-Control`; safe default is **private, no-store** for sensitive account data unless product approves.
- **Deferred:** conditional GET / analytics revalidation — see contract §6.

---

## Open questions / follow-ups

- **Team / non-owner account access:** If introduced, update [account-admin-api-contract.md](../account-admin-api-contract.md) §2 and §3 before implementing.
- **Phase 9 default window:** Exact default `from`/`to` when params omitted — finalize in Phase 9 implementation + handoff (contract allows last-30-days-style defaults).
- **Timezone for analytics:** UTC unless Phase 9 specifies per-account timezone.

---

## Links

- Phase plan: [phase-00-contract-transport-and-errors.md](../phase-00-contract-transport-and-errors.md)
- Contract: [account-admin-api-contract.md](../account-admin-api-contract.md)
- Research brief: [Fixtura-account-data-research-brief-v2.md](../../Fixtura-account-data-research-brief-v2.md)
- Phase checklist: [PHASE-CHECKLIST.md](../PHASE-CHECKLIST.md)
