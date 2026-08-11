# Frontend App: Refresh Teams for One Competition

**From:** CMS (Strapi) Backend Team  
**To:** Frontend Application Team  
**Purpose:** Document how the frontend app can request a team refresh for all grades under one competition. This is an asynchronous queue trigger, not an immediate teams response.

---

## Overview

The frontend app can request team lookup for one competition by calling:

```http
POST /api/competition/trigger-grades-lookup-teams-single-scrape
```

Despite the word `single`, this endpoint is **single competition scoped**, not single grade scoped.

The frontend sends a Strapi competition document id. The CMS queues a scrape job on:

```text
scrape:grades-lookup-teams-single
```

The scraper then asks CMS for all grade records attached to that competition:

```http
GET /api/grade-teams/by-competition?id={competitionId}
```

For each returned grade, the scraper visits the PlayHQ ladder page, extracts teams, and posts the result back to:

```http
POST /api/grade-teams/response
```

The CMS then processes the response in the background and links teams to the relevant grade records.

---

## When to Use

Use this endpoint when the app needs to refresh teams after grades exist for a competition.

Typical use cases:

- A user has refreshed grades for a competition and now wants team data.
- A competition detail or setup screen has a `Refresh teams` action.
- The app needs to repopulate teams for every grade in one competition without running the full catalog scrape.

This endpoint should not be used to refresh one individual grade. The current public trigger accepts a `competitionId` and processes every eligible grade under that competition.

---

## Endpoint

| Property         | Value                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Method           | `POST`                                                                     |
| Path             | `/api/competition/trigger-grades-lookup-teams-single-scrape`               |
| Alias            | `/api/competitions/trigger-grades-lookup-teams-single-scrape`              |
| Full URL         | `{CMS_BASE_URL}/api/competition/trigger-grades-lookup-teams-single-scrape` |
| Content-Type     | `application/json`                                                         |
| Current CMS auth | `auth: false`                                                              |

Although the CMS route is currently unauthenticated, the frontend app should only expose this action inside the appropriate authenticated user flow.

---

## Request Payload

```ts
interface RefreshCompetitionTeamsRequest {
  competitionId: number;
}
```

`competitionId` is the Strapi competition document id.

It is not:

- the PlayHQ competition id
- a grade id
- a team id

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
interface RefreshCompetitionTeamsResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "scrape:grades-lookup-teams-single";
}
```

Example:

```json
{
  "success": true,
  "jobId": "fixture:13093:cms-grades-lookup-teams-single-1710500000000:single",
  "runId": "cms-grades-lookup-teams-single-1710500000000",
  "message": "Single competition grades lookup teams scrape job queued successfully",
  "queueName": "scrape:grades-lookup-teams-single"
}
```

Important: success means the team refresh job was queued. It does not mean the teams have already updated.

---

## Error Responses

Validation errors return HTTP `400`.

Common messages:

| Message                                    | Meaning                                       |
| ------------------------------------------ | --------------------------------------------- |
| `competitionId is required`                | Request body did not include `competitionId`. |
| `competitionId must be a positive integer` | The id was invalid.                           |

Queue or unexpected server errors return HTTP `500`.

Frontend error handling should read:

```ts
const message = data?.error?.message ?? data?.message ?? `Request failed: ${response.status}`;
```

---

## Frontend Helper

```ts
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";

export async function refreshCompetitionTeams(
  competitionId: number,
): Promise<RefreshCompetitionTeamsResponse> {
  const response = await fetch(
    `${CMS_BASE_URL}/api/competition/trigger-grades-lookup-teams-single-scrape`,
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
      data?.error?.message ?? data?.message ?? `Failed to refresh teams: ${response.status}`;
    throw new Error(message);
  }

  return data as RefreshCompetitionTeamsResponse;
}
```

---

## Suggested UX

- Show the action as `Refresh teams` or `Update teams`.
- Make it clear the action applies to all grades in the competition.
- Disable the button while the request is being queued.
- On success, show a message like: `Team refresh started. This may take a few minutes.`
- Do not immediately assume team data has changed.
- Keep existing teams visible while the refresh runs.
- If the page supports polling, refresh the displayed teams after the background process has had time to complete.
- If the app does not poll, a later page reload should pick up the updated team links.

---

## End-to-End Flow

1. Frontend calls `POST /api/competition/trigger-grades-lookup-teams-single-scrape` with `competitionId`.
2. CMS validates that `competitionId` is a positive integer.
3. CMS queues a Bull job on `scrape:grades-lookup-teams-single`.
4. Bull bridge worker passes the job to the scraper.
5. Scraper calls `GET /api/grade-teams/by-competition?id={competitionId}`.
6. CMS returns all active grades for that competition that have a non-empty URL.
7. Scraper appends `/ladder` to each grade URL and extracts teams from PlayHQ.
8. Scraper posts each grade result to `POST /api/grade-teams/response`.
9. CMS stores or updates the `grade-teams` queue row and enqueues `queue:grade-teams-process`.
10. CMS processor creates or updates teams and links them to the grade.

---

## Backend References

| Piece                          | Location                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| Trigger route                  | `src/api/competition/routes/01-custom-competition.js`                                    |
| Trigger controller             | `src/api/competition/controllers/competition.js`                                         |
| Trigger handler                | `src/api/competition/controllers/handlers/admin/TriggerGradesLookupTeamsSingleScrape.js` |
| Grades by competition endpoint | `src/api/grade-teams/controllers/handlers/GradeTeamsByCompetition.js`                    |
| Scraper response route         | `src/api/grade-teams/routes/custom-grade-teams.js`                                       |
| Response ingest handler        | `src/api/grade-teams/controllers/handlers/IngestGradeTeams.js`                           |
| Queue processor                | `config/redis/registerGradeTeamsProcessor.js`                                            |
| Team linking logic             | `src/api/grade-teams/content-types/grade-teams/afterCreate/processors/teams.js`          |
