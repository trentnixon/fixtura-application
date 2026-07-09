# Session Expired

Route: `/session-expired`

Status: Pending review

## Customer Purpose

Help customers recover when their session is no longer valid.

## Features To Prove

- [ ] Explains the expired session without blaming the customer.
- [ ] Provides sign-in action.
- [ ] Clears stale client state where needed.
- [ ] Preserves intended destination only if safe.

## Related API Routes

- `GET /api/auth/session`
- `POST /api/auth/logout`

## Tests Required

- Component: renders recovery action.
- Browser/manual: expire or remove session, visit protected route, recover through sign-in.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
