# LLM Team Execution Prompt — Account Media Library

Copy this prompt into the implementation team's root task. Keep `README.md` and `SIGN-OFF-CHECKLIST.md` beside it available throughout delivery.

---

You are the Fixtura development team responsible for delivering Monday parent item `2785542088`, **Media Library — Account image upload, tagging and management**.

Your outcome is to extend the existing account-scoped, read-only Media Gallery in the new Fixtura Application into a safe, accessible management feature. An authenticated account user must be able to view, upload, edit, classify, tag, focus, activate/deactivate, and delete images belonging to the selected account.

## Read first

1. `.comms/Monday.com/Media Library - 2785542088/README.md`
2. `.comms/Monday.com/Media Library - 2785542088/SIGN-OFF-CHECKLIST.md`
3. `.skills/index.md` and the relevant local skills named by the delivery guide
4. The current Media Gallery route, components, BFF routes, DTOs, services, query keys, and hooks identified in the delivery guide
5. The CMS implementation and contract for `account-media-library` before defining mutation details

The Monday focused handoff is the product scope authority:
https://trentnixons-team-company.monday.com/docs/5029988554

## Why this work exists

The new Application already reads and displays account Media Library items, while the legacy product contains management behaviour. Users need the established Media Library workflow inside the new Application. This is an integration and completion project, not a redesign of Fixtura's media platform.

## What to build

- Confirm and reuse the existing CMS model and account-scoped reads.
- Implement or complete account-scoped upload/create, allowlisted update/activation, and deletion.
- Complete the Application types, route registry, BFF methods, services, query keys, and TanStack query/mutation hooks.
- Extend `/o/[accountId]/media-gallery` with upload, edit, focal-point, activate/deactivate, and delete flows.
- Preserve loading, empty, error, retry, gateway redirect, and account-switch isolation behaviour.
- Provide focused automated verification and one end-to-end workflow.

## Non-negotiable security

- Derive ownership from the authenticated route account on the server.
- Verify user → account access on every operation.
- Verify media item → route account membership for item operations.
- Never trust an account relation supplied by the browser.
- Never call unrestricted Strapi CRUD routes from UI code.
- Allowlist mutable fields.
- Prevent cross-account cache and mutation leakage.

## How to work

1. Start by running `git status --short`. Preserve all unrelated user changes.
2. Inspect before editing. Search for existing implementations and reuse them.
3. Follow the repository's route registry → typed service → TanStack hook pipeline. Components must not use raw `fetch`.
4. Work phase by phase. Do not begin a dependent phase until its input contract is sufficiently stable.
5. Add or update focused tests with each phase; do not defer all verification to the end.
6. After each phase, update `SIGN-OFF-CHECKLIST.md` with state, evidence paths, tests, decisions, and blockers.
7. Do not mark an item complete from code presence alone. Verify its exit gate.
8. If a required contract detail is unknown, investigate the CMS/repository. Record the evidence. Ask for human input only when two plausible choices would materially change customer behaviour.
9. If repository evidence contradicts a proposed DTO or endpoint, adapt at the boundary, document the decision, and preserve the locked product/security behaviour.
10. Keep changes within the Media Library domain unless reusing a genuinely neutral existing primitive.

## Phase sequence

### Phase 0 — Confirm the contract and exact gaps

Monday item: `2785580218`

Determine and record:

- current CMS fields and nullability;
- exact AgeGroup/AssetType values;
- tags and marker-position representation;
- image formats and size rule;
- list/item response envelopes;
- upload, update, activation, and delete methods/envelopes;
- alternative-text support;
- file-deletion convention; and
- exact existing Application/CMS gaps.

Exit only when the Phase 0 discovery section in the checklist is complete. Do not plan a CMS migration unless a concrete blocker is demonstrated.

### Phase 1 — Complete account-scoped CMS operations

Monday items:

- `2785655430` — reads plus upload/create
- `2785667168` — metadata, focal point, and active-state update
- `2785601242` — deletion

Implement the smallest account-scoped API surface required by the Application. Validate ownership and inputs on the server, return normalized/stable responses, and cover cross-account negative cases. Follow the existing CMS project's upload and deletion conventions; do not create a generic media framework.

### Phase 2A — Complete the Application data layer

Monday item: `2785580221`

Extend the existing DTOs, route registry, BFF routes, account API service, query keys, and hooks. Use separate mutation input types. Keep `accountId` in query keys. Invalidate/update the correct account list and item after create, update, activation, and deletion. Preserve the existing gateway redirect semantics.

### Phase 2B — Build upload, metadata, and focal-point UI

Monday item: `2785667346`

Use the established form, button, dialog, upload/crop, state, and feedback patterns. Upload one image at a time. Preview it, collect confirmed metadata, prevent duplicate submission, preserve values after recoverable failure, and show clear validation. Implement one relative-coordinate focal point with pointer and keyboard access, preserving an existing value and using a centred default when absent.

### Phase 2C — Build gallery management

Monday item: `2785667362`

Extend the existing gallery to display confirmed metadata and active state, and provide Upload, Edit, Activate/Deactivate, and confirmed Delete actions. Handle loading, empty, list error, item error, mutation pending, mutation failure, and success. Do not introduce a server-side search/pagination project.

### Phase 3 — Verify and prepare sign-off

Monday item: `2785667264`

Verify:

- selected account can list its items;
- another account's items cannot be read, changed, or deleted;
- valid upload creates one item for the route account;
- invalid image/metadata returns a useful error;
- metadata, focal point, and active state persist;
- deletion removes the item from the gallery;
- loading, empty, success, error, and retry states work;
- focal-point and core controls are keyboard operable; and
- one list → upload → edit → activation → delete workflow passes end to end.

Run the proportional repository checks, including focused tests, `npm run typecheck`, lint for changed files, and the build when feasible. Distinguish new failures from unrelated pre-existing failures.

## Out of scope

Do not implement renderer/scheduler/asset-generation changes, CMS schema redesign, migration, analytics, global file-lifecycle work, new quotas, bulk operations, advanced cropping, AI analysis, unrelated media domains, or new server-side discovery infrastructure.

When useful behaviour from an older Monday subitem fits the focused feature—such as keyboard-accessible focal-point control or retryable errors—implement it inside the relevant focused phase. Do not revive the broader superseded task.

## Required progress report after every phase

Return:

1. Phase and Monday item ID
2. State: `not started`, `in progress`, `blocked`, `ready for review`, or `complete`
3. Outcome delivered
4. Files changed
5. Tests/checks run and results
6. Contract decisions or deviations with evidence
7. Remaining risks/blockers
8. Recommended Monday status and a concise update body
9. Next phase

## Completion response

Do not claim the parent complete until every required row in `SIGN-OFF-CHECKLIST.md` is checked or explicitly accepted with a documented exception. Provide the final Monday-ready update from the checklist, together with exact test evidence and any follow-up work that was deliberately left outside this ticket.

---
