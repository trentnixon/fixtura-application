# Sponsor allocation — assign routes (members)

## Current implementation (Fixtura App Router)

| Item               | Location                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Position route     | [`assign/position/page.tsx`](../position/page.tsx) → [`AssignSponsorsWorkspace`](../../_components/assign-sponsors-workspace.tsx) `mode="position"`                           |
| Entity route       | [`assign/entity/page.tsx`](../entity/page.tsx) -> temporary settings readout (`account_type`, `group_assets_by`)                                                              |
| Position UI        | [`sponsor-slot-placement-panel.tsx`](../../_components/placement/sponsor-slot-placement-panel.tsx)                                                                            |
| Slot catalogue     | [`sponsor-position-slots.ts`](../../_constants/sponsor-position-slots.ts) — `POSITION_ALLOCATION_CATEGORY`, `primary_sponsor`, `general_sponsor_1` … `_30`                    |
| Allocation helpers | [`sponsorship-allocation-general.ts`](../../_utils/sponsorship-allocation-general.ts)                                                                                         |
| Workspace hook     | [`use-manage-sponsors-workspace.ts`](../../_hooks/use-manage-sponsors-workspace.ts) — filters/stats include position allocations                                              |
| BFF / API          | `src/lib/api/services/account.api.ts` — general allocation methods; contract in repo root `.comms/data-fetching/request/app-handoff-account-sponsors-and-allocations-crud.md` |

**Behaviour:** Each slot maps to a **general** allocation (`accountGroup.category` + `accountGroup.id`). Assign / clear uses **POST** / **DELETE** (replace = delete previous holder’s row then POST on the new sponsor).

**Manual checks:** no active sponsors → empty state; assign/clear per slot; sponsor must be active with logo; two sponsors competing for one slot → previous allocation removed on assign; entity route: sponsor dropdown + targeting panel.

**Downstream risk:** Features that only read sponsor `isPrimary` / `order` may ignore allocation-based placement until updated — align with render/scheduler.

---

## Entity route grouping rule

For `/manage-sponsors/assign/entity`, entity rows should be selected from account settings:

| Account context | `group_assets_by` | Entity grouping               |
| --------------- | ----------------- | ----------------------------- |
| Association     | `true`            | Grades                        |
| Association     | `false`           | Competitions                  |
| Team / club     | `true`            | Juniors and seniors           |
| Team / club     | `false`           | Juniors, seniors, and masters |

CMS clarification: app notes originally had association `group_assets_by` inverted. In CMS today, `true` means grade grouping and `false` means competition grouping. Entity allocation routes support only `club`, `team`, and `grade`. There is no `competition` entity type; competition grouping remains a general-allocation/render-pipeline concern. Entity ids must be Strapi numeric document ids, not PlayHQ ids or slugs. Allocation routes mutate/list allocations for known ids; they do not discover teams/grades, so the UI needs an account-scoped catalogue/tree endpoint for selectable targets.

CMS handoff for the requested endpoint: `.comms/data-fetching/request/app-handoff-sponsor-entity-targets-endpoint.md`.
CMS implementation response: `.comms/data-fetching/handoff/app-handoff-sponsor-entity-targets-endpoint.md`.

V1 entity assignment caveats from CMS response: `GET /api/accounts/:accountId/sponsor-entity-targets` returns a flat `targets[]` catalogue with no `occupant`; build current-assignment context from `GET /api/accounts/:accountId/sponsors`. Duplicate allocations for the same target are allowed, assigning a sponsor should not delete existing allocations for that same target, and there is no entity "Clear all" feature in v1.

---

## Legacy reference (pre–App Router)

The remainder of this file describes the older **Pages Router / Strapi REST** implementation for historical context.

---

---

## Route and entry points

| Item                            | Location                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Next.js page                    | `pages/members/sponsors/allocation/index.js`                                                          |
| Allocation UI                   | `components/pages/members/sponsors/allocation/`                                                       |
| Strapi hooks                    | `Hooks/useSponsorshipAllocations.js`                                                                  |
| Org data (leagues/grades/teams) | `Hooks/useGetOrganizationDetails.js`                                                                  |
| Nav link example                | `components/pages/members/sponsors/Sections/HeaderSection.js` (`URL='/members/sponsors/allocation/'`) |
| Tests                           | `tests/SponsorshipForm.test.js`                                                                       |
| Downstream (render pipeline)    | e.g. `utils/Remotion/delete/RemotionFormatSponsors.js` (reads `sponsorship_allocations`)              |

Shell: page is wrapped in `SecureRouteHOC` → `HOC_MembersWrapper` → `HOC_CheckUserSetup` → `HOC_ApplicationLoadingState` (`components/Layouts/members/security/SecureRouteHC.js`).

