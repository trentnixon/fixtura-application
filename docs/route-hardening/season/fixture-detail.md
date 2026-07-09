# Fixture Detail

Route: `/o/[accountId]/season/competitions/[competitionId]/grades/[gradeId]/fixtures/[fixtureId]`

Status: Pending review

## Customer Purpose

Let customers inspect fixture details, teams, scores, and result metadata.

## Features To Prove

- [ ] Loads fixture detail.
- [ ] Shows score/result state clearly.
- [ ] Handles missing/inaccessible `fixtureId`.
- [ ] Supports approved result scrape trigger.
- [ ] Recovers from partial scorecard data.

## Related API Routes

- `GET /api/season-hub/[accountId]/[...slug]`
- `POST /api/game-meta-data/trigger-result-single-scrape`

## Tests Required

- Unit: fixture detail model, scorecard rows, score display.
- Component: loading, no result, result available, scrape success/failure.
- API: invalid fixture path, trigger validation, account ownership.
- Browser/manual: open fixture, trigger result scrape, return to grade.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
