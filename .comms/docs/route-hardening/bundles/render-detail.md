# Render Detail

Route: `/o/[accountId]/bundles/[renderId]`

Status: Pending review

## Customer Purpose

Let customers inspect one generated render and download available outputs.

## Features To Prove

- [ ] Loads render detail.
- [ ] Handles missing/inaccessible `renderId`.
- [ ] Shows downloads only when available.
- [ ] Handles failed and processing render states.
- [ ] Does not expose raw render tokens unless explicitly required.

## Related API Routes

- `GET /api/accounts/[accountId]/renders/[renderId]`
- `GET /api/accounts/[accountId]/render-token`

## Tests Required

- Unit: download availability and detail summary helpers.
- Component: detail loading, missing render, failed render, completed render downloads.
- API: render ownership and not-found behavior.
- Browser/manual: open completed render and download an asset.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
