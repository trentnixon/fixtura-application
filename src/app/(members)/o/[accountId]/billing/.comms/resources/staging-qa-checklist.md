# Billing - staging QA checklist (frontend)

Run this against **staging** before release. Record **Pass / Fail / N/A** and short notes. Link this sheet(or copy) from the release ticket.

**Related:** [frontend-billing-api-contract-handoff.md](../response/frontend-billing-api-contract-handoff.md), [billing-checkout-return-urls.md](./billing-checkout-return-urls.md), [stripe-customer-portal-decision.md](./stripe-customer-portal-decision.md), [app-trial-frontend-handoff.md](../handoff/app-trial-frontend-handoff.md).

## Repo contract map (BFF -> TypeScript)

Use this when reconciling **staging JSON** with types in [`src/types/api/account.ts`](../../../../../../../types/api/account.ts). App calls **Next BFF** `/api/accounts/{accountId}/billing/...` (cookie session); BFF forwards to Strapi with JWT.

| Strapi / BFF role      | Method + path suffix                | Top-level response shape                             | Primary type(s)                                                        |
| ---------------------- | ----------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Billing summary        | `GET .../billing`                   | `{ data: BillingSummary }`                           | `AccountBillingResponse` -> `AccountBillingSummaryV1`                  |
| Available tiers        | `GET .../billing/available-tiers`   | `{ tiers: [...] }`                                   | `AccountBillingAvailableTiersResponse`, `AvailableBillingTier`         |
| Checkout               | `POST .../billing/checkout`         | `{ checkoutSessionId, checkoutUrl?, orderId }`       | `CreateCheckoutResponse`, `PostAccountBillingCheckoutRequest`          |
| Start trial            | `POST .../billing/start-trial`      | `{ trialId?, status?, message? }`                    | `StartAccountBillingTrialResponse`                                     |
| Invoice requests list  | `GET .../billing/invoice-requests`  | `{ invoiceRequests: [...] }`                         | `AccountBillingInvoiceRequestsResponse`, `InvoiceRequestSummary`       |
| Invoice request submit | `POST .../billing/invoice-requests` | `{ invoiceRequestId, status, submittedAt, message }` | `CreateInvoiceRequestResponse`, `PostAccountBillingInvoiceRequestBody` |
| Orders by account      | `GET .../billing/orders`            | `{ accountId, orders, meta }`                        | `AccountBillingOrdersResponse`, `AccountBillingOrderHistoryDto`        |

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

**Expected (Option A - defer):** No "Customer portal" / `StripeCustomerPortal` button or flow. Only billing summary, plan checkout, invoice request per contract.

| Check                                                                             | Pass / Fail / N/A | Notes |
| --------------------------------------------------------------------------------- | ----------------- | ----- |
| No portal CTA that calls legacy `POST /api/orders/StripeCustomerPortal`           |                   |       |
| If Product later enables Option B, replace this row with portal URL + auth checks |                   |       |

## Test matrix

| Area                            | Scenario                                                                                                                                                                                                                          | Pass / Fail / N/A | Notes                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| Free trial - start (legacy row) | Account with `GET /billing` showing `trial_available` + CMS `canStartTrial`; click Start; expect `POST .../billing/start-trial`, refetch `GET /billing`, active trial summary; checkout/invoice hidden until past trial-available |                   | Superseded by org-trial matrix below; keep for regression                                        |
| Checkout - success              | Complete Stripe test payment; land on `/o/{accountId}/billing` with success marker (`session_id`, `checkout_session_id`, or `billing_checkout=success`)                                                                           |                   | Banner/refetch; params stripped; summary updates after webhook (may need wait or manual refresh) |
| Checkout - cancelled            | Cancel or abandon Checkout; land with `billing_checkout=cancelled` (or agreed cancel marker)                                                                                                                                      |                   | Refetch; URL cleaned; no false "paid" state                                                      |
| Invoice request                 | Submit invoice form when allowed (`canRequestInvoice` or empty `availableActions` per legacy compat)                                                                                                                              |                   | `POST .../invoice-requests` 2xx; Latest invoice request updates                                  |
| Payment failed                  | Failing test card **or** CMS shows failed/unpaid on `GET /billing`                                                                                                                                                                |                   | UI matches API; no crash; sensible copy or error/retry                                           |
| Cross-account                   | Open `/o/{otherAccountId}/billing` logged in as user who does **not** own that account                                                                                                                                            |                   | 404 or safe denial; no enumeration hints                                                         |
| Auth failure                    | Expired/invalid session (or logout mid-flow)                                                                                                                                                                                      |                   | Login / session refresh; no stuck spinners                                                       |
| Responsive - mobile             | ~375px width: billing page, checkout card, invoice form                                                                                                                                                                           |                   | Readable, no bad overflow, tappable controls                                                     |
| Responsive - desktop            | Wide viewport: same surfaces                                                                                                                                                                                                      |                   | Layout acceptable                                                                                |

