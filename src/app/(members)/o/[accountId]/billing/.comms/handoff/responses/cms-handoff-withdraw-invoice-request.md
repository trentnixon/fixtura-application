# CMS handoff: Withdraw / cancel invoice request (member)

**From:** CMS / Strapi  
**To:** App (frontend + Next BFF)  
**Date:** 2026-05-08

## Summary

- **Route:** `POST /api/accounts/:accountId/billing/invoice-requests/:invoiceRequestId/cancel`, body optional `{}`.
- **Permission:** `postAccountBillingCancelInvoiceRequest` (Authenticated role on deploy).
- **Gating:** `GET /billing` → `availableActions.canWithdrawInvoiceRequest` (respects restricted access). `latestInvoiceRequest` and each item on `GET …/billing/invoice-requests` include **`canWithdraw`** for UI.
- **Success:** 200 with `invoiceRequestId`, `noOp` (`true` when already cancelled — idempotent).
- **Conflict:** 409 when the request is no longer withdrawable (implementation-defined; e.g. payment received or order past cancel window).

**Full contract:** CMS repo `billing-contract-v1.d.ts` (or equivalent) is source of truth for response fields and error codes.

## FE wiring (this repo)

- BFF: `src/app/api/accounts/[accountId]/billing/invoice-requests/[invoiceRequestId]/cancel/route.ts`
- Client: `accountApi.postAccountBillingCancelInvoiceRequest`, `usePostAccountBillingCancelInvoiceRequest`
- Resolver: `resolveWithdrawableInvoiceRequestId` (banner)
- Payment-pending banner: shows **Withdraw invoice request** (preparing invoice) or **Cancel invoice request** (invoice issued, awaiting payment) when `availableActions.canWithdrawInvoiceRequest` and `latestInvoiceRequest.canWithdraw` are true — including after issue if CMS allows
