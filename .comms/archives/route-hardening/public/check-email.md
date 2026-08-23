# Check Email

Route: `/check-email`

Status: Pending review

## Customer Purpose

Confirm to customers that an auth or recovery email action has been sent and provide a clear next step.

## Features To Prove

- [ ] Copy is generic and avoids account enumeration.
- [ ] Route provides a safe way back to sign-in/support.
- [ ] Route handles direct visits without required state.

## Related API Routes

- Usually none; confirm whether query params or session state are used.

## Tests Required

- Component: renders safe copy and navigation actions.
- Browser/manual: direct visit and visit after password recovery request.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
