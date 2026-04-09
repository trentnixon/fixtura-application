# App handoff — onboarding associations + clubs lookups and W1 (association / club selection)

**From:** CMS (Strapi) backend  
**To:** Fixtura members app (BFF + frontend)  
**Date:** 2026-04-07  
**Related:** [cms-request-onboarding-associations-and-clubs.md](./cms-request-onboarding-associations-and-clubs.md), [app-handoff-onboarding-phase2-l1-l2-w1.md](./app-handoff-onboarding-phase2-l1-l2-w1.md)

## Summary

Upstream routes are implemented for:

- **Associations lookup** — published associations filtered by **sport** (same string domain as L1 `id`).
- **Clubs lookup** — published clubs linked to a chosen **association** (many-to-many).
- **W1 extension** — `PATCH` Step 1 accepts **`associationId`** and **`clubId`** and persists them on the account’s `associations` and `clubs` relations (single selection each, via relation `set`).

**Base URL:** `{STRAPI_URL}/api` (same as existing account routes).

**Prerequisite:** Use L1 **`GET /api/account/onboarding/lookups/sports`** so the user’s sport choice is the same string you pass as the **`sport`** query parameter on the associations lookup.

---

## Auth

All endpoints require the same **JWT (Bearer)** as `GET /api/account/me`.

**Strapi Admin** → **Settings → Users & permissions → Roles → Authenticated → Account** — enable:

| Action                                  | Used by                                  |
| --------------------------------------- | ---------------------------------------- |
| `getOnboardingLookupsSports`            | L1 (prerequisite)                        |
| `getOnboardingLookupsOrganisationTypes` | L2                                       |
| `getOnboardingLookupsAssociations`      | Associations lookup                      |
| `getOnboardingLookupsClubs`             | Clubs lookup                             |
| `updateOnboardingStep1`                 | W1 (including Step 1 association / club) |

If an action is disabled, the client receives **403** with a valid JWT.

---

## Associations lookup — GET by sport

- **Upstream:** `GET {STRAPI_URL}/api/account/onboarding/lookups/associations?sport={sport}`
- **Query:** **`sport`** (required) — must be one of L1 ids: `Cricket`, `AFL`, `Hockey`, `Netball`, `Basketball`.
- **Success:** **200**

```json
{
  "data": [{ "id": 1, "label": "Example Regional Association", "sortOrder": 1 }]
}
```

- **`id`:** Strapi `association` document id (integer). Use as `associationId` in W1.
- **Source:** Published `api::association.association` rows where `Sport` matches `sport`; ordered by name ascending.
- **Empty list:** `data: []` is valid if none exist.
- **Caching:** `Cache-Control: private, max-age=3600`.

**Errors (400):** `{ "error": { "code": "INVALID_SPORT", "message": "..." } }` if `sport` is missing or not allowed.

---

## Clubs lookup — GET by association

- **Upstream:** `GET {STRAPI_URL}/api/account/onboarding/lookups/clubs?associationId={associationId}`
- **Query:** **`associationId`** (required) — positive integer; must be a **published** association.
- **Success:** **200** — same envelope as associations:

```json
{
  "data": [{ "id": 10, "label": "Example Club", "sortOrder": 1 }]
}
```

- **`id`:** Strapi `club` document id (integer). Use as `clubId` in W1 when the organisation type is a club.
- **Source:** Published `api::club.club` rows linked to that association via M2M; ordered by name ascending.
- **Empty list:** `data: []` is valid.
- **Caching:** `Cache-Control: private, max-age=3600`.

**Errors (400):** e.g. `INVALID_ASSOCIATION_ID`, `UNKNOWN_ASSOCIATION` if `associationId` is missing, invalid, or not published.

---

## W1 — PATCH Step 1 (association + club)

**Upstream:** `PATCH {STRAPI_URL}/api/accounts/:accountId/onboarding/step-1`

Behaviour for **sport**, **account type**, **name**, and **flags** is unchanged; see [app-handoff-onboarding-phase2-l1-l2-w1.md](./app-handoff-onboarding-phase2-l1-l2-w1.md).

### Additional request fields

