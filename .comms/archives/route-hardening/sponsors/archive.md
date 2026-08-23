# Sponsor Archive

Route: `/o/[accountId]/manage-sponsors/archive`

Status: Pending review

## Customer Purpose

Let customers review archived or inactive sponsors.

## Features To Prove

- [ ] Lists archived sponsors or a useful empty state.
- [ ] Clarifies whether archived sponsors can be restored.
- [ ] Handles API failure with retry.
- [ ] Does not mix active and archived state accidentally.

## Related API Routes

- `GET /api/accounts/[accountId]/sponsors`
- Confirm whether restore uses `PATCH /api/accounts/[accountId]/sponsors/[sponsorId]`.

## Tests Required

- Unit/component: archive filtering and empty/error states.
- API: archived sponsor shape and account ownership.
- Browser/manual: archive sponsor then view archive.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
