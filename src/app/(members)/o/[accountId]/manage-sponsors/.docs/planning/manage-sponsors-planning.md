# Manage Sponsors Planning

## Goal

Turn the sponsor feature into a small route cluster where:

- `/o/[accountId]/manage-sponsors` is the sponsor overview workspace
- `/o/[accountId]/add-sponsor` is the dedicated single-sponsor creation flow
- `/o/[accountId]/manage-sponsors/assign` is the dedicated assignment flow
- `/o/[accountId]/manage-sponsors/archive` is the archive area

Across those routes, users should be able to:

- manage a pool of sponsor records in one place
- upload, crop, replace, and remove sponsor logos
- assign one sponsor as `primary`
- rank additional sponsors into end-screen positions
- assign sponsors to entities based on org type
- archive sponsors out of the pool
- permanently delete sponsors from archive

## Core Model

This feature should be built around a sponsor pool.

Important rules:

- not every sponsor in the pool has to be used
- sponsors can remain unassigned in the pool
- assigning a placement is what makes a sponsor usable in outputs
- archive removes a sponsor from the active pool
- delete only happens from archive

So the mental model is:

1. sponsor exists in pool
2. placement makes sponsor usable
3. targeting decides where sponsor applies
4. archive removes sponsor from the pool
5. delete permanently removes archived sponsor

## Screen Flow Correction

Sponsor creation/editing and sponsor assignment should be treated as different jobs.

Updated UX rule:

- sponsor create/edit screen handles sponsor details and logo only
- sponsor assignment screen handles asset positions and entity assignment only
- users should not assign sponsors while creating or editing the sponsor record

This keeps the flow much clearer:

1. open the sponsor overview
2. add a sponsor from a dedicated add-sponsor route
3. confirm the new sponsor upload
4. return to sponsor overview
5. assign sponsor to asset position
6. assign sponsor to entity

## Preview Requirement

At every stage of this feature, we should aim to provide strong preview data and visuals for sponsorship positions.

This is important for:

- understanding which sponsor is assigned where
- checking primary vs ranked placement quickly
- confirming sponsor-to-entity assignment decisions
- reducing mistakes before save/archive actions

This can be staged later in implementation, but it should remain a core product requirement rather than an optional enhancement.

## Business Rules

### Org type rule

Entity targeting branches by organisation type:

- `org type === club`
  - assign sponsors to teams
- `org type === association`
  - assign sponsors by competitions or grades

### Association grouping rule

Association targeting follows the account's grouping mode:

- if assets are grouped by `competition`, assign by competition
- if assets are grouped by `grade`, assign by grade

This means:

- association sponsors do not need simultaneous competition and grade assignment for the same delivery model
- competition assignment is not automatically a generic inheritance rule for all grades
- the current grouping mode determines which association targeting UI to show

### Placement scope rule

For v1, placement is account-global:

- `primary` is global for the whole account
- ranked sponsor positions are global for the whole account
- teams, grades, and competitions do not get separate placement sets yet

### Sponsor pool rule

- sponsors can exist without a placement
- only placed sponsors are considered available for active output use
- unassigned is a normal state, not an error state

### Activation rules

- logo is required before a sponsor can be marked active
- logo is required before a sponsor can be marked primary
- there may be no primary sponsor

### Ranked slot rule

- ranked slots are dynamic
- capacity should support up to `30` sponsor positions

### Global targeting precedence

- if a sponsor is both global and entity-assigned, global wins

### Inactive rule

- inactive is acceptable as a status
- inactive sponsors remain in the pool

### Archive rule

Archive is the main removal flow:

- users archive sponsors from the pool
- archived sponsors move to an archive page/view
- hard delete is only available from archive

### Archive side effects

When a sponsor is archived:

- remove primary placement if present
- remove ranked placements if present
- remove saved entity assignments

If the sponsor is allocated, the user should be warned before archive.

## Current State

The route already exists and currently loads a read-only sponsor list:

- `src/app/(members)/o/[accountId]/manage-sponsors/page.tsx`
- `src/app/(members)/o/[accountId]/manage-sponsors/manage-sponsors-content.tsx`

Reusable upload/crop infrastructure already exists:

