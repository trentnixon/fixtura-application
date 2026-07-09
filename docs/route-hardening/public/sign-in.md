# Sign In

Route: `/sign-in`

Status: Pending review

## Customer Purpose

Allow customers to authenticate and enter the correct organisation/account context.

## Features To Prove

- [ ] Email/password validation works before submit.
- [ ] Invalid credentials show customer-readable feedback.
- [ ] Successful sign-in redirects to the expected destination.
- [ ] Already-authenticated customers are redirected intentionally.
- [ ] Submit is disabled or guarded while pending.

## Related API Routes

- `POST /api/auth/login`
- `GET /api/auth/session`
- `GET /api/auth/me`
- `GET /api/account/me`

## Tests Required

- Unit/component: validation, pending state, invalid credentials, successful redirect.
- API: login rejects bad payloads and returns stable auth failures.
- Browser/manual: sign in with valid and invalid credentials.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
