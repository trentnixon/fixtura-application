# Media Gallery

Route: `/o/[accountId]/media-gallery`

Status: Pending review

## Customer Purpose

Let customers browse account media that can be used in templates or generated outputs.

## Features To Prove

- [ ] Loads account media library.
- [ ] Shows useful empty state.
- [ ] Opens media detail when applicable.
- [ ] Handles broken or missing media assets.
- [ ] Keeps media scoped to `accountId`.

## Related API Routes

- `GET /api/accounts/[accountId]/media-library`
- `GET /api/accounts/[accountId]/media-library/[mediaId]`
- `GET /api/assets/list-for-selection`

## Tests Required

- Unit/component: media item display, empty state, error state.
- API: media ownership and missing media behavior.
- Browser/manual: browse media gallery on mobile and desktop.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