- `src/components/media/image-uploader-crop.tsx`
- `src/app/sandbox/interaction-lab/upload/image-crop/page.tsx`
- `src/features/branding/components/brand-logo-workspace/index.tsx`

Relevant data hooks already exist:

- `src/lib/api/hooks/account/useAccountSponsors.ts`
- `src/lib/api/hooks/account/useAccountOrganisationContext.ts`
- `src/lib/api/hooks/season-hub/useSeasonHubCompetitions.ts`
- `src/lib/api/hooks/season-hub/useSeasonHubCompetitionGrades.ts`
- `src/lib/api/hooks/season-hub/useSeasonHubGrade.ts`

## Route Structure Recommendation

This feature should become a small route cluster:

```text
/o/[accountId]/manage-sponsors
/o/[accountId]/add-sponsor
/o/[accountId]/manage-sponsors/assign
/o/[accountId]/manage-sponsors/archive
```

### Main route

`/o/[accountId]/manage-sponsors`

Purpose:

- overview the state of sponsors
- quick-view the sponsor pool
- access archive
- navigate to add sponsor
- navigate to sponsor assignment

This route should now behave as the overview page only.

### Add sponsor route

`/o/[accountId]/add-sponsor`

Purpose:

- add one sponsor at a time
- upload and crop sponsor logo
- enter sponsor details
- confirm the sponsor save/upload
- return to the overview once the sponsor has been created

Rules:

- this route is only for creating a new sponsor
- it should not include sponsor pool browsing
- it should not include sponsor assignment
- it should not include archive actions beyond normal page navigation

### Assignment route

`/o/[accountId]/manage-sponsors/assign`

Purpose:

- assign sponsor to asset position
- assign sponsor to entity
- manage global primary position
- manage ranked sponsor positions
- manage team / grade / competition assignment

### Archive route

`/o/[accountId]/manage-sponsors/archive`

Purpose:

- view archived sponsors
- restore sponsors
- permanently delete archived sponsors

This keeps the main route focused on the active working pool and moves destructive cleanup into a safer secondary view.

## Recommended Folder Structure

```text
src/app/(members)/o/[accountId]/manage-sponsors/
  page.tsx
  assign/
    page.tsx
  archive/
    page.tsx
  _components/
    manage-sponsors-shell.tsx
    manage-sponsors-workspace.tsx
    manage-sponsors-header.tsx
    manage-sponsors-empty-state.tsx
    manage-sponsors-loading-state.tsx
    manage-sponsors-error-state.tsx
    sponsor-pool-summary-cards.tsx
    sponsor-preview-panel.tsx

    library/
      sponsor-library-panel.tsx
      sponsor-library-search.tsx
      sponsor-library-filters.tsx
      sponsor-library-toolbar.tsx
      sponsor-library-list.tsx
      sponsor-library-card.tsx
      sponsor-status-badge.tsx

    editor/
      sponsor-editor-sheet.tsx
      sponsor-details-form.tsx
      sponsor-logo-card.tsx
      sponsor-save-dialog.tsx
      sponsor-archive-dialog.tsx
      sponsor-unsaved-changes-dialog.tsx

    placement/
      sponsor-assignment-workspace.tsx
      sponsor-slot-placement-panel.tsx
      sponsor-primary-slot-card.tsx
      sponsor-ranked-slots-list.tsx
      sponsor-rank-row.tsx
      sponsor-placement-summary.tsx

    targeting/
      sponsor-targeting-panel.tsx
      sponsor-target-scope-toggle.tsx
      sponsor-target-team-list.tsx
      sponsor-target-competition-list.tsx
      sponsor-target-grade-list.tsx
      sponsor-target-summary.tsx

    archive/
      sponsor-archive-workspace.tsx
      sponsor-archive-list.tsx
      sponsor-archive-card.tsx
      sponsor-restore-dialog.tsx
      sponsor-delete-dialog.tsx

  _hooks/
    use-manage-sponsors-workspace.ts
    use-manage-sponsors-archive.ts
    use-sponsor-editor-state.ts
    use-sponsor-placement-state.ts
    use-sponsor-targeting-state.ts

  _types/
    manage-sponsors.ts

  _utils/
    sponsor-form.ts
    sponsor-placement.ts
    sponsor-targeting.ts
    sponsor-display.ts
    sponsor-archive.ts

  .docs/
    manage-sponsors-planning.md

src/app/(members)/o/[accountId]/add-sponsor/
  page.tsx
  _components/
    add-sponsor-screen.tsx
    add-sponsor-header.tsx
    add-sponsor-form.tsx
    add-sponsor-logo-card.tsx
    add-sponsor-save-dialog.tsx
    add-sponsor-success-preview.tsx
  _hooks/
    use-add-sponsor.ts
```

