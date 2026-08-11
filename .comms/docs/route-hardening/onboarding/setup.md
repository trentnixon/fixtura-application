# Organisation Setup

Route: `/create-organisation/setup`

Status: Pending review

## Customer Purpose

Show provisioning/setup progress after onboarding and give customers a path to retry or continue.

## Features To Prove

- [ ] Pending, complete, failed, and retrying setup states.
- [ ] Polling/refetch behavior is controlled.
- [ ] Retry is available only when allowed.
- [ ] Completed setup routes to the correct account experience.

## Related API Routes

- `GET /api/accounts/[accountId]/onboarding/setup-status`
- `GET /api/accounts/[accountId]/onboarding/onboarding-state`
- `POST /api/accounts/[accountId]/onboarding/retry-setup`

## Tests Required

- Unit/component: all setup states and retry behavior.
- API: status shapes, unauthorized account, failed setup retry.
- Browser/manual: failed setup recovery and successful setup completion.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
