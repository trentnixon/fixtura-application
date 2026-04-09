# Epic 5 — BFF contract verification (onboarding-state, setup-status, retry-setup)

**Date:** 2026-04-09  
**Context:** Ticket 5.1 — confirm BFF alignment with Strapi for lifecycle routing and recovery.

## Shared mapping logic

Strapi `Response` → BFF `NextResponse` is implemented once in:

- `src/lib/api/bff/next-response-from-strapi-fetch.ts`

Behavior is covered by `src/lib/api/bff/next-response-from-strapi-fetch.test.ts` (JSON success/error pass-through, non-JSON error bodies → `{ error: string }`, edge cases).

## Parity matrix (BFF vs Strapi)

For each app route, the BFF calls the **same path suffix** on Strapi:  
`/api/accounts/:accountId/onboarding/<segment>`.

| App BFF (Next)                                         | Strapi segment     | Method | Expected parity                                     |
| ------------------------------------------------------ | ------------------ | ------ | --------------------------------------------------- |
| `/api/accounts/:accountId/onboarding/onboarding-state` | `onboarding-state` | GET    | Status and JSON body match Strapi; see tests above. |
| `/api/accounts/:accountId/onboarding/setup-status`     | `setup-status`     | GET    | Same.                                               |
| `/api/accounts/:accountId/onboarding/retry-setup`      | `retry-setup`      | POST   | Same (body forwarded as JSON `{}` default).         |

**Manual / staging check (optional):** compare one success and one error response for each segment **direct to Strapi** vs **via BFF** (same JWT); bodies and status codes should match except where BFF-only errors apply below.

## BFF-only responses (not from Strapi)

These are returned by the route **before** calling Strapi, or on fetch failure:

| Condition                                                      | HTTP status | Body shape                               |
| -------------------------------------------------------------- | ----------- | ---------------------------------------- |
| No auth cookie                                                 | 401         | `{ "error": "Unauthorized" }`            |
| Invalid `accountId` segment                                    | 400         | `{ "error": "Invalid account id" }`      |
| Strapi base URL not configured                                 | 503         | `{ "error": "Service unavailable" }`     |
| `retry-setup` only: malformed JSON when `Content-Type` is JSON | 400         | `{ "error": "Invalid JSON body" }`       |
| Network / thrown error after Strapi call attempted             | 500         | `{ "error": "Unexpected server error" }` |

## References

- Lifecycle handoff: `.comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md`
- Phase 6 setup-status: `create-organisation/.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md`
- Backlog: `.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md` (Epic 5)