## Layout Options

There are 3 strong layout patterns for this feature.

### Option A: split workflow routes

This is now the recommended default.

```text
Route 1: Manage sponsors overview
---------------------------------------------------------
 Header
 [Manage sponsors] [Assign sponsors] [Archive] [Add sponsor]
---------------------------------------------------------
 Overview
 - sponsor state summary
 - sponsor pool quick view
 - edit existing sponsor entry point
---------------------------------------------------------

Route 2: Add sponsor
---------------------------------------------------------
 Header
 [Add sponsor] [Back to overview]
---------------------------------------------------------
 Add sponsor workflow
 - logo upload and crop
 - sponsor details
 - save / confirm
 - preview of the new sponsor
---------------------------------------------------------

Route 3: Assign sponsors
---------------------------------------------------------
 Header
 [Assign sponsors] [Back to sponsor pool]
---------------------------------------------------------
 Left / Top
 - list of available positions
 - sponsor selector with preview
---------------------------------------------------------
 Right / Bottom
 - entity assignment lists
 - team / grade / competition selectors
---------------------------------------------------------
```

Why this is strongest:

- new sponsor creation becomes a dedicated intention
- sponsor details stay separate from asset assignment
- users can focus on sponsor creation without pool or placement noise
- assignment becomes a dedicated workflow with clearer intent

### Option B: 3-column workspace

This is now a fallback option only if we decide not to split the route yet.

```text
---------------------------------------------------------
 Header
 [Manage sponsors] [Archive] [Add sponsor] [Save changes]
---------------------------------------------------------
 Left column          Center column         Right column
 Sponsor pool         Selected sponsor      Placement + targeting
 - search             - details form        - primary slot
 - filters            - logo upload         - ranked positions
 - sponsor cards      - status toggles      - entity assignment
 - counts             - preview             - scope summary
---------------------------------------------------------
```

Why this is strongest:

- the sponsor pool stays visible
- editing is fast
- placement and targeting remain visible while editing
- it supports the pool-first model very naturally

### Option B: master-detail with right workspace

```text
---------------------------------------------------------
 Header
 [Manage sponsors] [Archive] [Add sponsor] [Save sponsor]
---------------------------------------------------------
 Left column                  Right column
 Sponsor pool                 Selected sponsor workspace
 - search                     - logo
 - filters                    - details
 - sponsor list               - placement
                              - targeting
                              - preview
---------------------------------------------------------
```

Why this is good:

- simpler to implement
- gives the editor more width
- adapts well to tablet

Tradeoff:

- placement and targeting are less independently scannable

### Option C: sponsor detail tabs

```text
---------------------------------------------------------
 Header
 [Manage sponsors] [Archive] [Add sponsor]
---------------------------------------------------------
 Left column                  Right column
 Sponsor pool                 Selected sponsor
                              [Details] [Placement] [Targeting]
---------------------------------------------------------
```

Why this is useful:

- lowest visual density
- easiest on smaller screens

Tradeoff:

- weakest for cross-checking a sponsor's full configuration

## Recommended Page Layout

Use the split workflow.

### Main screen: sponsor management

This is the overview and pool management route.

Features:

- sponsor pool quick-view grid/list
- sponsor archive entry point
- sponsor state overview
- entry point to add sponsor

This screen should focus on:

- sponsor state
- sponsor pool quick review
- editing existing sponsors

It should not be where asset positions or entity assignment are managed.

It should also no longer be where a brand new sponsor is created.

### Add sponsor screen

This is the dedicated route for creating a single sponsor.

Features:

- upload sponsor logo
- crop / replace / remove sponsor logo
- enter sponsor details
- confirm sponsor save
- show the new sponsor preview after save

This screen should focus on:

- single-sponsor creation only
- confirmation of the created sponsor
- a clean way back to the overview

It should not include:

