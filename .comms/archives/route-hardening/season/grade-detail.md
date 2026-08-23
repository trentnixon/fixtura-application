# Grade Detail

Route: `/o/[accountId]/season/competitions/[competitionId]/grades/[gradeId]`

Status: Pending review

## Customer Purpose

Let customers inspect one grade, teams, and fixtures.

## Features To Prove

- [ ] Loads grade detail and fixtures.
- [ ] Handles missing/inaccessible `gradeId`.
- [ ] Supports teams lookup and fixture discovery triggers.
- [ ] Filters fixture list predictably.
- [ ] Navigates to fixture detail.

## Related API Routes

- `GET /api/season-hub/[accountId]/[...slug]`
- `POST /api/competition/trigger-grades-lookup-teams-single-scrape`
- `POST /api/grade/trigger-fixture-discovery`

## Tests Required

- Unit: fixture filters and grade view helpers.
- Component: grade loading/error/empty, fixture list, trigger success/failure.
- API: invalid grade path, trigger validation, account ownership.
- Browser/manual: trigger fixture discovery and open a fixture.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