## Staff - immediate Stripe invoice (wizard)

Uses **direct Strapi** `POST /api/orders/stripe/create-invoice` from a Next **server action** (cookie JWT). Prerequisites: CMS route deployed; staff role has `createStripeInvoice`; tester user matches **staff/eligible** UX gate (`availableActions.canCreateStripeInvoice` or staff-like role - see `.comms/Stripe/planning/fe-wizard-generate-invoice-planning.md`).

| Check                                                                                                           | Pass / Fail / N/A | Notes |
| --------------------------------------------------------------------------------------------------------------- | ----------------- | ----- |
| Wizard step **4 . invoice path**: **Generate Stripe invoice** returns 200; polling surfaces **Pay online** link |                   |       |
| Hosted invoice loads in Stripe test mode                                                                        |                   |       |
| After pay: `invoice.paid` webhook; app poll shows paid / refreshed `GET .../billing`                            |                   |       |

## Optional

| Area                                                   | Pass / Fail / N/A | Notes                             |
| ------------------------------------------------------ | ----------------- | --------------------------------- |
| BFCache / browser Back after Stripe                    |                   | Acceptable stale state or refetch |
| Hosted invoice link (`activeOrder.hosted_invoice_url`) |                   | Opens correctly if present        |

## Phase 1 purchase-flow polish

Use this addendum for the Season Pass purchase polish pass added on 2026-05-10.

| Area                  | Scenario                                                                                                        | Pass / Fail / N/A | Notes |
| --------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------- | ----- |
| Encoding              | Walk `/o/{accountId}/billing/create`; confirm no visible mojibake or replacement characters appear.             |                   |       |
| Timeframe copy        | Step 1 is framed as choosing a Season Pass and explains that the selected pass controls the coverage window.    |                   |       |
| Review coverage       | Card and invoice review steps show selected pass, coverage/timeframe, start date, payment method, and total.    |                   |       |
| Single payment method | Account with only card or only invoice available still shows the resolved payment method on the review step.    |                   |       |
| Mobile polish         | At ~375px width, Step 1 and both review steps remain readable with no text overflow or clipped primary actions. |                   |       |

## Phase 4 confirmation and recovery UX

Use this addendum for the post-purchase and pending-payment polish added on 2026-05-12.

| Area                        | Scenario                                                                                                       | Pass / Fail / N/A | Notes |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------- | ----- |
| Invoice request success     | Submit invoice request; show in-flow confirmation with Back to billing and View billing history actions.       |                   |       |
| Confirmation persistence    | After submit/refetch, confirmation remains visible instead of immediately redirecting away from the wizard.    |                   |       |
| Pending Stripe guidance     | Checkout-pending banner explains resume/discard options clearly where available.                               |                   |       |
| Pending invoice guidance    | Invoice request pending and invoice issued copy explain what happens next in plain language.                   |                   |       |
| Support CTA                 | Pending-payment banner shows Contact billing support CTA.                                                      |                   |       |
| No purchase paths available | Create flow explains when Season Pass actions are unavailable and gives billing/support guidance.              |                   |       |
| No plans available          | Empty plan list explains that no Season Pass plans are currently available and points to support/billing next. |                   |       |

## Organisation free trial (APP-TRIAL-007)

