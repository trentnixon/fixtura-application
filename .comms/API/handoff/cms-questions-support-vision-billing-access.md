# CMS questions: Support Vision + billing access

**Date:** 2026-09-04  
**From:** Fixtura member app (frontend)  
**To:** Backend / CMS team  
**Canonical location:** Member app `.comms/API/handoff/` — sync all three handoff files to Backend `docs/handoff/` (see [BACKEND-SYNC](./cms-request-support-vision-billing-access-BACKEND-SYNC.md)).

**Related request:** [cms-request-support-vision-billing-access.md](./cms-request-support-vision-billing-access.md)

Use this doc to answer open implementation questions before or during CMS work. Priority items are listed at the bottom if you only have bandwidth for five replies.

---

## Review summary (member app ↔ CMS alignment)

The [request handoff](./cms-request-support-vision-billing-access.md) is scoped for support workflows (Vision read → Vision fix → billing triage). Auth intent matches Phase 3/5.1: **`assertAccountReadAccess` → 200 for support, 404 for everyone else**.

When compared to **CMS repo code today**, these gaps need explicit backend decisions:

| Area               | Request doc assumption                             | CMS code reality (per backend review)                                                                                                                                      |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Track 1**        | Wire `assertAccountReadAccess` in season-hub scope | Season-hub uses **owner-only** scope in `resolveSeasonHubScope.js` (`where: { id: accountId, user: userId }`), not `assertAccountReadAccess`                               |
| **Track 2**        | Support gets **404** on scrape POSTs today         | Routes are `auth: false` with **no account/ownership checks** in handlers (club/competition/grade triggers). Any 404 for support is likely **BFF-only**, not CMS-enforced. |
| **Track 3 (5.1b)** | Wire invoice-requests list for support             | `listAccountBillingInvoiceRequests` still uses `validateAccountOwnership`, unlike billing summary/orders which already use `assertAccountReadAccess`.                      |
| **Orders path**    | Table mentions BFF billing orders                  | CMS path is **`GET /api/orders/account/:accountId`** (BFF alias).                                                                                                          |
| **Audit**          | Open question                                      | Billing reads audit via `auditSupportAccessIfNeeded`; season-hub and scrape POSTs **do not** today.                                                                        |

**Suggested CMS touchpoints:**

- Track 1: `src/api/season-hub/services/resolveSeasonHubScope.js`, `src/api/season-hub/routes/custom-season-hub.js` (12 routes)
- Track 2: scrape route configs (`auth: false`), BFF proxy handlers
- Track 3: `listAccountBillingInvoiceRequests.js` → align with billing summary/orders pattern

---

## Questions for CMS / backend

### Scheduling and deployment

1. **ETA for Track 1 + Track 2 on staging?**
2. **Is Phase 5.1 (`GET …/billing`, `GET /api/orders/account/:accountId`) deployed to production?** If not, ETA?
3. **ETA for Phase 5.1b (`GET …/billing/invoice-requests`) on staging?**
4. **Can all three tracks ship independently**, or is there a preferred order (e.g. billing prod confirm before Vision POSTs)?
5. **Will staging QA use a fixed account** (e.g. account 700)? Is that account representative for both club and association Vision scenarios?

### Track 1 — Season-hub reads

6. **Implementation approach:** Will `resolveSeasonHubScope` load the account by `accountId` only (after `assertAccountReadAccess`), or will support get a separate code path?
7. **Payload parity:** Confirm support receives **identical** payloads to the owner — no redaction of PlayHQ IDs, internal flags, or recon diagnostics.
8. **Error shape parity:** Season-hub uses `SEASON_HUB_*` codes; support failures for non-existent accounts should stay **404** (not 403), consistent with Phase 3 — confirm?
9. **Permissions:** Season-hub scopes are bootstrapped for the Authenticated role in `src/index.js` — any Users & Permissions changes needed beyond handler-level access?
10. **Missing routes:** Confirm the route table in the request doc matches all routes in `custom-season-hub.js` — nothing else the member app calls?

### Track 2 — Vision scrape/sync POSTs (highest ambiguity)

11. **Auth model:** Today these endpoints are `auth: false` (built for admin UI). For support + owner member use, will you:
    - Add JWT auth to existing routes?
    - Add new account-scoped member routes?
    - Keep admin `auth: false` and only gate the BFF path?
