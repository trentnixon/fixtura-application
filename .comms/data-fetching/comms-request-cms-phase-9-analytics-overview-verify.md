# Comms — CMS: Phase 9 analytics overview — verify deploy & permissions

**Date:** 2026-04-06  
**From:** Fixtura members app (US)  
**To:** Fixtura CMS / Strapi  
**Context:** Phase 9 `GET /api/accounts/:accountId/analytics/overview`; US now exposes a BFF at the same path shape and proxies to Strapi with the session JWT.

---

## Ask

Please confirm on your target environment (staging/production as applicable):

1. **Route exists** — `GET {STRAPI_BASE}/api/accounts/{accountId}/analytics/overview` returns **200** for a valid owning user (not **404** from Strapi).
2. **Permission** — **`api::account.account.getAccountAnalyticsOverview`** is enabled for the **Authenticated** role (Users & permissions → Roles → Authenticated → Account), or document the correct permission name if it differs.
3. **Smoke** — One successful call with a real test user JWT:
   - without query params (default 30-day window per handoff), and
   - optionally with `?from=...&to=...` (UTC ISO) within the 366-day cap.

**Reference:** [handoff/done/handoff-phase-09-analytics-overview.md](./handoff/done/handoff-phase-09-analytics-overview.md), contract [§16](./account-admin-api-contract.md#16-analytics-overview--get-accountsaccountidanalyticsoverview-phase-9).

---

## What we see on the US side

- **404 on the Next app host** at `/api/accounts/:id/analytics/overview` was addressed by adding a BFF route that forwards to Strapi (same pattern as settings/renders/etc.).
- If the app still returns **404** or Strapi-shaped errors **after** that deploy, we treat it as **CMS-side** (route not registered, env mismatch, or permission denied → often **403**).

---

## Reply (please fill in)

| Check                                            | Result / notes |
| ------------------------------------------------ | -------------- |
| Strapi route live on env `________`              |                |
| Authenticated permission                         |                |
| Sample status (200 / 403 / 404) for test account |                |

---

## Open questions

- None from US beyond deploy/permission confirmation; align if the Strapi path or permission name differs from the Phase 9 handoff.
