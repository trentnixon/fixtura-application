# Request — Show organisation trial consumption ledger in Strapi dev admin

**From:** Frontend / billing QA  
**To:** CMS team  
**Date:** 2026-07-22  
**Context:** APP-TRIAL-007 staging QA, local dev reset  
**Related:** BILL-TRIAL-004, `organisation-trial-consumption-schema.md`

---

## Ask

Please make the **organisation trial consumption ledger** visible in **Strapi Content Manager on dev/local only**, so we can inspect and reset org trial state during QA without direct DB access.

---

## Why

When testing org free trial on `/o/:accountId/billing`, clearing **orders** and **trial instances** does **not** reset eligibility. The UI reads `organisationTrial.consumptionStatus` from the permanent ledger (`organisation_trial_consumptions`).

If a row exists → CMS returns `used` + `ended` → frontend shows **“Organisation free trial already used”**. That is correct behaviour, but hard to reset in dev when the collection is hidden.

---

## What to expose (dev only)

| Item           | Detail                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Content type   | `organisation-trial-consumption`                                                                                         |
| Display name   | `[bil] Organisation Trial Consumption`                                                                                   |
| Table          | `organisation_trial_consumptions`                                                                                        |
| Key field      | `organisationKey` (e.g. `club:{PlayHQID}`)                                                                               |
| Useful columns | `organisationId`, `playHqId`, `consumedAt`, `allocatedAccountId`, `allocatedTrialId`, `allocatedOrderId`, `evidenceTier` |

**Optional (same ask):** `organisation-trial-identity-alias` for debugging unresolved-org cases.

---

## Suggested approach

1. Set `"content-manager": { "visible": true }` in dev/local env only (keep **hidden in staging/prod**).
2. Restrict to **Super Admin** or a dev-only role.
3. Document a simple QA reset: delete consumption row for test org → GET billing should return `consumptionStatus: "available"`, `allocationStatus: "none"`.

Schema path:

`Backend/src/api/organisation-trial-consumption/content-types/organisation-trial-consumption/schema.json`

---

## Not asking for

- Production admin visibility
- REST API exposure
- Changes to immutability / business rules
- Ability to edit consumed rows in prod (delete in dev for reset is enough)

---

## Acceptance

- [ ] Dev Strapi admin lists **Organisation Trial Consumption**
- [ ] Can find row by `organisationKey` or `allocatedAccountId`
- [ ] Deleting row in dev resets org to eligible (after account billing also allows trial)

---

## Contact

Reply in this thread or link a pickup doc when dev visibility is enabled.
