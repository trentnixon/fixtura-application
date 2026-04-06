# Handoff — Phase 6: `GET /accounts/:accountId/render-token`

**Phase:** 6  
**Date:** 2026-04-06  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §13](../account-admin-api-contract.md#13-render-token--get-accountsaccountidrender-token-phase-6), [phase-06-accounts-render-token.md](../phase-06-accounts-render-token.md), implementation: [`src/api/account/controllers/services/getAccountRenderTokenPayload/index.js`](../../../../src/api/account/controllers/services/getAccountRenderTokenPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 6 adds a **dedicated, authenticated** endpoint that returns the account’s **render token** (and metadata from the same sanitized document) **only when the client explicitly requests it**. This keeps **`render_token` off** `GET /account/me` and other light endpoints (contract §9.2). Responses use the **same Content API sanitizer** as the legacy hub’s `render_token` field. Success responses set **`Cache-Control: private, no-store`**.

---

## Endpoints

| Method | Path (suffix)                       | Purpose                                                                                |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------- |
| GET    | `/accounts/:accountId/render-token` | Sanitized render-token document for the authenticated owner (or `null` if none linked) |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/render-token` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountRenderToken`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountRenderToken** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/accounts/319/render-token HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { ... } }` per Strapi convention.
- **`data.id`:** Account id (matches path).
- **`data.render_token`:** `null` if the account has no linked render-token row; otherwise a **Content API–sanitized** `render-token` object (`api::render-token.render-token`), same shape as **`render_token`** on **`GET /account/organisation/:accountId`** (legacy hub). Typically includes **`id`**, **`token`**, **`expiration`**, plus fields the sanitizer exposes.

**Stable for v1:** `id`, `render_token` presence; core token fields per §13. **Does not include:** scheduler, renders, organisation, settings, branding.

**Security:** Treat **`token`** as a secret — do not log responses, store in analytics, or echo in error UIs.

Example (sanitised — token value is illustrative):

```json
{
  "data": {
    "id": 319,
    "render_token": {
      "id": 42,
      "token": "<REDACTED>",
      "expiration": "2026-12-31T23:59:59.000Z"
    }
  }
}
```

Example when no render-token is linked:

```json
{
  "data": {
    "id": 319,
    "render_token": null
  }
}
```

---

## Errors

| Situation                                    | HTTP status | Notes                                                     |
| -------------------------------------------- | ----------- | --------------------------------------------------------- |
| Not authenticated                            | 401         | Missing/invalid JWT                                       |
| Role lacks `getAccountRenderToken`           | 403         | Valid JWT                                                 |
| Invalid `accountId` (not a positive integer) | 400         |                                                           |
| Wrong owner or unknown account               | 404         | “Account not found”                                       |
| Server error                                 | 500         | Generic message; details in logs (must not include token) |

---

## Migration from legacy hub

- **Previously:** `render_token` was available inside **`GET /account/organisation/:accountId`** (`fixturaContentHub`) with the full hub aggregate.
- **Now:** Call **`GET /accounts/:accountId/render-token`** when the UI needs the credential without loading the hub. The **sanitized object matches** the hub’s `render_token` field (same `TokenService` path).
- **Bootstrap:** **`GET /account/me`** must **not** include `render_token` — use this endpoint (contract §9.2, §13.4).

---

## Caching and freshness

- Success responses include **`Cache-Control: private, no-store`** (contract §13.3). Do not override with public caching on the client for this payload.

---

## Open questions / follow-ups

- Token **rotation** and mutating flows remain out of scope for this phase (see phase plan).
- **Audit logging** of access events (without logging the token) is a product/ops decision if required later.

---

## Links

- Phase plan: [`../phase-06-accounts-render-token.md`](../phase-06-accounts-render-token.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
