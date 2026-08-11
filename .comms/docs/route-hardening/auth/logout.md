# Logout

Route: `/logout`

Status: Pending review

## Customer Purpose

End the customer session and return the customer to a safe public/auth route.

## Features To Prove

- [ ] Clears server session.
- [ ] Clears stale client/query state where needed.
- [ ] Redirects to a safe destination.
- [ ] Handles logout API failure gracefully.

## Related API Routes

- `POST /api/auth/logout`
- `GET /api/auth/session`

## Tests Required

- Component/browser: visiting route logs out and redirects.
- API: logout is auth-safe and idempotent.
- Browser/manual: protected routes are inaccessible after logout.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
