# CMS request: Support super-user — Vision (season-hub) + billing invoice history

**Date:** 2026-09-04  
**From:** Fixtura member app (frontend)  
**To:** Backend / CMS team

**Document ownership**

| Copy                      | Path                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Canonical (edit here)** | Member app `.comms/API/handoff/cms-request-support-vision-billing-access.md`                            |
| **Backend sync**          | CMS repo `docs/handoff/cms-request-support-vision-billing-access.md` — copy from canonical; do not fork |

If you are reading a Backend sync copy, also sync [companion files](./cms-request-support-vision-billing-access-BACKEND-SYNC.md) or relative links to the questions doc will break.

**Related:**

- [cms-handoff-support-vision-billing-fe-start.md](../../FrontEnd/handoff/cms-handoff-support-vision-billing-fe-start.md) — **CMS → FE start (TKT-2026-017, 2026-09-04)**
- [cms-questions-support-vision-billing-access.md](./cms-questions-support-vision-billing-access.md) — implementation questions for CMS (please answer)
- [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md)
- [cms-request-support-super-user-billing-read-access.md](./cms-request-support-super-user-billing-read-access.md)
- [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md)
- [support-super-user-fe-outstanding.md](./support-super-user-fe-outstanding.md)
- Season hub contract: [frontend-handoff.md](<../../../src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md>)

---

## Summary

Support super-user (Phase 5) lets internal staff pick a customer account from `/support/accounts` and browse the normal `/o/[accountId]/…` routes.

We need CMS changes so support can **troubleshoot fixtures (Vision)** and **billing / invoice stuck states** without Strapi Admin or impersonation:

1. **Track 1 — Season-hub GETs** — mirror the customer Vision UI (competitions, grades, fixtures, recon)
2. **Track 2 — Vision scrape/sync POSTs** — queue the same remediation jobs the customer can (org sync, teams lookup, fixture discovery, competition grades scrape)
3. **Track 3 — Billing reads** — confirm Phase **5.1** on staging/prod; ship Phase **5.1b** invoice-request **list** GET for support

**Billing mutations and invoice creation remain owner-only** in the member app. Support creates or fixes invoices in Strapi admin; Support View is for **visibility** plus **Vision remediation** only.

**Support View banner (product):** Billing and most areas stay read-only; Vision sync is allowed. This updates Phase 5 “globally read-only” wording — see [questions doc Q27](./cms-questions-support-vision-billing-access.md).

---

## CMS code reality (align before implementing)

This handoff describes **target behaviour**. Backend review against the CMS repo noted:

| Area               | This doc’s intent                           | CMS implementation today                                                                                                            |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Track 1**        | Support reads via `assertAccountReadAccess` | Season-hub uses **owner-only** `resolveSeasonHubScope.js` (`accountId` + `userId`), not support access helper                       |
| **Track 2**        | Support POST → 200 when scoped              | Scrape routes often **`auth: false`** with no ownership checks; support **404 may be BFF-only**                                     |
| **Track 3 (5.1b)** | Invoice-requests list for support           | `listAccountBillingInvoiceRequests` still uses **`validateAccountOwnership`**; summary/orders already use `assertAccountReadAccess` |
| **Audit**          | Match Phase 3 where applicable              | Billing reads use `auditSupportAccessIfNeeded`; season-hub reads and scrape POSTs **do not** audit today                            |

There is **no central “support manifest”** — each handler must wire `assertAccountReadAccess` (or equivalent) explicitly.

**Open questions:** [cms-questions-support-vision-billing-access.md](./cms-questions-support-vision-billing-access.md)

---

## Business need

### Vision (fixtures)

Support must answer:

- What competitions / grades / fixtures are in scope for this account?
- Why does the customer see zero fixtures or stale counts?
- Can a sync or scrape fix missing data (same actions the customer has)?

Today: season-hub GETs return **404** for support JWTs. The member app skips queries and shows “Vision unavailable in support view.”

### Billing (invoice / checkout stuck states)

Support must answer:

- Why can’t the customer request a new invoice?
- Is a **previous** invoice request blocking them (not just `latestInvoiceRequest`)?
- What checkout / order / payment state does the customer see?

