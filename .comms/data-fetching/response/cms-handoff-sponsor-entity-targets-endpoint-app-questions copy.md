# CMS handoff: Sponsor entity targets — responses to app questions

**From:** CMS (Strapi) Backend  
**To:** Fixtura App (frontend)  
**Date:** 2026-05-14  
**Re:** [app-questions-sponsor-entity-targets-endpoint.md](../request/app-questions-sponsor-entity-targets-endpoint.md)

This document answers the questions in the app request, grounded in current backend code and routes.

---

## 1. Preferred `GET /api/accounts/:accountId/sponsor-entity-targets`

**Status:** Not implemented today. Adding it would follow the same patterns as other account custom routes: JWT required, `accountId` owned by the JWT user, same tenancy/error conventions as `GET /api/accounts/:accountId/sponsors`, and entity rows limited by the same scope rules as entity allocation create (`entityScope.js`).

The suggested response shape (`data.account`, `data.targets[]` with `type`, `id`, `name`/`label`, optional `group`, optional `meta`) is acceptable as a contract draft; final field names can align with existing DTO conventions on review.

---

## 2. Grouping rules — association `group_assets_by` (correct semantics)

The app request table for association `group_assets_by` is **inverted** relative to the backend.

**`saveAccountSettings` (non-club / association):**

- `competitionsGroupedBy === "grade"` → `group_assets_by = true`
- `competitionsGroupedBy === "competition"` → `group_assets_by = false`

**`FixtureDataSorter` (association fixtures):**

- `group_assets_by === true` → primary grouping key **`gradeName`**
- `group_assets_by === false` → primary grouping key **`competitionName`**

So in code terms:

| `group_assets_by` | Meaning in CMS today     |
| ----------------- | ------------------------ |
| `true`            | Group **by grade**       |
| `false`           | Group **by competition** |

**Entity allocation:** Supported `entityType` values remain **`club`**, **`team`**, **`grade`** only. There is no `competition` entity type.

**When association UI is “competition mode” (`group_assets_by === false`):** the new targets endpoint can still return **`grade`** (and/or **`team`**) rows as assignable entity targets, with **competition** used only as a **display heading** (nested structure or metadata), unless product explicitly keeps competition-level sponsorship to **general** `accountGroup` allocations only.

---

## 3. CRUD flow (entity allocations)

### 3.1 Delete then POST vs PATCH

- **Changing which sponsor “owns” a given entity target:** there is no move/upsert API. Use **DELETE** on the existing allocation row(s), then **POST** on the chosen sponsor’s `…/allocations/entity/:entityType/:entityId`.
- **`PATCH …/allocations/entity/…/:allocationId`:** applies to a row already under **`sponsorId`**; the stored `allocation.entity` must **match** the path `entityType`/`entityId`. It **replaces** the full `Allocation` JSON for that row. It does **not** attach that row to a different sponsor.

So **replace occupant across sponsors** = delete-then-post. **PATCH** = same sponsor + same entity path, update JSON (e.g. `extra` keys).

### 3.2 `extra` (e.g. provenance)

**POST** supports optional `{ "extra": { … } }`, merged into `Allocation` after `entity` is set. **`extra` must not** set `entity` or `accountGroup`. Keys such as `"source": "manage-sponsors-assign-entity"` are consistent with current validation.

### 3.3 Duplicates

**Create** does not check for an existing allocation for the same `(entityType, entityId)` on the same or another sponsor. The **`sponsorship-allocation`** schema has **no unique constraint** on entity inside JSON. **Duplicate rows are possible.** Whether the UI enforces one sponsor per target (or one allocation per target globally) is a **product** rule unless the backend adds explicit guards or indexing.

If duplicates already exist, cleanup policy (delete all but one, delete all for target, etc.) is **app- or future-API-defined**; CMS does not define a winner today.

### 3.4 Bulk “clear all”

There is **no** bulk-delete allocation endpoint. **Clear all** today means repeated **DELETE** per allocation id, unless a future bulk endpoint is added.

