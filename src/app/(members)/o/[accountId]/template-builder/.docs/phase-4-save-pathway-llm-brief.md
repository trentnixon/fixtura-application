# Phase 4 LLM Brief: Save Pathway

## Objective

Let a user persist `draftState` to CMS, refetch the saved state, and see the UI reset to the newly saved values.

## Current Status (2026-06-04)

| Layer                   | Status                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **CMS contract**        | **Implemented** — [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md) |
| **App implementation**  | **Done** — flat body, BFF (201/200 passthrough), save UI, enum `useBackground`, tests                   |
| **E2E save in staging** | **Ready** after ops enables `putTemplateOptions` + smoke checklist                                      |
| **Integration smoke**   | [phase-4-integration-smoke-checklist.md](./phase-4-integration-smoke-checklist.md)                      |

Legacy nested PUT body is **removed** on CMS. App sends full flat draft snapshot (all keys + null clears).

**Product (optional):** [product-phase-4-template-builder-questions.md](../.comms/product-phase-4-template-builder-questions.md)

**Original CMS questions:** [cms-phase-4-put-template-options-questions.md](../.comms/cms-phase-4-put-template-options-questions.md)

## Implemented (app)

| Piece                    | Path                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Save mapper + validation | `_utils/template-builder-save-payload.ts`                                                |
| `useBackground` enum     | `src/types/api/template-options.ts`, `_utils/template-builder-use-background-helpers.ts` |
| BFF PUT                  | `src/app/api/accounts/[accountId]/template-options/route.ts`                             |
| BFF body validation      | `…/validate-put-template-options-body.ts`                                                |
| Client API               | `accountApi.putTemplateOptions` in `src/lib/api/services/account.api.ts`                 |
| Mutation                 | `src/lib/api/hooks/account/usePutTemplateOptions.ts`                                     |
| Editor save UX           | `template-builder-editor.tsx`, wired from `template-builder-content.tsx`                 |
| Route registry           | `route-definitions.ts` → `accounts.template-options`                                     |

Phase 1 contract:

- `phase-1-data-contract.md`

## Route Context

- App route: `/o/[accountId]/template-builder`
- Route folder: `src/app/(members)/o/[accountId]/template-builder`
- Current editor: `template-builder-editor.tsx`
- State helpers: `_utils/template-builder-editor-state.ts`
- Current read BFF: `GET /api/accounts/:accountId/all-template-options`

## Prerequisites

Before implementation, confirm and document:

- CMS request JSON body.
- Whether the body uses flat ids, relation names, or Strapi connect/disconnect shapes.
- Whether `templateOptionId` is required in the body.
- Whether PUT creates a row when the account has no `templateOptionId`.
- Whether `null` clears optional relations.
- Whether omitted fields preserve previous values or clear them.
- Whether `useBackground` is accepted and required.
- Success response body.
- Error response body and status codes.
- Whether account `/me` and branding should be refetched after create/update.

Update `phase-1-data-contract.md` before writing code if the CMS contract changes any assumptions.

## Proposed App BFF

Add an app route that proxies the save to CMS.

Suggested app endpoint:

- `PUT /api/accounts/:accountId/template-options`

Suggested file:

- `src/app/api/accounts/[accountId]/template-options/route.ts`

BFF responsibilities:

- read auth cookie
- validate `accountId` segment
- validate request body with a local schema
- forward JSON body to CMS with bearer token
- normalize CMS error messages
- return CMS success payload
- capture unexpected errors with Sentry

Follow the style of:

- `src/app/api/accounts/[accountId]/all-template-options/route.ts`
- `src/app/api/accounts/[accountId]/branding/route.ts`

## Client API Additions

Add a client API method in:

- `src/lib/api/services/account.api.ts`

Suggested method:

- `putTemplateOptions(accountId, body)`

Add types in:

- `src/types/api/account.ts`

or a new route-local type file if the contract is highly specific to this POC.

Suggested type names, pending CMS truth:

- `PutTemplateOptionsBody`
- `PutTemplateOptionsSuccess`