Today: Phase **5.1** (`GET …/billing`, `GET …/orders`) may work on local CMS; **invoice-requests list** still returns **404** for support. The app falls back to a single `latestInvoiceRequest` from the billing summary — insufficient when an older failed request is the root cause.

---

## Authorisation pattern (all tracks)

Target — same as Phase 3 account reads and Phase 5.1 billing:

- Authorise when `isSupportSuperUser === true` **and** the target `accountId` is valid for the request
- **Support → 200** with the **same payload shape** as the account owner (full parity unless product specifies redaction)
- **Non-owner, non-support → 404** (anti-enumeration unchanged)
- Mutations not listed in Track 2 remain **404** for support before validation

---

## Track 1 — Season-hub GETs (required)

Wire **`assertAccountReadAccess`** (or equivalent) into season-hub scope resolution — there is **no central support manifest**; each handler owns access checks.

**Primary CMS change:** Update `resolveSeasonHubScope.js` so support super-users resolve account scope by `accountId` after `assertAccountReadAccess`, instead of owner-only `where: { id: accountId, user: userId }`.

**CMS touchpoints:**

- `src/api/season-hub/services/resolveSeasonHubScope.js` — primary access change
- `src/api/season-hub/routes/custom-season-hub.js` — **12 routes** (confirm table below matches)

**BFF base:** `GET /api/season-hub/:accountId/…` (proxies to CMS season-hub namespace).

| Method | Path pattern                                                        | Purpose                                     |
| ------ | ------------------------------------------------------------------- | ------------------------------------------- |
| GET    | `…/recon`                                                           | Account scope, counts, availability flags   |
| GET    | `…/stats`                                                           | Summary counts, freshness (`lastUpdatedAt`) |
| GET    | `…/competitions`                                                    | Paginated competition list                  |
| GET    | `…/competitions/:competitionId`                                     | Competition detail                          |
| GET    | `…/competitions/:competitionId/grades`                              | Grades under competition                    |
| GET    | `…/competitions/:competitionId/grades/:gradeId`                     | Grade detail (canonical)                    |
| GET    | `…/competitions/:competitionId/grades/:gradeId/fixtures`            | Fixture list for grade                      |
| GET    | `…/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId` | Fixture detail (canonical)                  |
| GET    | `…/grades/:gradeId`                                                 | Grade detail (alias)                        |
| GET    | `…/grades/:gradeId/fixtures`                                        | Fixture list (alias)                        |
| GET    | `…/grades/:gradeId/fixtures/:fixtureId`                             | Fixture detail (alias)                      |

See [frontend-handoff.md](<../../../src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md>) for response shapes and error codes (`SEASON_HUB_*`). Support failures for invalid accounts should remain **404**, not 403.

**Today:** Support JWT → **404** on all of the above.

**Audit (Track 1):** Season-hub reads do not call `auditSupportAccessIfNeeded` today (unlike Phase 3 billing reads). Add support-read audit on season-hub handlers if Phase 3 parity is required — confirm plan in [questions Q17](./cms-questions-support-vision-billing-access.md).

**Member app after CMS:** Removes query skip and placeholders; enables Vision in support sidebar.

---

## Track 2 — Vision scrape/sync POSTs (support remediation)

Allow support super-user on the POST routes the member app uses for customer Vision remediation.

### Implementation note (CMS)

Scrape/sync routes were built for **admin UI** and are often **`auth: false`** with **no account ownership checks** in CMS handlers today.

**Today (clarified):**

- CMS scrape routes may accept unauthenticated POSTs (`auth: false`).
- **Owners and support** in the member app typically hit scrape triggers **via the BFF**, not necessarily with a CMS JWT — same auth/scoping design applies to both.
- Support users may see **404 from the member-app BFF** before requests reach CMS — that is **BFF-enforced**, not proof CMS already blocks support.
- v1 must add **JWT auth + account↔entity scoping** on CMS and/or BFF so support and owners can queue jobs safely.

**v1 requires an explicit design:**

- JWT auth (member + support) and/or BFF-only gating
- **Account ↔ entity scoping** — request bodies often contain only `clubId` / `associationId` / `competitionId` / `gradeId`, not `accountId`; CMS must verify the entity belongs to the account being viewed
- Whether unauthenticated queue abuse is closed as part of this work

See [questions 11–20](./cms-questions-support-vision-billing-access.md).

### In scope for v1

