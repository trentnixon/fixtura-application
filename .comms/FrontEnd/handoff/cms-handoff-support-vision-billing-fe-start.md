# CMS → App handoff: Support View — Vision reads + billing invoice list + Vision sync

**Date:** 2026-09-04  
**From:** Fixtura Backend (CMS)  
**To:** Fixtura member app (frontend / BFF)  
**Ticket:** TKT-2026-017 (Backend)  
**Canonical (member app):** `.comms/FrontEnd/handoff/cms-handoff-support-vision-billing-fe-start.md`  
**Related:**

- Original FE request: [cms-request-support-vision-billing-access.md](../../API/handoff/cms-request-support-vision-billing-access.md)
- CMS questions (answered): [cms-questions-support-vision-billing-access.md](../../API/handoff/cms-questions-support-vision-billing-access.md)
- Phase 5 baseline: [cms-handoff-support-super-user-phase5-app-integration.md](../../API/handoff/cms-handoff-support-super-user-phase5-app-integration.md)
- FE tracker: [support-super-user-fe-outstanding.md](../../API/handoff/support-super-user-fe-outstanding.md)
- Season hub contract: [frontend-handoff.md](<../../../src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md>)

---

## TL;DR

Backend has shipped **TKT-2026-017** on this branch (local CMS; deploy to **staging** before FE prod):

| Track | What                                                 | Support user (after CMS staging deploy)                               |
| ----- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| **1** | Season-hub GETs                                      | **200** — same payloads as owner                                      |
| **3** | Billing summary + orders + **invoice-requests list** | **200**                                                               |
| **2** | Vision scrape/sync POSTs                             | **200** when BFF sends **`accountId` + Bearer JWT** + valid entity id |

**Support View is not globally read-only:** billing POSTs stay blocked; **Vision sync is allowed** once Track 2 BFF work lands.

**Ship FE in this order:**

1. Billing reads + invoice history (Track 3)
2. Vision reads — remove query skip / placeholder (Track 1)
3. Vision remediation buttons — **only after** BFF injects `accountId` on scrape proxies (Track 2)

**Staging first** — do not ship FE prod before CMS prod for these routes.

---

## What backend changed

### Track 1 — Season-hub reads

- `resolveSeasonHubScope` now uses **`assertAccountReadAccess`** (owner or `isSupportSuperUser`) instead of owner-only `userId` filter.
- All **12** season-hub GET routes work for support with **full owner payload parity**.
- Support reads are **audited** (`support.season_hub.read`).
- Stranger / non-support → **404** (unchanged anti-enumeration).

**BFF:** No new routes. Existing `GET /api/season-hub/:accountId/…` proxies unchanged; pass support JWT as today for other account reads.

**CMS touchpoints:** `src/api/season-hub/services/resolveSeasonHubScope.js`, `src/api/season-hub/routes/custom-season-hub.js`

### Track 3 — Billing reads (5.1b)

- `GET /api/accounts/:accountId/billing/invoice-requests` now uses **`assertAccountReadAccess`** (same as summary + orders).
- Response shape unchanged: `{ invoiceRequests: InvoiceRequestSummary[] }`.
- Support reads are **audited** (`support.account.billing.invoice_requests.list`).
- **`GET …/billing/available-tiers`** still **owner-only** (404 for support) — deferred **5.1c**.

**BFF paths (unchanged):**

| FE / BFF                         | CMS                                    |
| -------------------------------- | -------------------------------------- |
| `GET …/billing`                  | `GET /api/accounts/:accountId/billing` |
| `GET …/billing/orders`           | `GET /api/orders/account/:accountId`   |
| `GET …/billing/invoice-requests` | same path on CMS                       |

**Billing POSTs** remain **404** for support (checkout, trial, invoice create/cancel, delete pending order).

**CMS touchpoint:** `listAccountBillingInvoiceRequests.js`

### Track 2 — Vision remediation POSTs

Scrape triggers were admin-facing (`auth: false`). Member/support path is now gated when the body includes **`accountId`**:

| BFF POST (existing)                                               | Body entity field | CMS rule                                |
| ----------------------------------------------------------------- | ----------------- | --------------------------------------- |
| `…/association-overview-queues/trigger-association-single-scrape` | `associationId`   | entity ∈ account season-hub scope       |
| `…/club/trigger-club-single-scrape`                               | `clubId`          | entity ∈ account direct clubs           |
| `…/competition/trigger-grades-comps-single-scrape`                | `competitionId`   | entity ∈ account effective competitions |
| `…/competition/trigger-grades-lookup-teams-single-scrape`         | `competitionId`   | same                                    |
| `…/grade/trigger-fixture-discovery`                               | `id` (grade id)   | entity ∈ account effective grades       |

**Member/support contract (required for Track 2):**

```json
{
  "accountId": 700,
  "clubId": 12345
}
```