Do not invent body fields until CMS confirms them.

## Payload Mapping

Create a mapping helper from Phase 2 state to CMS save body.

Suggested file:

- `src/app/(members)/o/[accountId]/template-builder/_utils/template-builder-save-payload.ts`

Input:

- `TemplateBuilderEditorState`
- optional `templateOptionId` / `currentSelection.id` only if CMS requires it

Output:

- confirmed CMS request body

Tests should cover:

- full draft state maps correctly
- `null` values map according to CMS clear semantics
- `useBackground` maps correctly
- no guessed or extra fields are included

## Editor Integration

Update `template-builder-editor.tsx` to support save.

Expected behavior:

- Save button enabled only when `comparison.isDirty`.
- Save button disabled while saving.
- Reset disabled while saving.
- Save sends the current `draftState`.
- On success:
  - refetch `all-template-options`
  - refetch `/account/me` if CMS can create or change `templateOptionId`
  - refetch branding if template option or mode affects branding display
  - update UI from fresh `currentSelection`
- On error:
  - show inline error feedback
  - keep `draftState` unchanged
- After successful refetch:
  - `savedState` becomes fresh CMS state
  - `draftState` re-syncs
  - dirty state returns to false

## Query Invalidation

Use React Query invalidation/refetch rather than manual state patching.

Likely query keys:

- `queryKeys.account.allTemplateOptions(accountId, ...)`
- `queryKeys.account.me`
- `queryKeys.account.branding(accountId)`

Check existing query key definitions before implementation.

If `templateOptionId` can be created, be careful:

- current all-template-options query may have been fetched with `templateOptionId: null`
- after save, `/account/me` may expose a new `templateOptionId`
- refetch sequence may need to update account bootstrap first, then catalog

## UI Copy

Before CMS contract is implemented:

- keep disabled copy: `Save blocked pending CMS contract`

After CMS contract is implemented:

- enabled dirty state: `Save changes`
- clean state: disabled `No changes`
- saving: `Saving...`
- success: short success message
- error: inline error message from API where safe

## Error Handling

BFF should distinguish:

- `401`: unauthorized
- `400`: invalid payload / validation failure
- `403`: forbidden or wrong account
- `404`: account or template option not found
- `500`: unexpected server error

Client should:

- show validation/API errors inline
- avoid redirecting for save errors unless existing app patterns require it
- not discard unsaved draft state on error

## Tests

Add focused tests for:

- save payload mapper
- BFF request validation
- BFF forwards auth and body correctly
- BFF normalizes CMS errors
- editor save button enable/disable behavior, if component testing is practical

At minimum, test pure payload mapping and BFF body validation.

## Guardrails

- Do not wire legacy nested PUT body in production.
- Do not guess payload field names (use handoff target flat keys).
- Do not use `PATCH /api/accounts/:accountId/branding` as a substitute for full template-option save.
- Do not remove raw dumps until the POC save flow is proven.
- Do not silently clear fields unless CMS confirms clear semantics.
- Do not overwrite local draft state on save failure.

## Phase 4 Completion Criteria

| Criterion                                 | App  | E2E                                                                                |
| ----------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| CMS save contract documented              | Done | —                                                                                  |
| BFF + client API + flat mapper            | Done | —                                                                                  |
| Save UI + refetch me / catalog / branding | Done | —                                                                                  |
| Unit tests (mapper, BFF validation)       | Done | —                                                                                  |
| CMS PUT implemented in Strapi             | Done | —                                                                                  |
| Ops: `putTemplateOptions` permission      | —    | Pending                                                                            |
| Smoke checklist signed off                | —    | [phase-4-integration-smoke-checklist.md](./phase-4-integration-smoke-checklist.md) |

## Remaining before POC sign-off

1. Strapi Admin: enable **putTemplateOptions** for Authenticated (see handoff § Permissions).
2. Run [phase-4-integration-smoke-checklist.md](./phase-4-integration-smoke-checklist.md) on staging.