| BFF POST                                                             | Member app usage                | Purpose                                   |
| -------------------------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| `/api/association-overview-queues/trigger-association-single-scrape` | Org sync (association accounts) | Queue single association scrape           |
| `/api/club/trigger-club-single-scrape`                               | Org sync (club accounts)        | Queue single club scrape                  |
| `/api/competition/trigger-grades-comps-single-scrape`                | Competition context             | Queue competition grades scrape           |
| `/api/competition/trigger-grades-lookup-teams-single-scrape`         | Grade view                      | Teams lookup for grades under competition |
| `/api/grade/trigger-fixture-discovery`                               | Grade view                      | Fixture discovery for one grade           |

Integration handoffs (existing):

- [admin-frontend-trigger-association-single-integration.md](./admin-frontend-trigger-association-single-integration.md)
- [admin-frontend-trigger-club-single-integration.md](./admin-frontend-trigger-club-single-integration.md)
- [frontend-trigger-grades-comps-single-integration.md](./frontend-trigger-grades-comps-single-integration.md)
- [frontend-trigger-grades-lookup-teams-single-integration.md](./frontend-trigger-grades-lookup-teams-single-integration.md)
- [frontend-trigger-fixture-discovery-grade-integration.md](./frontend-trigger-fixture-discovery-grade-integration.md)

### Explicitly out of scope for v1

| BFF POST                                           | Reason                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `/api/game-meta-data/trigger-result-single-scrape` | Per-fixture result scrape — narrow ops; add in a follow-up if support needs it |

**Member app after CMS:** Keeps scrape/sync buttons enabled in Support View (same UX as customer; no extra confirmation dialog). Billing and other areas stay read-only.

**Regression:** Admin frontend scrape buttons must keep working after auth changes.

---

## Track 3 — Billing reads

### Phase 5.1 — confirm on staging and production

Already requested in [cms-request-support-super-user-billing-read-access.md](./cms-request-support-super-user-billing-read-access.md). Shipped on **local CMS** per [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md).

Please confirm deployment status:

| Layer       | Method | Path                                      | Support (target)                                                                               |
| ----------- | ------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| CMS         | GET    | `/api/accounts/:accountId/billing`        | **200** — summary incl. `latestInvoiceRequest`, `availableActions`, trial, `organisationTrial` |
| CMS         | GET    | `/api/orders/account/:accountId`          | **200** — order history                                                                        |
| BFF (alias) | GET    | `/api/accounts/:accountId/billing/orders` | **200** — proxies to CMS orders path above                                                     |

### Phase 5.1b — required for invoice triage (new)

**CMS touchpoint:** `listAccountBillingInvoiceRequests.js` — align with billing summary/orders (`assertAccountReadAccess`).

| Method | Path                                                | Purpose                                                                         |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/api/accounts/:accountId/billing/invoice-requests` | Full invoice request list — status, message, dates, withdraw/cancel eligibility |

**Optional (decide in 5.1b vs 5.1c):**

| Method | Path                                               | Purpose                                                                       |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/accounts/:accountId/billing/available-tiers` | Plan catalogue — low priority unless needed for checkout tier mismatch triage |

**Today:** Invoice-requests list → **404** for support. Member app uses `latestInvoiceRequest` from summary only when `isSupportView`.

**Member app after CMS:** Enables invoice-requests query on billing history; shows full list read-only (withdraw/cancel actions remain hidden for support).

### Billing mutations — must stay blocked for support

| Method | Path                                              |
| ------ | ------------------------------------------------- |
| POST   | `…/billing/checkout`, `…/billing/checkout/resume` |
| POST   | `…/billing/start-trial`                           |
| POST   | `…/billing/invoice-requests`                      |
| POST   | `…/billing/invoice-requests/:id/cancel`           |
| POST   | `…/billing/orders/:orderId/delete`                |

App disables billing POST UI when `isSupportView`; backend remains authoritative.

---

## Current vs target behaviour (support user, customer `accountId`)

