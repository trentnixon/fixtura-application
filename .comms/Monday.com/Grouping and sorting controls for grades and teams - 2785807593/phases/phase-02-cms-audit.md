# Phase 02 — CMS Ownership and Security Audit

> Monday child `2785631652` | Monday status: Done | Delivery action: locate evidence and use it

## Decisive findings

- CMS is Strapi `4.24.1`.
- Grade UID is `api::grade.grade`.
- A Grade belongs to one Competition and may relate to many Teams, so it can be reachable through multiple Clubs.
- `Grade.sortOrder` is provider/import order and is rewritten on import refresh.
- Shared Grade fields cannot safely store account-specific preference.
- Legacy `POST /api/account/update-team-grade-order` is public, ignores account ownership, and can mutate arbitrary Team or Grade IDs.
- Local CMS must work with SQLite; production uses PostgreSQL.
- Authorisation is User -> owned Account -> Club/Association -> derived Grade membership.

## Team tasks

1. In the CMS repository, locate `api::grade.grade`, its Team/Competition relations, importer writes to `sortOrder`, and the legacy route/controller/service.
2. Add the real paths to the README progress log or this phase’s implementation notes.
3. Confirm the installed Strapi version and database adapters from `package.json`/configuration.
4. Treat importer writes as regression fixtures, not as a migration source.
5. Feed the discovered relationship names into Phase 04/07 resolver code.

## Useful searches

```text
rg -n "update-team-grade-order|sortOrder|api::grade.grade" src config
rg -n "team.*grade|competition.*grade|grade.*team|grade.*competition" src/api
```

## Evidence of completion

- Source paths for Grade schema, importer, auth ownership path, and legacy handler are recorded.
- No implementation proposes shared Grade mutation for customer order.
- SQLite/PostgreSQL parity is included in Phase 04 and Phase 11.

## Exit gate

Audit findings are traceable to current CMS code and used by later phases. If code changed since the Monday audit, update the evidence—not the locked safety decision.
