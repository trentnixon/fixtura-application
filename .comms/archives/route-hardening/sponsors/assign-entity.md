# Sponsor Assignment By Entity

Route: `/o/[accountId]/manage-sponsors/assign/entity`

Status: Pending review

## Customer Purpose

Let customers assign sponsors to specific teams, clubs, grades, fixtures, or other supported entities.

## Features To Prove

- [ ] Loads sponsor list and entity targets.
- [ ] Shows current entity allocations.
- [ ] Creates, updates, and removes allocations.
- [ ] Handles allocation conflicts and missing targets.
- [ ] Preview matches current branding/template context.

## Related API Routes

- `GET /api/accounts/[accountId]/sponsors`
- `GET /api/accounts/[accountId]/sponsor-entity-targets`
- `GET /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/entity/[entityType]/[entityId]`
- `POST /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/entity/[entityType]/[entityId]`
- `PATCH /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/entity/[entityType]/[entityId]/[allocationId]`
- `DELETE /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/entity/[entityType]/[entityId]/[allocationId]`
- `GET /api/accounts/[accountId]/branding`
- `GET /api/template-modes/ui`

## Tests Required

- Unit: entity assignment rules and preview state.
- Component: target loading, allocation create/update/delete, conflict errors.
- API: target ownership, allocation ownership, validation.
- Browser/manual: assign sponsor to an entity and refresh.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
