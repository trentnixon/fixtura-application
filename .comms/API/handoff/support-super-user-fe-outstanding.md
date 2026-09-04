# Support Super-User — Member app outstanding work

**Date:** 2026-08-07  
**Audience:** Fixtura member app (frontend) team  
**Backend reference:** [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md)  
**CMS billing answers (P0):** [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md)  
**CMS Vision + billing (2026-09-04):** [cms-request-support-vision-billing-access.md](./cms-request-support-vision-billing-access.md)  
**CMS questions (Vision + billing):** [cms-questions-support-vision-billing-access.md](./cms-questions-support-vision-billing-access.md)  
**CMS → FE start (TKT-2026-017):** [cms-handoff-support-vision-billing-fe-start.md](../../FrontEnd/handoff/cms-handoff-support-vision-billing-fe-start.md)  
**Phases tracker:** [docs/support-super-user-access-implementation-phases.md](../../../docs/support-super-user-access-implementation-phases.md)

This file lists **frontend-only** work still open after Phase 5 core integration (directory + `/o/[accountId]/…` support view). Backend Phases 0–4 and **5.1 billing reads** are done on **local CMS** (not prod yet).

---

## Already shipped (not outstanding)

Use this section to avoid re-doing work.

- [x] `canAccessAllAccounts` from `GET /api/account/me` (bootstrap re-fetch; no localStorage authority)
- [x] Support-only login → `/support/accounts`
- [x] Dual-role login → `/select-organisation` + Support nav entry
- [x] Directory UI `/support/accounts` (BFF → Strapi directory; pagination, filters, debounced search, 403/429)
- [x] Directory row → `/o/{accountId}/dashboard` (reuse normal app routes, not parallel `/support/accounts/:id/*` tree)
- [x] Read-only banner for non-owned accounts + link back to directory
- [x] Phase 3 reads exercised on customer accounts (settings, branding, organisation, notifications, onboarding, renders, analytics, org dashboard)
- [x] Season-hub queries skipped in support view (Vision placeholder; no global error toasts)
- [x] Zero references to legacy `GET /api/account/admin/lookup`
- [x] BFF order history confirmed → Strapi `GET /api/orders/account/:accountId` (see CMS reply)

---

## P0 — Support Vision + billing (TKT-2026-017)

**CMS shipped (staging deploy pending):** [cms-handoff-support-vision-billing-fe-start.md](../../FrontEnd/handoff/cms-handoff-support-vision-billing-fe-start.md)

**Ship order:** Billing (Track 3) → Vision reads (Track 1) → Vision sync (Track 2, requires BFF `accountId` on scrape POSTs).

### Phase A — Billing

- [x] Enable invoice-requests list query when `isSupportView` (remove latest-only fallback)
- [x] Billing sidebar for support; diagnostics panel
- [x] Verify billing POST UI still hidden

### Phase B — Vision reads

- [ ] Remove `useSeasonHubQueriesEnabled` skip; remove Vision placeholders
- [ ] Vision in support sidebar
- [ ] Scrape buttons hidden until Phase C

### Phase C — Vision sync (BFF)

- [ ] Inject `accountId` + Bearer JWT on scrape proxy bodies to CMS
- [ ] Enable scrape/sync in Support View

### Phase D — UX

- [ ] Support banner copy (billing read-only; Vision sync when Phase C live)

---

## P0 — Do next (legacy billing 5.1)

### 1. Enable billing in support view (Phase 5.1)

CMS allows support reads on **local CMS** (see [CMS reply](./cms-reply-support-super-user-p0-billing-2026-08-07.md)):

| Endpoint             | CMS path                                                          | Support                                   |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Billing summary      | `GET /api/accounts/:accountId/billing`                            | **200** — includes `latestInvoiceRequest` |
| Order history        | `GET /api/orders/account/:accountId` (via BFF `…/billing/orders`) | **200**                                   |
| Invoice-request list | `GET /api/accounts/:accountId/billing/invoice-requests`           | **404** until 5.1b                        |

**Tasks:**

