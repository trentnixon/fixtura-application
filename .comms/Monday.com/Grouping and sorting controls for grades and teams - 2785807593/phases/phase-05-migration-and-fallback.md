# Phase 05 — Migration, Fallback, and Dormant Restoration

> Monday child `2785619930` | Primary repository: CMS; consumed by scheduler and API

## Outcome

Existing accounts remain deterministic with empty custom-order tables, new imports appear automatically, and dormant preferences survive relationship loss.

## Locked strategy

- Do not migrate `Grade.sortOrder` into custom rows.
- Start with empty ordering tables.
- Absence of a custom row means unordered.
- Effective order within a derived group is:
  1. custom-positioned Grades ordered by `position`;
  2. remaining Grades by numeric/null-safe `Grade.sortOrder`;
  3. normalized `gradeName` ascending;
  4. Grade CMS ID ascending.
- Null provider positions sort after non-null provider positions before name/ID tie-breakers.
- Use a stable locale-independent comparison for `gradeName` and document it.

## Resolver contract

Create one CMS domain function that accepts resolved visible Grades plus scoped custom rows and returns normalized groups. Both GET and downstream map construction must call the same ordering logic.

Recommended pure helpers:

```text
deriveVisibleGradeGroups(scope)
mergeCustomAndFallbackOrder(groups, customRows)
buildEffectiveOrderingMap(normalizedGroups)
```

Do not duplicate fallback sorting in the Application.

## Dormant behavior

- When a Grade is no longer reachable, omit it from GET/effective maps but retain its ordering item.
- If the same Grade relation returns to the same derived group, reuse its custom position and normalize collisions deterministically.
- If it returns in a different group, treat it as unordered in the new group; retain the old row dormant until reconciliation/cleanup policy is deliberately added.
- Reconcile a deleted/recreated Grade only when `gradeIdSnapshot` matches a verified stable provider identity and membership is valid. Never match on display name alone.

## Importer behavior

- Importers may continue rewriting provider `Grade.sortOrder`.
- Importers must never create/update/delete custom ordering items.
- A newly imported Grade appears through fallback without a backfill.
- A migration utility is unnecessary unless verifiable historical customer order is found later.

## Tests

- Empty tables reproduce provider/name/ID fallback.
- New Grade appears after saved custom rows without importer changes.
- Provider refresh changes fallback-only rows but not custom relative order.
- Null/duplicate provider positions remain deterministic.
- Dormant row excluded, then restored on same relationship return.
- Group change does not apply an old group’s position.
- Reconciliation succeeds only on verified provider snapshot.
- Resolver output matches on SQLite and PostgreSQL.

## Exit gate

The resolver is deterministic, shared, importer-safe, and proven for new, dormant, restored, moved, null-position, and duplicate-position Grades.
