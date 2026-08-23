# Phase 09: Browser and Staging Verification

## Goal

Verify the multi-account contract through real navigation, network responses, account switching, deletion, and ownership denial.

## Fixture prerequisite

Coordinate dedicated non-production users for:

- one user with two ongoing accounts;
- one user with an existing blank account;
- one user with a deletable unfinished account;
- a second user for cross-user denial.

Do not use production customer accounts. If fixtures are unavailable, mark this phase blocked with an owner and provisioning action; do not substitute unsafe data.

## Required browser matrix

1. Load selection with one ongoing account.
2. Choose **Create organisation** and record `200` or `201` plus returned id.
3. Confirm the wizard uses that exact id.
4. Return to selection and confirm both accounts appear.
5. Start create while the second account is blank and confirm the same id is reused.
6. Select a club or association, start create again, and confirm a different blank id is obtained.
7. Resume each unfinished account using its explicit id.
8. Switch between accounts across onboarding, billing, branding, fixtures, scheduler, and cached state.
9. Delete an eligible unfinished account and confirm it disappears only after success.
10. Exercise `ACCOUNT_DELETE_NOT_ALLOWED` where safely possible.
11. Request a nonexistent id and a cross-user id; confirm identical safe account-level behavior without fallback.
12. Confirm nested-resource not-found remains distinguishable where applicable.
13. Exercise or safely simulate `503 ACCOUNT_CREATE_BUSY` and verify retry UX and `Retry-After` handling.

## Evidence to record

- Environment and build identifier.
- Test-user identifiers that do not expose credentials.
- Route before and after each action.
- Request method, path, status, returned account id, and relevant headers.
- Visible organisation list and labels.
- Selected account id versus rendered data.
- Screenshots or recordings for critical states.
- Cache/state leakage observations.
- Deletion reconciliation behavior.
- Cross-user/nonexistent error presentation.

## Safety and cleanup

- Never record JWTs, cookies, internal tokens, or personal customer data.
- Delete disposable fixtures only through approved flows.
- Record remaining fixture accounts and cleanup ownership.
- Do not treat a staging-only configuration failure as application success.

## Acceptance criteria

- Create, blank reuse, and later new-blank behavior are evidenced with ids and statuses.
- Every owned account is visible and navigable explicitly.
- No tested account switch leaks previous-account data.
- Deletion changes the list only after confirmed outcome.
- Cross-user and nonexistent account ids behave identically without enumeration or fallback.
- Any untestable scenario has a named owner and follow-up.

## Handoff to Phase 10

Provide the evidence bundle, environment details, failures/retests, and remaining staging or CMS gates.

---

## Starting inputs from Phase 08 (2026-07-13)

Automated coverage for all 15 contract scenarios is recorded in [`08-automated-verification.md`](./08-automated-verification.md) (scenario → test map + Phase 09 browser checklist).

Do not mark browser acceptance from code inspection. Use dedicated non-production personas:

- user with two ongoing accounts;
- user with an existing blank account;
- user with a deletable unfinished account;
- second user for cross-user denial.

Behaviors that still require real network/navigation evidence are listed in the Phase 08 handoff checklist (create/reuse statuses, concurrent blank reuse, rapid A↔B cache leakage, live delete reconciliation, staging busy simulation).
