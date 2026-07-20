# Create Organisation

Route: `/create-organisation`

Status: Pending review

## Customer Purpose

Guide new customers through creating and configuring their first organisation/account.

## Features To Prove

- [ ] Step 1 organisation details and permissions.
- [ ] Step 2 branding, theme, and logo upload.
- [ ] Step 3 contact and delivery details.
- [ ] Review and confirmation step.
- [ ] Recovery for partial progress and unfinished accounts.

## Related API Routes

- `GET /api/account/me`
- `POST /api/account/first`
- `GET /api/account/onboarding/lookups/sports`
- `GET /api/account/onboarding/lookups/organisation-types`
- `GET /api/account/onboarding/lookups/associations`
- `GET /api/account/onboarding/lookups/clubs`
- `GET /api/account/onboarding/lookups/themes`
- `PATCH /api/accounts/[accountId]/onboarding/step-1`
- `PATCH /api/accounts/[accountId]/onboarding/step-2`
- `POST /api/accounts/[accountId]/onboarding/step-2/upload`
- `POST /api/accounts/[accountId]/onboarding/step-2/theme`
- `PATCH /api/accounts/[accountId]/onboarding/step-3`
- `POST /api/accounts/[accountId]/onboarding/confirm`
- `DELETE /api/accounts/[accountId]`

## Tests Required

- Unit: payload builders, wizard state, lookup mapping.
- Component: each step validation, save failures, upload failures, review submit.
- API: lookup validation, write validation, unauthorized account.
- Browser/manual: complete onboarding from a zero-account state.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
