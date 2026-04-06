# Account admin API — normative contract (Fixtura CMS)

**Audience:** Fixtura members-area frontend and LLM implementers.

**Source of truth:** Phase handoffs in [`.comms/data-fetching/handoff/`](./handoff/) plus this index. Backend implementation lives in the CMS (Strapi) repo; paths below assume an API prefix such as `/api`.

---

## 2. Tenancy and transport (JWT)

- **JWT:** `Authorization: Bearer <jwt>` on authenticated routes (users-permissions), same as existing Strapi patterns.
- **Account ID for new routes:** **Path only** — `GET /api/accounts/:accountId/...` with a positive integer Strapi account id.
- **Bootstrap:** `GET /api/account/me` has **no** path `accountId` (see §9).

---

## 3. Access rules and ownership

- The authenticated user must **own** the account (`account.user` = JWT user id), consistent with `validateAccountOwnership` / legacy hub behaviour.
- **Non-owner membership** is out of scope until product updates the access matrix (update this section before implementing team access).

---

## 4. Error semantics (account-scoped and shared)

| Situation                                               | HTTP status | Notes                                                                             |
| ------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| Not authenticated                                       | **401**     | Missing/invalid JWT.                                                              |
| Valid JWT, role lacks permission                        | **403**     | Strapi users-permissions scope.                                                   |
| Invalid `accountId` (not a positive integer)            | **400**     | Bad request.                                                                      |
| Valid JWT, user does **not** own account (or no access) | **404**     | **“Account not found”** — same as legacy hub; do not distinguish from unknown id. |
| Sub-resource not found (with valid account access)      | **404**     | Per-endpoint in later phases.                                                     |
| Server error                                            | **500**     | Generic client message.                                                           |

Prefer the Strapi default JSON error shape for new routes.

---

## 6. Caching and freshness

- **v1:** No requirement for `ETag` / `Cache-Control` for correctness; safe default is **private, no-store** for sensitive account data unless product approves.
- **Deferred:** conditional GET / analytics revalidation — see CMS implementation notes when available.

---

<a id="7-route--endpoint-map"></a>

## 7. Route — endpoint map

| Phase | Method | Path (after `/api`)                       | Handoff                                                                                                                |
| ----- | ------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1     | GET    | `/account/me`                             | [handoff-phase-01-account-me-bootstrap.md](./handoff/handoff-phase-01-account-me-bootstrap.md)                         |
| 2     | GET    | `/accounts/:accountId/settings`           | [handoff-phase-02-accounts-settings.md](./handoff/handoff-phase-02-accounts-settings.md)                               |
| 3     | GET    | `/accounts/:accountId/branding`           | [handoff-phase-03-accounts-branding.md](./handoff/handoff-phase-03-accounts-branding.md)                               |
| 4     | GET    | `/accounts/:accountId/organisation`       | [handoff-phase-04-accounts-organisation.md](./handoff/handoff-phase-04-accounts-organisation.md)                       |
| 5     | GET    | `/accounts/:accountId/scheduler`          | [handoff-phase-05-accounts-scheduler.md](./handoff/handoff-phase-05-accounts-scheduler.md)                             |
| 6     | GET    | `/accounts/:accountId/render-token`       | [handoff-phase-06-accounts-render-token.md](./handoff/handoff-phase-06-accounts-render-token.md)                       |
| 7     | GET    | `/accounts/:accountId/renders`            | [handoff-phase-07-renders-list.md](./handoff/handoff-phase-07-renders-list.md)                                         |
| 8     | GET    | `/accounts/:accountId/renders/:renderId`  | [handoff-phase-08-accounts-render-detail.md](./handoff/handoff-phase-08-accounts-render-detail.md)                     |
| 9     | GET    | `/accounts/:accountId/analytics/overview` | (Phase 9 handoff when published)                                                                                       |
| —     | GET    | `/account/organisation/:accountId`        | **Legacy hub** (retained; heavy aggregate). See [handoff-phase-00-contract.md](./handoff/handoff-phase-00-contract.md) |

Normative transport rules for new `/accounts/:accountId/...` routes: [handoff-phase-00-contract.md](./handoff/handoff-phase-00-contract.md).

---

<a id="9-bootstrap--get-accountme-phase-1"></a>

## 9. Bootstrap — GET /account/me (Phase 1)

Lightweight shell bootstrap: user context, `accounts[]` summaries, **not** full scheduler/renders/analytics payloads. Full dashboard may use the legacy hub or future dedicated routes per §7.

**Detail:** [handoff-phase-01-account-me-bootstrap.md](./handoff/handoff-phase-01-account-me-bootstrap.md)

---

<a id="10-branding--get-accountsaccountidbranding-phase-3"></a>

## 10. Branding — GET /accounts/:accountId/branding (Phase 3)

**Detail:** [handoff-phase-03-accounts-branding.md](./handoff/handoff-phase-03-accounts-branding.md)

---

<a id="11-organisation--get-accountsaccountidorganisation-phase-4"></a>

## 11. Organisation — GET /accounts/:accountId/organisation (Phase 4)

**Detail:** [handoff-phase-04-accounts-organisation.md](./handoff/handoff-phase-04-accounts-organisation.md)

---

<a id="12-scheduler--get-accountsaccountidscheduler-phase-5"></a>

## 12. Scheduler — GET /accounts/:accountId/scheduler (Phase 5)

**Detail:** [handoff-phase-05-accounts-scheduler.md](./handoff/handoff-phase-05-accounts-scheduler.md)

---

<a id="13-render-token--get-accountsaccountidrender-token-phase-6"></a>

## 13. Render token — GET /accounts/:accountId/render-token (Phase 6)

**Detail:** [handoff-phase-06-accounts-render-token.md](./handoff/handoff-phase-06-accounts-render-token.md)

---

<a id="14-renders-list--get-accountsaccountidrenders-phase-7"></a>

## 14. Renders list — GET /accounts/:accountId/renders (Phase 7)

**Detail:** [handoff-phase-07-renders-list.md](./handoff/handoff-phase-07-renders-list.md)

---

<a id="15-render-detail--get-accountsaccountidrendersrenderid-phase-8"></a>

## 15. Render detail — GET /accounts/:accountId/renders/:renderId (Phase 8)

**Detail:** [handoff-phase-08-accounts-render-detail.md](./handoff/handoff-phase-08-accounts-render-detail.md)

---

## Frontend implementation

- Approved pipeline: [`.skills/api-data-layer-patterns.md`](../../.skills/api-data-layer-patterns.md) — route registry → central client → domain service → TanStack Query.
- Planned route keys for `/api/accounts/...` live in `src/lib/api/routes/route-definitions.ts` (`appRoutes.accounts.*`).
- HTTP semantics constant: `src/lib/api/account-scoped-http-semantics.ts`.
