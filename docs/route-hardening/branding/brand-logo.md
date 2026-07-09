# Brand Logo

Route: `/o/[accountId]/brand-logo`

Status: Pending review

## Customer Purpose

Let customers manage the logo used across generated assets and previews.

## Features To Prove

- [ ] Current logo state is clear.
- [ ] Upload/select flow validates file constraints.
- [ ] Preview works before save where applicable.
- [ ] Failed upload/save is recoverable.
- [ ] Saved logo appears in downstream branding surfaces.

## Related API Routes

- `GET /api/accounts/[accountId]/branding`
- `PATCH /api/accounts/[accountId]/branding`
- Confirm whether a dedicated brand logo upload route is used.

## Tests Required

- Unit/component: file validation and logo state rendering.
- API: file upload constraints if route exists.
- Browser/manual: upload/change logo and confirm persistence.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
