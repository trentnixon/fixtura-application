# CMS reply — Support super-user P0 billing (Phase 5.1)

**Date:** 2026-08-07  
**From:** Backend / CMS team  
**To:** Fixtura member app (frontend)  
**Related:** [cms-request-support-super-user-billing-read-access.md](./cms-request-support-super-user-billing-read-access.md), [cms-handoff-support-super-user-phase5-app-integration.md](./cms-handoff-support-super-user-phase5-app-integration.md), [support-super-user-fe-outstanding.md](./support-super-user-fe-outstanding.md)

> **Note:** The main Phase 5 handoff billing table was stale when this was written. Phase **5.1** shipped on local CMS — use **this document** for billing support-read status.

---

## P0 billing (#1–#6)

### 1. Phase 5.1 — status today (support JWT, non-owned account)

| Route                                                                | Status  |
| -------------------------------------------------------------------- | ------- |
| `GET /api/accounts/:accountId/billing`                               | **200** |
| BFF `…/billing/orders` → Strapi `GET /api/orders/account/:accountId` | **200** |
| `GET /api/accounts/:accountId/billing/invoice-requests`              | **404** |

**Important:** Billing **summary** already includes **`latestInvoiceRequest`** (latest row only). Full invoice-request **list** is still owner-only.

**P0 implication:** If billing history **blocks** on invoice-requests GET, **decouple on FE** (load summary + orders; treat missing list as optional / use `latestInvoiceRequest` from summary). CMS is **not** changing invoice-requests to `200 + []` in 5.1.

---

### 2. Phase 5.1b — invoice-requests

| Question                 | Answer                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Until 5.1b               | Stays **404** (not empty array)                                                                                                      |
| Ticket / ETA             | **Not ticketed yet** — tracked as Phase 5.1b in backend `docs/support-super-user-access-implementation-phases.md`; no date           |
| Required for support v1? | **Optional** for v1 — summary + orders enough for trial/checkout troubleshooting; full history tab needs 5.1b or FE workaround above |

---

### 3. Order history Strapi path

**Yes.** Support wired on **`GET /api/orders/account/:accountId`** via `assertAccountReadAccess` + audit — same pattern as Phase 3/5.1. There is no CMS route at `…/billing/orders`.

---

### 4. `availableActions` for support billing GET

**A — full parity with owner.** Same payload and `computeAvailableActions`; **no** server-side “all false” for support. **Hide/disable POST CTAs in the app** (`isSupportView`).

---

### 5. Field redaction

**Full parity** — same fields as owner GET (trial, `organisationTrial`, orders metadata, Stripe IDs, invoice URLs, etc.). **No** server-side redaction in 5.1. Support troubleshooting needs that context; don’t expose via UI copy/logging.

---

### 6. Audit — billing reads

**Yes** — one audit row per **successful support** GET (owner reads are not audited).

| Route           | `action`                               | `routeTemplate`                |
| --------------- | -------------------------------------- | ------------------------------ |
| Billing summary | `support.account.billing.summary.read` | `/accounts/:accountId/billing` |
| Orders          | `support.account.billing.orders.list`  | `/orders/account/:accountId`   |

---

## P1 coverage (#7–#10)

### 7. Render detail

**Yes — 200 for support** today. Both list and detail use `loadAccountForRead` / `assertAccountReadAccess`.

---

### 8. Coverage checklist (support on customer account)

| Route                                                 | Support              |
| ----------------------------------------------------- | -------------------- |
| `GET /api/account/:accountId/health/status`           | **200**              |
| `GET /api/accounts/:accountId/scheduler`              | **200**              |
| `GET /api/accounts/:accountId/media-library`          | **200**              |
| `GET /api/accounts/:accountId/media-library/:mediaId` | **200**              |
| `GET /api/accounts/:accountId/sponsors`               | **200**              |
| Sponsor entity targets + allocation GETs              | **200**              |
| `GET /api/accounts/:accountId/grade-ordering?…`       | **200**              |
| `PUT …/grade-ordering`                                | **404** (owner-only) |

---

### 9. Deferred routes — backlog (no ETAs)

| Route                                                       | Support today | Backlog                                 |
| ----------------------------------------------------------- | ------------- | --------------------------------------- |
| `/api/season-hub/*`                                         | **404**       | Follow-up read ticket (Phase 3 pattern) |
| `GET /template-categories/all-template-options?accountId=…` | **404**       | Same                                    |
| `GET /api/accounts/:accountId/club-logos-directory`         | **404**       | Same                                    |
| `GET …/billing/available-tiers`                             | **404**       | Phase **5.1b**                          |
| `GET …/billing/invoice-requests`                            | **404**       | Phase **5.1b**                          |

**Nav:** hide or “unavailable in support view” — no CMS dates yet.

---

### 10. Directory `onboardingStatus` filter

**Response field only** — not a query param today. Supported filters: `page`, `pageSize`, `search`, `sport`, `isActive`, `isSetup`, `healthStatus`, `sort`. **No plan to add `onboardingStatus` filter** in v1; keep using **`isSetup`** (and row `onboardingStatus` in response if useful for display).

---

## Security / edge cases (#11–#14)

### 11. Dual-role users

**Correct.** Mutations on **owned** account `42` behave exactly like a normal owner (**200** on valid POSTs). Ownership check is `account.user === userId` only — support flag does not block own-account writes.

---

### 12. Mutations on customer accounts

Billing POSTs use **`validateAccountOwnership`** → **404** `Account not found` when not owner (checkout, resume, start-trial, invoice create/cancel, delete pending order). **No** support-specific 403 on those routes for wrong account. (403 only where business rules apply **after** ownership passes — e.g. grade-ordering PUT when feature flag off.)

---

### 13. Production deploy

Phases **0–6 + 5.1** are on **local CMS only** today. **No prod deploy date yet.** Do **not** enable billing in prod support view until CMS confirms prod has 5.1 — backend will raise a deploy/handoff ticket when ready.

---

### 14. Rate limits on billing reads

**None** beyond normal auth. Support-specific rate limit is **directory only** (60 req/min/user, in-memory). Billing GETs are uncapped on our side for v1.

---

## Bottom line for P0 (frontend)

1. **Flip on:** `GET …/billing` + Strapi `GET /orders/account/:accountId` (reads should succeed on local CMS without BFF changes).
2. **Disable all billing POSTs** in support view (`isSupportView`) despite full-parity `availableActions` from GET.
3. **Decouple** billing history from `GET …/invoice-requests` (404 until 5.1b), or use **`latestInvoiceRequest`** from summary where a single latest row is enough.
