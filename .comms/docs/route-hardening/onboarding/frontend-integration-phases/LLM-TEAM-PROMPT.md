# LLM Team Prompt: Frontend Multi-Account Integration

Copy this prompt into the implementation task for an LLM coding agent or team. Replace bracketed run-specific fields where applicable.

---

## Mission

You are implementing and verifying Fixtura frontend support for CMS multi-account organisations.

The CMS ownership model now allows one authenticated user to own multiple organisation accounts. Authentication identifies the user; an explicit account id identifies the organisation being viewed or changed.

Your task is to complete the next unfinished frontend integration phase safely, prove its acceptance criteria, and leave a precise handoff for the following phase.

Do not attempt to complete the entire program in one undifferentiated change. Work within the selected phase, while recording discoveries that belong to later phases.

## Repository and documentation

Frontend repository:

```text
D:\htdoc\Fixtura\Fixtura.com.au\application
```

Authoritative frontend integration contract:

```text
docs/route-hardening/onboarding/12-frontend-integration-guide.md
```

Phase index:

```text
docs/route-hardening/onboarding/frontend-integration-phases/README.md
```

Detailed phase documents:

```text
docs/route-hardening/onboarding/frontend-integration-phases/01-contract-inventory-and-audit.md
docs/route-hardening/onboarding/frontend-integration-phases/02-api-types-parsing-and-bff.md
docs/route-hardening/onboarding/frontend-integration-phases/03-organisation-selection.md
docs/route-hardening/onboarding/frontend-integration-phases/04-create-and-explicit-resume.md
docs/route-hardening/onboarding/frontend-integration-phases/05-deletion-and-uncertain-outcomes.md
docs/route-hardening/onboarding/frontend-integration-phases/06-route-and-server-hardening.md
docs/route-hardening/onboarding/frontend-integration-phases/07-cache-and-state-isolation.md
docs/route-hardening/onboarding/frontend-integration-phases/08-automated-verification.md
docs/route-hardening/onboarding/frontend-integration-phases/09-browser-and-staging-verification.md
docs/route-hardening/onboarding/frontend-integration-phases/10-completion-report.md
```

CMS ownership-hardening reference, when that repository is locally available:

```text
D:\htdoc\Fixtura\Fixtura.com.au\Backend\.comms\FrontEnd\request\cms-multi-account\04-consumer-hardening.md
```

## Authority order

When instructions or older documentation conflict, use this order:

1. The user's current task instructions.
2. Repository-level agent or contribution instructions.
3. `12-frontend-integration-guide.md`.
4. The selected document in `frontend-integration-phases`.
5. Existing older onboarding phase notes and implementation comments.

The older onboarding Phase 7 may state that Create Organisation always creates a new account. That statement is stale. The current CMS contract is:

- `POST /api/account/first` obtains the user's reusable blank account;
- `201` means a new blank account was created;
- `200` means the existing blank account was reused; and
- both statuses are equivalent frontend success and return `{ data: { accountId } }`.

Never reintroduce the stale behavior.

## Non-negotiable invariants

- Use `data.accounts[]` as the owned-organisation list.
- Never use `/api/account/me.data.accountId` as active, preferred, default, or selected account state.
- Never select `accounts[0]`, the lowest id, `user.account`, or `isActive` as an implicit account.
- Every account-scoped route, request, mutation, redirect, server action, loader, cache key, optimistic update, and persisted state entry uses an explicit account id.
- Blank, onboarding unfinished, operationally set up, and deletable are different states.
- Show **Continue setup** from `onboardingWizardCompletedAt === null`.
- Do not infer deletion eligibility. The CMS deletion endpoint is authoritative.
- Treat nonexistent and cross-user account ids identically without enumeration or fallback.
- Normalize legacy account-scoped 404s carefully; do not turn unrelated nested-resource 404s into account ownership failures.
- Never expose JWTs, cookies, credentials, personal customer data, or `INTERNAL_CMS_TOKEN` in browser code, logs, fixtures, screenshots, or reports.

## How to determine what is next

If the user assigns a phase explicitly, work on that phase.

If no phase is assigned:

1. Read the phase index.
2. Inspect the working tree and recent relevant history without discarding changes.
3. Read existing completion evidence, audit ledgers, reports, tests, and implementation for the phases in numerical order.
4. Select the earliest phase whose acceptance criteria do not have complete, current evidence.
5. Do not assume a phase is complete merely because some code exists or checkboxes are marked.
6. If an earlier phase is materially incomplete and blocks the assigned later phase, report the dependency and complete only safe preparatory work within scope.
7. State the selected phase and why before editing.

A phase counts as complete only when:

- its production behavior is implemented;
- its required tests exist and pass;
- validation commands and results are recorded;
- acceptance criteria have evidence; and
- remaining risks have an owner and target phase.

## Required startup procedure

Before making changes:

1. Read the parent contract completely.
2. Read the phase index and selected phase completely.
3. Read applicable repository guidance files.
4. Inspect `git status --short` and preserve unrelated or overlapping user changes.
5. Review the previous phase handoff and audit ledger, if present.
6. Locate relevant files with targeted searches before opening or editing broadly.
7. Trace the existing data flow from route/account selection through API, state, cache, and UI.
8. Write a short working plan tied directly to the phase acceptance criteria.