- sponsor pool
- sponsor overview stats
- assignment UI
- archive workflow

### Assignment screen: assign sponsors to asset

This is the only place where sponsor assignment happens.

Features:

- list of available positions
- sponsor selector for each position
- sponsor name and image preview in the selector
- entity assignment controls

Examples:

- `Primary position 1` -> choose sponsor from pool
- ranked position list -> choose sponsor from pool
- team / grade / competition assignment -> choose entity from list

### Main screen header content

The header should include:

- title: `Manage sponsors`
- helper copy explaining the sponsor pool
- summary chips:
  - total sponsors
  - placed sponsors
  - unassigned sponsors
  - archived sponsors
- actions:
  - `Add sponsor`
  - `View archive`
  - `Assign sponsors`

### Add sponsor header content

The header should include:

- title: `Add sponsor`
- helper copy explaining single-sponsor creation
- actions:
  - `Back to overview`

### Main screen layout

Recommended regions:

- sponsor state summary
- sponsor pool quick-view section

### Add sponsor screen layout

Recommended regions:

- add sponsor header
- sponsor logo upload/crop
- sponsor details form
- save confirmation
- post-save sponsor preview

### Sponsor pool quick view

Purpose:

- fast overview of what exists in the pool
- quick checks on logos, names, and current state
- not the primary place for assignment

Recommended presentation:

- grid or featured list view
- logo thumbnail
- sponsor name
- active / inactive
- placement summary
- optional quick edit entry point

### Sponsor create/edit area

Purpose:

- update sponsor logo
- update sponsor details
- crop and replace logo
- remove logo

Recommended card order:

1. sponsor details
2. sponsor logo upload/crop
3. sponsor preview

Recommended fields:

- name
- tagline
- url
- description
- active toggle

Recommended status guidance:

- missing logo warning
- unassigned informational note
- primary label

The archive action should sit at the bottom of the editor, away from save actions.

### Add sponsor area

Purpose:

- create one sponsor
- confirm the upload/save result

Recommended card order:

1. sponsor logo upload/crop
2. sponsor details
3. save / confirm
4. resulting sponsor preview

Recommended rule:

- after save, keep the user on the dedicated add-sponsor route until they choose to return to overview

### Assignment screen layout

The assignment route should contain two major areas:

1. asset position assignment
2. entity assignment

### Asset position assignment

This is where we assign sponsors to positions.

Rules:

- this is the only place we assign sponsors to positions
- sponsor create/edit should not assign positions
- the selector should show sponsor name and logo preview

Example pattern:

- `Primary position 1`
- sponsor select next to it
- preview name + image in the selected state

### Entity assignment

This is where we assign sponsors to teams / grades / competitions.

Rules:

- this is the only place we assign sponsors to entities
- club accounts assign to teams
- association accounts assign to grades or competitions based on grouping mode

UI pattern:

- entity list selector
- choose team / grade / competition
- same model as sponsor selection, just using entity options

## Archive Page Layout

The archive route should be intentionally simpler than the main route.

```text
---------------------------------------------------------
 Header
 [Archived sponsors] [Back to sponsor pool]
---------------------------------------------------------
 Search / filters
---------------------------------------------------------
 Archived sponsor list
 - archived sponsor card
 - restore
 - delete permanently
---------------------------------------------------------
```

Archive page features:

- search archived sponsors
- restore sponsor back to the pool
- permanently delete archived sponsor
- warning copy around hard delete

The archive route should not include full placement or targeting editing.

## Suggested Component Responsibilities

### `manage-sponsors-workspace.tsx`

Owns:

- sponsor pool loading
- org context loading
- grouping mode derivation
- selected sponsor id for pool editing
- save coordination for existing sponsors
- archive coordination

### `add-sponsor-screen.tsx`

Owns:

- single-sponsor creation flow
- shared cropper integration for new sponsors
- sponsor create form state
- save confirmation
- post-save preview state

### `sponsor-library-panel.tsx`

Owns:

- search
- filters
- sponsor selection
- add sponsor trigger

### `sponsor-editor-sheet.tsx`

Owns:

- sponsor form state
- cropper integration
- validation

### `sponsor-slot-placement-panel.tsx`

Owns:

- assignment-route position controls (general allocation slots)
- per-slot sponsor select, assign, clear