- [x] Verify dashboard billing card loads when billing GET succeeds in support view (hides on 404 via `useBillingProductStateSnapshot` — works when CMS returns 200)
- [x] Verify `/o/[accountId]/billing` overview loads (`useAccountBilling`, `useAccountBillingOrders`)
- [x] **Decouple billing history** from invoice-requests GET in `useBillingHistoryContentState` — orders no longer gated on invoice-requests; support uses `latestInvoiceRequest` from summary
- [x] Hide/disable all billing **POST** actions when `isSupportView` (`useBillingSupportReadOnly`, overview actions, payment-pending banner, create wizard redirect)
- [ ] QA: support user → customer account → trial status, `organisationTrial`, order history visible; mutations return 404 if triggered

**Invoice-request list (5.1b):** Required for invoice stuck-state triage (older requests not in `latestInvoiceRequest`). See [cms-request-support-vision-billing-access.md](./cms-request-support-vision-billing-access.md) Track 3.

**Prod:** Do **not** enable billing in prod support view until CMS confirms prod deploy includes 5.1.

---

## P1 — Read-only UX polish (deferred from v1)

Backend enforces owner-only mutations; UI should still prevent confusion.

### Write guards (screen-by-screen)

- [x] Settings — disable/hide Save
- [x] Branding — disable uploads / save
- [ ] Organisation / scheduler — disable writes
- [ ] Onboarding — disable confirm / write steps
- [x] Media library — disable upload / delete
- [x] Sponsors — disable create / edit / delete / allocations writes
- [x] Grade ordering — disable reorder (PUT); GET only
- [ ] Renders — disable trigger / write actions if any
- [x] Notifications — disable PATCH
- [x] Billing — disable all actions (see P0)

**Pattern:** Prefer `isSupportView` or `readOnly` prop on shared components rather than one-off checks.

### Navigation pruning

Routes that **404** for support today should be hidden or show intentional empty states:

- [x] **Vision / Season hub** — hidden in support view nav (page placeholder unchanged)
- [x] **Billing** — user menu links to `/billing`; overview/history work after P0 decouple
- [x] **Template builder** — hidden from nav; direct URL shows unavailable card in support view
- [x] **Club logos** — hidden from nav; direct URL shows unavailable card in support view

### Error / empty states

- [ ] Consistent copy for support-blocked areas: “Unavailable in support view (read-only)” vs generic errors
- [ ] Accidental write → 404: friendly “Read-only support view” message where hooks surface errors

---

## P1 — Coverage gaps (screens not confirmed exercised in app)

CMS confirms **200** for support on local CMS (see [CMS reply](./cms-reply-support-super-user-p0-billing-2026-08-07.md)). Prioritise if support staff need them in the member app:

- [ ] `GET /api/account/:accountId/health/status` (note `/account/` prefix, not `/accounts/`)
- [ ] `GET /api/accounts/:accountId/scheduler`
- [ ] `GET /api/accounts/:accountId/media-library` (+ item detail)
- [ ] `GET /api/accounts/:accountId/sponsors` (+ entity targets, allocation lists)
- [ ] `GET /api/accounts/:accountId/grade-ordering` (requires `organisationType` + `organisationId`)
- [ ] Render detail route (CMS confirms **200**; exercise in app QA)

---

## P1 — Documentation (frontend repo)

- [x] CMS reply doc for Phase 5.1 billing status
- [x] Phase 5 handoff billing section updated (was stale)
- [ ] Update internal handoff / README to describe **actual** architecture: directory at `/support/accounts`, customer context via **`/o/[accountId]/…`**, not parallel `/support/accounts/:id/*` tree from original CMS suggestion
- [ ] Document `isSupportView` detection (non-owned `accountId` from URL + capability, or explicit context flag)
- [x] Note billing order-history Strapi path (`GET /api/orders/account/:accountId`)

---

## P2 — Blocked on backend (do not build until CMS ships)

