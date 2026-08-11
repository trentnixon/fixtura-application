# Phase 07 — CMS API and Application Data Layer

> Monday child `2785782270` | Repositories: CMS + Application

## Outcome

Ship authenticated normalized GET/PUT endpoints in CMS, proxy them through the Application BFF, and expose typed TanStack Query hooks ready for the production screen.

## Routes

```text
GET /api/accounts/:accountId/grade-ordering
PUT /api/accounts/:accountId/grade-ordering
```

The Application BFF and CMS use the same public path. The BFF reads the session cookie and forwards a bearer token; CMS remains the authority for account ownership and Grade reachability.

## PM-approved proposed DTO

Monday locks the semantic fields. The JSON below is the implementation starting contract. Adjust only for an established CMS envelope convention while retaining the same typed information.

### Shared types

```ts
type GradeOrderingOrganisationType = "club" | "association";
type GradeOrderingGroupType = "club-age-group" | "competition";
type ClubAgeGroupKey = "junior" | "senior" | "masters" | "unclassified";
```

### GET Club response

```json
{
  "data": {
    "accountId": 575,
    "organisation": {
      "type": "club",
      "id": 123,
      "name": "North Cricket Club"
    },
    "revision": 3,
    "groups": [
      {
        "groupType": "club-age-group",
        "groupKey": "senior",
        "label": "Senior Grades",
        "competition": null,
        "items": [
          {
            "gradeId": 781,
            "providerGradeId": "playhq-grade-781",
            "gradeName": "First Grade",
            "ageGroup": "senior",
            "position": 0,
            "customPosition": 0,
            "providerPosition": 4,
            "isCustomOrdered": true,
            "visibility": {
              "scopePublished": true,
              "scopeActive": true,
              "gradePublished": true,
              "viaPublishedTeam": true
            }
          }
        ]
      }
    ]
  }
}
```

### GET Association group

```json
{
  "groupType": "competition",
  "groupKey": "18031",
  "label": "Premier Cricket",
  "competition": {
    "id": 18031,
    "providerCompetitionId": "phq-comp-415",
    "name": "Premier Cricket"
  },
  "items": [
    {
      "gradeId": 415,
      "providerGradeId": "phq-grade-415",
      "gradeName": "First XI",
      "ageGroup": "senior",
      "position": 0,
      "customPosition": null,
      "providerPosition": 1,
      "isCustomOrdered": false,
      "visibility": {
        "scopePublished": true,
        "gradePublished": true,
        "competitionPublished": true,
        "competitionActive": true
      }
    }
  ]
}
```

`position` is the current effective zero-based display position. `customPosition` is nullable persisted preference. Labels are response presentation only and are never persisted in ordering rows.

Competition label normalization for v1: Unicode NFC, trim ends, collapse internal whitespace, preserve case; fall back to `Competition {CMS ID}` when empty. CMS ID—not name—is identity, so equal normalized names do not collide.

### PUT request

```json
{
  "revision": 3,
  "organisation": {
    "type": "club",
    "id": 123
  },
  "groups": [
    {
      "groupType": "club-age-group",
      "groupKey": "senior",
      "gradeIds": [781, 804, 799]
    },
    {
      "groupType": "club-age-group",
      "groupKey": "junior",
      "gradeIds": []
    }
  ]
}
```

- Array index becomes the server-derived zero-based custom position.
- The payload represents the complete custom-order replacement for the scope.
- Grades omitted from all arrays have no custom row and remain visible through fallback.
- Empty groups are permitted and clear custom rows for that group.
- The client includes organisation identity as an assertion; CMS resolves and verifies it from the Account and never trusts it.
- PUT returns the same fully normalized response as GET with revision incremented once.

### Error envelopes

Validation (`422` proposed):

```json
{
  "error": {
    "code": "GRADE_ORDERING_VALIDATION_FAILED",
    "message": "The submitted grade order is invalid.",
    "details": {
      "issues": [
        {
          "code": "DUPLICATE_GRADE",
          "path": "groups[0].gradeIds[2]",
          "groupKey": "senior",
          "gradeId": 781,
          "message": "Grade 781 appears more than once."
        }
      ]
    }
  }
}
```

Revision conflict (`409`):

```json
{
  "error": {
    "code": "GRADE_ORDERING_REVISION_CONFLICT",
    "message": "This grade order changed after you loaded it.",
    "details": {
      "expectedRevision": 3,
      "currentRevision": 4,
      "current": { "accountId": 575, "organisation": {}, "revision": 4, "groups": [] }
    }
  }
}
```

The `current` field is the same data object returned by GET. This lets the UI offer reload safely without another race. Other status codes: `400` malformed JSON, `401` unauthenticated, `403` unowned account, `404` missing/unconfigured scope, `500` unexpected failure.

## CMS responsibilities

- Resolve Account and exactly one Club/Association.
- Apply visibility, deduplication, grouping, fallback, and dormant rules.
- Validate duplicate IDs, group types/keys, membership, foreign Grades, and organisation assertion.
- Do not require every visible Grade in PUT; omitted Grades are fallback-only.
- Create/find the ordering set safely under concurrency.
- Execute replacement + revision + audit transaction.
- Return canonical normalized data after commit.

## Application implementation paths

Create/update:

```text
src/types/api/grade-ordering.ts
src/app/api/accounts/[accountId]/grade-ordering/route.ts
src/app/api/accounts/[accountId]/grade-ordering/route.test.ts
src/lib/api/routes/route-definitions.ts
src/lib/api/services/account.api.ts
src/lib/api/query/query-keys.ts
src/lib/api/hooks/account/useAccountGradeOrdering.ts
src/lib/api/hooks/account/usePutAccountGradeOrdering.ts
```

### BFF

- Export `GET` and `PUT` from one route file.
- Use `guardAccountStrapiRequest(accountId)`.
- Forward to `${strapiUrl}/api/accounts/${accountId}/grade-ordering` with `cache: "no-store"`.
- PUT must reject invalid JSON/non-object bodies before forwarding.
- Use `nextResponseFromStrapiFetch` so `409` and validation details pass through unchanged.
- Capture network exceptions with Sentry and return the repository-standard unexpected error.

### Data layer

- Add `appRoutes.accounts.gradeOrdering` at `/api/accounts`, auth required, status ready only when CMS is live.
- Add `accountApi.getAccountGradeOrdering(accountId)` and `putAccountGradeOrdering(accountId, body)`.
- Add `queryKeys.account.gradeOrdering(accountId)`.
- Query hook follows account gateway behavior for `400/403/404` used by other account screens.
- Mutation replaces/sets the grade-ordering query with canonical success data, then invalidates organisation/settings/scheduler data that can expose grouping/output state.
- Do not discard `ApiError.details`; Phase 09 parses conflict/validation envelopes from it.

## Tests

- BFF 401, invalid account ID, missing CMS URL, GET forwarding, PUT forwarding, invalid JSON, structured 422, and structured 409 passthrough.
- Account service path and verb.
- Query key isolation between accounts.
- Query gateway redirect behavior.
- Mutation cache update/invalidation.
- DTO type fixtures for Club, Association, empty groups, fallback-only item, and nullable metadata.

## Exit gate

Live GET/PUT works through the Application BFF, the proposed contract is represented by exported types and fixtures, structured errors survive intact, and the data hooks are ready for Phase 08/09 without raw Strapi objects.
