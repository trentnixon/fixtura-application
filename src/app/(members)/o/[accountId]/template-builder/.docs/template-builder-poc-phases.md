# Template Builder POC Phases

## Phase 1: Recover Data Contract — complete

**Deliverable:** [phase-1-data-contract.md](./phase-1-data-contract.md)  
**CMS comms:** [cms-request-put-template-options.md](../.comms/cms-request-put-template-options.md)  
**Phase 4 questionnaires:** [CMS questions](../.comms/cms-phase-4-put-template-options-questions.md) · [Product questions](../.comms/product-phase-4-template-builder-questions.md)  
**Phase 4 smoke:** [phase-4-integration-smoke-checklist.md](./phase-4-integration-smoke-checklist.md)

- [x] Template option groups documented (GET catalog + `currentSelection`).
- [x] `GET /api/accounts/:accountId/all-template-options` payload documented (types + handoff).
- [x] `currentSelection` hydration documented (me → branding → query param).
- [x] CMS save payload documented — [cms-phase-4-put-template-options-response.md](../.comms/response/cms-phase-4-put-template-options-response.md), [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md).
- [x] Create-vs-update when no `templateOptionId` — CMS creates row; refetch `/account/me`.
- [ ] Live CMS smoke on template-builder route — checklist in contract doc § Verified.

## Phase 2: Normalize State — complete

**LLM brief:** [phase-2-normalize-state-llm-brief.md](./phase-2-normalize-state-llm-brief.md)

- [x] Normalized editor state shape (`_utils/template-builder-editor-state.ts`).
- [x] Map `currentSelection` into `savedState`.
- [x] Initialize `draftState` from `savedState` (diagnostic component; re-sync on catalog change).
- [x] Unset relation ids and scalars use `null` consistently.
- [x] Comparison helpers: changed, unchanged, unset (`isUnset` when draft is `null`).
- [x] Vitest coverage in `template-builder-editor-state.test.ts`.
- [x] Read-only diagnostic panel on template-builder route.

## Phase 3: Simple Picker UI — complete

**LLM brief:** [phase-3-simple-picker-ui-llm-brief.md](./phase-3-simple-picker-ui-llm-brief.md)

- [x] Simple picker editor (`template-builder-editor.tsx`) replaces Phase 2 diagnostic panel.
- [x] One control per option group (category, mode, palette, gradient, image, noise, particle, pattern, texture, video, use background).
- [x] Saved value label per field; draft via Select controls.
- [x] Dirty state, changed count, changed field list, reset-to-saved.
- [x] Disabled save with “Save blocked pending CMS contract”.
- [x] Raw JSON dumps retained for debugging (above dumps in content order: editor first).
- [x] Label and select-value helpers with Vitest coverage.

## Phase 4: Save Pathway

**LLM brief:** [phase-4-save-pathway-llm-brief.md](./phase-4-save-pathway-llm-brief.md)  
**Handoff:** [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md) (CMS implemented)  
**Outstanding:** [phase-4-save-pathway-outstanding.md](./phase-4-save-pathway-outstanding.md)  
**Status:** App + CMS aligned on flat PUT. **E2E:** enable `putTemplateOptions` in Strapi Admin, then smoke checklist.

- [x] App BFF `PUT /api/accounts/:accountId/template-options` (201/200 passthrough)
- [x] `draftState` → flat PUT body (`template-builder-save-payload.ts`)
- [x] Save UI (dirty-only, validation, errors, success)
- [x] Refetch `account/me`, `all-template-options`, branding after save
- [x] `useBackground` enum picker (not boolean)
- [x] CMS flat PUT implemented (legacy nested removed)
- [ ] Ops permission + integration smoke signed off

## Phase 5: POC Validation

**LLM brief:** [phase-5-poc-validation-llm-brief.md](./phase-5-poc-validation-llm-brief.md)

- Test with an account that has existing template options.
- Test with an account that has no template options.
- Confirm saved CMS state reloads correctly.
- Confirm comparisons reset after save.
- Confirm invalid account and permission redirects still behave.

## Phase 6: Hardening Before Real UI

- Add focused tests for:
  - state normalization
  - dirty comparison
  - payload mapping
  - save route validation
- Document final save contract.
- Decide how private categories should behave.
- Decide whether category/mode should filter other options.

## POC Success Criteria

- User can load all template options.
- User can change selections locally.
- UI shows what changed.
- User can save.
- Route reloads with the new saved state from CMS.
