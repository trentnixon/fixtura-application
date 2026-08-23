# Club Logo Detail

Route: `/o/[accountId]/club-logos/[clubId]`

Status: Pending review

## Customer Purpose

Let customers upload or select a logo for one club.

## Features To Prove

- [ ] Loads selected club and current logo state.
- [ ] Handles invalid or inaccessible `clubId`.
- [ ] Upload flow validates file constraints.
- [ ] Save flow persists selected media/logo.
- [ ] Retry/cancel behavior is clear.

## Related API Routes

- `GET /api/accounts/[accountId]/club-logos-directory`
- `GET /api/accounts/[accountId]/branding`
- `POST /api/accounts/[accountId]/clubs/[clubId]/logo/upload`
- `PATCH /api/accounts/[accountId]/clubs/[clubId]/logo`

## Tests Required

- Unit/component: editor state, upload failure, save failure.
- API: account/club ownership and invalid upload handling.
- Browser/manual: update a club logo and return to directory.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
