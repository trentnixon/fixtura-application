# Season Hub Frontend Handoff

## Purpose

This document is the integration handoff for the app UI team.

It explains:

- what `season-hub` is
- what has already been built in CMS
- which endpoints are available now
- how the frontend should call them
- what payloads and response shapes to expect
- how to structure the season explorer UI around the current API

This is intended to let the app team begin integration without needing to reverse-engineer the backend.

## What Has Been Built

The CMS now exposes a dedicated read-only namespace:

- `GET /api/season-hub/...`

This namespace is a season explorer read model built on top of existing CMS collections.

It is not a new collection type.
It is not a raw entity passthrough.
It is a curated API surface for the app.

Current backend capabilities:

- account-scoped season discovery via `recon`
- lightweight season summary via `stats`
- competition listing
- competition detail
- competition grades listing
- grade detail
- grade fixtures listing
- fixture detail via canonical route
- fixture detail via alias route

Current backend guarantees:

- account ownership is validated per request
- nested ids are validated against the resolved account scope
- responses are curated and drill-down friendly
- fixture detail is sourced from `game-meta-data`
- error responses use stable `SEASON_HUB_*` codes

## Base Integration Rules

Base URL:

- `/api/season-hub`

Authentication:

- authenticated request required
- send normal app bearer token in `Authorization` header

Content type:

- `application/json`

Request body:

- all current `season-hub` endpoints are `GET`
- no request body is required in v1

Primary route parameter:

- `accountId`

Example header:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

## Endpoint Matrix

Available now:

- `GET /api/season-hub/:accountId/recon`
- `GET /api/season-hub/:accountId/stats`
- `GET /api/season-hub/:accountId/competitions`
- `GET /api/season-hub/:accountId/competitions/:competitionId`
- `GET /api/season-hub/:accountId/competitions/:competitionId/grades`
- `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId`
- `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures`
- `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId`
- `GET /api/season-hub/:accountId/grades/:gradeId`
- `GET /api/season-hub/:accountId/grades/:gradeId/fixtures`
- `GET /api/season-hub/:accountId/grades/:gradeId/fixtures/:fixtureId`

Canonical fixture detail route:

- `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId`

Alias fixture detail route:

- `GET /api/season-hub/:accountId/grades/:gradeId/fixtures/:fixtureId`

Frontend recommendation:

- treat the canonical fixture route as the primary route for navigation and deep links
- treat the grade-only fixture route as a convenience alias

## Recommended UI Integration Flow

Recommended initial page load:

1. call `GET /api/season-hub/:accountId/recon`
2. call `GET /api/season-hub/:accountId/stats`
3. call `GET /api/season-hub/:accountId/competitions`

Recommended drill-down flow:

1. user opens competition
2. call `GET /api/season-hub/:accountId/competitions/:competitionId`
3. call `GET /api/season-hub/:accountId/competitions/:competitionId/grades`
4. user opens grade
5. call `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId`
6. call `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures`
7. user opens fixture
8. call canonical fixture detail route

Why this flow is recommended:

- `recon` establishes scope and availability
- `stats` populates summary cards fast
- `competitions` fills the first main list
- deeper requests happen only when the user drills in
- this keeps the UI responsive and avoids loading the full season graph on first paint

## Request Details

### `GET /api/season-hub/:accountId/recon`

Purpose:

- discover the effective account season scope
- understand what the user can drill into next

Params:

- `accountId`: required numeric route param

Query params:

- none

Request body:

- none

### `GET /api/season-hub/:accountId/stats`

Purpose:

- fast top-level season summary

Params:

- `accountId`: required numeric route param

Query params:

- none

Request body:

- none

### `GET /api/season-hub/:accountId/competitions`

Purpose:

- list competitions within the resolved account scope

Params:

- `accountId`: required numeric route param

Query params:

- `page`: optional, defaults to `1`
- `pageSize`: optional, defaults to `25`
- max supported `pageSize` in current backend: `100`

Request body:

- none

### `GET /api/season-hub/:accountId/competitions/:competitionId`

Purpose:

- return top-line competition detail

Params:

- `accountId`: required numeric route param
- `competitionId`: required numeric route param

### `GET /api/season-hub/:accountId/competitions/:competitionId/grades`

Purpose:

- list grades for a competition inside account scope

Params:

- `accountId`: required numeric route param
- `competitionId`: required numeric route param

### `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId`

Purpose:

- return a grade detail view under competition context

Params:

- `accountId`: required numeric route param
- `competitionId`: required numeric route param
- `gradeId`: required numeric route param

### `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures`

Purpose:

- list fixtures for a grade inside the selected competition

Params:

- `accountId`: required numeric route param
- `competitionId`: required numeric route param
- `gradeId`: required numeric route param

