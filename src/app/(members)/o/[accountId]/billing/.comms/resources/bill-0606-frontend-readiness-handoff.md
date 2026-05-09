# bill-0606 - Frontend readiness handoff (billing v1)

Formal sign-off gate for members billing aligned with [frontend-billing-api-contract-handoff.md](../response/frontend-billing-api-contract-handoff.md).

## Engineering criteria (this repo)

| Criterion                                                     | Status | Evidence                                                                                                                                                                                                                                           |
| ------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Billing UI reads from `GET /billing` (via BFF)                | Done   | [useAccountBilling.ts](../../../../../../../lib/api/hooks/account/useAccountBilling.ts), [BillingContent.tsx](../../overview/_components/BillingContent.tsx)                                                                                       |
| Plan selection uses `GET /billing/available-tiers`            | Done   | [useAccountBillingAvailableTiers.ts](../../../../../../../lib/api/hooks/account/useAccountBillingAvailableTiers.ts), [billing-plan-checkout.tsx](../../billing-plan-checkout.tsx)                                                                  |
| Card checkout uses `POST /billing/checkout`                   | Done   | [usePostAccountBillingCheckout.ts](../../../../../../../lib/api/hooks/account/usePostAccountBillingCheckout.ts)                                                                                                                                    |
| Invoice flow uses account-scoped invoice request endpoints    | Done   | [useAccountBillingInvoiceRequests.ts](../../../../../../../lib/api/hooks/account/useAccountBillingInvoiceRequests.ts), [usePostAccountBillingInvoiceRequest.ts](../../../../../../../lib/api/hooks/account/usePostAccountBillingInvoiceRequest.ts) |
| Start trial uses `POST /billing/start-trial`                  | Done   | [usePostAccountBillingStartTrial.ts](../../../../../../../lib/api/hooks/account/usePostAccountBillingStartTrial.ts)                                                                                                                                |
| Legacy Strapi order/tier routes not used from app             | Done   | See **Frontend legacy audit** in [frontend-billing-api-contract-handoff.md](../handoff/frontend-billing-api-contract-handoff.md)                                                                                                                   |
| Stripe Checkout return -> refetch billing (+ related queries) | Done   | [billing-checkout-return.ts](../../billing-checkout-return.ts), [BillingContent.tsx](../../overview/_components/BillingContent.tsx)                                                                                                                |
| Customer portal deferred                                      | Done   | [stripe-customer-portal-decision.md](./stripe-customer-portal-decision.md)                                                                                                                                                                         |
| Types aligned with contract                                   | Done   | [account.ts](../../../../../../../types/api/account.ts) (`Account billing v1`)                                                                                                                                                                     |

## Staging / release

Complete [staging-qa-checklist.md](./staging-qa-checklist.md) for each release that touches billing (environments differ; this file does not replace QA).

## Sign-off

| Role        | Name | Date | Signature |
| ----------- | ---- | ---- | --------- |
| Engineering |      |      |           |
| Product     |      |      |           |

Until the table is filled, **PR review + passing `npm run typecheck` + billing Vitest** remain the minimum merge gate for billing changes.