- **`accountId`** — from Support View URL `/o/[accountId]/…`, **not** from `/me`.
- **`Authorization: Bearer <support-or-owner-jwt>`** — CMS resolves JWT on these routes even though Strapi route config is `auth: false`.
- Out-of-scope entity → **404**.
- Missing JWT when `accountId` present → **401**.
- **No `accountId` in body** → legacy admin path (unchanged); admin app keeps working without `accountId`.

**Out of scope v1:** `POST …/game-meta-data/trigger-result-single-scrape` — still not for support.

---

## FE implementation checklist

### Phase A — Billing in Support View (start after CMS on **staging**)

- [ ] Re-enable `/o/[accountId]/billing` for `isSupportView` (remove hard skip / error gate if any remain).
- [ ] Load **summary** + **orders** + **`invoice-requests` list** — enable invoice-requests query when `isSupportView` (remove latest-only fallback in history).
- [ ] Hide/disable all billing **POST** UI (checkout, trial, invoice create/cancel, delete order) when `isSupportView`.
- [ ] Add **Billing** to support sidebar (always visible; show load error if GET fails).
- [ ] Add support-only diagnostics panel: `billingUiMode`, `availableActions`, trial, `latestInvoiceRequest` + full list for triage.
- [ ] Primary triage case: **older** invoice request blocks new one while summary `latestInvoiceRequest` looks fine — show full list read-only.
- [ ] Confirm BFF orders proxy targets **`GET /api/orders/account/:accountId`** on CMS.

### Phase B — Vision reads (after CMS staging)

- [ ] Remove season-hub query skip when `isSupportView` (`useSeasonHubQueriesEnabled`).
- [ ] Enable Vision nav item; remove “Vision unavailable in support view” placeholder (`season-overview`, dashboard Vision card).
- [ ] Use **URL `accountId`** for all season-hub BFF calls (same as other Support View screens).
- [ ] Keep scrape/sync buttons **disabled or hidden** until Phase C is deployed and verified.

### Phase C — Vision remediation (BFF change required)

- [ ] On each existing scrape proxy, **add `accountId`** from route context to JSON body forwarded to CMS.
- [ ] Forward **Bearer JWT** on scrape POSTs (same session token as other authenticated BFF calls).
- [ ] Enable scrape/sync buttons in Support View when `isSupportView` (same UX as customer; no extra confirm dialog for v1).
- [ ] Ensure owners on normal routes also send `accountId` if they use the same BFF proxies (recommended for consistent CMS scoping).

**Example BFF body augmentation (conceptual):**

```typescript
// POST /api/club/trigger-club-single-scrape
await strapiPost("/api/club/trigger-club-single-scrape", {
  accountId: Number(params.accountId), // from /o/[accountId]/…
  clubId: body.clubId,
});
```

### Phase D — UX copy

- [ ] Update Support View banner: **billing read-only**; **Vision sync allowed** when Phase C live — not “globally read-only”.
- [ ] Optional short note on disabled scrape buttons until backend staging confirms Track 2.

---

## Auth & routing reminders

- Capability: `GET /api/account/me` → `user.capabilities.canAccessAllAccounts === true`.
- Support user with **no owned account**: `/me` may have `accountId: null` — always use **selected customer `accountId` from URL**.
- Route guard: non-support users must not reach `/o/{someoneElse}/…` (existing app guard).

---

## Acceptance testing (staging)

Use **one club** and **one association** customer account (CMS will nominate IDs on staging).

### Vision reads

1. Support opens `/o/{accountId}/season` → recon, stats, competitions **200**.
2. Drill-down to fixture detail **200**.
3. Normal member on another user’s account → **404**.

### Billing

4. Support `GET …/billing`, `GET …/billing/orders`, `GET …/invoice-requests` → **200**, same shapes as owner.
5. Support billing POSTs → **404**.

### Vision sync (after Phase C)

6. Support org sync (club or association) → **200**, job queued.
7. Support teams lookup + fixture discovery on in-scope grade → **200**.
8. Scrape with entity **outside** account scope → **404**.
9. Support-only user: verify scrape uses URL `accountId`, not `/me.accountId`.

---

## Deploy coordination

| Step                                | Owner         |
| ----------------------------------- | ------------- |
| Deploy CMS to **staging**           | Backend / ops |
| FE QA on staging (Phases A → B → C) | App team      |
| Deploy CMS to **production**        | Backend / ops |
| Deploy member app to **production** | App team      |

**Do not** ship FE prod ahead of CMS prod for these routes.

Phase **5.1** billing summary/orders may already work on local CMS; confirm staging/prod with backend before enabling billing in prod Support View.

---

## Open / not in this release

- `GET …/billing/available-tiers` for support (**5.1c**).
- Per-fixture result scrape for support.
- Stricter lockdown of admin-only unauthenticated scrape paths (separate security ticket).
- Invoice create/fix in member app — remains Strapi Admin.

---

## Questions

Reply in member app `.comms/API/handoff/` or tag backend on **TKT-2026-017** if:

- BFF needs a worked example for one scrape proxy end-to-end.
- Staging account IDs for club vs association QA are needed.
- Invoice list row shape questions (`canCancel` etc.) — same as owner; hide actions in UI only.
