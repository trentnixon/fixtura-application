# Club Logos

Route: `/o/[accountId]/club-logos`

Status: Pending review

## Customer Purpose

Let customers review club logo coverage for their competition/association context.

## Features To Prove

- [ ] Loads the club logo directory.
- [ ] Shows logo state per club.
- [ ] Handles empty and unavailable directory states.
- [ ] Links to individual club logo edit route.
- [ ] Keeps clubs scoped to the account context.

## Related API Routes

- `GET /api/accounts/[accountId]/club-logos-directory`
- `GET /api/accounts/[accountId]/branding`

## Tests Required

- Unit: directory view state and error message resolution.
- Component: loading, empty, error, success, retry.
- API: account ownership and unavailable directory response.
- Browser/manual: open directory and navigate to club detail.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