---

## What the feature does

Members assign sponsors from **`account.attributes.sponsors`** to **slots** (levels). Each assignment is persisted as a **sponsorship allocation** in Strapi (`POST/PUT/DELETE` `/sponsorship-allocations`). Slots are grouped as:

1. **Default** — fixed rows from `sponsorshipLevels.js` (`defaultSponsorshipLevels`: Primary + General slots).
2. **Leagues** — association: current competitions (filtered by `endDate`), unless `group_assets_by` clears leagues.
3. **Grades** — association: grades rolled up from those leagues, or grades-only when `group_assets_by` is set.
4. **Teams** — club: teams from the club org payload.

Account type comes from `FindAccountType` / `FindAccountTypeOBJ` (`lib/actions`).

---

## How allocation works

### Slot identity

Each table row receives a **`level`** object. The slot key is **`level.id`** (e.g. `primary_sponsor`, `general_sponsor_3`, or a league/grade/team id for dynamic rows).

### Discovering an existing allocation

`SponsorshipForm` scans every sponsor’s `sponsorship_allocations.data` and finds the first allocation where:

`allocation.attributes.Allocation.accountGroup.id === level.id`

If found, it stores Strapi `allocation.id` as `allocationId` and pre-selects the sponsor.

### Create / update

On sponsor change, the client sends `{ data: allocationData }` where `allocationData` includes:

- `Allocation.accountType` — association vs club string.
- `Allocation.sponsor` — `id`, `name`, logo URL.
- `Allocation.accountGroup` — `level` (display/key string), `id` (slot key), `category`, `name` (optional; used for dynamic entities).
- `sponsor` — `{ id }` for the Strapi relation.

If `allocationId` exists → **PUT** `/sponsorship-allocations/:id`. Otherwise → **POST** `/sponsorship-allocations`, then save returned id.

### Delete

**DELETE** `/sponsorship-allocations/:allocationId`, then clear local selection state.

### Auth

Hooks use `getAccountFromLocalCookie()` and `Authorization: Bearer` + `Cookies.get('jwt')` (`lib/api` `fetcher`).

---

## Component map (`allocation/`)

| File                   | Role                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `SponsorshipGroup.js`  | Section + Mantine `Table`; renders one `SponsorshipForm` per level; hides empty groups.             |
| `SponsorshipForm.js`   | Row: load existing allocation, select sponsor, create/update/delete.                                |
| `SponsorSelection.js`  | Searchable Mantine `Select` with avatar/label.                                                      |
| `SponsorDisplay.js`    | Shows selected sponsor in the row.                                                                  |
| `SponsorLabel.js`      | Level title + label + tooltip (`level.name`, `level.label`, `level.description`).                   |
| `SponsorshipTitle.js`  | Group header copy.                                                                                  |
| `ActionButtons.js`     | Remove + error line.                                                                                |
| `sponsorshipLevels.js` | `defaultSponsorshipLevels` + `accountSpecificSponsorshipLevels` (association/club extra templates). |

---

## Feature review notes (maintenance)

**Strengths:** Clear page → group → form layering; account-type-specific dynamic entities; searchable select + tooltips; `SponsorshipForm` unit tests.

**Gaps / risks:**

1. **No sponsors** — After load, `if (!userAccount \|\| !Sponsors.length) return null` gives a blank page with no CTA.
2. **Org fetch errors** — `useGetOrganizationDetails` returns `error` but the page does not use it; leagues/grades/teams can silently stay empty.
3. **`sponsorshipLevels` state unused** — `useEffect` merges `defaultSponsorshipLevels` + `accountSpecificSponsorshipLevels` into state, but the Default group always passes `defaultSponsorshipLevels` only; account-specific template rows may never render (drift vs `sponsorshipLevels.js`).
4. **`SponsorLabel` vs defaults** — Default levels use `level` (string) not `name`; dynamic rows set `name`. Default rows may show a weak/empty title line unless aligned.
5. **`SponsorSelection` filter** — Assumes `description` (Tagline) is a string; null/undefined can break search.
6. **Hooks without user** — If cookie user is missing, mutations no-op without surfaced error.
7. **`SponsorshipForm` init** — `flatMap` assumes `sponsorship_allocations.data` always exists on every sponsor.
8. **`useGetOrganizationDetails`** — If `accountId` is falsy, fetch may never run; confirm loading always clears.

---

## Meta (members area)

```text
PageMetaData title: Member Sponsors - Fixtura: Manage Your Partnerships
```

---

## Related account population

`useAccount.js` populates relation `'sponsors.sponsorship_allocations'` where account details are loaded — allocations need to be present on sponsors for the UI to match existing rows.
