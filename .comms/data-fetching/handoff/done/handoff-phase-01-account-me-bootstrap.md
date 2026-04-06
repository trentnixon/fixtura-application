# Handoff — Phase 1: `GET /account/me` (bootstrap)

**Phase:** 1  
**Date:** 2026-04-05  
**Author:** Backend (Fixtura CMS)  
**Backend reference:** [account-admin-api-contract.md §9](../account-admin-api-contract.md#9-bootstrap--get-accountme-phase-1), [phase-01-account-me-bootstrap.md](../phase-01-account-me-bootstrap.md)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 1 **normatively documents** the existing lightweight bootstrap endpoint `GET /account/me`. The handler already returns user context, the list of linked accounts with light per-account fields and `accountOrganisationDetails`, and **does not** embed scheduler state, render history, analytics, or `render_token`. No new HTTP routes were added. Consumers should rely on this call for **shell boot** (account switcher + header) and load heavier data from `GET /account/organisation/:accountId` (legacy hub) or future `/accounts/:accountId/*` endpoints per the route map.

---

## Endpoints

| Method | Path (suffix) | Purpose                                                                           |
| ------ | ------------- | --------------------------------------------------------------------------------- |
| GET    | `/account/me` | Authenticated bootstrap: `user`, `accountId`, `accounts[]` (light summaries only) |

Full URL example: `GET {CMS_BASE_URL}/api/account/me` (prepend your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** **Not** in the path for this route. Tenancy for account-scoped data uses **`/accounts/:accountId/...`** or legacy **`/account/organisation/:accountId`** on subsequent requests.
- **Access rule:** User must be authenticated. Accounts returned are only those where `account.user` = JWT user id. Strapi permission: **`api::account.account.loggedInAccount`** (403 if disabled for the role).

---

## Request details

- **Query params:** None.
- **Body:** None.

Example:

```http
GET /api/account/me HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { "accountId", "user", "accounts" } }` per Strapi convention.
- **Stable for v1:** Presence of `data`, `data.user`, `data.accounts`, `data.accountId`, per-account scalars, `account_type`, `accountOrganisationDetails` (nullable). Ordering of `accounts` ascending by account `id`.
- **May evolve:** Additional scalar fields on account rows if product needs them (must remain “light”; no hub domains).
- **Field-by-field detail (TypeScript names, examples):** [app-handoff-get-account-me-endpoint.md](../../../../src/api/account/.comms/app-handoff-get-account-me-endpoint.md)

Example (sanitised):

```json
{
  "data": {
    "accountId": 319,
    "user": {
      "id": 110,
      "username": "…",
      "email": "…",
      "confirmed": true,
      "blocked": false,
      "role": { "id": 1, "name": "Authenticated", "type": "authenticated" }
    },
    "accounts": [
      {
        "id": 319,
        "FirstName": "…",
        "LastName": null,
        "DeliveryAddress": "…",
        "isActive": true,
        "isSetup": true,
        "isRightsHolder": true,
        "isPermissionGiven": true,
        "group_assets_by": false,
        "include_junior_surnames": true,
        "isUpdating": false,
        "Sport": "Cricket",
        "account_type": 1,
        "accountOrganisationDetails": {
          "id": 31296,
          "Name": "…",
          "href": "https://…",
          "ParentLogo": "https://…",
          "Sport": "Cricket"
        }
      }
    ]
  }
}
```

---

## Errors

| Situation                                            | HTTP status | Notes                                                                                                                                                         |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not authenticated                                    | **401**     | Missing/invalid JWT (`loggedInAccount` handler).                                                                                                              |
| Valid JWT, role missing `loggedInAccount` permission | **403**     | Strapi users-permissions.                                                                                                                                     |
| Authenticated user has **no** linked account rows    | **404**     | Message such as “No account linked to this user” — **not** `200` with `accounts: []` in v1 (see contract §9.3 if product later wants onboarding empty-shell). |
| Server error                                         | **500**     | Generic message; details in logs.                                                                                                                             |

---

## Migration from legacy hub

- **Do not** expect `contentHub` or `extended` on `GET /account/me` (removed; see app handoff breaking-change note).
- **Heavy dashboard / operational aggregate** still comes from **`GET /account/organisation/:accountId`** until those concerns move to dedicated endpoints.
- **Stop** assuming a single mega-response for the admin shell; use `/me` for bootstrap only, then fetch per feature/route.

---

## Caching and freshness

- Per Phase 0 / contract §6: **no** reliance on ETag for correctness in v1; sensitive data may use `Cache-Control: private, no-store` if added later.

---

## Open questions / follow-ups

- **Empty account list vs 404:** v1 returns **404** when the user has no linked accounts. If onboarding requires **200** + `accounts: []`, that needs product sign-off and a contract bump.
- **Multi-account selection persistence:** `accountId` in the response defaults to the first account; client owns selected-account storage until product defines otherwise.

---

## Links

- Phase plan: [phase-01-account-me-bootstrap.md](../phase-01-account-me-bootstrap.md)
- Normative contract: [account-admin-api-contract.md §9](../account-admin-api-contract.md#9-bootstrap--get-accountme-phase-1)
- Research brief: [Fixtura-account-data-research-brief-v2.md](../../Fixtura-account-data-research-brief-v2.md)
- Detailed app contract (fields): [app-handoff-get-account-me-endpoint.md](../../../../src/api/account/.comms/app-handoff-get-account-me-endpoint.md)
- Route map: [account-admin-api-contract.md §7](../account-admin-api-contract.md#7-route--endpoint-map)
