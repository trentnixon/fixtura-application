# Add Sponsor

Route: `/o/[accountId]/add-sponsor`

Status: Pending review

## Customer Purpose

Let customers create a sponsor that can be placed into generated assets.

## Features To Prove

- [ ] Sponsor form validates required fields.
- [ ] Logo upload/select flow is clear.
- [ ] Successful create updates sponsor lists.
- [ ] Failed create/upload is recoverable.
- [ ] Duplicate submit is prevented.

## Related API Routes

- `GET /api/accounts/[accountId]/sponsors`
- `POST /api/accounts/[accountId]/sponsors`
- `POST /api/accounts/[accountId]/sponsors/[sponsorId]/upload`

## Tests Required

- Unit: create sponsor payload and validation helpers.
- Component: create success, validation errors, API failure, upload failure.
- API: invalid payload, unauthorized account, upload constraints.
- Browser/manual: create sponsor and see it in manage sponsors.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
