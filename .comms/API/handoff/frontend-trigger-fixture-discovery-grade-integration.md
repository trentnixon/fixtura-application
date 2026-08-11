# Frontend App: Refresh Fixtures for One Grade

**From:** CMS (Strapi) Backend Team  
**To:** Frontend Application Team  
**Purpose:** Document how the frontend app can request fixture discovery for one grade. This is an asynchronous queue trigger, not an immediate fixtures response.

---

## Overview

The frontend app can request fixture discovery for a single grade by calling:

```http
POST /api/grade/trigger-fixture-discovery
```

The frontend sends a Strapi grade document id. The CMS looks up the grade, resolves its PlayHQ URL, checks the parent competition and association sport, then queues a scraper job on:

```text
fixture_discovery
```

The scraper discovers fixtures for that grade and posts the results back to:

```http
POST /api/fixture-discovery/response
```

The CMS then processes the response in the background on:

```text
queue:fixture-discovery-process
```

---

## When to Use

Use this endpoint when the app needs to refresh fixtures for one grade.

Typical use cases:

- A grade detail screen has a `Refresh fixtures` action.
- A setup or data-repair flow needs to populate fixtures for one grade.
- The app needs fixture discovery without running an association-wide batch.

This endpoint is **grade scoped**. It does not accept a competition id or association id.

---

## Endpoint

| Property         | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Method           | `POST`                                               |
| Path             | `/api/grade/trigger-fixture-discovery`               |
| Alias            | `/api/grades/trigger-fixture-discovery`              |
| Full URL         | `{CMS_BASE_URL}/api/grade/trigger-fixture-discovery` |
| Content-Type     | `application/json`                                   |
| Current CMS auth | `auth: false`                                        |

Although the CMS route is currently unauthenticated, the frontend app should only expose this action inside the appropriate authenticated user flow.

---

## Request Payload

```ts
interface RefreshGradeFixturesRequest {
  id: number;
}
```

`id` is the Strapi grade document id.

It is not:

- the PlayHQ grade id
- a competition id
- an association id
- a team id

Example:

```json
{
  "id": 1234
}
```

---

## Success Response

HTTP `200`

```ts
interface RefreshGradeFixturesResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "fixture_discovery";
  gradeId: number;
}
```

Example:

```json
{
  "success": true,
  "jobId": "fixture-discovery:1234:cms-fixture-discovery-grade-1710500000000",
  "runId": "cms-fixture-discovery-grade-1710500000000",
  "message": "Fixture discovery grade job queued successfully",
  "queueName": "fixture_discovery",
  "gradeId": 1234
}
```

Important: success means the fixture discovery job was queued. It does not mean fixtures have already been created or updated.

---

## Error Responses

Validation errors return HTTP `400`.

Common messages:

| Message                                 | Meaning                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `id is required`                        | Request body did not include `id`.                                                                     |
| `id must be a positive integer`         | The grade id was invalid.                                                                              |
| `Grade not found: {id}`                 | No CMS grade exists for that id.                                                                       |
| `Grade has no url`                      | The grade exists but cannot be scraped because it has no PlayHQ URL.                                   |
| `Grade has no competition`              | The grade is not linked to a competition.                                                              |
| `Competition has no association`        | The parent competition is not linked to an association.                                                |
| `Association has no Sport`              | The association has no sport value.                                                                    |
| `Association Sport must not be Unknown` | The association sport is set to `Unknown`, so the processor cannot choose the fixture processing path. |

Queue or unexpected server errors return HTTP `500`.

Frontend error handling should read:

```ts
const message = data?.error?.message ?? data?.message ?? `Request failed: ${response.status}`;
```

---

## Frontend Helper

