# Branding

Route: `/o/[accountId]/branding`

Status: Pending review

## Customer Purpose

Let customers configure the visual identity used in generated Fixtura assets.

## Features To Prove

- [ ] Loads current branding.
- [ ] Edits palette/template mode safely.
- [ ] Previews changes before or after save.
- [ ] Saves and invalidates/refetches relevant cache.
- [ ] Handles unavailable template assets.

## Related API Routes

- `GET /api/accounts/[accountId]/branding`
- `PATCH /api/accounts/[accountId]/branding`
- `GET /api/template-modes/ui`
- `GET /api/template-palettes/ui`

## Tests Required

- Unit: branding defaults and patch body creation.
- Component: edit, preview, save success, save failure.
- API: payload validation, account ownership, no private asset leakage.
- Browser/manual: change branding and confirm dashboard/template surfaces reflect it.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
