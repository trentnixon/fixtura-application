# Competition Detail

Route: `/o/[accountId]/season/competitions/[competitionId]`

Status: Pending review

## Customer Purpose

Let customers inspect one competition and its available grades.

## Features To Prove

- [ ] Loads competition detail.
- [ ] Loads grades for the competition.
- [ ] Handles missing/inaccessible `competitionId`.
- [ ] Supports approved grade scrape action.
- [ ] Navigates to grade detail.

## Related API Routes

- `GET /api/season-hub/[accountId]/[...slug]`
- `POST /api/competition/trigger-grades-comps-single-scrape`

## Tests Required

- Unit/component: competition detail states and grade list states.
- API: invalid competition path and unauthorized account.
- Browser/manual: trigger scrape, refetch, navigate to grade.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
