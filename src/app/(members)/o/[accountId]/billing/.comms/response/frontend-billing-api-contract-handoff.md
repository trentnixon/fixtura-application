# Frontend Billing API Contract Handoff

## Purpose

This is the frontend-facing handoff for account-scoped billing v1.

Use this for implementation.

**Canonical TypeScript shapes for account billing live in this repo at [`src/types/api/account.ts`](../../../../../../../types/api/account.ts)** (`AvailableBillingTier`, `AccountBillingSummaryV1`, etc.).

**Available tiers wire shape:** authoritative CMS→FE contract is [`frontend-handoff-billing-available-tiers.md`](./frontend-handoff-billing-available-tiers.md) — **camelCase v1** `{ tiers: AvailableBillingTier[] }`. Any older PascalCase tier examples (`Name`, `Title`, `stripe_price_id`) are **superseded** by that document.

**Open request to CMS (pending backend):** [Discard / delete pending order](../handoff/cms-request-delete-pending-order.md) — account-scoped mutation so members can remove in-flight unpaid orders and unblock new checkout/invoice flows.

## Required Frontend Context

The frontend must have:

- `accountId`: current selected Strapi account id
- JWT: `Authorization: Bearer <token>`
- API base URL: `{STRAPI_URL}/api`

All routes below are account-scoped and require the authenticated user to own the account.

## Endpoints

| Need                   | Method | Path                                                                     | Response                                                       |
| ---------------------- | ------ | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Billing summary        | GET    | `/accounts/:accountId/billing`                                           | `{ data: BillingSummary }`                                     |
| Available tiers        | GET    | `/accounts/:accountId/billing/available-tiers`                           | `{ tiers: AvailableBillingTier[] }`                            |
| Start Stripe checkout  | POST   | `/accounts/:accountId/billing/checkout`                                  | `CreateCheckoutResponse`                                       |
| Start free trial       | POST   | `/accounts/:accountId/billing/start-trial`                               | `{ trialId: string; status: string; message?: string }`        |
| List invoice requests  | GET    | `/accounts/:accountId/billing/invoice-requests`                          | `{ invoiceRequests: InvoiceRequestSummary[] }`                 |
| Submit invoice request | POST   | `/accounts/:accountId/billing/invoice-requests`                          | `CreateInvoiceRequestResponse`                                 |
| Cancel invoice request | POST   | `/accounts/:accountId/billing/invoice-requests/:invoiceRequestId/cancel` | `CancelInvoiceRequestResponse` (`noOp` when already cancelled) |

## Auth And Permissions

Frontend sends:

```http
Authorization: Bearer <jwt>
```

Backend Users & Permissions scopes:

| Endpoint                                                  | Scope                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| `GET /billing`                                            | `api::account.account.getAccountBilling`                      |
| `GET /billing/available-tiers`                            | `api::account.account.getAccountBillingAvailableTiers`        |
| `POST /billing/checkout`                                  | `api::account.account.postAccountBillingCheckout`             |
| `POST /billing/start-trial`                               | `api::account.account.postAccountBillingStartTrial`           |
| `GET /billing/invoice-requests`                           | `api::account.account.getAccountBillingInvoiceRequests`       |
| `POST /billing/invoice-requests`                          | `api::account.account.postAccountBillingInvoiceRequest`       |
| `POST /billing/invoice-requests/:invoiceRequestId/cancel` | `api::account.account.postAccountBillingCancelInvoiceRequest` |

## Billing Summary

Request:

```http
GET {STRAPI_URL}/api/accounts/{accountId}/billing
Authorization: Bearer <jwt>
```

Response:

```ts
{
  data: BillingSummary;
}
```

Important fields:

- `billingStatus`: lifecycle state for billing UI (**during an active free trial this may be `active` because the synthetic trial order counts as paid-in-window entitlement — use `trial.isActive` and tier labels for “trialing” UX**)
- `accessStatus`: access gate state
- `currentPlan`: current plan or `null`
- `trial`: trial eligibility and active state
- `activeOrder`: current paid entitlement order or `null`
- `latestInvoiceRequest`: newest invoice request or `null`
- `availableActions`: booleans that should drive visible user actions

Frontend should treat `GET /billing` as the single source of truth after checkout, invoice request, admin invoice changes, or webhook updates.

## Available Tiers

Request:

```http
GET {STRAPI_URL}/api/accounts/{accountId}/billing/available-tiers
Authorization: Bearer <jwt>
```

