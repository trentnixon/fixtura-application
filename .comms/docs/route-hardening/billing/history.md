# Billing History

Route: `/o/[accountId]/billing/history`

Status: Pending review

## Customer Purpose

Let customers review billing orders and invoice request history.

## Features To Prove

- [ ] Lists order history.
- [ ] Lists invoice requests where applicable.
- [ ] Shows useful empty states.
- [ ] Handles failed history load with retry.

## Related API Routes

- `GET /api/accounts/[accountId]/billing/orders`
- `GET /api/accounts/[accountId]/billing/invoice-requests`
- `GET /api/accounts/[accountId]/billing`

## Tests Required

- Unit: history row formatting and status mapping.
- Component: empty, loading, error, success.
- API: pagination/ordering if supported and account ownership.
- Browser/manual: view billing history for account with and without orders.

## Production Sign-off

- Owner:
- Known gaps:
  - Stripe order totals may be stored in cents in CMS; app normalizes at display when `total === tier.price * 100` (see `resolveOrderTotalForDisplay`). CMS should persist dollars — see `billing/.comms/handoff/cms-followup-order-total-currency-units.md`.
- Test evidence:
- Production decision: Pending
