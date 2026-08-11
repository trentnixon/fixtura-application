# Handoff — Phase 9: `GET /accounts/:accountId/analytics/overview`

**Phase:** 9
**Date:** 2026-04-06
**Author:** Backend (Fixtura CMS)
**Backend reference:** [account-admin-api-contract.md §16](../account-admin-api-contract.md#16-analytics-overview--get-accountsaccountidanalyticsoverview-phase-9), [phase-09-accounts-analytics-overview.md](../phase-09-accounts-analytics-overview.md), implementation: [`src/api/account/controllers/services/getAccountAnalyticsOverviewPayload/index.js`](../../../../src/api/account/controllers/services/getAccountAnalyticsOverviewPayload/index.js)

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

Phase 9 adds a **server-aggregated analytics overview** for the account dashboard: **KPI rollup**, **cost / percentage metrics** (same business rules as the legacy hub), **`metricsOverTime`** summary plus **per-day** arrays, and a **daily `series`** for charts. All metrics are **scoped to a bounded UTC date range** (`from` / `to`, max **366 days**); defaults match Phase 0 (**30-day rolling window** when both bounds are omitted). The implementation uses **count queries and SQL aggregates** (via Strapi `db.query` and Knex where available) over **`render.createdAt`** and joined child tables — **not** a full in-memory scan of every historical render row like the legacy hub.

---

## Endpoints

| Method | Path (suffix)                             | Purpose                                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| GET    | `/accounts/:accountId/analytics/overview` | Dashboard KPIs, cost/percent metrics, and per-day series for the authenticated owner |

Full URL example: `GET {CMS_BASE_URL}/api/accounts/319/analytics/overview` (use your Strapi API prefix if not `/api`).

---

## Auth and tenancy

- **JWT:** `Authorization: Bearer <jwt>` (users-permissions).
- **Account ID:** Path parameter **`accountId`** (positive integer), per Phase 0.
- **Access rule:** User must **own** the account (`account.user` = JWT user id). Unknown id or non-owner both return **404** “Account not found” (no enumeration). Strapi permission: **`api::account.account.getAccountAnalyticsOverview`** (403 if disabled for the role).

**Post-deploy:** Enable **Account → getAccountAnalyticsOverview** for the **Authenticated** role (Settings → Users & permissions → Roles → Authenticated → Account).

---

## Request details

**Query parameters (Phase 0 §5)**

| Param  | Meaning                     | Default                                                                              | Notes             |
| ------ | --------------------------- | ------------------------------------------------------------------------------------ | ----------------- |
| `from` | Range start (ISO 8601, UTC) | If omitted with `to`: **`to` minus 30 days**; if both omitted: **now minus 30 days** | Invalid → **400** |
| `to`   | Range end (ISO 8601, UTC)   | If omitted with `from`: **now**; if both omitted: **now**                            | Invalid → **400** |

**Span:** `(to - from)` must not exceed **366 days**; otherwise **400** “Date range must not exceed 366 days”.
**Ordering:** `from` must be **≤** `to`; otherwise **400**.

**Empty scheduler:** If the account has no linked scheduler, **200** with **`rollup` / `metricsOverTime` / `metricsAsPercentageOfCost`** all zeros or empty **and** `series: []`.

Example:

```http
GET /api/accounts/319/analytics/overview?from=2026-03-01T00:00:00.000Z&to=2026-04-06T23:59:59.999Z HTTP/1.1
Host: YOUR_CMS_HOST
Authorization: Bearer YOUR_JWT
```

---

## Response shape

- **Envelope:** `{ "data": { "id", "rollup", "metricsOverTime", "metricsAsPercentageOfCost", "series" }, "meta": { ... } }` — **top-level `meta`** is required for range and freshness (unlike routes that only return `{ data }`).

**`meta`**

| Field                 | Meaning                                                     |
| --------------------- | ----------------------------------------------------------- |
| `from`                | Resolved window start (ISO string)                          |
| `to`                  | Resolved window end (ISO string)                            |
| `timezone`            | `"UTC"` (v1)                                                |
| `computedAt`          | When the response was built (ISO string)                    |
| `staleness`           | Human-readable note (e.g. computed on read from primary DB) |
| `totalRendersInRange` | Same as `data.rollup.totalRenders`                          |

**`data.rollup`**

Same field names as the legacy hub **`rollup`**, but **only for renders with `createdAt` in `[from, to]`** (the legacy hub was effectively **all-time**).

**`data.metricsOverTime`**

Summary totals plus **`GameResultsArr`**, **`UpcomingGamesArr`**, **`GradesArr`**, **`AiArticlesArr`**, **`DownloadsArr`**. In the **legacy hub**, these arrays had **one entry per render**. In Phase 9, they have **one entry per calendar day (UTC)**, in chronological order — **aligned with `data.series`**. **`metricsAsPercentageOfCost.averageCostOverTime`** uses the same formula as the hub but **per day** (paired **`AiArticlesArr`** / **`DownloadsArr`** indices), not per render.

**`data.series`**

Array of `{ date, renders, completeRenders, gameResults, upcomingGames, grades, downloads, aiArticles }` with **`date`** = `YYYY-MM-DD` (UTC).

**Stable v1:** `rollup` field names, `metricsAsPercentageOfCost` keys, `series` object keys, `meta` keys. **`series` length** may grow with calendar days in range.

Example (sanitised):

```json
{
  "data": {
    "id": 319,
    "rollup": {
      "totalRenders": 12,
      "totalProcessingRenders": 2,
      "totalCompleteRenders": 10,
      "totalEmailsSent": 8,
      "totalTeamRosterRequests": 0,
      "totalTeamRosters": 0,
      "totalTeamRosterEmails": 0,
      "totalForceRerenders": 0,
      "totalForceRerenderEmails": 0,
      "totalGameResults": 40,
      "totalUpcomingGames": 15,
      "totalGrades": 6,
      "totalDownloads": 120,
      "totalAiArticles": 5
    },
    "metricsOverTime": {
      "totalRenders": 12,
      "totalCompleteRenders": 10,
      "totalDownloads": 120,
      "totalEmailsSent": 8,
      "totalGameResults": 40,
      "totalUpcomingGames": 15,
      "totalGrades": 6,
      "totalAiArticles": 5,
      "GameResultsArr": [2, 0, 5],
      "UpcomingGamesArr": [1, 0, 3],
      "GradesArr": [0, 0, 2],
      "AiArticlesArr": [0, 1, 2],
      "DownloadsArr": [10, 5, 40]
    },
    "metricsAsPercentageOfCost": {
      "valuePerRender": 20,
      "totalCostByAccount": 240,
      "totalDigitalAssets": 125,
      "percentageCompleteRenders": 83.33,
      "percentageProcessingRenders": 16.67,
      "percentageGameResults": 32,
      "percentageDownloads": 96,
      "percentageAiArticles": 4,
      "averageCostPerDigitalAsset": 1.92,
      "averageCostOverTime": [0.5, 0.3, 2.1]
    },
    "series": [
      {
        "date": "2026-04-04",
        "renders": 4,
        "completeRenders": 3,
        "gameResults": 2,
        "upcomingGames": 1,
        "grades": 0,
        "downloads": 10,
        "aiArticles": 0
      }
    ]
  },
  "meta": {
    "from": "2026-03-07T00:00:00.000Z",
    "to": "2026-04-06T23:59:59.999Z",
    "timezone": "UTC",
    "computedAt": "2026-04-06T12:00:00.000Z",
    "staleness": "Computed on read from the primary database; numbers reflect data as of request time.",
    "totalRendersInRange": 12
  }
}
```

---

## Errors

| Situation                                    | HTTP status | Notes                                              |
| -------------------------------------------- | ----------- | -------------------------------------------------- |
| Not authenticated                            | **401**     | Missing or invalid JWT                             |
| Role lacks permission                        | **403**     | Valid JWT but action not allowed                   |
| Invalid `accountId`                          | **400**     | Not a positive integer                             |
| Invalid `from` / `to` or range &gt; 366 days | **400**     | Bad request message                                |
| Unknown account or not owner                 | **404**     | “Account not found” (same as other account routes) |
| Server error                                 | **500**     | Generic message; details in server logs            |

---

## Migration from legacy hub

- **Previously:** `GET /api/account/organisation/:accountId` returned **`rollup`**, **`metricsOverTime`**, **`metricsAsPercentageOfCost`** with **all-time** render history loaded server-side.
- **Now:** Use **`GET /api/accounts/:accountId/analytics/overview`** with explicit **`from` / `to`** for dashboard charts and KPIs. **Do not** derive analytics from **`GET /accounts/:accountId/renders`** (pagination is for tables, not rollups).
- **Difference:** `rollup` / `metricsOverTime` totals are **range-scoped**. **`metricsOverTime` `*Arr` arrays** are **per day** (aligned with **`series`**), not per render — update any chart code that assumed **per-render** array length.
- **Bootstrap:** **`GET /account/me`** must **not** include analytics (§9.2).

---

## Caching and freshness

- **v1:** No `ETag` / shared caching; numbers are **computed on read** from the primary database; see **`meta.staleness`** and **`meta.computedAt`**.
- **Daily rollups / precomputed tables:** Not required for v1; optional hardening later if performance requires it.

---

## Open questions / follow-ups

- **SQLite / local dev:** If Knex day-bucketing fails on a non-Postgres dialect, **`series`** may be empty while **`rollup`** still reflects Strapi counts; investigate column naming (`created_at`) if seen in dev.
- **Commercial / billing:** Remains **Phase 10** unless product merges metrics into this endpoint.

---

## Links

- Phase plan: [`../phase-09-accounts-analytics-overview.md`](../phase-09-accounts-analytics-overview.md)
- Research brief: [`../../Fixtura-account-data-research-brief-v2.md`](../../Fixtura-account-data-research-brief-v2.md)