12. **Account scoping enforcement:** Request requires “cannot trigger scrapes outside support read manifest.” **How** will CMS validate that `clubId` / `associationId` / `competitionId` / `gradeId` belongs to the `:accountId` in context? Request body today often has **only entity ID**, not `accountId`.
13. **Owner path today:** Do member-app owners already hit these CMS routes with JWT, or only via BFF with a service token? Need a clear before/after for **owner vs support vs anonymous**.
14. **Security if `auth: false` remains:** If routes stay open, enabling support JWT doesn’t stop unauthenticated queue abuse. Is tightening auth in scope for v1?
15. **Rate limiting / abuse:** Any limits on support-triggered scrapes (per account, per user, cooldown)? Same queues as customer actions?
16. **Idempotency:** Member app sends `Idempotency-Key` on some triggers — same contract for support?
17. **Audit:** Will support-triggered scrapes write to `supportAccessAudit` (or equivalent)? What fields: `accountId`, entity ID, job type, outcome?
18. **Confirmation UX:** Request doc says no extra confirmation dialog in the app — is backend audit alone acceptable for v1?
19. **Out-of-scope confirm:** `POST …/trigger-result-single-scrape` stays **404** for support in v1 — agreed?
20. **Partial failure:** If account scoping fails (grade not in account scope), **404** or **400** with validation code?

### Track 3 — Billing reads

21. **5.1b scope:** Is the list endpoint **only** `GET …/billing/invoice-requests`, or should **`GET …/billing/available-tiers`** ship in the same phase? FE diagnostics may want tiers for “why can’t they checkout?”
22. **List shape:** Confirm `{ invoiceRequests: InvoiceRequestSummary[] }` matches owner exactly — including `canCancel`, status, `linkedOrder`, dates, message.
23. **Pagination / limits:** Full history unbounded, or cap (e.g. last N)? Any PII redaction for support?
24. **Blocking-request triage:** When an **older** failed request blocks a new one, is that rule visible in the list payload, or only inferable from status + server-side validation on POST?
25. **Prod 5.1 verification:** Can backend confirm which deploy/environment has billing reads live and provide a smoke-test checklist for FE?

### Cross-cutting

26. **“Support manifest”:** Is this conceptual (per-handler `assertAccountReadAccess`) or will there be a central registry/docs list backend maintains?
27. **Banner / product copy:** Request doc says Support View is **not** globally read-only (Vision sync allowed). Confirm product sign-off — may conflict with Phase 5 “Read-only support view” wording.
28. **BFF vs CMS testing:** For acceptance, should FE test **through BFF** only, or will CMS provide direct Strapi curl examples for support JWT?
29. **Regression:** After Track 2 auth changes, confirm **admin frontend** scrape buttons still work.
30. **Health status:** `GET …/health/status` is already **200** for support (per Phase 5). Should Vision work assume support also uses health dashboard alongside season-hub, or is season-hub sufficient?

---

## Priority questions (if you only answer five)

1. **Track 2 auth + account↔entity scoping design** (questions 11–12)
2. **Production status of Phase 5.1** (question 2)
3. **ETA for 5.1b invoice-requests** (question 3)
4. **Audit for season-hub reads + scrape POSTs** (questions 17–18)
5. **Whether `available-tiers` is in scope for billing triage** (question 21) — otherwise defer to **5.1c**

---

## Reply template (CMS team)

Copy and fill in:

```markdown
### Scheduling

- Track 1+2 staging ETA:
- 5.1 prod status:
- 5.1b staging ETA:
- Track independence / order:

### Track 1

- resolveSeasonHubScope approach (assertAccountReadAccess vs separate path):
- Payload parity:
- Route count confirmed (custom-season-hub.js):

### Track 2 (blocks implementation — answer first)

- Auth model (pick one):
  - [ ] JWT on existing scrape routes
  - [ ] New account-scoped member routes
  - [ ] BFF-only gate; CMS stays auth: false
- Account↔entity scoping mechanism (how gradeId/clubId tied to accountId):
- Owner path today (JWT vs BFF service token):
- Close unauthenticated scrape abuse in v1: yes/no
- Audit plan (supportAccessAudit fields):
- result-single-scrape out of scope for support v1: yes/no

### Track 3

- 5.1b includes available-tiers: yes / no / defer to 5.1c
- listAccountBillingInvoiceRequests → assertAccountReadAccess: confirmed
- Blocking-request visibility in list payload:

### Testing

- BFF-only vs Strapi curl for acceptance:
- Smoke-test account (e.g. 700):
- Admin frontend scrape regression: verified yes/no
```
