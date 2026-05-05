# Billing — staging QA checklist (frontend)

Run this against **staging** before release. Record **Pass / Fail / N/A** and short notes. Link this sheet(or copy) from the release ticket.

**Related:** [frontend-billing-api-contract-handoff.md](./frontend-billing-api-contract-handoff.md), [billing-checkout-return-urls.md](./billing-checkout-return-urls.md).

## Prerequisites

| Item                                                                     | Ready |
| ------------------------------------------------------------------------ | ----- |
| Staging app URL + env points at staging CMS/Strapi                       | [ ]   |
| Stripe **test mode** (or staging keys) for Checkout                      | [ ]   |
| Two accounts: one **owned** by tester, one **not owned** (cross-account) | [ ]   |
| Success/cancel return URLs match billing return contract                 | [ ]   |
| Browser devtools: Network open for `/api/accounts/.../billing`           | [ ]   |

**Tester / date:** **\*\***\_\_\_**\*\***

## Customer Portal (decision)

**Expected (Option A — defer):** No “Customer portal” / `StripeCustomerPortal` button or flow. Only billing summary, plan checkout, invoice request per contract.

| Check                                                                             | Pass / Fail / N/A | Notes |
| --------------------------------------------------------------------------------- | ----------------- | ----- |
| No portal CTA that calls legacy `POST /api/orders/StripeCustomerPortal`           |                   |       |
| If Product later enables Option B, replace this row with portal URL + auth checks |                   |       |

## Test matrix

| Area                 | Scenario                                                                                                                                                | Pass / Fail / N/A | Notes                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| Checkout — success   | Complete Stripe test payment; land on `/o/{accountId}/billing` with success marker (`session_id`, `checkout_session_id`, or `billing_checkout=success`) |                   | Banner/refetch; params stripped; summary updates after webhook (may need wait or manual refresh) |
| Checkout — cancelled | Cancel or abandon Checkout; land with `billing_checkout=cancelled` (or agreed cancel marker)                                                            |                   | Refetch; URL cleaned; no false “paid” state                                                      |
| Invoice request      | Submit invoice form when allowed (`canRequestInvoice` or empty `availableActions` per legacy compat)                                                    |                   | `POST …/invoice-requests` 2xx; Latest invoice request updates                                    |
| Payment failed       | Failing test card **or** CMS shows failed/unpaid on `GET /billing`                                                                                      |                   | UI matches API; no crash; sensible copy or error/retry                                           |
| Cross-account        | Open `/o/{otherAccountId}/billing` logged in as user who does **not** own that account                                                                  |                   | 404 or safe denial; no enumeration hints                                                         |
| Auth failure         | Expired/invalid session (or logout mid-flow)                                                                                                            |                   | Login / session refresh; no stuck spinners                                                       |
| Responsive — mobile  | ~375px width: billing page, checkout card, invoice form                                                                                                 |                   | Readable, no bad overflow, tappable controls                                                     |
| Responsive — desktop | Wide viewport: same surfaces                                                                                                                            |                   | Layout acceptable                                                                                |

## Optional

| Area                                                   | Pass / Fail / N/A | Notes                             |
| ------------------------------------------------------ | ----------------- | --------------------------------- |
| BFCache / browser Back after Stripe                    |                   | Acceptable stale state or refetch |
| Hosted invoice link (`activeOrder.hosted_invoice_url`) |                   | Opens correctly if present        |

## Engineering verification (repo, local)

| Check                                                                               | Pass / Fail / N/A | Notes |
| ----------------------------------------------------------------------------------- | ----------------- | ----- |
| `grep` / code review: no `StripeCustomerPortal` in `src/**/*.ts(x)` except `.comms` |                   |       |

**Date completed:** **\*\***\_\_\_**\*\***
