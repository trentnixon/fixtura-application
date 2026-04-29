# DevelopmentRoadMap — Page Headers

## Current Focus

- TKT-2026-001 Boilerplate kitchen-sink page-headers route (skeleton + notes)

## Completed

- (none)

## To Do (easy → hard)

1. [ ] TKT-2026-002 Build basic + eyebrow + breadcrumbs variants (P1)
   - (see TKT-2026-002 in `Tickets.md`)
2. [ ] TKT-2026-003 Build actions + meta + tabs variants (P2)
   - (see TKT-2026-003 in `Tickets.md`)
3. [ ] TKT-2026-004 Build stats + back + search variants (P2)
   - (see TKT-2026-004 in `Tickets.md`)
4. [ ] TKT-2026-005 Refactor route-lab Season Overview header to consume chosen variant (P3)
   - (see TKT-2026-005 in `Tickets.md`)

## Blocked / Waiting

- (none)

## Recommendations

- Once two variants are built, decide whether to ship a single composable `<PageTitleBlock />` API with optional slots (eyebrow, breadcrumbs, actions, meta, tabs) versus 9 distinct components. Avoid duplicating the title block across files.
- Decide where tabs live: inside the header component, or as a sibling under it. Affects the API surface.
- Capture mobile collapse behaviour for the actions + search variants before building.
