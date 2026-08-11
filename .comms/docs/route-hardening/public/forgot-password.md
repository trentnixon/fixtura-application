# Forgot Password

Route: `/forgot-password`

Status: Pending review

## Customer Purpose

Let customers request a password reset without leaking whether an email is registered.

## Features To Prove

- [ ] Email validation works before submit.
- [ ] Success state is generic and safe.
- [ ] Failure state is customer-readable and retryable.
- [ ] Submit is guarded while pending.

## Related API Routes

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Tests Required

- Unit/component: validation, success copy, failure copy, pending state.
- API: invalid payload, upstream failure, rate-limit behavior if available.
- Browser/manual: request reset and verify check-email path.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
