# App handoff: Sponsor entity targets endpoint

**From:** Fixtura App (frontend) Team  
**To:** CMS (Strapi) Backend Team  
**Date:** 2026-05-14  
**Feature:** `/o/:accountId/manage-sponsors/assign/entity`  
**Main ask:** Please add a JWT/account-scoped GET endpoint that returns the sponsor-assignable entity targets for an account.

> **Status:** Superseded by CMS implementation handoff: `.comms/data-fetching/handoff/app-handoff-sponsor-entity-targets-endpoint.md`. Use that file as the source of truth for implementation. This request doc is retained for history.

---

## Summary

The app already supports assigning sponsors to account-wide position slots at:

```text
/o/:accountId/manage-sponsors/assign/position
```

We are preparing the matching entity assignment route:

```text
/o/:accountId/manage-sponsors/assign/entity
```

The UI should behave like position assignment:

- show assignable rows,
- assign a sponsor to a selected target,
- show current allocation context from the sponsors payload where useful.

CMS v1 difference from position assignment:

- entity assignment is additive,
- duplicate allocations for the same target are allowed,
- there is no entity clear-all feature in v1,
- the targets endpoint does not include occupants.

The difference is that rows are account-specific entity targets instead of static position slots.

Current temporary app state:

- The entity route only prints `account_type` and `group_assets_by`.
- Full UI build is blocked on an account-scoped target catalogue endpoint.

---

## Confirmed CMS facts

### Entity allocation routes do not list entities

The existing sponsor entity allocation routes only operate when the app already knows:

```text
entityType + entityId
```

They do not discover teams, grades, or clubs for an account.

### Supported entity allocation types

Supported `entityType` path segments are:

```text
club
team
grade
```

There is no `competition` entity type.

Rules:

- `entityType` must be lowercase.
- `entityId` is the Strapi numeric document id for that collection type.
- `entityId` is not a PlayHQ id, slug, or external id.
- Out-of-scope entities return `404`, usually with a message like `Entity not found for this account.`
- Wrong-account sponsor/entity access follows the usual account route enumeration pattern.

Ownership/scope checks:

| Type    | Server-side scope rule                                                                               |
| ------- | ---------------------------------------------------------------------------------------------------- |
| `club`  | Club is linked to the account (`club.accounts` includes this account).                               |
| `team`  | Team's club is linked to the account.                                                                |
| `grade` | Grade's competition has at least one `club_to_competitions` row whose club is linked to the account. |

### Current account/organisation reads

Available today:

- `GET /api/account/me` returns account rows with `accountOrganisationDetails`.
- For club accounts (`account_type` id `1`), `accountOrganisationDetails` is built from the first linked club and includes that club's Strapi id and name.
- `GET /api/account/organisation/:accountId` and `GET /api/accounts/:accountId/organisation` use the same single club-or-association summary pattern.

Implication:

- The primary linked club id is available and can be used as a `club` entity target if product wants a club row.
- Lists of teams and grades scoped to the account are not provided by those account/organisation endpoints.

Endpoints that should not be used for member UI without redesign:

- `GET /api/account/getAccountDetailsForScheduler/:accountID` can build richer data, including club team summaries, but is configured with `auth: false`.
- `GET /api/team/getTeamByID/:ID` is `auth: false`.
- `POST /api/team/getTeamBySearchTerm` is `auth: false`.

These are not JWT + account-ownership-checked pickers for sponsor allocation.

---

## Correct grouping semantics

CMS confirmed the app's first assumption for association grouping was inverted.

For association accounts:

| `group_assets_by` | Meaning in CMS today     |
| ----------------- | ------------------------ |
| `true`            | Group by **grade**       |
| `false`           | Group by **competition** |

Additional details:

- `saveAccountSettings`: `competitionsGroupedBy === "grade"` maps to `group_assets_by = true`.
- `saveAccountSettings`: `competitionsGroupedBy === "competition"` maps to `group_assets_by = false`.
- Fixture sorting follows the same meaning: `true` groups by grade name; `false` groups by competition name.
- Since `competition` is not an entity allocation type, competition mode should use competition as a display heading over valid entity targets, or remain a general-allocation/render-pipeline concern.

For club/team accounts, current app product notes say:

| Account context | Setting                     | UI grouping                   |
| --------------- | --------------------------- | ----------------------------- |
| Club / team     | `group_assets_by === true`  | Juniors and seniors           |
| Club / team     | `group_assets_by === false` | Juniors, seniors, and masters |

CMS has clarified:

- Scheduler/organisation payloads expose team ids/names and grade names.
- They do not compute junior/senior/masters buckets.
- Render/roster code has age heuristics, but that logic is not currently shared with sponsor allocation.
- If the UI needs those buckets, CMS should ideally return a `group` field so the app does not fork classification logic.
- `split_seniors_and_masters` exists on club account settings and informs product/UI behaviour, but is not automatically applied to sponsor APIs today.

