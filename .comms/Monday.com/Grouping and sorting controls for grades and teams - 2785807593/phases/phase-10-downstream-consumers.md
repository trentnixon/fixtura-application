# Phase 10 — Downstream Effective Ordering

> Monday child `2785807542` | Repositories: CMS, scheduler/worker, creator/assets, Remotion as confirmed

## Outcome

Resolve customer order once at an authenticated account boundary and prove it affects at least one agreed upcoming/results asset bundle without leaking database/auth logic into low-level sorters.

## Start with a consumer audit

Search CMS, worker, creator, scraper, asset-generation, and Remotion repositories for:

```text
Grade.sortOrder
sortOrder
FixtureDataSorter
group_assets_by
gradeName
competitionId
upcoming
results
```

Create a table in this phase’s implementation notes listing repository, confirmed consumer, current order source, required insertion point, owner, and test. Do not change speculative consumers merely because the parent ticket named them.

## Locked scheduler boundary

```text
authenticated internal scheduler request
  -> accountId
  -> load Account + Club/Association
  -> CMS/domain effective-order resolver
  -> immutable ReadonlyMap<string, number>
  -> FixtureDataSorter(orderingMap)
```

- External callers cannot supply an ordering map.
- Scheduler internal authentication must be verified before resolution.
- `FixtureDataSorter` receives data only; it does not query CMS/database or decide account ownership.
- The resolver uses the same visibility/group/fallback rules as GET.

## Map keys

Locked examples establish these formulas:

```text
Club:       {clubGroupKey}:{gradeCmsId}
            junior:781

Association competition:competitionCmsId:gradeCmsId
            competition:18031:415
```

Map values are effective zero-based positions. Expose a `ReadonlyMap<string, number>` or immutable plain record at serialization boundaries. Use shared key helpers with tests; do not build ad hoc strings in consumers.

## Sorting behavior

- Items with resolved map positions sort first by position.
- Missing map entries use provider `Grade.sortOrder`, then normalized Grade name, then Grade CMS ID.
- Preserve stable relative order of unrelated non-Grade content.
- Group selection happens before ordering; custom order never moves content between groups.
- Account A’s map must never be cached/reused for Account B.
- Cache keys, if added, include account ID and ordering revision; invalidate after save.

## Minimum accepted consumer

Monday’s final acceptance requires an upcoming/results asset bundle. The audit may confirm more consumers—assets, bundles, galleries, fixtures, ladders, results—but each added consumer needs evidence and an owner.

Implement the shared resolver first, then update only confirmed insertion points. Preview and generated output must agree.

## Tests

- Internal scheduler authentication required.
- Caller-provided/fabricated map ignored or rejected.
- Club and Association map keys.
- Account isolation under parallel jobs.
- Custom position and complete fallback tie-breakers.
- New fallback-only Grade after custom save.
- Dormant Grade absent and restored Grade deterministic.
- `FixtureDataSorter` uses injected immutable map without I/O.
- Preview and generated bundle have identical Grade sequence.
- Before/after E2E fixture proves a custom save changes an upcoming/results bundle.

## Exit gate

The consumer audit is recorded, one shared resolver/key implementation is used, and at least one agreed production output demonstrably reflects the saved account-specific order.
