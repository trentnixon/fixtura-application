# Sponsor Assignment Redirect

Route: `/o/[accountId]/manage-sponsors/assign`

Status: Pending review

## Customer Purpose

Route customers into the default sponsor assignment mode.

## Features To Prove

- [ ] Redirect target is intentional.
- [ ] Preserves `accountId`.
- [ ] Does not render a blank or confusing intermediate page.

## Related API Routes

- None expected.

## Tests Required

- Route/browser: redirects to `/o/[accountId]/manage-sponsors/assign/position` or the chosen default.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
