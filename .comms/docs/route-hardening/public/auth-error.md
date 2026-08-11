# Auth Error

Route: `/auth-error`

Status: Pending review

## Customer Purpose

Give customers a recoverable state after authentication fails outside the normal form flow.

## Features To Prove

- [ ] Error copy is safe and non-technical.
- [ ] Route provides sign-in and support recovery actions.
- [ ] Query-string error details do not leak raw provider errors.

## Related API Routes

- Confirm whether this route reads auth/session state.

## Tests Required

- Component: generic error, known error variants, safe links.
- Browser/manual: simulate failed auth callback or direct visit.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
