# Stripe subscription integration (Frontend ↔ Strapi ↔ Stripe) — detailed walkthrough

This document describes **how Stripe subscription purchase + management works from this Next.js frontend** based on the current code. The frontend **does not** call Stripe secret APIs directly; it calls **Strapi** (`NEXT_PUBLIC_STRAPI_URL`) and (in one legacy component) uses Stripe.js for Checkout redirection.

> Scope: Frontend repository only. The “real” Stripe objects (Checkout Session, Customer, Subscription, Invoices) are created/verified in **Strapi** and/or configured in the Stripe Dashboard.

---

## Core idea (who does what)

### Frontend responsibilities

- Render subscription UI (select tier, confirm purchase, show pending/active states)
- Call Strapi endpoints to:
  - create an order/invoice (and possibly a Checkout Session)
  - confirm an order after Stripe redirects back
  - cancel/rollback an incomplete checkout
  - fetch invoice history / upcoming invoices
  - open Stripe Customer Portal (via Strapi-generated portal session)
- Refresh local account state after any subscription-related change (`ReRender()` from `useAccountDetails`)

### Strapi responsibilities (outside this repo)

- Authenticate the user (JWT) and associate actions to the correct account
- Create Stripe objects:
  - Checkout Session (if using Stripe Checkout)
  - Customer + Subscription
  - Invoices / Payment Intents
  - Billing Portal session
- Persist subscription/order state in Strapi models (orders on `account`)
- Verify payment success (usually by retrieving/validating `session_id` or by processing webhooks)
- Provide frontend-friendly “status” fields that drive UI routing (`isActive`, `OrderPaid`, `Status`, etc.)

### Stripe responsibilities

- Hosted checkout / invoice payment collection
- Redirect back to configured success/cancel URLs
- Billing portal for self-service subscription management
- Webhook events (typically used by backend for durable state sync)

---

## Configuration + environment variables

- `NEXT_PUBLIC_STRAPI_URL`
  - Used as the base URL for all Strapi REST calls in this flow.
- `NEXT_PUBLIC_STRIPE_PK`
  - Stripe **publishable** key used by Stripe.js (`loadStripe`) in a legacy checkout redirect component.
  - Note: no Stripe secret keys should ever exist in this frontend repo.

Authentication is done by sending `Authorization: Bearer ${Cookies.get('jwt')}` to Strapi endpoints.

---

## Where “subscription status” comes from (frontend routing)

The account UI does **not** ask Stripe for subscription status. It derives state from the `account` object returned by your normal account-loading flow and routes to different screens based on `account.attributes.orders.data`.

Key files (frontend routing logic):

- `pages/members/account.js`
- `components/Members/Account/AccountViewOptions/UsersAccountStatusViews.js`
- `lib/members/getTrialNotificationStatus.js`

These decide whether the user sees:

- plan selection (“create season pass”)
- pending payment view (invoice/checkout not finished)
- subscribed view (active subscription)
- trial views (if applicable)

---

## Purchase flow A (current “Create Season Pass” UI): tier selection → create invoice/order in Strapi

This is the main purchase UI referenced in your internal flow doc.

### A1) User picks a season start date

Component:

- `components/Members/Account/AccountViewOptions/CreateSubscription/userSubscription.js`

The start date is used to compute plan end dates and to form the billing window payload that gets sent to Strapi.

### A2) Frontend loads available tiers from Strapi

Hook:

- `Hooks/useSubscriptionTiers.js`

Network request:

- `GET ${NEXT_PUBLIC_STRAPI_URL}/subscription-tiers`

UI:

- `components/Members/Account/AccountViewOptions/CreateSubscription/components/SelectAPlan/SelectAPlan.js`

Filtering rules in UI:

- Only tiers where `product.attributes.isActive` is truthy
- Tiers are filtered by account type (club vs association) using `FindAccountType(account)` and `product.attributes.isClub`

### A3) User confirms a plan → frontend calls `POST /orders/createInvoice`

UI component:

- `components/Members/Account/AccountViewOptions/CreateSubscription/components/SelectAPlan/components/CreateANewInvoice.js`

Hook:

- `Hooks/useCreateInvoice.js`

Network request (as documented in the repo’s subscription flow doc):

- `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/createInvoice`
- Body fields:
  - `AccountID`
  - `product_id` (tier id)
  - `startDate`
  - `endDate`
  - `couponId` (optional)

Frontend behavior after success:

- It stores the returned `invoice` state in the hook
- The component runs `ReRender()` to refresh the account state
- It does **not** perform a Stripe Checkout redirect in active code

### A4) User is now in “pending payment” (depending on backend semantics)

If Strapi marks the order as “pending” (or “unpaid but active in workflow”), the account router will send them to the pending branch.

Pending UI:

- `components/Members/Account/AccountViewOptions/SubscriptionPending/userSubscriptionPending.js`

This screen shows:

- An internal invoice template (`InvoiceDisplay`)
- Stripe invoice listing (`components/Members/stripe/Invoicing.js`) which fetches hosted invoice links