Run on staging `/o/{accountId}/billing`. Open Network for `/api/accounts/.../billing` and `.../billing/start-trial`. Use `?debug=1` to inspect `organisationTrial` and derived presentation. Authoritative contract: [Backend cms-handoff-bill-trial-012-013](../../../../../../../../Backend/.comms/accounts/handoff/cms-handoff-bill-trial-012-013-frontend-integration.md).

**Prerequisites (org-trial):**

| Item                                                                                                      | Ready |
| --------------------------------------------------------------------------------------------------------- | ----- |
| Staging accounts covering eligible, active-here, active-elsewhere, used, unresolved, billing-blocked orgs | [ ]   |
| Two accounts under same org (for active-elsewhere)                                                        | [ ]   |
| CMS env: start-trial enabled (not kill-switched) unless testing 503 row                                   | [ ]   |

| Scenario          | What to verify                                                                                   | Pass / Fail / N/A | Notes |
| ----------------- | ------------------------------------------------------------------------------------------------ | ----------------- | ----- |
| Eligible org      | Start visible; POST succeeds; refetch shows active trial with CMS dates (not client-predicted)   |                   |       |
| Active here       | No Start; active-trial UI with CMS dates                                                         |                   |       |
| Active elsewhere  | Org notice; no Start; no other-account IDs, emails, or billing details exposed                   |                   |       |
| Used (ended)      | Org notice; paid-plan CTAs when CMS allows                                                       |                   |       |
| Unresolved org    | Fail-closed; support/unavailable notice; no Start; `organisationTrial` may omit status fields    |                   |       |
| Billing-blocked   | No org notice; billing/checkout UX owns screen (`blocked_by_billing` or paid/pending precedence) |                   |       |
| Idempotent retry  | POST returns `already_active`; refetch; no duplicate UI                                          |                   |       |
| 503 kill-switch   | Stable copy + Retry-After when CMS returns `TRIAL_ALLOCATION_DISABLED`                           |                   |       |
| Org conflict race | POST `TRIAL_ALREADY_CONSUMED`; refetch replaces stale Start UI with used or active-elsewhere     |                   |       |

## Frontend sign-off (APP-TRIAL-007)

Static checks (repo/local). Record Pass / Fail / N/A before release.

| Check                                                                                                                                           | Pass / Fail / N/A | Notes                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| No legacy `POST /trial-instances` usage in `src/`                                                                                               | Pass              | 2026-07-22: no matches in `src/` (docs only)                           |
| Start-trial UI driven by `availableActions.canStartTrial` + org presentation                                                                    | Pass              | Covered by 177 vitest + Route Lab matrix                               |
| Org-consumed / active-elsewhere states show appropriate messaging                                                                               | Pass              | Component + fixture tests                                              |
| POST errors mapped by stable `error.code` (not message text)                                                                                    | Pass              | billingTrialStart + BFF route tests                                    |
| Billing refetch after mutation verified (local tests + staging)                                                                                 | Pass (local)      | Mutation hook tests; staging POST/refetch pending                      |
| Dashboard billing card: "Start trial" CTA label only when `free_trial_available`; billing overview still double-gates Start on org presentation | Pass              | No `useBillingTrialStart` in dashboard; build-organisation-route-cards |

## Engineering verification (repo, local)

| Check                                                                                                  | Pass / Fail / N/A | Notes               |
| ------------------------------------------------------------------------------------------------------ | ----------------- | ------------------- |
| `grep` / code review: no `StripeCustomerPortal` in `src/**/*.ts(x)` except `.comms`                    | Pass              | 2026-07-22          |
| `grep`: no `trial-instances` or `useTrial` in `src/`                                                   | Pass              | 2026-07-22          |
| `grep`: no `useBillingTrialStart` under dashboard (Start mutation billing-only)                        | Pass              | 2026-07-22          |
| `npm run typecheck`                                                                                    | Pass              | 2026-07-22          |
| Vitest org-trial suite (see [app-trial-frontend-handoff.md](../handoff/app-trial-frontend-handoff.md)) | Pass              | 177 tests, 11 files |

**Date completed (local/static):** 2026-07-22  
**Live staging matrix:** Pending — see [app-trial-007-sign-off.md](./app-trial-007-sign-off.md)
