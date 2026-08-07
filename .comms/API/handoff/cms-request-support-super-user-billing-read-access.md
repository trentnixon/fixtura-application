# CMS request: Support super-user — billing read access (Phase 5.1)

**Date:** 2026-08-07  
**From:** Fixtura member app (frontend)  
**To:** Backend / CMS team  
**Related:** [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md), [frontend-billing-api-contract-handoff.md](<../../../src/app/(members)/o/[accountId]/billing/.comms/handoff/frontend-billing-api-contract-handoff.md>)

---

## Summary

Support super-user (Phase 5) is live in the member app: staff pick a customer account from `/support/accounts` and browse the normal `/o/[accountId]/…` app in read-only mode.

**Billing is currently blocked for support.** All billing GETs use owner-only loaders and return **404** for support JWTs (same as pre–Phase 3 behaviour). The app hides the dashboard billing card when billing is unavailable; the user menu still links to `/billing`, which cannot load data.

We need **read-only billing access** so support can **track free trial usage, subscription state, checkout/order errors, and invoice-request status** when troubleshooting customer accounts.

---

## Business need

Support staff must answer questions such as:

- Has this organisation **used** its free trial (`organisationTrial.consumptionStatus`, org allocation)?
- Why can’t the customer **start** a trial (`canStartTrial`, `availableActions`, start-trial error codes)?
- What is **`billingStatus`** / product state (trial active, subscribed, lapsed, pending payment)?
- Are there **failed checkouts**, **pending orders**, or **stuck invoice requests**?
- What did the customer last attempt (order history, invoice request list)?

Today they cannot see any of this in Support View without impersonation or Strapi Admin.

---

## Request

Add the billing **GET** routes below to the support super-user read manifest, using the same pattern as Phase 3 account reads:

- Authorise via `assertAccountReadAccess` (or equivalent) when `isSupportSuperUser === true`
- **Support GET → 200** with the same payload shape as owner
- **Non-owner, non-support → 404** (anti-enumeration unchanged)
- **All billing mutations remain owner-only** (404 before validation)

### Minimum v1 (required for billing overview + trial troubleshooting)

| Method | Path                                      | Purpose                                                                                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/accounts/:accountId/billing`        | Summary: `billingStatus`, `organisationTrial`, `trial`, `availableActions`, `canStartTrial`, subscription/trial dates, payment flags |
| GET    | `/api/accounts/:accountId/billing/orders` | Order history — pending checkout, paid-awaiting-start, failed/abandoned flows                                                        |

These are already consumed by the member app (`useAccountBilling`, `useAccountBillingOrders`, billing overview page, dashboard billing card). **No new BFF routes required on the app side** once CMS allows support reads.

### Recommended v1 (invoice / checkout error triage)

| Method | Path                                                | Purpose                                                         |
| ------ | --------------------------------------------------- | --------------------------------------------------------------- |
| GET    | `/api/accounts/:accountId/billing/invoice-requests` | List invoice requests — status, errors, withdrawal/cancel state |

### Optional (read-only context only — not needed for first pass)

| Method | Path                                               | Notes                                                                                          |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/api/accounts/:accountId/billing/available-tiers` | Plan catalogue for checkout UI; low value for support read-only unless debugging tier mismatch |

---

## Explicitly out of scope (must stay blocked for support)

Support must **not** gain access via these routes in v1:

| Method | Path                                              |
| ------ | ------------------------------------------------- |
| POST   | `…/billing/checkout`, `…/billing/checkout/resume` |
| POST   | `…/billing/start-trial`                           |
| POST   | `…/billing/invoice-requests`                      |
| POST   | `…/billing/invoice-requests/:id/cancel`           |
| POST   | `…/billing/orders/:orderId/delete`                |
| POST   | `…/billing/start-trial`                           |

App will hide/disable all billing actions in Support View when `isSupportView` is true; **backend remains authoritative**.

---

## Security / product notes

- Billing was **explicitly excluded** from the Phase 3 support manifest as **financially sensitive**.
- This request is **read-only** for internal support troubleshooting (trial usage + error states), not customer-facing billing management.
- Please confirm whether product/security wants:
  - Audit logging on support billing reads (same as other Phase 3 reads), and/or
  - Any field redaction in GET billing for support (we assume **full parity** with owner GET unless told otherwise).

**CMS answers (2026-08-07):** Full parity; audited per [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md).

---

## Current behaviour (support user, customer `accountId`)

| Route                                                 | Before request             | After 5.1 (local CMS) |
| ----------------------------------------------------- | -------------------------- | --------------------- |
| `GET …/billing`                                       | **404**                    | **200**               |
| `GET …/billing/orders` → Strapi `/orders/account/:id` | **404**                    | **200**               |
| `GET …/billing/invoice-requests`                      | **404**                    | **404** (5.1b)        |
| Settings, branding, renders, onboarding, etc.         | **200** (Phase 3 manifest) | **200**               |

**Status:** Phase 5.1 minimum v1 **shipped on local CMS** (2026-08-07). See [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md).

---

## App follow-up (frontend — in progress)

No API contract changes expected. Frontend will:

1. Verify billing data on dashboard + `/o/[accountId]/billing` in support view (reads return 200 on local CMS)
2. Decouple billing history from invoice-requests GET until 5.1b
3. Hide/disable checkout, start trial, invoice submit, and order delete when `isSupportView` (despite full-parity `availableActions` from GET)
4. Keep the support read-only banner
5. Hold prod support billing until CMS prod deploy includes 5.1

---

## Acceptance criteria

1. Support super-user with JWT can `GET …/billing` and `GET …/billing/orders` for an account they do **not** own → **200** with same schema as owner.
2. Normal authenticated member on another user’s account → **404**.
3. Support `POST …/billing/start-trial` (and all other billing mutations) on customer account → **404**.
4. Support billing reads appear in support access audit (if other Phase 3 reads are audited).
5. Local QA: enable `isSupportSuperUser` on test user → open customer account → billing overview shows trial status and order history.

---

## References

- Support Phase 5 handoff + Backend FAQ: `.comms/API/handoff/cms-handoff-support-super-user-phase5-app-integration.md`
- Billing API contract: `src/app/(members)/o/[accountId]/billing/.comms/handoff/frontend-billing-api-contract-handoff.md`
- Trial / start-trial: `src/app/(members)/o/[accountId]/billing/.comms/handoff/app-trial-frontend-handoff.md`
- Phase 3 read helper: `src/api/account/controllers/services/security/supportSuperUser.js` (backend repo)
