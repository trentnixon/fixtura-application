# Handoff — Phase 4: `GET /accounts/:accountId/organisation`

**Phase:** 4  
**Date:** 2026-04-06  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §11](../account-admin-api-contract.md#11-organisation--get-accountsaccountidorganisation-phase-4), [phase-04-accounts-organisation.md](../phase-04-accounts-organisation.md), implementation: [`src/api/account/controllers/services/getAccountOrganisationPayload/index.js`](../../../../src/api/account/controllers/services/getAccountOrganisationPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 4 adds a **read-only** organisation context endpoint so the admin app can load linked **club or association** display data (name, logo, href, sport, etc.) **without** calling the full legacy hub (`GET /account/organisation/:accountId`). Resolution matches bootstrap and hub: **first linked** club if `account_type` is club (`id === 1`), otherwise **first linked** association. **`GET /account/me`** still exposes the same DTO shape per account for the switcher; this route is the **canonical page fetch** for organisation context when you already know `accountId`.

---

## Endpoints

| Method | Path (suffix)                       | Purpose                                                                |
| ------ | ----------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/accounts/:accountId/organisation` | Organisation summary (club or association) for the authenticated owner |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/organisation` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountOrganisation`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountOrganisation** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/accounts/319/organisation HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { ... } }` per Strapi convention.
- **Stable for v1:** `id`, `account_type`, `accountOrganisationDetails` (nullable object).
- **May evolve:** Extra fields on the organisation DTO if product extends club/association (contract bump).

| Field                        | Type           | Notes                                                                     |
| ---------------------------- | -------------- | ------------------------------------------------------------------------- |
| `id`                         | number         | Account id (matches path)                                                 |
| `account_type`               | number \| null | Related `account-type` id                                                 |
| `accountOrganisationDetails` | object \| null | Club or association summary; `null` if none linked on the expected branch |

**Club DTO** (`account_type` branch for type id `1`): `id`, `Name`, `href`, `ParentLogo`, `Sport` (same as bootstrap/hub).

**Association DTO** (non-club branch): `id`, `Name`, `PlayHQID`, `ParentLogo`, `href`, `Sport`.

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "account_type": 1,
    "accountOrganisationDetails": {
      "id": 42,
      "Name": "Example Club",
      "href": "https://example.com/club",
      "ParentLogo": "https://…",
      "Sport": "Cricket"
    }
  }
}
```

When the account is owned but no club/association exists on the resolved branch, `accountOrganisationDetails` is **`null`** and the status remains **200**.

---

## Errors

| Situation                                    | HTTP status | Notes                                             |
| -------------------------------------------- | ----------- | ------------------------------------------------- |
| Not authenticated                            | 401         | Missing/invalid JWT                               |
| Role lacks permission                        | 403         | Enable `getAccountOrganisation` for Authenticated |
| Invalid `accountId` (not a positive integer) | 400         |                                                   |
| User does not own account (or no row)        | 404         | “Account not found”                               |
| Server error                                 | 500         | Generic message; details in logs                  |

---

## Migration from legacy hub

- **Previously:** Organisation block for UI often came from **`GET /account/organisation/:accountId`**, which returns the **full** dashboard aggregate (`FixturaContentHubService`).
- **Now:** For **organisation summary only** (name, logo, href, sport fields above), call **`GET /accounts/:accountId/organisation`** instead of parsing the hub.
- **Still use the hub** when you need scheduler, renders list, `render_token`, template/theme strings, or other domains not on this route (until those phases replace them).

---

## Caching and freshness

- **v1:** No reliance on ETag; treat as private account data. Optional `Cache-Control: private, no-store` on clients if desired.

---

## Open questions / follow-ups

- If club accounts need both **identifier association** and **club** exposed explicitly in one response, that would be a **contract extension** (not v1); bootstrap remains first-link-only.

---

## Links

- Phase plan: [`../phase-04-accounts-organisation.md`](../phase-04-accounts-organisation.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
