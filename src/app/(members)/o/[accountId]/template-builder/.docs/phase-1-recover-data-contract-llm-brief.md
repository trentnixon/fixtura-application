# Phase 1 LLM Brief: Recover Data Contract

## Objective

Recover and document the data contract for the template builder POC before implementing UI, state normalization, or save behavior.

The output of this phase should be a practical frontend contract that explains:

- What template option catalogs are available.
- How saved template state is hydrated.
- What payload CMS expects when saving.
- What edge cases need to be handled before Phase 2.

Do not build the editor UI in this phase.

## Route Context

- App route: `/o/[accountId]/template-builder`
- Route folder: `src/app/(members)/o/[accountId]/template-builder`
- Current route state: read-only diagnostic/data dump.
- Existing planning docs:
  - `template-builder-route-plan.md`
  - `template-builder-poc-phases.md`

## Existing GET Pathway

Frontend hook:

- `useAllTemplateOptions(accountId, { templateOptionId })`

App BFF:

- `GET /api/accounts/:accountId/all-template-options`

CMS endpoint:

- `GET /api/template-categories/all-template-options?accountId=...&templateOptionId=...`

Known response groups:

- `categories`
- `modes`
- `palettes`
- `gradients`
- `images`
- `noises`
- `particles`
- `patterns`
- `textures`
- `videos`
- `currentSelection`

## Existing Category List Pathway

Frontend hook:

- `useTemplateCategoriesListForSelection()`

App BFF:

- `GET /api/account/template-categories/list-for-selection`

CMS endpoint:

- `GET /api/template-categories/list-for-selection`

Known behavior:

- Full catalog excludes private categories.
- Category list includes private categories.

## Investigation Tasks

### 1. Inventory Current GET Data

Confirm the exact payload shape for:

- `categories`
- `modes`
- `palettes`
- `gradients`
- `images`
- `noises`
- `particles`
- `patterns`
- `textures`
- `videos`
- `currentSelection`

For each catalog group, document:

- item type/interface
- id field
- display label fallback
- nullable fields
- whether the group can be empty

### 2. Confirm Saved State Hydration

Confirm how `templateOptionId` is resolved:

- primary source: `/account/me`
- fallback source: account branding payload

Confirm behavior when:

- `templateOptionId` is present and valid
- `templateOptionId` is missing
- `templateOptionId` is invalid
- account has no saved template option yet

Document whether `currentSelection` can be trusted as the source for `savedState`.

### 3. Recover Save Contract

Find or confirm the CMS save endpoint:

- `PUT /api/template-option/put-template-options/:accountId`

Confirm:

- exact request body
- relation field names
- whether relation values are ids, objects, or nested Strapi connect shapes
- whether `useBackground` is included
- whether `templateOptionId` is required
- whether the endpoint creates when missing or only updates existing records
- success response shape
- error response shape

If the exact CMS contract cannot be proven from this repo, document the uncertainty clearly and list the CMS questions to ask.

### 4. Define Frontend Field Contract

Create a mapping table for normalized editor fields.

Expected frontend field names:

- `templateCategoryId`
- `templateModeId`
- `templatePaletteId`
- `templateGradientId`
- `templateImageId`
- `templateNoiseId`
- `templateParticleId`
- `templatePatternId`
- `templateTextureId`
- `templateVideoId`
- `useBackground`

For each field, map:

- catalog source list
- `currentSelection` source field
- draft state field
- CMS save payload field
- nullable behavior

### 5. Identify Edge Cases

Document known or likely edge cases:

- private categories: hidden, selectable, or diagnostic-only
- required fields
- nullable save behavior
- category/mode dependency rules
- invalid account redirects
- permission failures
- CMS 400/401/403/404/500 behavior
- save after no existing `templateOptionId`

## Required Output

Create or update a Phase 1 contract document in this folder.

Suggested filename:

- `phase-1-data-contract.md`

The document should include:

- endpoint summary
- option group inventory
- saved state hydration notes
- normalized field mapping
- save payload contract
- edge cases
- unresolved questions
- recommendation on whether Phase 2 can start

## Guardrails

- Do not implement UI controls in this phase.
- Do not add save behavior in this phase unless required only to verify the contract and explicitly agreed.
- Prefer evidence from code, existing handoffs, and git history over assumptions.
- Mark uncertain items as open questions rather than filling gaps with guesses.
- Keep docs concise and directly useful for implementation.

## Phase 1 Completion Criteria

Phase 1 is complete when:

- all GET catalog groups are documented
- saved-state hydration is understood
- save contract is either confirmed or clearly blocked on CMS questions
- frontend normalized field mapping is drafted
- Phase 2 state normalization can start with known inputs and known unknowns