---

## Requested new endpoint

Preferred endpoint:

```http
GET /api/accounts/:accountId/sponsor-entity-targets
```

CMS response status:

- Not implemented today.
- CMS agrees this endpoint would follow existing account custom route patterns.
- The draft response shape is acceptable as a contract draft; final field names can align with existing DTO conventions on review.

Auth and tenancy should match other account custom routes:

- JWT required.
- `accountId` must belong to the JWT user.
- Invalid/non-owned account should follow existing account route conventions.
- Returned targets should already be in scope for that account using the same rules as entity allocation create/update.

Purpose:

- Return the selectable sponsor assignment targets for the account.
- Return Strapi numeric document ids that can be passed directly to the entity allocation routes.
- Return the catalogue only. CMS v1 does not include occupants; the app should inspect `GET /api/accounts/:accountId/sponsors` for current allocations.

---

## Suggested response shape

Flat shape, simple for the app:

```json
{
  "data": {
    "account": {
      "id": 575,
      "accountType": "club",
      "accountTypeId": 1,
      "groupAssetsBy": true,
      "splitSeniorsAndMasters": false
    },
    "targets": [
      {
        "type": "team",
        "id": 123,
        "name": "Under 15 Boys",
        "label": "Under 15 Boys",
        "group": "juniors",
        "section": {
          "type": "ageGroup",
          "id": "juniors",
          "name": "Juniors"
        },
        "meta": {
          "clubId": 42,
          "gradeId": 987,
          "competitionId": 654
        }
      }
    ]
  }
}
```

Critical target fields:

- `type`: one of `club`, `team`, `grade`
- `id`: Strapi numeric document id accepted by `/allocations/entity/:entityType/:entityId`
- `name` or `label`: display text for the table row

Helpful optional fields:

- `group`: `juniors`, `seniors`, `masters`, or another CMS-defined grouping key
- `section`: display heading metadata, for example a competition heading with grade targets underneath
- `meta`: source ids or helpful context

CMS v1 response does not include `occupant` or `occupants`.

Nested shape is also acceptable if CMS prefers sections:

```json
{
  "data": {
    "sections": [
      {
        "type": "competition",
        "id": 654,
        "name": "Winter Competition",
        "targets": [
          {
            "type": "grade",
            "id": 987,
            "name": "Under 15 Boys"
          }
        ]
      }
    ]
  }
}
```

The app preference is a flat `targets[]` with `section` metadata because it makes filtering, searching, and occupant mapping simpler.

---

## Target selection rules requested

### Club/team accounts

Please return account-scoped targets for the club/team context.

CMS response / remaining product decisions:

1. `club` is a valid selectable `entityType` if the club id passes scope checks; whether to list the primary linked club is a product choice.
2. Team ids/names are available in scheduler/organisation internals, but not through a member-safe account-scoped catalogue today.
3. CMS should ideally return a `group` field for juniors/seniors/masters so the app does not fork render/roster age heuristics.
4. `split_seniors_and_masters` exists on account settings and can inform product/UI behaviour, but sponsor APIs do not apply it automatically today.

### Association accounts, grade mode

When `group_assets_by === true`, CMS semantics are grade grouping.

Please return assignable `grade` targets with Strapi grade document ids.

CMS response / remaining product decisions:

1. Assignable grades are valid entity targets when `gradeBelongsToAccount` passes.
2. The new endpoint should return Strapi `api::grade.grade` document ids so the picker matches `POST .../allocations/entity/grade/:entityId`.
3. Competition metadata can be included as `section` or `meta` for display.

### Association accounts, competition mode

When `group_assets_by === false`, CMS semantics are competition grouping.

Because `competition` is not an entity type, please confirm the intended target model:

CMS response / remaining product decisions:

1. Competition can be used as a display heading only.
2. The endpoint can return nested sections with competition metadata and `grade` or `team` entity ids as leaves.
3. Competition-level sponsorship remains a general allocation with `accountGroup`, not entity CRUD, unless a future `competition` entity type is added.
4. Product still needs to decide whether competition mode should show grade/team leaves under competition headings or stay general-allocation-only.

If competition-level sponsorship is required, it should remain a general allocation with `accountGroup`, unless CMS adds a future `competition` entity type.

---

## Existing entity allocation CRUD

Base path:

```http
/api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId
```

Per sponsor:

| Method   | Purpose                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| `GET`    | List allocations for that sponsor matching `entityType` + `entityId`.                                        |
| `POST`   | Create one allocation. Path defines the entity; body may include optional `{ "extra": { ... } }`.            |
| `PATCH`  | `/:allocationId` - replace the full allocation JSON with a validated object that includes matching `entity`. |
| `DELETE` | `/:allocationId` - delete the allocation row.                                                                |

Required Users & Permissions actions:

