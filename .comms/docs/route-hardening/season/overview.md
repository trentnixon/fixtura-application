# Season Overview

Route: `/o/[accountId]/season`

Status: Pending review

## Customer Purpose

Let customers inspect season data readiness and navigate into competitions, grades, and fixtures.

## Features To Prove

- [ ] Loads season recon, stats, and competition list.
- [ ] Shows setup/onboarding state if season data is not ready.
- [ ] Supports approved scrape/refetch actions.
- [ ] Handles missing or partial season data.
- [ ] Navigates to competition detail.

## Related API Routes

- `GET /api/season-hub/[accountId]/[...slug]`
- `POST /api/association-overview-queues/trigger-association-single-scrape`

## Tests Required

- Unit: overview model and empty/partial data helpers.
- Component: recon, stats, competitions, trigger success/failure.
- API: season hub slug validation and account ownership.
- Browser/manual: navigate from overview to competition.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