**Superseded for Vision + billing 5.1b by TKT-2026-017** — see [cms-handoff-support-vision-billing-fe-start.md](../../FrontEnd/handoff/cms-handoff-support-vision-billing-fe-start.md). Remaining P2 rows below are **other** support gaps.

**Original CMS request:** [cms-request-support-vision-billing-access.md](./cms-request-support-vision-billing-access.md)

| Feature                         | CMS status (2026-09-04) | FE action                           |
| ------------------------------- | ----------------------- | ----------------------------------- |
| Invoice requests list           | **Shipped (5.1b)**      | Phase A in FE start handoff         |
| Season hub GETs                 | **Shipped (Track 1)**   | Phase B in FE start handoff         |
| Season hub scrape POSTs         | **Shipped (Track 2)**   | Phase C — BFF `accountId` injection |
| Available tiers                 | 404 (5.1c)              | Optional; low priority              |
| Template `all-template-options` | 404                     | Enable template builder read path   |
| Club logos directory            | 404                     | Enable logos troubleshooting UI     |

**Do not build:** render-token, billing POSTs, support mutations (Phase 7+).

---

## P2 — Product / UX decisions (open)

Resolve with product; blocks polish not core flow:

1. **Default landing after directory pick** — dashboard (current) vs settings vs health
2. **Dual-role “My account” vs Support** — explicit switcher vs directory-only entry (CMS: mutations on owned account work normally)
3. **Minimum screen set sign-off** — which `/o/…` sections are in scope for support v1
4. ~~**Invoice-requests in support billing**~~ — **Resolved:** optional for v1; decouple history from list GET; use `latestInvoiceRequest` from summary if needed

---

## P2 — Production readiness (when leaving local CMS)

- [ ] Confirm deployed CMS includes Phases 0–4 + 5.1 before enabling billing in prod support view (await CMS deploy/handoff ticket)
- [ ] Smoke test: capability revoke on live `/me` + directory 403
- [ ] Confirm no prod code path calls admin lookup (already true in dev)

---

## Explicit non-goals (frontend)

Do **not** implement unless product opens a new epic:

- Customer impersonation / login-as-user
- Support write flows (settings save on behalf of customer, etc.)
- Audit log viewer in member app
- Parallel full route tree at `/support/accounts/:accountId/...` (current `/o/` approach is intentional)
- `GET /api/account/admin/lookup`

---

## Suggested order of execution

1. **P0** — Billing enablement (5.1): verify reads + decouple history + disable POSTs
2. **P1** — Write guards on high-traffic screens (settings, billing, branding)
3. **P1** — Nav pruning (Vision, template, club logos)
4. **P1** — Remaining screen coverage + QA checklist
5. **P1** — Frontend docs update (architecture + `isSupportView`)
6. **P2** — Invoice-requests / season hub when backend tickets land

---

## Local QA checklist (repeat after each tranche)

- [ ] Support user: directory 200, search/filters, 429 handling
- [ ] Normal user: directory 403, no Support nav (or hidden)
- [ ] Pick customer account → banner + Phase 3 GETs 200
- [ ] Billing summary + orders 200; billing history loads without invoice-requests list (after P0)
- [ ] Billing POSTs disabled in UI; direct POST → 404
- [ ] Season hub still skipped / placeholder (until backend)
- [ ] PATCH/POST on customer account → 404; UI disabled where implemented
- [ ] Dual-role: owned account mutations still work
- [ ] Revoke `isSupportSuperUser` → next `/me` drops capability; reads stop

---

## Links

- CMS → App handoff: [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md)
- CMS billing reply (5.1): [cms-reply-support-super-user-p0-billing-2026-08-07.md](./cms-reply-support-super-user-p0-billing-2026-08-07.md)
- CMS billing request: [cms-request-support-super-user-billing-read-access.md](./cms-request-support-super-user-billing-read-access.md)
- Billing API contract: [.comms/accounts/handoff/frontend-billing-api-contract-handoff.md](../../accounts/handoff/frontend-billing-api-contract-handoff.md)
- Phase 6 (backend): legacy lookup removal — no FE work except confirm zero refs (done)