Do not start by mechanically replacing every text match. Confirm the runtime role of each consumer first.

## Coding approach

### 1. Work from the account-id source

For every changed flow, identify the authoritative id source:

- selected organisation row;
- explicit `/o/:accountId/...` route segment;
- explicit resume query parameter; or
- `response.data.accountId` returned from `/api/account/first`.

Trace that exact id into every downstream request and cache key. If the source is user identity, array position, compatibility data, or mutable global state, stop and correct the design.

### 2. Prefer narrow shared contracts

Update shared types, parsers, key factories, and error helpers when they can prevent repeated unsafe behavior. Avoid large abstractions that hide where account ids originate.

Make invalid states difficult to represent:

- require `accountId` in account-scoped hook/service signatures;
- require it in key factories;
- validate route/query input at boundaries; and
- keep user-level lookup endpoints clearly separate from account-level endpoints.

### 3. Preserve server contracts

For BFF and proxy routes:

- preserve `200`, `201`, and `503` as required;
- preserve `{ data: { accountId } }`;
- forward `Retry-After`;
- preserve structured errors;
- keep authenticated responses private; and
- never manufacture an account id when the caller supplied none.

### 4. Design for switching and races

Assume users can switch rapidly between accounts and requests can finish out of order.

- Scope keys and optimistic state by account id.
- Cancel or ignore stale requests.
- Never render previous-account data beneath a new route.
- Reset or namespace account-specific drafts and forms.
- On uncertain deletion, refetch the account list before changing the UI permanently.
- On create retry, accept the same returned blank id as success.

### 5. Keep changes phase-scoped

Fix issues needed to meet the selected phase. For discoveries outside scope:

- add them to the audit/handoff with file, risk, and owning phase;
- avoid speculative rewrites; and
- do not leave an unsafe temporary fallback to make the current phase appear complete.

If a required change crosses shared files owned by another active task, coordinate before editing or clearly report the overlap.

## Testing approach

Add or update tests alongside behavior. Tests must prove account identity, not only generic success.

Use at least two distinct account ids in selection, switching, routing, and cache tests. Assert the exact id used in:

- navigation;
- service calls;
- request paths;
- cache keys;
- invalidation;
- optimistic updates; and
- rendered state after switching.

Cover error and race paths required by the selected phase. In particular, do not omit `200` reuse, `201` creation, `503` retry, account-level 404 without fallback, deletion uncertainty, or stale-request isolation when they are in scope.

Run validation progressively:

1. Closest changed unit tests.
2. Related component, hook, service, and BFF tests.
3. Relevant multi-account integration tests.
4. Lint for changed files.
5. Typecheck.
6. Build when server/client boundaries or production routing changed, or repository practice requires it.

Record exact commands and counts. If a broader command fails for a pre-existing reason, demonstrate the baseline or otherwise provide evidence before classifying it as unrelated.

## Browser verification approach

Browser/staging work belongs primarily to Phase 09, but earlier phases should perform safe local checks when useful.

Use dedicated non-production fixtures. Do not use production customer accounts. Record request status, returned id, selected route id, visible account list, and any data leakage without recording secrets.

Required staging personas are:

- a user with two ongoing accounts;
- a user with an existing blank account;
- a user with a deletable unfinished account; and
- another user for cross-user denial.

If fixtures or staging access are unavailable, document the external blocker, owner, and exact verification still required. Do not mark browser acceptance criteria passed from code inspection.

## Working-tree safety

- Treat existing changes as user-owned unless proven otherwise.
- Do not reset, revert, overwrite, or reformat unrelated files.
- Inspect diffs before and after editing.
- Keep formatting-only churn out of implementation diffs.
- Do not stage, commit, push, or open a pull request unless explicitly requested.
- If the authoritative guide or phase files are untracked, preserve them and report that state.

## Communication while working

Keep the user informed with concise updates:

- selected phase and intended outcome;
- important discovery that changes the approach;
- completion of a meaningful implementation slice;
- validation progress; and
- genuine blockers requiring external coordination.

Ask questions only when missing information would materially change the implementation and cannot be discovered safely from the repository or contract.

## Phase completion handoff

At the end of the phase, report:

### Outcome

- Selected phase and whether it is complete.
- Acceptance criteria passed or still open.

### Findings and implementation

- Singular/default-account assumptions found.
- Files inspected.
- Files changed and why.
- Contract or architecture decisions made.
- Cache keys or route families reviewed.

### Verification

- Tests added or updated.
- Exact commands.
- Passed, failed, and skipped counts.
- Lint, typecheck, and build status as applicable.
- Browser evidence if performed.

### Risks and next work

- Deferred risks with severity, owner, and target phase.
- External CMS/staging dependencies.
- Overlapping or unrelated working-tree changes.
- The next phase and its concrete starting inputs.

Do not claim completion if required evidence is missing. Use one of these explicit outcomes:

- **Phase complete**
- **Implementation complete; verification gated**
- **Phase incomplete**
- **Blocked by external dependency**

## Current assignment

Assigned phase: `[phase number and title, or "determine next"]`

Additional user constraints: `[constraints or "none"]`

Begin by reading the authoritative contract, phase index, and selected phase. Then inspect the working tree and report the phase you will execute before changing code.

---
