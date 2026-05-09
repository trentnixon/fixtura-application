# Folder Overview

Account-scoped billing UI under `/o/[accountId]/billing`: overview, create subscription wizard, history, trial flows, checkout and invoice request surfaces.

## Files

- See parent route directories: `overview/`, `create/` (includes `create-subscription-wizard.tsx`, `actions/create-stripe-invoice.ts` — server action calling Strapi invoice create, dev panel `create-subscription-wizard-state-panel.tsx`), `history/`, `_components/` (includes `plan-tier-card/`), `_hooks/`, `_utils/` (`planTierCard.ts`, pass end date helper, Stripe immediate-invoice eligibility), `core/`.

## Child Modules

- `overview/`: main billing content shell.
- `create/`: multi-step subscription wizard.
- `history/`: billing history listing.

## Relations

- Parent: `src/app/(members)/o/[accountId]/`
- API types: `src/types/api/account.ts` (`AvailableBillingTier`, `AccountBillingSummaryV1`)
- Available tiers contract: [`../.comms/response/frontend-handoff-billing-available-tiers.md`](../.comms/response/frontend-handoff-billing-available-tiers.md)
