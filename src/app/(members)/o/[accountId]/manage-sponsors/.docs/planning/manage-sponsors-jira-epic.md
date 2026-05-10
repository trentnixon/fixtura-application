# Jira Epic: Manage Sponsors Workspace

## Epic Summary

Build `/o/[accountId]/manage-sponsors` into a complete sponsor-management workspace for club and association accounts.

The feature should let users:

- manage a sponsor pool
- upload and crop sponsor logos
- assign global sponsor placements
- target sponsors to org-specific entities
- archive sponsors out of the pool
- restore or permanently delete archived sponsors

## Epic Goal

Create one sponsor-management experience where users can maintain a pool of sponsors, decide which sponsors are usable by assigning placements, and control where those sponsors apply.

## Scope

### In scope

- sponsor pool workspace
- sponsor editor
- sponsor logo upload/crop integration
- global primary sponsor assignment
- global ranked sponsor positions
- org-type-aware targeting
- archive route and archive lifecycle
- restore and delete-from-archive flows
- tests for core sponsor workflows

### Out of scope

- entity-scoped placement sets
- date-driven scheduling logic
- multiple primary sponsor groups
- advanced sponsor analytics
- bulk import/export

## Business Rules

- sponsors live in a pool and do not all need placements
- placement is what makes a sponsor usable in outputs
- placements are account-global for v1
- club accounts assign sponsors to teams
- association accounts assign sponsors by competition or grade based on grouping mode
- logo is required before a sponsor can be active
- logo is required before a sponsor can be primary
- there may be no primary sponsor
- ranked positions are dynamic up to 30 slots
- archive removes placements and assignments
- hard delete is only available from archive

## Phase Files

1. [Phase 1 - Route Structure](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-1-route-structure.md>)
2. [Phase 2 - Sponsor Pool And Navigation](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-2-sponsor-pool-and-navigation.md>)
3. [Phase 3 - Sponsor Editor And Logo Workflow](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-3-sponsor-editor-and-logo-workflow.md>)
4. [Phase 4 - Placement Management](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-4-placement-management.md>)
5. [Phase 5 - Org-Aware Targeting](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-5-org-aware-targeting.md>)
6. [Phase 6 - Archive Lifecycle](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-6-archive-lifecycle.md>)
7. [Phase 7 - Preview Polish And Tests](<C:/htdocs/fixtura/application/src/app/(members)/o/[accountId]/manage-sponsors/.docs/planning/phase-7-preview-polish-and-tests.md>)

## Success Criteria

- users can create and edit sponsor records in one place
- users can upload and crop logos using the existing cropper flow
- users can see which sponsors are placed vs unassigned
- users can set one global primary sponsor
- users can assign ranked end-screen sponsor positions
- users can target sponsors correctly based on account type
- users can archive sponsors safely with warnings
- users can restore or permanently delete archived sponsors

## Dependencies

- existing `manage-sponsors` route
- `ImageUploaderCrop` reusable component
- account organisation context
- season hub entity sources
- sponsor API contracts for read/write/archive

## Risks

- current sponsor DTO is too raw for full editing
- archive lifecycle may need backend changes
- team source for club targeting may need contract clarification
- grouping-mode-aware association targeting depends on available account settings data

## Suggested Jira Ticket Format

Suggested story naming pattern:

- `MSP-1 Route shell for sponsor workspace`
- `MSP-2 Sponsor pool library rail`
- `MSP-3 Sponsor editor and logo workflow`

Suggested labels:

- `manage-sponsors`
- `account-scoped`
- `sponsor-pool`
- `ui`
- `api`

## Recommended Delivery Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
