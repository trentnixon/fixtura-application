# Manage Sponsors

Route: `/o/[accountId]/manage-sponsors`

Status: Pending review

## Customer Purpose

Let customers view, edit, and manage active sponsors.

## Features To Prove

- [ ] Lists active sponsors.
- [ ] Shows empty state with create action.
- [ ] Supports edit and archive/delete flows.
- [ ] Shows sponsor logo and key metadata.
- [ ] Recovers from list and mutation failures.

## Related API Routes

- `GET /api/accounts/[accountId]/sponsors`
- `PATCH /api/accounts/[accountId]/sponsors/[sponsorId]`
- `DELETE /api/accounts/[accountId]/sponsors/[sponsorId]`
- `POST /api/accounts/[accountId]/sponsors/[sponsorId]/upload`

## Tests Required

- Unit: sponsor editor payloads and archive state.
- Component: list loading/empty/error, edit success/failure, archive confirmation.
- API: sponsor ownership and validation.
- Browser/manual: edit and archive a sponsor.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
