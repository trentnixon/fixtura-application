# Stripe Customer Portal — product decision (billing v1)

## Context

Account-scoped billing v1 has **no** replacement for legacy `POST /api/orders/StripeCustomerPortal` (see [frontend-billing-api-contract-handoff.md](../response/frontend-billing-api-contract-handoff.md)).

## Decision

**Option A — Defer (chosen).** The members billing area does **not** expose Stripe Customer Portal. There is no Next BFF route, `accountApi` method, or UI entry that calls `StripeCustomerPortal`.

## If this changes

1. Product + CMS agree on an account-scoped portal route (or a time-boxed legacy proxy).
2. Implement using the same stack as checkout: [route-definitions.ts](../../../../../../../lib/api/routes/route-definitions.ts) → [account.api.ts](../../../../../../../lib/api/services/account.api.ts) → query key → hook → BFF forwarder.
3. Update this document and the handoff **Stripe Customer Portal** section in the same change train.

## Related

- [staging-qa-checklist.md](./staging-qa-checklist.md) — portal row expects no portal CTA.
- [frontend-billing-api-contract-handoff.md](../handoff/frontend-billing-api-contract-handoff.md) — audit + decision paragraph.

## Date

- 2026-05-05 — Decision recorded for billing v1 integration plan.
