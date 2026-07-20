# Phase 11 — End-to-End, Accessibility, Regression, and Release

> Monday child `2785807516` | Repositories: all affected

## Outcome

Prove the complete user and generation journey, deploy safely, and return concise evidence to the PM for Monday closure.

## Required coverage by boundary

### CMS schema/service

- `scopeKey` and `orderingKey` uniqueness on SQLite and PostgreSQL.
- Club XOR Association invariant.
- Two accounts order the same Grade differently.
- Import refresh rewrites `Grade.sortOrder` without changing custom rows.
- Dormant exclusion/restoration and verified snapshot reconciliation.
- Exact published/active visibility; status/date/season strings do not affect v1.
- Empty group, duplicate Grade, invalid group, foreign Grade, and unauthorised account.
- `409` stale revision and concurrent create/replacement safety.
- Replacement/revision/audit atomic rollback at every injected failure.
- Legacy 410 does not alter Team/Grade.
- 12-month cleanup boundary and idempotency.

### Application BFF/data layer

Target files from Phase 07:

- BFF GET/PUT guard, forwarding, JSON validation, structured error passthrough.
- service path/verb and DTO fixtures;
- query-key account isolation;
- query redirect/error states;
- mutation canonical cache update and invalidation.

### Application UI

Target files from Phases 08–09:

- Club `group_assets_by=true` and `false` fixtures.
- Association Competition groups and equal labels with different IDs.
- loading, empty, unsupported, denied, error/retry.
- within-group pointer and keyboard movement; cross-group prevention.
- mobile/touch activation and scrolling smoke test.
- position announcements, visible focus, dialog focus return.
- save success, 422, 403, network retry, 409 recovery.
- dirty-state navigation through refresh, sidebar, and user menu.
- reload reproduces canonical saved order.

### Scheduler/downstream

- internal authentication;
- no ordering-map injection;
- account/revision cache isolation;
- shared fallback/key behavior;
- preview/output parity;
- upcoming/results bundle before/after proof.

## End-to-end scenarios

### Club

1. Sign in to a Club account containing duplicate Team->Grade relationships.
2. Open Sort Order and verify deduplication/group labels.
3. Reorder with keyboard, save, refresh, and verify persistence.
4. Change/import a provider `sortOrder`; verify custom relative order remains.
5. Generate the agreed bundle and verify the saved sequence.

### Association

1. Sign in to an Association with multiple Competitions.
2. Verify CMS-ID-backed Competition groups and ignored `group_assets_by`.
3. Reorder inside two groups; verify cross-group movement is impossible.
4. Save atomically, refresh, and verify both groups/output.

### Conflict

1. Load the same account in sessions A/B at revision `n`.
2. Save A to `n+1`.
3. Save B and receive `409` with current normalized data.
4. Verify A remains canonical and B can load latest without silent replay.

### Dormant/import

1. Save custom order.
2. Make one Grade unreachable and import one new Grade.
3. Verify dormant omission and deterministic new fallback.
4. Restore the relationship and verify the restoration rule.

## Application commands

Run targeted tests while developing, then:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

Run CMS schema/integration suites on both database engines and equivalent checks in each affected worker/creator/render repository.

## Manual accessibility checklist

- Complete reorder/save using keyboard only.
- Check handle instructions and screen-reader announcements.
- Verify focus after drop, validation error, conflict dialog, cancel, and success.
- Verify 200% zoom, narrow mobile viewport, touch scroll/drag, reduced motion, and visible focus.
- Run automated accessibility tooling, but do not use it as the only evidence.

## Release sequence

1. Legacy 410 may deploy first.
2. Deploy CMS schemas/API/resolver/audit with migrations and rollback notes.
3. Deploy Application BFF/data/UI after CMS compatibility is confirmed.
4. Deploy scheduler/consumer integration behind a safe rollout flag if the repository supports one.
5. Smoke Club and Association accounts.
6. Monitor 401/403/409/422/5xx rates, audit failures, cleanup job, and scheduler output.
7. Remove legacy endpoint code after its 14-day observation window.

## PM handback package

Return:

- phase status table;
- PR/commit links by repository;
- test/CI results;
- Club and Association screenshots or smoke notes;
- `409` and rollback proof;
- legacy 410 observation/removal status;
- generated bundle before/after proof;
- known limitations and follow-ups;
- Monday-ready status/comment for each child item.

## Exit gate

All critical automated/manual scenarios pass, rollback and monitoring owners are known, the production output proof exists, and the PM has enough evidence to update/close Monday items accurately.
