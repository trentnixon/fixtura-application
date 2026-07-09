# Dashboard

Route: `/o/[accountId]/dashboard`

Status: Pending review

## Customer Purpose

Give customers a clear account overview covering organisation state, analytics, branding, sponsors, scheduler, and season progress.

## Features To Prove

- [ ] Loads the selected account context.
- [ ] Shows meaningful KPIs and operational status.
- [ ] Shows billing overview route card with link to `/billing`.
- [ ] Handles partial panel failures without making the whole route unusable.
- [ ] Does not expose debug payloads in production.
- [ ] Keeps data scoped to `accountId`.

## Related API Routes

- `GET /api/account/me`
- `GET /api/accounts/[accountId]/settings`
- `GET /api/accounts/[accountId]/branding`
- `GET /api/accounts/[accountId]/organisation`
- `GET /api/accounts/[accountId]/billing`
- `GET /api/orders/account/[accountId]`
- `GET /api/accounts/[accountId]/analytics/overview`
- `GET /api/accounts/[accountId]/sponsors`
- `GET /api/season-hub/[accountId]/[...slug]`
- `GET /api/template-modes/ui`

## Tests Required

- Unit: dashboard view model with full, empty, and partial data.
- Component: each panel loading/success/error state.
- API: account ownership and stable response shapes.
- Browser/manual: refresh route, switch account, mobile layout.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