### `GET /api/season-hub/:accountId/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId`

Purpose:

- return full fixture detail in canonical drill-down form

Params:

- `accountId`: required numeric route param
- `competitionId`: required numeric route param
- `gradeId`: required numeric route param
- `fixtureId`: required numeric route param

### `GET /api/season-hub/:accountId/grades/:gradeId`

Purpose:

- return a grade detail view without needing competition in the URL

### `GET /api/season-hub/:accountId/grades/:gradeId/fixtures`

Purpose:

- list fixtures for a grade via the shorter route

### `GET /api/season-hub/:accountId/grades/:gradeId/fixtures/:fixtureId`

Purpose:

- return fixture detail through the shorter alias route

## Response Contracts

## Recon Response

Example:

```json
{
  "data": {
    "account": {
      "id": 573,
      "sport": "Cricket",
      "orgType": "Club"
    },
    "scope": {
      "clubIds": [32961],
      "associationIds": [2964],
      "competitionIds": [18030, 18031, 18032, 18033, 18034],
      "gradeIds": [71337, 71338, 71339]
    },
    "counts": {
      "competitions": 5,
      "grades": 17,
      "teams": 134,
      "fixtures": 831
    },
    "available": {
      "stats": true,
      "competitions": true,
      "grades": true,
      "teams": true,
      "fixtures": true
    },
    "links": {
      "stats": "/api/season-hub/573/stats",
      "competitions": "/api/season-hub/573/competitions"
    }
  }
}
```

Frontend usage:

- use `account` to label the current season scope
- use `counts` to decide whether to render empty states or loaded states
- use `available` to hide unsupported UI sections
- use `scope` ids for state and analytics if needed
- use `links` when building navigation or route maps

## Stats Response

Example:

```json
{
  "data": {
    "accountId": 573,
    "summary": {
      "competitions": 5,
      "grades": 17,
      "teams": 134,
      "fixtures": 831
    },
    "freshness": {
      "lastUpdatedAt": "2026-04-24T23:57:33.685Z"
    }
  }
}
```

Frontend usage:

- use this for overview cards
- show `lastUpdatedAt` only if useful in the product
- do not wait for deep drill-down endpoints before rendering the season summary

## Competitions List Response

Example:

```json
{
  "data": [
    {
      "id": 18031,
      "name": "Senior Competition",
      "season": "Winter 2026",
      "status": "Active",
      "association": {
        "id": 2964,
        "name": "Darwin And Districts Cricket Competition"
      },
      "counts": {
        "grades": 5,
        "teams": 43,
        "fixtures": 327
      },
      "links": {
        "self": "/api/season-hub/573/competitions/18031",
        "grades": "/api/season-hub/573/competitions/18031/grades"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 5
    }
  }
}
```

Frontend usage:

- render this as the first drill-down list
- use `counts` to show badges or preview chips
- preserve `meta.pagination` in the client data model even if page count is currently small

## Competition Detail Response

Current shape:

- top-line competition metadata
- association summary
- grade count
- team count
- fixture count
- embedded grade summary list
- links for the next drill-down

Frontend usage:

- use as the competition hero/header state
- you may still separately call the dedicated grades list route for the primary table/list UI

## Competition Grades Response

Current shape:

- array of grade DTOs for the competition
- grade id and name
- counts for teams and fixtures
- links to grade detail and grade fixtures

Frontend usage:

- this should power the grade list under a competition
- each item should link to a grade screen or expandable panel

## Grade Detail Response

Current shape includes:

- grade identifiers and title information
- competition context
- association context
- team summary information
- fixture count
- drill-down links

Frontend usage:

- use this as the grade overview state
- pair it with the fixtures list endpoint to render the full grade screen

## Grade Fixtures Response

Example characteristics from live data:

- array of fixture items
- id
- game id
- date
- round
- status
- type
- venue
- team names
- grade summary
- competition summary
- association summary
- links

Frontend usage:

- this should power the fixture list inside a grade
- `status`, `round`, `date`, and `teams` are the key list fields
- use `links.self` as the safest drill-in target

## Fixture Detail Response

Current shape includes:

- `fixture`
- `grade`
- `teamsData`
- `downloads`
- `renderStatus`
- `club`
- `context`
- `meta`
- `links`

Important note:

- fixture detail is richer than the other DTOs because it is assembled from the existing fixture detail handler
- it includes more content than the list endpoints

Frontend usage:

- use `fixture` for the primary match presentation
- use `grade` for breadcrumb and context
- use `meta.validation` and `meta.performance` only if the app has an admin/debug need
- use `links.canonical` if the UI wants a stable deep-link target

## Suggested TypeScript Types

These are recommended app-side types based on the current backend contract.

