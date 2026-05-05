# Frontend Billing API Contract Handoff

## Purpose

This is the frontend-facing handoff for account-scoped billing v1.

Use this for implementation. Use `src/api/account/types/billing-contract-v1.d.ts` as the canonical TypeScript source.

## Required Frontend Context

The frontend must have:

- `accountId`: current selected Strapi account id
- JWT: `Authorization: Bearer <token>`
- API base URL: `{STRAPI_URL}/api`

All routes below are account-scoped and require the authenticated user to own the account.

## Endpoints

| Need                   | Method | Path                                            | Response                                       |
| ---------------------- | ------ | ----------------------------------------------- | ---------------------------------------------- |
| Billing summary        | GET    | `/accounts/:accountId/billing`                  | `{ data: BillingSummary }`                     |
| Available tiers        | GET    | `/accounts/:accountId/billing/available-tiers`  | `{ tiers: AvailableBillingTier[] }`            |
| Start Stripe checkout  | POST   | `/accounts/:accountId/billing/checkout`         | `CreateCheckoutResponse`                       |
| List invoice requests  | GET    | `/accounts/:accountId/billing/invoice-requests` | `{ invoiceRequests: InvoiceRequestSummary[] }` |
| Submit invoice request | POST   | `/accounts/:accountId/billing/invoice-requests` | `CreateInvoiceRequestResponse`                 |

## Auth And Permissions

Frontend sends:

```http
Authorization: Bearer <jwt>
```

Backend Users & Permissions scopes:

| Endpoint                         | Scope                                                   |
| -------------------------------- | ------------------------------------------------------- |
| `GET /billing`                   | `api::account.account.getAccountBilling`                |
| `GET /billing/available-tiers`   | `api::account.account.getAccountBillingAvailableTiers`  |
| `POST /billing/checkout`         | `api::account.account.postAccountBillingCheckout`       |
| `GET /billing/invoice-requests`  | `api::account.account.getAccountBillingInvoiceRequests` |
| `POST /billing/invoice-requests` | `api::account.account.postAccountBillingInvoiceRequest` |

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

- `billingStatus`: lifecycle state for billing UI
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

**Return URLs:** After Stripe redirects back to the app, the members billing page recognises specific query parameters, strips them, and **refetches** `GET /billing` (and available tiers). Configure `success_url` / `cancel_url` accordingly — see [`.comms/billing-checkout-return-urls.md`](./.comms/billing-checkout-return-urls.md).

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
  "purchaseOrderNumber": "PO-123",
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

### Frontend legacy audit

- **2026-05-05:** Searched application `src/` (TypeScript/TSX) for legacy path fragments (`subscription-tiers`, `orders/createInvoice`, `orders/confirm`, `CancelCreateSubscription`, and generic Strapi `/orders` API calls). **No client or Next BFF usage** of those legacy routes was found. Production billing traffic uses account-scoped paths only: `GET|POST …/api/accounts/:accountId/billing/…` (via the app’s `/api/accounts/...` BFF). **Stripe Customer Portal** remains deferred below; this repo does **not** call `POST /api/orders/StripeCustomerPortal`.

## Stripe Customer Portal Gap

There is no account-scoped v1 replacement for:

```http
POST /api/orders/StripeCustomerPortal
```

Historical options (superseded by decision below):

- remove/defer portal UX, or
- keep this legacy endpoint temporarily with owner and removal ticket, or
- create a future account-scoped portal route.

**Decision (2026-05-05): defer (Option A).** Members billing UI does **not** integrate Stripe Customer Portal. There is no call to `POST /api/orders/StripeCustomerPortal` in this codebase. When CMS provides an account-scoped portal endpoint, add a BFF route + `accountApi` method + UI (mirror the checkout pattern) and replace this section.

### Release gate (Customer Portal)

- **Chosen path for this repo:** Option A (defer). No Next BFF route, `accountApi` method, or members CTA for `StripeCustomerPortal`.
- **Product:** Before each release, confirm portal remains out of scope—or open a ticket for Option B (temporary legacy proxy + removal criterion) and revise the **Decision** paragraph plus code in the same change train.
- **QA:** See [`staging-qa-checklist.md`](./staging-qa-checklist.md) (portal expectation: no portal entry point).

## Frontend Done Criteria

- Billing UI reads from `GET /billing`.
- Plan selection uses `GET /billing/available-tiers`.
- Card checkout uses `POST /billing/checkout`.
- Invoice request flow uses account-scoped invoice request endpoints.
- Legacy endpoint usage is removed or documented as temporary (see **Frontend legacy audit** above).
- **`bill-0606-frontend-readiness-handoff.md`:** not present in this repository as of 2026-05-05. **Interim sign-off:** satisfy the bullets above, run `tsc`/lint, and complete normal PR review; add that document under billing `.comms/` when stakeholders publish it, then treat it as the formal gate.

## Sign-off (interim)

Until `bill-0606-frontend-readiness-handoff.md` exists in-repo, treat **Frontend Done Criteria** + PR merge as the billing v1 frontend release gate.

**Staging QA:** Complete and attach [`staging-qa-checklist.md`](./staging-qa-checklist.md) (or equivalent) for releases that touch billing.