```ts
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";

export async function refreshGradeFixtures(gradeId: number): Promise<RefreshGradeFixturesResponse> {
  const response = await fetch(`${CMS_BASE_URL}/api/grade/trigger-fixture-discovery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: gradeId }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ?? data?.message ?? `Failed to refresh fixtures: ${response.status}`;
    throw new Error(message);
  }

  return data as RefreshGradeFixturesResponse;
}
```

---

## Optional Queue Status Lookup

After queueing, the frontend can inspect fixture discovery ingest rows if the app has permission to call the queue status endpoints.

By grade:

```http
GET /api/fixture-discovery/queue-items?gradeId={gradeId}
```

By run id returned from the trigger response:

```http
GET /api/fixture-discovery/queue-items?runId={runId}
```

By both:

```http
GET /api/fixture-discovery/queue-items?runId={runId}&gradeId={gradeId}
```

Include stored payload details:

```http
GET /api/fixture-discovery/queue-items?runId={runId}&gradeId={gradeId}&includePayload=true
```

Status response:

```ts
interface FixtureDiscoveryQueueItemsResponse {
  data: FixtureDiscoveryQueueItem[];
  meta: {
    count: number;
    limit: number;
  };
}

interface FixtureDiscoveryQueueItem {
  id: number;
  processingStatus: "pending" | "processing" | "processed" | "failed";
  processed: boolean;
  idempotencyKey: string | null;
  acceptedAt: string | null;
  processingStartedAt: string | null;
  processedAt: string | null;
  failedAt: string | null;
  failureCode: string | null;
  failureReason: string | null;
  gradeId: number | null;
  sport: string | null;
  runId: string | null;
  jobId: string | null;
  fixtureKey: string | null;
  batchIndex: number | null;
  itemIndex: number | null;
  fixturesReceived: number;
  fixturesCreated: number;
  fixturesUpdated: number;
  fixturesIgnored: number;
  fixturesIncompleteReceived: number;
  fixturesUnresolvedTeams: number;
  fixturesUnsupportedSport: number;
  fixtureCount: number;
}
```

Notes:

- `queue-items` requires at least `runId` or `gradeId`.
- `limit` defaults to `50` and maxes at `100`.
- `includePayload=true` can return large payloads, so use it only for troubleshooting views.
- These status endpoints require Strapi permissions.

---

## Suggested UX

- Show the action as `Refresh fixtures` or `Update fixtures`.
- Disable the action while the queue request is being submitted.
- On success, show: `Fixture refresh started. This may take a few minutes.`
- Do not immediately assume fixture data has changed.
- Keep existing fixtures visible while the refresh runs.
- If queue status access is available, poll by `runId` and `gradeId` until the latest queue item reaches `processed` or `failed`.
- If queue status access is not available, let a later page reload or normal data refetch pick up updated fixtures.

---

## End-to-End Flow

1. Frontend calls `POST /api/grade/trigger-fixture-discovery` with `{ id: gradeId }`.
2. CMS validates the grade id.
3. CMS loads the grade, its competition, and its association.
4. CMS validates the grade URL and association sport.
5. CMS queues a Bull job on `fixture_discovery`.
6. Scraper discovers fixtures for the grade.
7. Scraper posts results to `POST /api/fixture-discovery/response`.
8. CMS stores or updates a `fixture-discovery-ingest` row.
9. CMS queues processing on `queue:fixture-discovery-process`.
10. CMS processor creates or updates fixture/game data for the supported sport.
11. Optional: frontend checks `GET /api/fixture-discovery/queue-items?runId={runId}&gradeId={gradeId}` for processing state.

---

## Backend References

| Piece                            | Location                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Trigger route                    | `src/api/grade/routes/custom-grade.js`                                                 |
| Trigger controller               | `src/api/grade/controllers/grade.js`                                                   |
| Trigger handler                  | `src/api/grade/controllers/handlers/admin/TriggerFixtureDiscoveryGrade.js`             |
| Fixture discovery response route | `src/api/fixture-discovery-ingest/routes/custom-fixture-discovery-ingest.js`           |
| Response ingest handler          | `src/api/fixture-discovery-ingest/controllers/handlers/IngestFixtureDiscovery.js`      |
| Queue status handler             | `src/api/fixture-discovery-ingest/controllers/handlers/FixtureDiscoveryQueueStatus.js` |
| Queue processor                  | `config/redis/registerFixtureDiscoveryProcessor.js`                                    |
