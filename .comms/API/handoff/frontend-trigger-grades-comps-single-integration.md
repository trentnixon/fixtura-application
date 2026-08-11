# Frontend App: Refresh Competition Grades Integration

**From:** CMS (Strapi) Backend Team  
**To:** Frontend Application Team  
**Purpose:** Document how the frontend app can request a grades refresh for one competition. This is an asynchronous queue trigger, not an immediate grades response.

---

## Overview

The frontend app can request a refresh of grades for a single competition by calling:

```http
POST /api/competition/trigger-grades-comps-single-scrape
```

The CMS looks up the competition by its Strapi competition document id, resolves the PlayHQ grades URL from `competition.url`, and queues a scrape job on `scrape:grades-comps-single`.

After that, the scraper processes the job in the background and posts the scraped grades back to:

```http
POST /api/competition-grades/ingest
```

The CMS then creates or links `grade` records and attaches them to the competition.

Use this from the frontend when a user needs to refresh grades for one competition, for example from a competition detail page or a season setup flow.

---

## Endpoint

| Property         | Value                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Method           | `POST`                                                              |
| Path             | `/api/competition/trigger-grades-comps-single-scrape`               |
| Full URL         | `{CMS_BASE_URL}/api/competition/trigger-grades-comps-single-scrape` |
| Content-Type     | `application/json`                                                  |
| Current CMS auth | `auth: false`                                                       |

Although the CMS route is currently unauthenticated, the frontend app should only expose this action inside the appropriate authenticated user flow.

---

## Request

```ts
interface RefreshCompetitionGradesRequest {
  competitionId: number;
}
```

`competitionId` is the Strapi competition document id, not the PlayHQ competition id.

Example:

```json
{
  "competitionId": 13093
}
```

---

## Success Response

HTTP `200`

```ts
interface RefreshCompetitionGradesResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "scrape:grades-comps-single";
}
```

Example:

```json
{
  "success": true,
  "jobId": "fixture:13093:cms-grades-single-1710500000000:F001",
  "runId": "cms-grades-single-1710500000000",
  "message": "Single competition grades scrape job queued successfully",
  "queueName": "scrape:grades-comps-single"
}
```

Important: success means the refresh job was queued. It does not mean the grades have already updated.

---

## Error Responses

Validation errors return HTTP `400`.

Common messages:

| Message                                      | Meaning                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| `competitionId is required`                  | Request body did not include `competitionId`.                              |
| `competitionId must be a positive integer`   | The id was invalid.                                                        |
| `Competition not found: {id}`                | No CMS competition exists for that id.                                     |
| `Competition has no url (PlayHQ grades URL)` | The competition exists but cannot be scraped because it has no PlayHQ URL. |

Queue or unexpected server errors return HTTP `500`.

Frontend error handling should read:

```ts
const message = data?.error?.message ?? data?.message ?? `Request failed: ${response.status}`;
```

---

## Frontend Helper

```ts
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";

export async function refreshCompetitionGrades(
  competitionId: number,
): Promise<RefreshCompetitionGradesResponse> {
  const response = await fetch(
    `${CMS_BASE_URL}/api/competition/trigger-grades-comps-single-scrape`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ competitionId }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ?? data?.message ?? `Failed to refresh grades: ${response.status}`;
    throw new Error(message);
  }

  return data as RefreshCompetitionGradesResponse;
}
```

---

## Suggested UX

- Show the action as `Refresh grades` or `Update grades`.
- On click, disable the button while the request is being queued.
- On success, show a message like: `Grades refresh started. This may take a few minutes.`
- Do not immediately assume grade data has changed.
- If the page already displays grades, either keep the current list visible or show a background-refresh state.
- If the app has polling or a later page reload, use that to pick up the updated grades after the queue finishes.

---

## End-to-End Flow

1. Frontend calls `POST /api/competition/trigger-grades-comps-single-scrape` with `competitionId`.
2. CMS validates the competition and queues `scrape:grades-comps-single`.
3. Bull bridge worker sends the job to the scraper.
4. Scraper reads the PlayHQ grades page.
5. Scraper posts results to `/api/competition-grades/ingest`.
6. CMS queues processing on `queue:competition-grades-process`.
7. CMS creates or links grades and updates the competition relation.

---

## Backend References

| Piece               | Location                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- |
| Route               | `src/api/competition/routes/01-custom-competition.js`                              |
| Controller          | `src/api/competition/controllers/competition.js`                                   |
| Trigger handler     | `src/api/competition/controllers/handlers/admin/TriggerGradesCompsSingleScrape.js` |
| Grades ingest route | `src/api/queued-competition-grade/routes/custom-queued-competition-grade.js`       |
| Queue processor     | `config/redis/registerQueuedCompetitionGradesProcessor.js`                         |
