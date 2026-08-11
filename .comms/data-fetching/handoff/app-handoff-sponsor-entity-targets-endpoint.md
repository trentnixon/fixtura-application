# App: Sponsor entity targets — `GET /api/accounts/:accountId/sponsor-entity-targets`

**From:** CMS (Strapi) Backend Team  
**To:** Fixtura App (frontend) Team  
**Date:** 2026-05-14  
**Purpose:** Load the account-scoped catalogue of entities that can be used with sponsor entity allocation CRUD.

**See also:** [app-handoff-account-sponsors-and-allocations-crud.md](./app-handoff-account-sponsors-and-allocations-crud.md) for create/update/delete allocation routes.

---

## Endpoint

| Property       | Value                                             |
| -------------- | ------------------------------------------------- |
| **Method**     | `GET`                                             |
| **Path**       | `/api/accounts/:accountId/sponsor-entity-targets` |
| **Path param** | `accountId` — positive integer Strapi account id  |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`       |

**Users-permissions:** Enable **Authenticated** → Account → **`getAccountSponsorEntityTargets`**.  
**Reference scope:** `api::account.account.getAccountSponsorEntityTargets`

Ownership matches other account-scoped routes (`account.user` = JWT user).

---

## Success response (HTTP 200)

Envelope:

```json
{
  "data": {
    "account": {
      "id": 575,
      "accountType": "Club",
      "groupAssetsBy": true
    },
    "targets": [
      {
        "type": "team",
        "id": 123,
        "name": "Under 15 Boys",
        "label": "Under 15 Boys",
        "group": "juniors",
        "groupLabel": "juniors",
        "meta": {
          "clubId": 42,
          "clubName": "Fixture Club",
          "gradeIds": [987],
          "gradeNames": ["U15 Boys"],
          "competitionId": 77,
          "competitionName": "Winter 2026"
        }
      }
    ]
  }
}
```

`targets` is a flat list. Use `group`, `groupLabel`, and `meta` fields to render UI section headings.

---

## Target Contract

| Field                  | Notes                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| `type`                 | One of `club`, `team`, `grade`. This is the `entityType` for allocation CRUD. |
| `id`                   | Strapi numeric id for the entity. This is the `entityId` for allocation CRUD. |
| `name` / `label`       | Display text for the row.                                                     |
| `group` / `groupLabel` | Optional grouping/display metadata for the assignment UI.                     |
| `meta`                 | Entity context such as club, grade, and competition ids/names.                |

This endpoint does **not** include `occupant` or `occupants` in v1. It is only the catalogue of assignable targets.

---

## Grouping Semantics

For association accounts:

| `groupAssetsBy` | CMS meaning          | FE grouping                              |
| --------------- | -------------------- | ---------------------------------------- |
| `true`          | Group by grade       | Grade headings                           |
| `false`         | Group by competition | Competition headings using grade targets |

There is no `competition` entity allocation type. In competition grouping mode, the returned assignable rows are still `grade` targets with competition metadata for display.

For club/team accounts:

- `groupAssetsBy === true`: juniors and seniors
- `groupAssetsBy === false`: juniors, seniors, and masters

The endpoint may return a linked `club` target as well as `team` targets.

---

## Allocation Flow

Use the existing entity allocation CRUD routes with the selected target:

```http
POST /api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId
```

Optional body:

```json
{
  "extra": {
    "source": "manage-sponsors-assign-entity"
  }
}
```

Duplicate allocations for the same target are allowed. Assigning a sponsor to an entity target should not delete existing allocations for that same target.

To inspect current sponsor allocations, use:

```http
GET /api/accounts/:accountId/sponsors
```

Each sponsor includes `sponsorshipAllocations`.

There is no entity "Clear all" feature in v1.

---

## Error responses

| HTTP    | When                                                      |
| ------- | --------------------------------------------------------- |
| **400** | `accountId` invalid                                       |
| **401** | No or invalid JWT                                         |
| **403** | Valid JWT but role lacks `getAccountSponsorEntityTargets` |
| **404** | Account not found or not owned                            |
| **500** | Server error                                              |

---

## Backend reference

| Item    | Location                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Route   | `src/api/account/routes/custom-account.js`                                                                                 |
| Handler | `src/api/account/controllers/account.js` → `getAccountSponsorEntityTargets`                                                |
| Payload | `src/api/account/controllers/services/getAccountSponsorEntityTargetsPayload/index.js`                                      |
| Tests   | `src/api/account/controllers/services/getAccountSponsorEntityTargetsPayload/getAccountSponsorEntityTargetsPayload.test.js` |
