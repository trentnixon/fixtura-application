# Frontend Multi-Account Integration Phases

## Purpose

This folder turns the CMS multi-account frontend contract into bounded implementation phases suitable for an LLM team.

Reusable team execution prompt:

- [LLM team implementation prompt](./LLM-TEAM-PROMPT.md)
- [Outstanding items from the Phase 1-8 review](./OUTSTANDING-ITEMS.md)

The parent contract is:

- `../12-frontend-integration-guide.md`

That guide is authoritative. If an older onboarding phase conflicts with it, follow the guide and record the conflict in the phase completion evidence.

## Non-negotiable contract

- Authentication identifies the user; an explicit `accountId` identifies the selected organisation.
- `data.accounts[]` is the organisation-list source of truth.
- `/api/account/me.data.accountId` is compatibility-only and must not select an account.
- `POST /api/account/first` obtains the user's reusable blank account. Both `200` reuse and `201` creation are success.
- Blank, onboarding-unfinished, operationally set up, and deletable are distinct states.
- Account-level inaccessible and cross-user requests produce the same safe unavailable UI without fallback.
- Every account-scoped cache, mutation, route, loader, server action, and redirect must use the explicit account id.

## Phase sequence

1. [Contract inventory and audit](./01-contract-inventory-and-audit.md) — ledger: [`01-audit-ledger.md`](./01-audit-ledger.md)
2. [API types, parsing, and BFF behavior](./02-api-types-parsing-and-bff.md) — **complete 2026-07-13**
3. [Organisation selection](./03-organisation-selection.md) — **complete 2026-07-13**
4. [Create and explicit resume](./04-create-and-explicit-resume.md) — **complete 2026-07-13**
5. [Deletion and uncertain outcomes](./05-deletion-and-uncertain-outcomes.md) — **complete 2026-07-13**
6. [Route and server-side hardening](./06-route-and-server-hardening.md) — **complete 2026-07-13**
7. [Cache and state isolation](./07-cache-and-state-isolation.md) — **complete 2026-07-13**
8. [Automated verification](./08-automated-verification.md) — **complete 2026-07-13**
9. [Browser and staging verification](./09-browser-and-staging-verification.md)
10. [Completion report](./10-completion-report.md)

Phases 1 and 2 establish the shared inventory and contract layer. Phases 3 through 7 implement the behavior. Phase 8 runs after implementation is reconciled. Phase 9 requires coordinated non-production fixtures. Phase 10 is the exit-gate review.

## Team execution rules

- Read the parent guide and the current phase completely before editing.
- Inspect the working tree before changing files; preserve unrelated user changes.
- Do not silently broaden the phase scope. Record discoveries for the appropriate later phase.
- Do not introduce a temporary fallback to `data.accountId`, `accounts[0]`, `user.account`, or `isActive`.
- Add or update tests with each behavioral change; do not defer all testing to Phase 8.
- Use explicit account ids in test names and fixtures so isolation behavior is visible.
- Report exact commands, test counts, files changed, unresolved risks, and the next-phase handoff.
- A phase is incomplete if its acceptance criteria lack evidence.

## Standard completion evidence

Each phase handoff must include:

1. Scope completed and acceptance criteria status.
2. Files inspected and files changed.
3. Singular/default-account assumptions found and their resolution.
4. Tests added or updated.
5. Exact validation commands and results.
6. Deferred risks with an owner and target phase.
7. Working-tree notes for overlapping or unrelated changes.
