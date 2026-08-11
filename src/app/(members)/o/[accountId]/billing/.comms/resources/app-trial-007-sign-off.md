# APP-TRIAL-007 — Sign-off record

**Date:** 2026-07-22  
**Ticket:** APP-TRIAL-007  
**Route:** `/o/:accountId/billing`

## Local / static verification — PASS

| Check                                       | Result | Evidence                                                 |
| ------------------------------------------- | ------ | -------------------------------------------------------- |
| Typecheck                                   | Pass   | `npm run typecheck` exit 0                               |
| Org-trial vitest suite                      | Pass   | 177 tests, 11 files                                      |
| No `trial-instances` / `useTrial` in `src/` | Pass   | grep 2026-07-22                                          |
| No dashboard Start mutation                 | Pass   | no `useBillingTrialStart` in dashboard                   |
| Frontend sign-off static rows               | Pass   | See [staging-qa-checklist.md](./staging-qa-checklist.md) |

## Live staging CMS matrix — PENDING

Run the **Organisation free trial (APP-TRIAL-007)** section in [staging-qa-checklist.md](./staging-qa-checklist.md) against staging accounts. Record Pass/Fail in that checklist.

**Proxy (local only):** Route Lab org scenarios cover the contract matrix without live CMS:

- `/sandbox/route-lab/o/575/billing?state=org_start_available`
- `/sandbox/route-lab/o/575/billing?state=org_active_elsewhere`
- `/sandbox/route-lab/o/575/billing?state=org_unavailable`

## Completion gate

Mark APP-TRIAL-007 **Done** in `.docs/` and Monday only after all staging matrix rows are Pass (or documented N/A with rationale).

## Sign-off

| Role               | Name      | Date       | Status |
| ------------------ | --------- | ---------- | ------ |
| Frontend (local)   | Automated | 2026-07-22 | Pass   |
| Frontend (staging) | _Pending_ |            |        |
