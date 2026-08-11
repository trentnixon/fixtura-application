## Current Focus

- APP-INV-001: Align Member billing/order UI with simplified invoice lifecycle (Monday 2801897240)
- APP-TRIAL-007: Live staging CMS matrix (local verification complete; see `.comms/resources/app-trial-007-sign-off.md`)

## Completed

- TKT-2026-001: v1 `AvailableBillingTier` migration + create-subscription step 1 plan card grid _(see Completed.md)_
- APP-TRIAL-001: Align billing types and fixtures with CMS org-trial contract _(see Completed.md)_
- APP-TRIAL-002: Pure fail-closed organisation-trial presentation derivation + debug _(see Completed.md)_
- APP-TRIAL-003: Billing notices + overview integration _(see Completed.md)_
- APP-TRIAL-004: Start-trial mutation/error/refetch _(see Completed.md)_
- APP-TRIAL-005: Remove client-predicted pre-start trial dates from confirm dialog _(see Completed.md)_
- APP-TRIAL-006: Route Lab org-trial matrix + automated verification _(see Completed.md)_

## To Do

1. [ ] APP-INV-001 — Simplified invoice lifecycle Member FE (P1) _(see Tickets.md, cms-handoff-simplified-invoice-lifecycle-member.md)_
2. [ ] APP-TRIAL-007 — Staging QA + handoff (P3) — local verification PASS; live CMS matrix pending _(see Tickets.md, app-trial-007-sign-off.md)_

## Blocked / Waiting

- APP-INV-001 staging E2E — waiting on disposable CMS invoice fixtures (Admin + CMS create/paid/cancel)

## Recommendations

- Keep [`frontend-handoff-billing-available-tiers.md`](../.comms/response/frontend-handoff-billing-available-tiers.md) in sync with Strapi when tier fields change.
- Use Backend `cms-handoff-bill-trial-012-013-frontend-integration.md` as authoritative org-trial contract reference.
- Member invoice contract: [`cms-handoff-simplified-invoice-lifecycle-member.md`](../.comms/response/cms-handoff-simplified-invoice-lifecycle-member.md).
