# Phase 01 — Product Scope Baseline

> Monday child `2785807577` | Monday status: Done | Delivery action: verify and preserve

## Why this phase exists

Prevent later agents from reintroducing Team ordering, cross-group movement, or legacy incidental behavior. This is a short verification phase, not a new discovery project.

## Locked deliverable

- Grades are the only reorderable entity.
- Club Grades come through Teams and are deduplicated by Grade CMS ID.
- Association Grades come through Competitions.
- Association groups are Competition-backed and ignore `group_assets_by`.
- Club groups use age classification and the four keys in the overview.
- Dragging never changes a server-derived group.
- The new visibility rules supersede legacy “all records” behavior.
- Fallback is deterministic; do not retain incidental CMS response order.

## Team tasks

1. Read the parent and child update `119953329` if Monday access is available.
2. Search all new feature branches/docs for “team ordering,” “cross-group,” and writes to `Grade.sortOrder`.
3. Confirm UI copy says “grades,” even if the legacy ticket title remains unchanged.
4. Confirm proposed DTOs use Grade IDs and derived group IDs, not draggable Team/Competition entities.
5. Record any contradiction before proceeding.

## Evidence of completion

- README contains the locked scope.
- Phase 07 DTOs and Phase 08 components conform to it.
- No production design includes Team ordering or cross-group moves.

## Exit gate

All team members and implementation artifacts use the same Grade-only vocabulary. Mark verified in the README progress log; do not spend a development cycle recreating the legacy discovery.