| Area                | Route / action                            | Today (best known)                                                 | Target                                             |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| Vision              | Season-hub GETs                           | **404** (owner scope in CMS)                                       | **200**                                            |
| Vision              | Scrape/sync POSTs                         | CMS routes **`auth: false`** today; support **404 often BFF-only** | **200** when JWT + account-scoped (CMS and/or BFF) |
| Billing             | `GET …/billing`                           | **404** prod; **200** local CMS                                    | **200** staging + prod                             |
| Billing             | `GET …/billing/orders` (BFF) → CMS orders | **404** prod; **200** local CMS                                    | **200** staging + prod                             |
| Billing             | `GET …/invoice-requests`                  | **404** (`validateAccountOwnership`)                               | **200**                                            |
| Billing             | All POSTs                                 | **404**                                                            | **404**                                            |
| Other Phase 3 reads | settings, branding, etc.                  | **200**                                                            | **200** (unchanged)                                |

---

## Frontend follow-up (after CMS on staging)

No new BFF routes expected. Member app will:

1. Enable Vision nav and season-hub queries in Support View
2. Keep Vision scrape/sync actions enabled when `isSupportView`
3. Add Billing to support sidebar (always visible; show load error if GET fails)
4. Enable full invoice-requests list on billing history for support
5. Add support-only billing diagnostics panel (`billingUiMode`, `availableActions`, trial, invoice summary)
6. Update Support View banner copy (billing read-only; Vision sync allowed)
7. QA on staging (e.g. account 700) before production deploy

**Rollout:** Staging CMS first → local member-app QA → production CMS → production member app. Frontend prod deploy should not precede CMS prod for these routes.

**Acceptance testing:** Prefer end-to-end **through BFF** (same path as member app). CMS may additionally provide Strapi curl examples for support JWT — see [questions Q28](./cms-questions-support-vision-billing-access.md).

---

## Acceptance criteria (staging)

### Track 1 — Vision reads

1. Support user opens `/o/{accountId}/season` for a non-owned account → recon, stats, competitions return **200**.
2. Drill-down competition → grades → fixtures → fixture detail returns **200**.
3. Normal member on another user’s account → **404** on season-hub routes.

### Track 2 — Vision remediation

4. Support triggers org sync (association or club) for customer account → **200**, job queued.
5. Support triggers teams lookup and fixture discovery on a grade → **200**, job queued.
6. Support `POST …/trigger-result-single-scrape` → **404** (out of v1 scope).
7. Scrape for entity **outside** account scope → **404** or **400** (CMS to confirm).
8. Admin frontend scrape buttons still work (regression).

### Track 3 — Billing

9. Support `GET …/billing` and `GET …/billing/orders` (BFF) → **200**, same schema as owner.
10. Support `GET …/invoice-requests` → **200**, list includes multiple historical requests when present.
11. Support `POST …/billing/invoice-requests` (and all other billing POSTs) → **404**.

### Audit

12. Confirm audit plan for season-hub reads and scrape POSTs (billing reads already use `auditSupportAccessIfNeeded`).

---

## Open questions for CMS

Full list (30 questions + priority five + reply template):

- **Member app (canonical):** [cms-questions-support-vision-billing-access.md](./cms-questions-support-vision-billing-access.md)
- **If link 404 in Backend repo:** sync companion files per [BACKEND-SYNC](./cms-request-support-vision-billing-access-BACKEND-SYNC.md)

**Priority if answering briefly:**

1. Track 2 auth + account↔entity scoping design
2. Phase 5.1 production deployment status
3. ETA for 5.1b invoice-requests
4. Audit for season-hub reads + scrape POSTs
5. Whether `available-tiers` ships with 5.1b or deferred (5.1c)

---

## References

- **Questions for CMS:** [cms-questions-support-vision-billing-access.md](./cms-questions-support-vision-billing-access.md)
- **Backend repo sync:** [cms-request-support-vision-billing-access-BACKEND-SYNC.md](./cms-request-support-vision-billing-access-BACKEND-SYNC.md)
- Support Phase 5 handoff: [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md)
- Prior billing request: [cms-request-support-super-user-billing-read-access.md](./cms-request-support-super-user-billing-read-access.md)
- CMS billing reply (5.1 local): [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md)
- FE outstanding tracker: [support-super-user-fe-outstanding.md](./support-super-user-fe-outstanding.md)
- Season hub API: [frontend-handoff.md](<../../../src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md>)
- Billing API contract: [frontend-billing-api-contract-handoff.md](<../../../src/app/(members)/o/[accountId]/billing/.comms/handoff/frontend-billing-api-contract-handoff.md>)