Response:

```ts
{
  tiers: AvailableBillingTier[]
}
```

Use this for plan selection. Tiers are already filtered for the account where possible.

**Full field list, behaviour, error codes, and TypeScript:** see **[`frontend-handoff-billing-available-tiers.md`](./frontend-handoff-billing-available-tiers.md)** (camelCase v1 — `name`, `category`, `daysInPass`, `priceByWeekInPass`, `includedAssetTypes`, etc.). Do not implement against legacy PascalCase tier keys for this endpoint.

## Start Stripe Checkout

Request:

```http
POST {STRAPI_URL}/api/accounts/{accountId}/billing/checkout
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "subscriptionTierId": "12",
  "startDate": "2026-05-10"
}
```

Notes:

- `subscriptionTierId` may be sent as a string or number if the frontend normalizes loosely, but the contract type is string.
- `startDate` must be an ISO-compatible future/current date.
- `couponId` is ignored in v1. Stripe hosted promotion codes are enabled on the Checkout session.

Response:

```ts
{
  checkoutSessionId: string;
  checkoutUrl?: string;
  orderId: string;
}
```

Frontend flow:

1. Call checkout endpoint.
2. Redirect to `checkoutUrl`.
3. On return from Stripe, refresh `GET /billing`.
4. Do not call a legacy confirm endpoint. Stripe webhook updates the order.

## Submit Invoice Request

Request:

```http
POST {STRAPI_URL}/api/accounts/{accountId}/billing/invoice-requests
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "subscriptionTierId": "12",
  "requestedStartDate": "2026-06-01T00:00:00.000Z",
  "billingContactName": "Jane Example",
  "billingEmail": "billing@example.com",
  "billingOrganisationName": "Example Assoc",
  "billingAddress": {
    "line1": "1 Test St",
    "line2": "",
    "city": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "AU"
  },
  "notes": ""
}
```

Response:

```ts
{
  invoiceRequestId: string;
  status: "submitted";
  submittedAt: string;
  message: string;
}
```

After submit, refresh `GET /billing` and show `latestInvoiceRequest`.

## List Invoice Requests

Request:

```http
GET {STRAPI_URL}/api/accounts/{accountId}/billing/invoice-requests
Authorization: Bearer <jwt>
```

Response:

```ts
{
  invoiceRequests: InvoiceRequestSummary[]
}
```

Use for invoice request history if the UI needs more than the latest request shown in `GET /billing`.

## Error Handling

| HTTP | Meaning                                | Frontend handling                                               |
| ---- | -------------------------------------- | --------------------------------------------------------------- |
| 400  | Invalid path param or request body     | Show validation/state error                                     |
| 401  | Missing/invalid JWT                    | Send user to login/session refresh                              |
| 403  | Permission denied                      | Show access denied                                              |
| 404  | Account not found or not owned by user | Show not found/access denied without exposing account existence |
| 500  | Server error                           | Show retry/support message                                      |

For cross-account access, backend may return `404` intentionally to avoid account enumeration.

## Legacy Endpoint Replacements

| Legacy call                             | Replacement                                               |
| --------------------------------------- | --------------------------------------------------------- |
| `GET /subscription-tiers`               | `GET /api/accounts/:accountId/billing/available-tiers`    |
| `POST /orders/createInvoice`            | `POST /api/accounts/:accountId/billing/invoice-requests`  |
| `POST /orders/confirm`                  | Stripe webhook + refresh `GET /billing`                   |
| `POST /orders/CancelCreateSubscription` | Refresh `GET /billing` after cancelled/abandoned checkout |
| `POST /orders`                          | `POST /api/accounts/:accountId/billing/checkout`          |

## Stripe Customer Portal Gap

There is no account-scoped v1 replacement for:

```http
POST /api/orders/StripeCustomerPortal
```

Product/frontend decision required:

- remove/defer portal UX, or
- keep this legacy endpoint temporarily with owner and removal ticket, or
- create a future account-scoped portal route.

## Frontend Done Criteria

- Billing UI reads from `GET /billing`.
- Plan selection uses `GET /billing/available-tiers`.
- Card checkout uses `POST /billing/checkout`.
- Invoice request flow uses account-scoped invoice request endpoints.
- Legacy endpoint usage is removed or documented as temporary.
- [`bill-0606-frontend-readiness-handoff.md`](../resources/bill-0606-frontend-readiness-handoff.md) — engineering checklist and stakeholder sign-off table.
