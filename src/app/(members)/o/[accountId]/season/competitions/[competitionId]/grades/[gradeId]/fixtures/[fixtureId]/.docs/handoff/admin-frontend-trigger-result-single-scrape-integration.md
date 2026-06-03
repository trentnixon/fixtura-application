# Admin Frontend: Trigger result-single scrape — integration

**From:** CMS (Strapi) Backend Team  
**To:** Admin Frontend Team  
**Date:** 2026-05-19  
**Purpose:** Call `POST /api/game-meta-data/trigger-result-single-scrape` from a “Scrape result” (or similar) control on a cricket fixture (`game-meta-data`). CMS resolves `urlToScoreCard`, validates a PlayHQ game-centre URL, and enqueues Bull queue `scrape:result-single`.

**Scraper handoff:** [.comms/Data-Processing/request/cms-trigger-result-single-redis-queue.md](../../../../.comms/Data-Processing/request/cms-trigger-result-single-redis-queue.md)

---

## 1. Endpoint

| Property     | Value                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| Method       | POST                                                                      |
| Path         | `/api/game-meta-data/trigger-result-single-scrape`                        |
| Full URL     | `{CMS_BASE_URL}/api/game-meta-data/trigger-result-single-scrape`          |
| Auth         | None on route (`auth: false`). Protect via network/gateway in production. |
| Content-Type | `application/json`                                                        |

---

## 2. Request — TypeScript

```typescript
interface TriggerResultSingleScrapeRequest {
  /** Strapi `game-meta-data` document id (required if `fixtureId` omitted) */
  cmsFixtureId?: number;
  /** Alias of `cmsFixtureId` */
  fixtureId?: number;
  /** Override PlayHQ URL; default is fixture `urlToScoreCard` */
  url?: string;
  /** Default `cricket` (lowercase in queue payload) */
  sport?: string;
  /** Pass-through to job `options.dryRun` (default false) */
  dryRun?: boolean;
  /** Pass-through to job `options.metadataOnly` */
  metadataOnly?: boolean;
}
```

Either `cmsFixtureId` or `fixtureId` must be a positive integer.

---

## 3. Success response (HTTP 200)

```typescript
interface TriggerResultSingleScrapeSuccessResponse {
  success: boolean;
  /** Correlates with scraper logs (string, e.g. `result-single:81406:1739000000000`) */
  jobId: string;
  /** Bull numeric job id */
  bullJobId: number | string;
  runId: string;
  cmsFixtureId: number;
  queueName: "scrape:result-single";
  message: string;
}
```

---

## 4. Errors

| HTTP | When                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| 400  | Missing id, invalid id, fixture not found, missing/invalid URL (must include `/game-centre/`) |
| 500  | Queue or server error                                                                         |

---

## 5. Example

```typescript
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";

async function triggerResultSingleScrape(
  payload: TriggerResultSingleScrapeRequest,
): Promise<TriggerResultSingleScrapeSuccessResponse> {
  const res = await fetch(`${CMS_BASE_URL}/api/game-meta-data/trigger-result-single-scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? res.statusText);
  return data as TriggerResultSingleScrapeSuccessResponse;
}

// Typical: only fixture id; URL comes from Strapi `urlToScoreCard`
await triggerResultSingleScrape({ cmsFixtureId: 81406 });
```

---

## 6. Operational notes

- **Duration:** Scrape + ingest often ~30–60s; poll fixture `scorecards.v1.scrapedAt` or scraper logs (`CMS_PUBLIC_URL` / `STRAPI_PUBLIC_URL` enables `cms.logUrl` on the job).
- **Re-clicks:** Each request uses a new Bull `jobId` (timestamp suffix) so repeated clicks are not deduped at Bull.
- **Dev fixtures (from handoff):** `cmsFixtureId` 81406 / 81397 with known game-centre URLs when data is present locally.