### `sponsor-targeting-panel.tsx`

Owns:

- assignment-route entity controls
- org-type-aware targeting UI
- grouping-aware association targeting
- entity selection
- targeting summary

### `sponsor-archive-workspace.tsx`

Owns:

- archived sponsor list
- restore flow
- hard delete flow

## Data Shape Recommendation

The current DTO is read-only and too raw for full editing because `sponsorshipAllocations` is JSON-like.

We should introduce a UI model like:

```ts
type SponsorPlacementRole = "primary" | "ranked" | "none";
type SponsorTargetType = "global" | "team" | "competition" | "grade";
type SponsorAssignmentMode = "global" | "scoped";

type SponsorTargetRef = {
  type: SponsorTargetType;
  entityId: string;
  label: string;
  parentId?: string | null;
};

type SponsorWorkspaceItem = {
  id: number | string;
  name: string;
  tagline: string | null;
  url: string | null;
  description: string | null;
  isActive: boolean;
  isArchived: boolean;
  logo: {
    mediaId: number | null;
    url: string | null;
  };
  placement: {
    role: SponsorPlacementRole;
    rank: number | null;
  };
  assignmentMode: SponsorAssignmentMode;
  targets: SponsorTargetRef[];
};
```

This lets the UI think in clear sponsor rules instead of raw allocation JSON.

## Backend / API Needs

Current API support is not enough for the full feature yet.

### Read

- `GET /api/accounts/:accountId/sponsors`
  - should return edit-friendly sponsor pool data
- `GET /api/accounts/:accountId/sponsors/archive`
  - or equivalent archived sponsor source

### Write

- `POST /api/accounts/:accountId/sponsors`
- `PATCH /api/accounts/:accountId/sponsors/:sponsorId`
- `POST /api/accounts/:accountId/sponsors/:sponsorId/archive`
- `POST /api/accounts/:accountId/sponsors/:sponsorId/restore`
- `DELETE /api/accounts/:accountId/sponsors/:sponsorId`
- `POST /api/accounts/:accountId/sponsors/:sponsorId/logo`
  - or upload + media id patch flow
- optional:
  - `PATCH /api/accounts/:accountId/sponsors/placements`

### Entity sources

Reuse existing account + season-hub lookups where possible:

- org context decides club vs association
- competition and grade sources come from season hub
- team source for clubs comes from the team-capable account scope or CMS source
- association targeting obeys the grouping preference

## Validation Rules

### Sponsor record

- name required
- logo required before active
- logo required before primary
- url valid when supplied

### Placement

- only one primary
- no duplicate rank numbers
- no placement required for pool membership
- there may be no primary
- up to 30 rank slots

### Targeting

- global and scoped assignments should not conflict
- at least one entity required when in scoped mode
- club accounts cannot target competitions or grades
- association accounts cannot target teams
- club accounts may assign one sponsor to multiple teams
- association accounts assign by current grouping mode
- if global and scoped both exist, global wins

### Archive

- warn before archive if sponsor has placement or targeting
- archive removes allocations
- hard delete only available from archive

## Recommended Rollout Phases

### Phase 1: route and shell structure

Deliver:

- new workspace shell
- add-sponsor route shell
- archive route
- sponsor pool rail
- existing sponsor editor shell
- placement shell
- targeting shell

### Phase 2: sponsor editing

Deliver:

- add-sponsor entry point from overview
- existing sponsor selection and editing
- logo upload/crop
- save sponsor

### Phase 3: assignment

Deliver:

- primary assignment
- ranked position assignment
- rank validation

### Phase 4: entity targeting

Deliver:

- team targeting for clubs
- competition targeting for competition-grouped associations
- grade targeting for grade-grouped associations

### Phase 5: archive lifecycle

Deliver:

- archive flow
- archive warnings
- restore flow
- hard delete from archive

### Phase 6: preview and polish

Deliver:

- preview panel
- empty states
- unsaved changes guard
- tests

## Recommended First Build Slice

The best first implementation slice is:

1. add the route shell and archive route
2. add the assignment route shell
3. replace the current read-only layout with the sponsor-pool workspace shell
4. build the sponsor editor shell for logo/details only
5. build the assignment screen shell for positions and entities
6. add a simple archive view shell

This gives us the correct structure before every save action is wired.
