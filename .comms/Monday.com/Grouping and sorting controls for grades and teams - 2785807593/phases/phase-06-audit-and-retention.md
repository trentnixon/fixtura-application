# Phase 06 — Transactional Audit and Retention

> Monday child `2785652774` | Primary repository: CMS

## Outcome

Every successful ordering replacement has an authoritative before/after audit event committed in the same transaction, retained for 12 months.

## Collection

Create draft/publish-disabled `grade-ordering-audit-event` with:

- `orderingSet`: required relation;
- `account`: required relation;
- nullable `club` / `association` matching the set;
- nullable `actorUser`;
- `actorUserIdSnapshot`;
- `actorType`: enum `member | admin | internal`;
- `fromRevision` and `toRevision` integers;
- `before` JSON;
- `after` JSON;
- creation timestamp.

The before/after payload uses the normalized custom ordering representation: scope identity plus ordered Grade IDs per group. Do not store raw HTTP bodies, tokens, cookies, or unrelated account data.

## Transaction boundary

The PUT service must perform in one Strapi/Knex transaction:

1. lock/read ordering set and validate expected revision;
2. capture normalized `before`;
3. replace scoped custom rows;
4. increment revision once;
5. capture normalized `after`;
6. insert audit event;
7. commit.

Any failure rolls back rows, revision, and audit together. Use the transaction APIs supported by Strapi `4.24.1`; prove participation with integration tests rather than assuming entity-service calls inherit the transaction.

## Retention

- Weekly CMS cron deletes audit events strictly older than 12 months.
- Use batched deletion if table size warrants it.
- Log request/job ID, cutoff, deleted count, duration, and outcome.
- Cleanup failure must not affect ordering data.
- Application/Sentry logs are diagnostic, not authoritative audit history.

## Tests

- Member/admin/internal actor snapshots.
- Successful mutation writes exactly one event with revisions `n -> n+1`.
- Inject failure at row replacement, revision update, and audit insert; all state rolls back.
- `409` produces no audit event.
- Cleanup retains boundary/newer events and removes only older events.
- Cleanup is idempotent and safe on an empty table.

## Exit gate

Transaction rollback is proven on the installed Strapi/database configuration, and the weekly retention job has deployment configuration, monitoring, and an owner.