---

## 4. Existing allocation read / occupant map

### 4.1 `GET /api/accounts/:accountId/sponsors`

**Yes** — this is the supported way to build an occupant map today: each sponsor includes `sponsorshipAllocations: [{ id, allocation }]`, published rows only, with `allocation.entity` where applicable.

### 4.2 Optional `occupant` on the new targets GET

Including **`occupant: { sponsorId, allocationId }`** (or similar) on each target in **`GET …/sponsor-entity-targets`** is **not** implemented yet but is a **reasonable** contract extension to avoid a client-side join. Whether to add it is a single product decision when the endpoint is built.

---

## 5. Team / club — juniors, seniors, masters

**Scheduler / organisation payloads** (`formatClubs`, `extractClubTeamsSummary`) expose **team** ids/names and **grade names**; they do **not** compute junior/senior/masters buckets.

**Render/roster** code uses a fixed **`ageGroupLookup`** on grade-like strings (e.g. `U15` → junior, `Over 35` → masters). That logic is **not** currently shared with sponsor allocation.

**Recommendations for the new endpoint:**

- Either return a **`group`** (or equivalent) **from CMS** so the app does not fork classification logic, or document the single source of truth if the app duplicates heuristics.
- **`club`** as a selectable **`entityType`** is valid for any club id that passes scope checks; whether to **list** the primary linked club as a row is **product** choice.

**Club account settings:** `split_seniors_and_masters` is stored on the account (`saveAccountSettings`); it informs product/UI behaviour but is not automatically applied to sponsor APIs today.

---

## 6. Association — grades, competitions, general allocations

1. **Assignable grades:** Yes — in scope when `gradeBelongsToAccount` passes (grade’s competition linked via `club_to_competitions` to a club that has the account).
2. **Competition as headings only:** Response shape for the new GET is flexible; CMS can return nested sections with competition metadata and **grade** (or **team**) entity ids as leaves.
3. **Competition-level sponsor:** Remains **general allocation** (`accountGroup`), not entity CRUD, until a competition entity type exists (not planned in current entity contract).
4. **Source of truth for Strapi grade ids:** Entity routes require Strapi **`api::grade.grade`** document ids. The new targets endpoint should return those same ids so the picker matches **POST** `…/allocations/entity/grade/:entityId`.

---

## 7. Related implementation references (backend)

| Topic                                          | Location                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Entity allocation create/update/delete         | `src/api/account/controllers/services/accountSponsorAllocations/index.js`                |
| Entity scope                                   | `src/api/account/controllers/services/accountSponsorAllocations/entityScope.js`          |
| Allocation JSON validation                     | `src/api/account/controllers/services/accountSponsorAllocations/allocationShapes.js`     |
| Sponsor list DTO                               | `src/api/account/controllers/services/sponsorDto/index.js`                               |
| Association `group_assets_by` mapping          | `src/api/account/controllers/services/saveAccountSettings/index.js`                      |
| Fixture grouping by grade vs competition       | `src/api/game-meta-data/controllers/handlers/utils/fixture-data-sorter.js`               |
| Club teams / grade names (no sponsor grouping) | `src/api/account/controllers/workers/getAccountDetailsForScheduler/utils/formatClubs.js` |
| Age heuristics (roster, not sponsor)           | `src/api/render/controllers/fixturaGetFixturesFromRenderForRosters/index.js`             |
| Sponsor CRUD handoff                           | `src/api/account/.comms/app-handoff-account-sponsors-and-allocations-crud.md`            |

---

## 8. Action items (backend)

- [ ] Implement `GET /api/accounts/:accountId/sponsor-entity-targets` (or agreed path) with JWT + ownership + entity scope.
- [ ] Fix app-facing docs that state association `group_assets_by` backwards vs CMS.
- [ ] Decide response: flat `targets[]` vs nested; optional `occupant`; optional pre-computed `group` for club accounts.
- [ ] Optionally: uniqueness guard or bulk delete for allocations (product-driven).
