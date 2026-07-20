# Select Organisation

Route: `/select-organisation`

Status: Pending review

## Customer Purpose

Let customers choose the organisation/account they want to work in.

## Features To Prove

- [ ] Handles zero-account, one-account, and multi-account customers.
- [ ] Shows account load failures with retry.
- [ ] Routes customers with incomplete onboarding to the correct next step.
- [ ] Prevents access to accounts the customer does not belong to.

## Related API Routes

- `GET /api/account/me`
- `GET /api/accounts/[accountId]/onboarding/onboarding-state`

## Tests Required

- Unit/component: account list states, retry state, onboarding redirect decision.
- API: account list excludes inaccessible accounts.
- Browser/manual: choose organisation and land in expected account dashboard/setup route.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