---

## Purchase flow B (legacy Stripe Checkout redirect): `POST /orders` → `redirectToCheckout({ sessionId })`

This repo contains an older/alternate flow that:

1. calls `POST ${NEXT_PUBLIC_STRAPI_URL}/orders`
2. expects a response with an `id` that is a **Stripe Checkout Session id**
3. redirects the browser to Stripe Checkout using Stripe.js:
   - `stripe.redirectToCheckout({ sessionId: Subscription.id })`

Files:

- UI: `components/Members/stripe/BTN_SubscribeToFixtura.js`
- Hook: `Hooks/useOrder.js` (`useCreateNewInstanceOfSubscription`)

Important note:

- Repo-level usage suggests this component is likely **not wired into the main account purchase UX** (treat it as legacy unless you confirm otherwise).

---

## Stripe return URLs (success + cancel) and how the frontend finalizes the subscription

Regardless of which “create” endpoint is used, the frontend has explicit success/cancel pages that assume Stripe will redirect back with a `session_id`.

### Success return: `/members/subscriptionSuccess?session_id=...`

Page:

- `pages/members/subscriptionSuccess.js`

Action:

- Calls Strapi:
  - `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/confirm`
  - Body: `{ checkout_session: session_id }`

Hook:

- `Hooks/useOrder.js` (`useConfirmOrder`)

Frontend behavior:

- When confirmation succeeds, it calls `ReRender()` to reload account state, which should flip the account into the “subscribed” branch.

### Cancel/error return: `/members/subscriptionError?session_id=...&OrderSetup=...`

Page:

- `pages/members/subscriptionError.js`

Action:

- Calls Strapi:
  - `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/CancelCreateSubscription`
  - Body: `{ checkout_session: session_id, OrderSetup }`

Hook:

- `Hooks/useOrder.js` (`useCancelCreateOrder`)

Frontend behavior:

- When cancellation completes, it calls `ReRender()` to reload account state, which should remove or invalidate the pending order.

---

## “Get” and “manage” subscription (billing portal + invoices)

### Billing portal (self-service management)

Hook:

- `Hooks/useSubscription.js` (`useCreateStripePortal`)

Network request:

- `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/StripeCustomerPortal`
- Body: `{ user: <account-from-cookie> }`

Expected response:

- Typically a URL for Stripe Billing Portal (created server-side). The frontend should then navigate to that URL.

### Invoice history

Hook:

- `Hooks/useInvoicing.js` (`useGetInvoice`)

Network request:

- `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/invoicing`
- Body: `{ user: <account-from-cookie> }`

UI:

- `components/Members/stripe/Invoicing.js`

Expected invoice fields used by UI:

- `hosted_invoice_url` (Stripe-hosted invoice page)
- `invoice_pdf`
- `period_start`, `period_end`
- `subtotal` (assumed cents)
- `status`
- `account_name`

### Upcoming invoice

Hook:

- `Hooks/useInvoicing.js` (`useGetUpcomingInvoice`)

Network request:

- `POST ${NEXT_PUBLIC_STRAPI_URL}/orders/upcomingInvoice`

UI:

- `components/Members/stripe/Invoicing.js` (`UpcomingInvoicing`)

---

## Current gaps / drift (important)

### 1) Main account purchase path does not redirect to Stripe Checkout in active code

The “Create Season Pass” purchase button calls `POST /orders/createInvoice` and refreshes account state, but there is **no active** `redirectToCheckout` in that component (Stripe redirect code is commented out).

If the intended UX is “Stripe Checkout session → redirect”, you’ll need a contract like:

- Strapi returns either:
  - a Checkout Session id (for `redirectToCheckout({ sessionId })`), or
  - a Checkout URL (for `window.location = url`)
- Frontend uses that return value immediately after invoice/order creation.

### 2) There are two different backend “create” endpoints used in different flows

- `POST /orders` (legacy checkout session flow)
- `POST /orders/createInvoice` (current UI flow)

If both are real and supported, you should document (in backend + frontend docs) when to use each and what each returns (session id vs invoice id vs hosted invoice link).

---

## Practical “how we create/get/manage Stripe subscription” summary

- **Create**:
  - User selects tier → frontend calls Strapi to create an order/invoice (and possibly a Stripe Checkout Session behind the scenes).
  - Stripe-hosted payment is completed (Checkout or invoice payment link).
- **Confirm**:
  - Stripe redirects back with `session_id`.
  - Frontend posts `session_id` to Strapi `/orders/confirm`.
  - Frontend refreshes account state; UI becomes “subscribed”.
- **Cancel/rollback**:
  - Stripe redirects back to error page with `session_id`.
  - Frontend calls Strapi `/orders/CancelCreateSubscription`.
  - Frontend refreshes account state; UI returns to selectable state.
- **Manage**:
  - Frontend requests a Billing Portal session from Strapi and navigates user to Stripe Portal.
  - Frontend fetches invoice history and displays hosted invoice URLs and PDFs.
