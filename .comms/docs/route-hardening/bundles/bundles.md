# Bundles

Route: `/o/[accountId]/bundles`

Status: Pending review

## Customer Purpose

Let customers view generated render bundles and their statuses.

## Features To Prove

- [ ] Lists renders with status and useful metadata.
- [ ] Supports pagination or list controls where available.
- [ ] Shows empty state when no renders exist.
- [ ] Handles queued, processing, failed, and completed statuses.
- [ ] Navigates to render detail.

## Related API Routes

- `GET /api/accounts/[accountId]/renders`
- `GET /api/accounts/[accountId]/scheduler`

## Tests Required

- Unit: render sorting and status label helpers.
- Component: loading, empty, error, paginated list, status variants.
- API: pagination, account ownership, empty list.
- Browser/manual: open render list and navigate to detail.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
