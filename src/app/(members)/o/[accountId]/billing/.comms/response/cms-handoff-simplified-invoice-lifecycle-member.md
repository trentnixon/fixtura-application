# CMS → Member Application handoff — Simplified invoice lifecycle

**Date:** 2026-07-24  
**Source:** Monday CMS package [2801881904](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2801881904) (Done)  
**Backend handoff path (SoT):** `.comms/accounts/handoff/cms-handoff-admin-invoice-workspace.md`  
**Application ticket:** [2801897240](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2801897240)

## Purpose

Member billing, order history, and access must react to **authoritative order fields** returned by CMS. The Application does **not** drive invoice-request FSM transitions.

## Lifecycle (invoice-request statuses — CMS/Admin only)

`invoice_received` → `invoice_created` → `paid`, with exits `declined` / `cancelled`.

Member UI must **not** key entitlements or awaiting-payment banners on these strings.

## Account-order fields (Member reads)

| Field              | History (`GET /orders/account/:id`)              | Summary `activeOrder` (`GET /billing`) |
| ------------------ | ------------------------------------------------ | -------------------------------------- |
| Hosted invoice URL | `hostedInvoiceUrl` (snake: `hosted_invoice_url`) | `hosted_invoice_url`                   |
| PDF URL            | `invoicePdfUrl` (snake: `invoice_pdf`)           | `invoice_pdf`                          |
| Checkout           | `checkoutStatus`                                 | `checkout_status`                      |
| Payment            | `paymentStatus`                                  | `payment_status`                       |
| Paid flag          | `isPaid` (helpers also accept `orderPaid`)       | `OrderPaid`                            |
| Active             | `isActive`                                       | `isActive`                             |
| Channel            | `paymentChannel`                                 | `payment_channel`                      |

## Order state after CMS transitions

### Invoice created (`invoice_created`)

- `checkoutStatus` / `checkout_status`: `invoice_issued`
- `paymentStatus` / `payment_status`: `unpaid`
- Paid flag: `false`
- `isActive`: `false`
- At least one invoice URL may be present (hosted and/or PDF)

Member outcome: awaiting-payment messaging; invoice open/download actions; paid access **disabled**.

### Paid

- `paymentStatus`: `paid`
- Paid flag: `true`
- `isActive`: `true`
- `checkoutStatus`: `active` (confirmed Application default from CMS paid-transition proposal)

Member outcome: awaiting-payment cleared; paid/active presentation; subscription access enabled.

### Cancelled (after invoice created)

CMS clears awaiting-payment eligibility in the same transition transaction.

Application cancelled signals (fail-safe):

- Must **not** satisfy awaiting-payment (`invoice_issued` + unpaid + not paid + inactive)
- Cancel-like checkout/payment: `cancelled`, `canceled`, or `incomplete_expired`
- `isActive`: `false`
- Unpaid / not paid

**URL retention:** Historical hosted/PDF URLs may remain. Present as document links (View invoice / Download invoice), **never** as a current Pay action.

### Mixed-version

CMS package is always-on for the simplified statuses (no rollout flag in this env). Application still fails closed on unknown/contradictory combinations (no crash, no unlock, no pay CTA).

## Application ownership

- Display invoice links from order data
- Derive awaiting-payment, paid/active, cancelled presentation
- Access gating from order + billing summary (not IR status)
- Loading, errors, accessibility, tests

## Non-ownership

- Invoice-request transitions, email, setting payment/activation/checkout flags
- Repairing linked orders or deciding payment success
