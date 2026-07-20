# Phase 04 — Organisation-Scoped Ordering Data Model

> Monday child `2785782340` | Primary repository: CMS

## Outcome

Create account-and-organisation-scoped persistence that never modifies shared Grade provider order.

## Required collections

### `grade-ordering-set`

- `account`: required Account relation.
- `club`: nullable Club relation.
- `association`: nullable Association relation.
- `scopeKey`: required, unique, server-derived string.
- `revision`: required integer, default `0`, minimum `0`.
- `items`: one-to-many ordering items.
- Draft/publish disabled.

Exactly one of `club` and `association` must be populated. Application validation is not enough; enforce the invariant in service/lifecycle code and database-compatible tests.

PM key formula:

```text
account:{accountCmsId}:club:{clubCmsId}
account:{accountCmsId}:association:{associationCmsId}
```

### `grade-ordering-item`

- `orderingSet`: required relation.
- `grade`: nullable Grade relation.
- `gradeIdSnapshot`: nullable string containing the verified provider identity used for reconciliation.
- `groupType`: enum `club-age-group | competition`.
- `groupKey`: required string.
- `competition`: nullable Competition relation; required for `competition`, null for `club-age-group`.
- `position`: required integer, minimum `0`.
- `orderingKey`: required, unique, server-derived string.
- Draft/publish disabled.

PM ordering-key formula:

```text
{scopeKey}:{groupType}:{groupKey}:grade:{gradeCmsId}
```

The server derives it after resolving the Grade and group. If CMS escaping conventions require encoding, use a single tested encoder; do not accept the key from clients.

## Group identity

- Club: `groupType=club-age-group`, `groupKey` is one of `junior|senior|masters|unclassified`, `competition=null`.
- Association: `groupType=competition`, `groupKey=String(competitionCmsId)`, `competition` is the same CMS relation.
- Names/labels are never stored in ordering rows.

## CMS paths to create

Follow the repository’s Strapi layout, expected to resemble:

```text
src/api/grade-ordering-set/content-types/grade-ordering-set/schema.json
src/api/grade-ordering-item/content-types/grade-ordering-item/schema.json
src/api/grade-ordering-set/services/...
src/api/grade-ordering-set/controllers/...
```

Do not guess naming if the CMS uses generated/custom conventions; inspect adjacent account-scoped collections first.

## Tests

- Valid Club set and valid Association set.
- Reject both organisation relations and reject neither.
- Unique `scopeKey` across SQLite/PostgreSQL.
- Unique `orderingKey` across SQLite/PostgreSQL.
- Same Grade can be ordered differently in two scopes.
- Duplicate Grade/group row in one scope is rejected.
- Position `0` accepted; negative rejected.
- Grade relation can become null without deleting the dormant item.
- Labels/names are absent from persistence.

## Deliverables

- Schemas and generated types.
- Server key helpers with unit tests.
- XOR and uniqueness integration tests.
- Relationship/migration notes.
- One documented Grade age-classification adapter returning the four Club keys.

## Exit gate

Both database engines enforce or consistently emulate the invariants, and the CMS can create two different account-scoped orders for the same shared Grade without touching `Grade.sortOrder`.
