# Completed Tickets Index

- TKT-2026-001

---

## Active tickets

_(none)_

---

## TKT-2026-001 (Completed)

```md
---
ID: TKT-2026-001
Status: Completed
Priority: High
Owner: Frontend
Created: 2026-05-06
Updated: 2026-05-06
Related: frontend-handoff-billing-available-tiers.md
---
```

### Overview

Migrate `AvailableBillingTier` and all consumers to the camelCase v1 wire shape live on staging; replace create-subscription wizard step 1 with the route-lab-style tier card grid.

### What We Need to Do

Restore correct tier rendering after CMS contract change; ship improved plan selection UX on `/billing/create`.

### Completion Summary

- Rewrote `AvailableBillingTier` and added `SubscriptionTierCategory` in `src/types/api/account.ts`; linked main billing handoff to `frontend-handoff-billing-available-tiers.md`.
- Migrated tier UI reads to `name`/v1 fields across wizard, plan-checkout and invoice tier radios, current plan card, and trial tier label helper; fixed billing state test fixtures.
- Introduced `PlanTierCard`, `_utils/create-subscription/planTierCard.ts`, category toggle when multiple tiers categories exist, and replaced wizard step 1 list with responsive card grid.