```ts
export type SeasonHubErrorCode =
  | "SEASON_HUB_AUTH_REQUIRED"
  | "SEASON_HUB_BAD_REQUEST"
  | "SEASON_HUB_NOT_FOUND"
  | "SEASON_HUB_INTERNAL_ERROR";

export interface SeasonHubErrorResponse {
  error: {
    code: SeasonHubErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SeasonHubReconResponse {
  data: {
    account: {
      id: number;
      sport: string | null;
      orgType: string | null;
    };
    scope: {
      clubIds: number[];
      associationIds: number[];
      competitionIds: number[];
      gradeIds: number[];
    };
    counts: {
      competitions: number;
      grades: number;
      teams: number;
      fixtures: number;
    };
    available: {
      stats: boolean;
      competitions: boolean;
      grades: boolean;
      teams: boolean;
      fixtures: boolean;
    };
    links: {
      stats: string;
      competitions: string;
    };
  };
}

export interface SeasonHubStatsResponse {
  data: {
    accountId: number;
    summary: {
      competitions: number;
      grades: number;
      teams: number;
      fixtures: number;
    };
    freshness?: {
      lastUpdatedAt?: string | null;
    };
  };
}

export interface SeasonHubCompetitionListItem {
  id: number;
  name: string;
  season: string | null;
  status: string | null;
  association: {
    id: number | null;
    name: string | null;
  };
  counts: {
    grades: number;
    teams: number;
    fixtures: number;
  };
  links: {
    self: string;
    grades: string;
  };
}

export interface SeasonHubCompetitionListResponse {
  data: SeasonHubCompetitionListItem[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SeasonHubFixtureListItem {
  id: number;
  gameId: string | null;
  date: string | null;
  round: string | null;
  status: string | null;
  type: string | null;
  venue: {
    ground: string | null;
  };
  teams: {
    home: string | null;
    away: string | null;
  };
  grade: {
    id: number;
    name: string | null;
  };
  competition: {
    id: number | null;
    name: string | null;
  };
  association: {
    id: number | null;
    name: string | null;
  };
  links: {
    self: string;
    alias: string;
  };
}
```

## Error Handling

Current error contract:

- `401`

```json
{
  "error": {
    "code": "SEASON_HUB_AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

- `400`

```json
{
  "error": {
    "code": "SEASON_HUB_BAD_REQUEST",
    "message": "Invalid account id"
  }
}
```

- `404`

```json
{
  "error": {
    "code": "SEASON_HUB_NOT_FOUND",
    "message": "Fixture not found"
  }
}
```

- `500`

```json
{
  "error": {
    "code": "SEASON_HUB_INTERNAL_ERROR",
    "message": "Failed to load season hub fixture detail"
  }
}
```

Frontend handling recommendation:

- handle `401` through the app auth/session flow
- show a scoped empty/error state for `404`
- treat `400` as a route/state bug or invalid navigation state
- treat `500` as a recoverable server error with retry affordance

## Recommended Client Architecture

Suggested query model:

- `seasonHubRecon(accountId)`
- `seasonHubStats(accountId)`
- `seasonHubCompetitions(accountId, page, pageSize)`
- `seasonHubCompetition(accountId, competitionId)`
- `seasonHubCompetitionGrades(accountId, competitionId)`
- `seasonHubGrade(accountId, gradeId, competitionId?)`
- `seasonHubGradeFixtures(accountId, gradeId, competitionId?)`
- `seasonHubFixture(accountId, gradeId, fixtureId, competitionId?)`

Suggested UI structure:

- season overview screen
- competition list screen or section
- competition detail drawer/page
- grade detail screen
- fixture detail screen

Suggested caching behavior:

- cache `recon` and `stats` aggressively for the active session
- cache competition and grade lists by route key
- cache fixture detail by canonical route key

## Integration Checklist For App Team

- confirm app bearer token is available for `season-hub`
- implement API client wrappers for all current routes
- implement types for `recon`, `stats`, competitions, grade fixtures, and fixture detail
- build overview page from `recon` + `stats` + `competitions`
- use canonical fixture route for deep links
- support server error states using `SEASON_HUB_*` codes
- preserve pagination support in the competitions client even if the first screen does not paginate yet

## Known Current Scope

Built and verified now:

- `recon`
- `stats`
- competitions list
- competition drill-down
- grade drill-down
- fixture list
- fixture detail

Not yet part of this handoff:

- dedicated team drill-down endpoints
- dedicated results-specific endpoints
- extra filters beyond the current route family

## Recommended Next FE Milestone

The best first app milestone is:

- season overview screen using `recon`, `stats`, and `competitions`
- competition to grade to fixture drill-down
- fixture detail view on canonical route

That will align directly with the backend surface that is already implemented and verified.
