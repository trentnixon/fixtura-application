# Billing Success

Route: `/o/[accountId]/billing/success`

Status: Pending review

## Customer Purpose

Confirm a successful billing return and route customers back to billing or product usage.

## Features To Prove

- [ ] Shows success state only when safe.
- [ ] Refetches current billing summary.
- [ ] Handles delayed provider/backend reconciliation.
- [ ] Provides next action.

## Related API Routes

- `GET /api/accounts/[accountId]/billing`
- `GET /api/accounts/[accountId]/billing/orders`

## Tests Required

- Component/browser: direct visit, successful provider return, delayed reconciliation.
- API: active order state after provider return.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
