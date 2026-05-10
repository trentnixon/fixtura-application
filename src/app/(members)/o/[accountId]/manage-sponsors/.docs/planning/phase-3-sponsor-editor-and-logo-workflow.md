# Phase 3: Sponsor Editor And Logo Workflow

## Status

Complete

## Route Split Follow-up

Phase 3 is now split into two implementation tracks:

1. overview editing for existing sponsors on `/manage-sponsors`
2. new sponsor creation on `/add-sponsor`

This means some of the current Phase 3 implementation should be refactored rather than expanded in place.

Refactor direction:

- keep shared sponsor form pieces
- keep shared logo cropper integration
- move new-sponsor creation flow into dedicated add-sponsor components
- simplify the overview route so it only edits existing sponsors

## Phase 3 Build Focus

This phase established the working sponsor editor foundation.

Immediate focus:

1. turn the selected sponsor shell into a real editable form
2. wire sponsor drafts and existing sponsors into editable local form state
3. integrate `ImageUploaderCrop` into the sponsor logo card
4. add a deliberate save flow for sponsor changes

Implementation approach:

- start from the `brand-logo` route and `BrandLogoWorkspace`
- extract or mirror only the pieces that are genuinely sponsor-specific
- keep sponsor logo behavior visually and technically aligned with the existing application logo flow

Expected Phase 3 outcome:

- the center column stops being a read-only shell and becomes a working sponsor editor
- draft sponsors created in Phase 2 become meaningfully editable
- sponsor logo management starts using the proven cropper workflow already in the repo

Current implementation status:

- selected sponsor shell has been converted into a working local editor
- sponsor draft editing is in place
- sponsor logo upload/crop is using the shared `ImageUploaderCrop` path
- sponsor logo layout is now following the `brand-logo` route direction
- save behavior lives inside the sponsor editor, not the page header
- the header no longer owns save behavior
- current inline new-sponsor flow should be extracted into `/add-sponsor`

## Shared Upload/Crop Rule

Phase 3 should explicitly reuse the labs-based upload/crop implementation that is already being used for logo workflows.

Primary reference route:

- `/o/[accountId]/brand-logo`

Primary reference files:

- `src/app/(members)/o/[accountId]/brand-logo/page.tsx`
- `src/app/(members)/o/[accountId]/brand-logo/_components/brand-logo-screen.tsx`
- `src/features/branding/components/brand-logo-workspace/index.tsx`

Target shared code path:

- interaction lab upload/crop foundations
- reusable `ImageUploaderCrop`
- the same logo-oriented implementation approach already used by the existing logo workflow

Goal:

- one shared code base for lab cropper behavior
- one shared code base for organisation logos
- one shared code base for sponsor logos

Layout direction:

- use the `brand-logo` route as the base application layout reference
- use the `BrandLogoWorkspace` shape as the starting point for sponsor logo UX
- adapt that layout to the sponsor editor context instead of designing a separate uploader section from scratch

We should avoid creating a separate sponsor-only crop flow unless there is a genuine sponsor-specific requirement that cannot be handled through shared props or wrapper components.

## Goal

Make the dedicated add-sponsor flow and sponsor editing flow work cleanly, including logo upload and crop.

## Outcomes

- users can create a sponsor from a dedicated route
- users can edit sponsor details
- users can manage sponsor logos through the existing cropper flow
- sponsor edits can be saved intentionally

## Route Direction Update

This phase now needs to be read in two parts:

- `/o/[accountId]/add-sponsor` owns new sponsor creation
- `/o/[accountId]/manage-sponsors` overview owns existing sponsor browsing and editing

Important UX rule:

- add-new-sponsor should not live inside the overview layout
- new sponsor creation should happen on its own dedicated route
- after save, the add-sponsor route should show the created sponsor confirmation state until the user returns to overview

## Tasks

### Task 3.1: Build sponsor details form

Description:

- build the sponsor details form for new and existing sponsor flows

Deliverables:

- name
- tagline
- url
- description
- active toggle

Acceptance criteria:

- selected sponsor data is editable in the workspace
- new sponsor creation can use the same form foundation on the dedicated add-sponsor route
- validation states are visible

### Task 3.2: Integrate sponsor logo upload and crop

Description:

- reuse the existing cropper flow for sponsor logos
- align sponsor logo behavior with the same labs-driven implementation used by the existing logo workflow
- use the `brand-logo` route and `BrandLogoWorkspace` as the base research reference for both code and layout

Deliverables:

- upload logo
- replace logo
- recrop logo
- remove logo

Acceptance criteria:

- logo workflow uses `ImageUploaderCrop`
- sponsor logo flow follows the same shared implementation direction as organisation logo flow
- sponsor logo layout clearly derives from the existing `brand-logo` application route pattern
- logo state updates correctly in the sponsor editor

### Task 3.3: Add sponsor save workflow

Description:

- save sponsor changes explicitly

Deliverables:

- save action
- dirty-state support
- save confirmation feedback

Acceptance criteria:

- sponsor edits can be saved reliably
- unsaved state is visible before save
- add-sponsor save flow can confirm the new sponsor without returning immediately to overview

### Task 3.4: Extract add-sponsor workflow from overview

Description:

- move the current create-state sponsor editor flow into the dedicated `/add-sponsor` route

Deliverables:

- add-sponsor page header
- add-sponsor logo-first form flow
- add-sponsor save/confirm state
- shared sponsor editor pieces reused where appropriate

Acceptance criteria:

- new sponsor creation no longer depends on overview-only panels or state
- existing sponsor editing stays in `/manage-sponsors`
- add-sponsor route shows a clean post-save confirmation state

## Remaining Phase 3 Follow-up

- refine validation messaging as needed
- decide whether any extra dirty-state affordance is needed before Phase 7
- keep save behavior scoped to the selected sponsor editor

These follow-ups do not block Phase 4.
