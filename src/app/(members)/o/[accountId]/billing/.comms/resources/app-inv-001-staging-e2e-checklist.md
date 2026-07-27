# APP-INV-001 — Staging E2E checklist (simplified invoice lifecycle)

**Date:** 2026-07-24  
**Monday:** [2801897240](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2801897240) / subitem [2801882349](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2801882349)  
**Contract:** [cms-handoff-simplified-invoice-lifecycle-member.md](../response/cms-handoff-simplified-invoice-lifecycle-member.md)

## Status

Blocked on disposable CMS invoice fixtures (Admin create → paid → cancel). Local unit/component coverage is green.

## Automated (local)

- [x] `invoiceOrderState.test.ts`
- [x] `orderInvoiceLinks.test.ts`
- [x] `billingPaymentPending.test.ts`
- [x] `billing-state.test.ts` (incl. cancelled not pending)
- [x] `OrdersTableInvoiceActions.test.tsx`
- [x] Related history/dashboard billing tests

## Manual / staging (when CMS fixtures ready)

Use a disposable account. Confirm GET `/billing` + GET `/billing/orders` after each CMS transition (no full browser restart; soft refresh / refetch is enough).

1. [ ] Invoice created — hosted URL only → Pay/View invoice action; awaiting-payment banner; access locked
2. [ ] Invoice created — PDF URL only → Download invoice; awaiting-payment; access locked
3. [ ] Invoice created — both URLs → Pay invoice + Download; awaiting-payment; access locked
4. [ ] Awaiting-payment banner copy shows issued / payment required / access inactive
5. [ ] Paid subscription routes remain gated before payment
6. [ ] CMS marks order paid + active (`paymentStatus=paid`, paid flag true, `isActive=true`, `checkoutStatus=active|complete`)
7. [ ] Soft refresh / query refetch clears awaiting-payment banner
8. [ ] Access unlocks for paid+active (overview `paid_active`, dashboard billing card)
9. [ ] CMS cancels issued invoice (cancel-like checkout/payment; not `invoice_issued` awaiting AND)
10. [ ] Payment messaging and Pay invoice CTA gone; historical View/Download only if URLs retained
11. [ ] Hard refresh + new session preserve paid / cancelled / awaiting states
12. [ ] Unknown/contradictory order fields do not unlock access or show Pay invoice

## Out of scope for Application E2E

- Invoice-request FSM transitions (CMS/Admin)
- Sending invoice email
- Setting payment/activation flags from the Member app

## Results log

| Date       | Env   | Result                | Notes                               |
| ---------- | ----- | --------------------- | ----------------------------------- |
| 2026-07-24 | local | PASS (unit/component) | Staging matrix pending CMS fixtures |
