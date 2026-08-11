# Sponsor Assignment By Position

Route: `/o/[accountId]/manage-sponsors/assign/position`

Status: Pending review

## Customer Purpose

Let customers assign sponsors to general template positions or slots.

## Features To Prove

- [ ] Loads sponsor list and current general allocations.
- [ ] Creates, updates, and removes slot allocations.
- [ ] Handles unavailable slots and conflicts.
- [ ] Preview reflects placement and branding context.
- [ ] Mutation failures do not lose unsaved intent.

## Related API Routes

- `GET /api/accounts/[accountId]/sponsors`
- `GET /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/general`
- `POST /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/general`
- `PATCH /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/general/[allocationId]`
- `DELETE /api/accounts/[accountId]/sponsors/[sponsorId]/allocations/general/[allocationId]`
- `GET /api/accounts/[accountId]/branding`
- `GET /api/template-modes/ui`

## Tests Required

- Unit: slot assignment rules and preview state.
- Component: allocation create/update/delete and conflict errors.
- API: slot validation, allocation ownership, unauthorized account.
- Browser/manual: assign sponsor to slot and confirm persistence.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