| Field           | Type           | Notes                                                                                                                                                                                                                                        |
| --------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `associationId` | number         | Optional. Must reference a **published** association whose `Sport` matches the account’s effective sport for this request (see below). Replaces prior association selection (`set` to a single id).                                          |
| `clubId`        | number \| null | Optional. **`null`** clears the account’s club links. **Positive integer** selects a published club that is linked to the **same request’s** `associationId`, and must be consistent with sport rules when `club.Sport` is one of L1 sports. |

**Rules:**

- **`associationId`** cannot be `null` unless you omit the key; sending `associationId: null` returns **400** (`INVALID_ASSOCIATION`).
- **`clubId` as a number** requires **`associationId`** in the **same** JSON body (same PATCH). Use the association id from the associations lookup.
- **Same request as `sport`:** If you change `sport` and `associationId` together, the association is validated against the **new** sport value (after merge), not only the stored account row.

**Success (200):** Same shape as before; `updated` may include:

```json
{
  "data": {
    "accountId": 123,
    "updated": {
      "sport": "Cricket",
      "associationId": 1,
      "clubId": null
    }
  }
}
```

`updated` only includes keys that were applied in that request. `clubId: null` in `updated` means clubs were cleared.

### Error codes (additional to W1)

| Code                            | Typical cause                                                                |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `INVALID_ASSOCIATION`           | `associationId` invalid type or null.                                        |
| `UNKNOWN_ASSOCIATION`           | Not published or missing.                                                    |
| `ASSOCIATION_SPORT_MISMATCH`    | Association’s sport does not match the account’s effective sport.            |
| `INVALID_CLUB`                  | `clubId` not a positive integer or null.                                     |
| `UNKNOWN_CLUB`                  | Club not published or not linked to the given association.                   |
| `CLUB_SPORT_MISMATCH`           | Club’s L1 sport does not match account sport (when club sport is in L1 set). |
| `ASSOCIATION_REQUIRED_FOR_CLUB` | `clubId` is a number but `associationId` was not sent in the same body.      |

**404:** `ACCOUNT_NOT_FOUND` — same as existing W1.

---

## Suggested client flow (Step 1)

1. After L1 sport is chosen, call **associations** with `sport=<L1 id>`.
2. User picks an association; optionally call **clubs** with `associationId=<that id>` when the organisation type is a **club** (or when you need club selection).
3. **PATCH** Step 1 with `associationId` and, if needed, `clubId` (and `associationId` in the same request when `clubId` is a number). Send `clubId: null` to clear clubs when switching org type or clearing selection.
4. Re-fetch **`GET /api/account/me`**, **`GET /api/accounts/:accountId/settings`**, and **`GET /api/accounts/:accountId/organisation`** as per the Phase 2 handoff; linked association / club details are consumed by organisation payloads where `account_type` drives `clubs[0]` vs `associations[0]`.

---

## CMS implementation map (Strapi codebase)

Paths below are **in the Strapi repository**, not the Fixtura Next.js app.

| Area                                 | Location (Strapi)                                                     |
| ------------------------------------ | --------------------------------------------------------------------- |
| Custom routes                        | `src/api/account/routes/custom-account.js`                            |
| Handlers                             | `src/api/account/controllers/account.js`                              |
| L1/L2 + associations / clubs lookups | `src/api/account/controllers/services/onboardingLookups/index.js`     |
| W1 logic                             | `src/api/account/controllers/services/updateOnboardingStep1/index.js` |

---

## Members app (Fixtura) alignment

- BFF proxies match the upstream paths and query params in this document.
- Step 1 UI: [`wizard-step-organisation.tsx`](../../_components/wizard-step-organisation.tsx) — sends **`associationId`** (number) when valid; sends **`clubId: null`** when organisation type is not **club** (`account_type.id !== 1`); never sends **`associationId: null`**. **`onboardingOrganisationName`** is the selected **club** label when `account_type.id === 1`, else the selected **association** label. Club vs association UI uses [`CLUB_ACCOUNT_TYPE_ID`](../../../../../lib/config/onboarding.ts) (**1**), matching backend `account.me` / organisation resolution — not a label regex.
- Numeric **`clubId`** is only sent together with **`associationId`** in the same PATCH body.

---

## Ops

After deploy, enable the two new **Account** permissions for **Authenticated** (`getOnboardingLookupsAssociations`, `getOnboardingLookupsClubs`).

No new account schema columns are required for this feature; associations and clubs use existing M2M relations on `api::account.account`.
