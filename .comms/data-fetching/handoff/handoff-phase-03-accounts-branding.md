# Handoff — Phase 3: `GET /accounts/:accountId/branding`

**Phase:** 3  
**Date:** 2026-04-05  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §10](../account-admin-api-contract.md#10-branding--get-accountsaccountidbranding-phase-3), [phase-03-accounts-branding.md](../phase-03-accounts-branding.md), implementation: [`src/api/account/controllers/services/getAccountBrandingPayload/index.js`](../../../../src/api/account/controllers/services/getAccountBrandingPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 3 adds a **read-only** branding endpoint so the admin app can load **template**, **theme**, and **template_option** (preview-grade configuration) **without** calling the monolithic organisation hub. The payload reuses the same destructors as the scheduler worker for template metadata and `template_option`, and adds **template id** plus **poster / gallery / video** media summaries for UI previews. **`hasCustomTemplate`** remains on **`GET /accounts/:accountId/settings`**; organisation logos stay for Phase 4.

---

## Endpoints

| Method | Path (suffix)                   | Purpose                                                           |
| ------ | ------------------------------- | ----------------------------------------------------------------- |
| GET    | `/accounts/:accountId/branding` | Template, theme, and template option for branding / preview flows |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/branding` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountBranding`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountBranding** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/accounts/319/branding HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { ... } }` per Strapi convention.
- **`data.id`:** Account id (matches path).
- **`data.template`:** `null` if no template linked; otherwise includes:
  - **`id`:** Strapi template id (use for caching).
  - Fields from the scheduler **`templateDestruct`** shape: **`name`**, **`frontEndName`**, **`requiresMedia`**, **`variation`**, **`category`**, **`templateVariation`**, **`divideFixturesBy`**, **`bundleAudio`** (nested audio options).
  - **`poster`**, **`video`:** Single media objects or `null` — each is `{ id, url, width, height, mime, alternativeText }` when present.
  - **`gallery`:** Array of the same media objects (may be empty).
- **`data.theme`:** `null` if no theme; otherwise **`{ id, name, theme }`** — **`name`** is the theme record label; **`theme`** is the JSON config (Strapi `Theme` field).
- **`data.template_option`:** `null` if none; otherwise matches **scheduler** **`templateOptionDestruct`** (palette, gradient, image/noise/particle/pattern/video, category slug, etc.) — same shape as render pipeline consumption.

**Stable for v1:** Top-level keys `id`, `template`, `theme`, `template_option`; nested keys follow the helpers above. Additional nullable fields may appear if the CMS schema grows.

**Does not include:** Settings flags (`hasCustomTemplate`, etc.); organisation branding; scheduler; renders; `render_token`.

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "template": {
      "id": 12,
      "name": "Basic",
      "frontEndName": "Basic Layout",
      "requiresMedia": false,
      "variation": null,
      "category": "Basic",
      "templateVariation": null,
      "divideFixturesBy": null,
      "bundleAudio": null,
      "poster": {
        "id": 1,
        "url": "/uploads/...",
        "width": 1200,
        "height": 630,
        "mime": "image/jpeg",
        "alternativeText": null
      },
      "gallery": [],
      "video": null
    },
    "theme": {
      "id": 7,
      "name": "Default",
      "theme": {}
    },
    "template_option": null
  }
}
```

---

## Errors

| Situation                                                                  | HTTP status | Notes                                   |
| -------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| Not authenticated                                                          | **401**     | Missing/invalid JWT                     |
| Valid JWT, role lacks `getAccountBranding`                                 | **403**     | Strapi users-permissions                |
| `accountId` missing or not a positive integer                              | **400**     | Invalid id                              |
| Valid JWT, valid id format, user does not own account (or account missing) | **404**     | “Account not found”                     |
| Server error                                                               | **500**     | Generic message; details in server logs |

---

## Migration from legacy hub

- **Previously:** `GET /account/organisation/:accountId` returned **`template`** and **`theme`** as **plain strings** only (`Name` / theme string from [`fixturaContentHub`](../../../../src/api/account/controllers/services/fixturaContentHub/index.js)); no **`template_option`**, no ids, no media URLs.
- **Now:** Use **`GET /accounts/:accountId/branding`** for branding and preview UIs. Use **`GET /accounts/:accountId/settings`** for **`hasCustomTemplate`** and other flags.
- **Stop** using the hub for template/theme/option preview data once the app is migrated; keep the hub only where other aggregates are still required.

---

## Caching and freshness

- **v1:** No reliance on `ETag` for correctness. Treat as **private, no-store** on the client unless product approves caching.

---

## Open questions / follow-ups

- **Write API:** PATCH/PUT for branding is out of scope; add when product defines validation and permissions.
- **Payload size:** `template_option` mirrors the full scheduler destruct; if clients need a slimmer summary later, negotiate a query flag in a new ticket.

---

## Links

- Phase plan: [phase-03-accounts-branding.md](../phase-03-accounts-branding.md)
- Contract: [account-admin-api-contract.md](../account-admin-api-contract.md) §10
- Research brief: [Fixtura-account-data-research-brief-v2.md](../../Fixtura-account-data-research-brief-v2.md)
- App reference: [`src/api/account/.comms/app-handoff-get-account-branding-endpoint.md`](../../../../src/api/account/.comms/app-handoff-get-account-branding-endpoint.md)
