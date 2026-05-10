# Manage Sponsors Planning

## Goal

Turn `/o/[accountId]/manage-sponsors` into the single sponsor-management workspace where users can:

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
/o/[accountId]/manage-sponsors/archive
```

### Main route

`/o/[accountId]/manage-sponsors`

Purpose:

- manage active and inactive sponsors in the pool
- edit sponsor details
- upload/crop logos
- manage placement
- manage targeting

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
      sponsor-placement-panel.tsx
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
```

## Layout Options

There are 3 strong layout patterns for this feature.

### Option A: 3-column workspace

This is the recommended default.

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

Use:

- Option A on desktop
- Option B behavior on tablet
- stacked cards or tabs on mobile

### Desktop shell

```text
---------------------------------------------------------
 Header
 [Manage sponsors] [Archive] [Add sponsor] [Save changes]
---------------------------------------------------------
 Left column          Center column         Right column
 Sponsor pool         Selected sponsor      Placement + targeting
---------------------------------------------------------
```

### Header content

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
  - `Save changes`

### Left column: sponsor pool rail

Purpose:

- navigation between sponsors
- overview of the pool
- status visibility

Recommended sections:

- quick stats
- search
- filters
- sponsor list

Recommended filters:

- all
- active
- inactive
- placed
- unassigned
- primary

Recommended sponsor card content:

- logo thumbnail
- sponsor name
- active/inactive badge
- primary badge if present
- rank badge if present
- targeting summary such as:
  - `All teams`
  - `3 grades`
  - `2 competitions`
- placement state such as:
  - `Unassigned`
  - `Primary`
  - `Rank 4`

### Center column: sponsor editor canvas

Purpose:

- edit the selected sponsor record

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

### Right column: assignment rail

Split the right column into 2 cards:

1. placement
2. targeting

This keeps:

- “is this sponsor usable?”
- “where does it apply?”

visually separate.

### Placement card

Controls:

- `Primary sponsor` selector
- ranked positions list
- assign/remove rank
- reorder rank

Rules to show in UI:

- only one primary sponsor per account
- there may be no primary sponsor
- rank positions must be unique
- up to 30 ranked slots
- inactive sponsors cannot occupy active placements

### Targeting card

Controls:

- assignment mode:
  - `Global`
  - `Specific entities`

Global meaning:

- sponsor applies everywhere for that account

Specific meaning:

- club accounts:
  - team selection
- association accounts grouped by competition:
  - competition selection
- association accounts grouped by grade:
  - grade selection

Recommended helper copy:

- `Sponsors can stay in the pool without being assigned.`
- `Only placed sponsors are available for output use.`

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
- selected sponsor id
- dirty state
- save coordination
- archive coordination

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

### `sponsor-placement-panel.tsx`

Owns:

- primary assignment
- ranked list assignment
- rank validation

### `sponsor-targeting-panel.tsx`

Owns:

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
- archive route
- sponsor pool rail
- editor shell
- placement shell
- targeting shell

### Phase 2: sponsor editing

Deliver:

- create sponsor
- edit sponsor
- logo upload/crop
- save sponsor

### Phase 3: placement

Deliver:

- primary assignment
- ranked position assignment
- rank validation

### Phase 4: targeting

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
2. replace the current read-only layout with the sponsor-pool workspace shell
3. build the left sponsor pool rail
4. build the selected sponsor editor shell
5. build the right placement and targeting shells
6. add a simple archive view shell

This gives us the correct structure before every save action is wired.
