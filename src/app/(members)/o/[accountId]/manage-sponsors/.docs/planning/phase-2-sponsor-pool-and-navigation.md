# Phase 2: Sponsor Pool And Navigation

## Status

Completed

## Route Split Follow-up

Phase 2 is functionally complete for the overview experience, but its add-sponsor entry task now needs a route-level adjustment.

What stays valid:

- sponsor pool summary cards
- sponsor pool search and filtering
- sponsor card selection
- sponsor pool as the overview library

What changes:

- `Add sponsor` should navigate to `/add-sponsor`
- overview should no longer enter local draft-creation mode

## Implementation Notes

Phase 2 has now been landed in the route shell.

Implemented:

- sponsor pool summary cards
- sponsor pool search
- sponsor pool filter state
- sponsor card navigation
- overview-level sponsor browsing patterns

Delivered files include:

- `src/app/(members)/o/[accountId]/manage-sponsors/_hooks/use-manage-sponsors-workspace.ts`
- `src/app/(members)/o/[accountId]/manage-sponsors/_components/library/sponsor-library-panel.tsx`
- `src/app/(members)/o/[accountId]/manage-sponsors/_components/library/sponsor-library-search.tsx`
- `src/app/(members)/o/[accountId]/manage-sponsors/_components/library/sponsor-library-filters.tsx`
- `src/app/(members)/o/[accountId]/manage-sponsors/_components/sponsor-pool-summary-cards.tsx`

## Goal

Make the sponsor overview and sponsor pool easy to scan, filter, and navigate.

## Outcomes

- sponsor pool feels like a usable library
- users can find sponsors quickly
- unassigned sponsors are clearly visible

## Tasks

### Task 2.1: Build sponsor pool summary header

Description:

- show high-level sponsor counts
- support the pool model visually

Deliverables:

- total sponsors
- placed sponsors
- unassigned sponsors
- archived sponsor count entry point

Acceptance criteria:

- header summaries render from sponsor data
- archive entry point is visible from the main route

### Task 2.2: Build sponsor library rail

Description:

- build the left-side sponsor navigation rail

Deliverables:

- sponsor search
- sponsor filters
- sponsor card list
- selected sponsor state

Acceptance criteria:

- users can select sponsors from the pool
- unassigned sponsors are clearly visible
- sponsor cards show placement and targeting summaries

### Task 2.3: Add sponsor creation entry point

Description:

- allow users to launch sponsor creation from the overview route

Deliverables:

- `Add sponsor` action
- route transition to `/add-sponsor`

Acceptance criteria:

- users can enter sponsor creation flow from the overview route

Refactor acceptance:

- clicking `Add sponsor` leaves the overview route
- sponsor pool remains available only for overview and existing-sponsor editing

## Phase Exit Check

- sponsor pool feels like a usable library: complete
- users can find sponsors quickly: complete
- unassigned sponsors are clearly visible: complete