- `listAccountSponsorAllocationsEntity`
- `createAccountSponsorAllocationEntity`
- `updateAccountSponsorAllocationEntity`
- `deleteAccountSponsorAllocationEntity`

---

## Stored allocation JSON

Required shape:

```json
{
  "entity": {
    "type": "team",
    "id": 123
  }
}
```

Constraints:

- `entity.type` must be `club`, `team`, or `grade`.
- `entity.id` must match the URL `entityId`.
- `accountGroup` is forbidden on entity allocations.
- Creates and updates set `publishedAt`, so rows are published immediately.

POST behaviour:

- The path defines the entity.
- Optional `extra` is shallow-merged after the entity is set.
- `extra` must not define `entity` or `accountGroup`.

PATCH behaviour:

- Send a full allocation object.
- The allocation object replaces the whole Strapi `Allocation` JSON for that row.
- PATCH is not a deep merge.
- PATCH does not move an allocation to another sponsor.

---

## Proposed app CRUD behaviour

For assigning one sponsor to one visible target:

1. User chooses a sponsor for a target row returned by `GET /api/accounts/:accountId/sponsor-entity-targets`.
2. App creates a new allocation for the chosen sponsor:

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

Confirmed by CMS:

- Duplicate allocations for the same target are allowed.
- Assigning a sponsor to an entity target should **not** delete existing allocations for that same target.
- `PATCH` is only for same sponsor + same entity path, updating JSON such as `extra`.
- There is no move/upsert API today.
- There is no entity "Clear all" feature in v1.

Product/app implication:

- Entity assignment is additive in v1. Do not mirror the position route's replacement/clear-all semantics unless product/CMS changes the contract.

---

## Reading occupants

Supported today:

`GET /api/accounts/:accountId/sponsors` returns sponsors with:

```json
{
  "sponsorshipAllocations": [
    {
      "id": 456,
      "allocation": {
        "entity": {
          "type": "team",
          "id": 123
        }
      }
    }
  ]
}
```

The app can build an occupant map from:

```text
allocation.entity.type + allocation.entity.id -> sponsor allocation row
```

CMS v1 response:

- `GET /api/accounts/:accountId/sponsor-entity-targets` does not include `occupant` or `occupants`.
- Use `GET /api/accounts/:accountId/sponsors` to inspect current sponsor allocations.

---

## Entity vs render pipeline note

CMS confirmed scheduler grouping for render paths such as `roster aux.team` only ingests allocations with `accountGroup`, not entity allocations.

So:

- Entity allocations are correct for "attach sponsor to this team/grade/club" in account APIs and the member UI.
- If this linkage must also drive a render path that reads only `accountGroup`, that is a separate pipeline concern.
- Position/general allocation work is handled separately.

---

## Why this endpoint is preferred

We prefer one account-scoped target-list endpoint because it:

- Keeps account ownership and entity scope checks in CMS.
- Avoids frontend stitching across unauthenticated or non-account-scoped endpoints.
- Ensures ids are the exact Strapi document ids expected by entity allocation CRUD.
- Keeps juniors/seniors/masters and competition/grade grouping logic consistent with CMS.
- Lets the UI remain a simple assignment table over a trusted list of targets.

---

## CMS action items / remaining decisions

Backend action items from CMS response:

1. Implement `GET /api/accounts/:accountId/sponsor-entity-targets` or an agreed path with JWT + ownership + entity scope.
2. Use flat `targets[]` with `group`, `groupLabel`, and `meta` for UI headings.
3. Do not include `occupant` in v1.
4. Return pre-computed `group` / `groupLabel` for club/team targets where possible.
5. Optionally add uniqueness guards, occupant data, or bulk operations later; current v1 allows duplicates and has no entity clear-all.

Remaining product decisions:

1. Should the primary linked club be listed as a selectable `club` target?
2. Should club/team targets primarily be `team` rows, `grade` rows, or a combination?
3. What is the source of truth for juniors/seniors/masters grouping?
4. In association competition mode (`group_assets_by === false`), should the UI show grade/team leaves under competition headings or keep competition sponsorship general-allocation-only?
5. Should a later product version add one-sponsor-per-target uniqueness, occupant data, or clear-all? V1 does not.

---

## Related references

| Item                                      | Location                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Existing sponsor/allocations CRUD handoff | `.comms/data-fetching/request/app-handoff-account-sponsors-and-allocations-crud.md`                      |
| CMS response to app questions             | `.comms/data-fetching/response/cms-handoff-sponsor-entity-targets-endpoint-app-questions copy.md`        |
| Temporary entity route                    | `src/app/(members)/o/[accountId]/manage-sponsors/assign/entity/page.tsx`                                 |
| Temporary settings readout                | `src/app/(members)/o/[accountId]/manage-sponsors/assign/entity/entity-assignment-settings-print.tsx`     |
| Position assignment reference UI          | `src/app/(members)/o/[accountId]/manage-sponsors/_components/placement/sponsor-slot-placement-panel.tsx` |
