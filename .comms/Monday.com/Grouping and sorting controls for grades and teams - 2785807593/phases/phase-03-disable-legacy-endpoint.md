# Phase 03 — Disable the Legacy Public Endpoint

> Monday child `2785870171` | Priority: urgent security remediation

## Outcome

`POST /api/account/update-team-grade-order` immediately stops mutating data, returns `410 Gone`, is safely observed for 14 days, and is then removed with its unused controller/service code.

## CMS implementation

1. Locate the exact custom route, controller, service, policy, and tests.
2. Replace the handler before any body parsing or mutation call.
3. Return:

```json
{
  "error": {
    "code": "LEGACY_ORDERING_ENDPOINT_REMOVED",
    "message": "This ordering endpoint is no longer available."
  }
}
```

4. Set status `410` and JSON content type.
5. Log only route name, timestamp, request ID, and caller IP. Never log body, cookie, bearer token, or arbitrary headers.
6. Add a metric/searchable event for attempted calls.
7. Record observation owner, deployment timestamp, query/dashboard, and removal date (`deployment + 14 days`).
8. After observation and caller migration, delete the route plus unused Team/Grade ordering controller/service code.

Do not “temporarily secure” and reuse the endpoint. It writes the invalid shared persistence model.

## Tests

- POST with valid legacy body returns 410 and changes neither Team nor Grade.
- POST with arbitrary IDs returns the same 410.
- Oversized/malformed JSON does not reach mutation logic.
- Response code/message are exact.
- Safe log metadata exists and body/secrets do not.
- Removed handler dependencies are not called.

## Deliverables

- CMS code/test change for immediate 410.
- Observation runbook with owner and dates.
- Follow-up deletion change after 14 days.
- Monday-ready evidence: deployment reference and attempted-call count.

## Exit gate

The route cannot mutate in production. Full phase completion occurs after the observation window and code removal; until then report `in progress — 410 deployed`.
