# Developer Handoff — Media Gallery plural `assetTypes`

> Monday parent `2789028497` | Board `5029957869` — Fixtura Application | Prepared 17 July 2026

This is the development handoff for migrating the Application Media Gallery from the deprecated singular `assetType` assignment to canonical plural `assetTypes: string[]`, including a multi-select upload/edit experience.

The team should read this guide and [LLM-TEAM-PROMPT.md](./LLM-TEAM-PROMPT.md), then complete the phases in dependency order. The CMS change is already live; this Application work is a client contract migration, not a CMS redesign.

## Source authority

Use sources in this order when details conflict:

1. [Application Monday ticket `2789028497`](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2789028497)
2. [Attached Application implementation brief](https://trentnixons-team-company.monday.com/docs/5030004924)
3. [CMS source ticket `2788711582`](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2788711582)
4. Repository handoff downloaded as `06-FE-IMPLEMENTATION-HANDOFF.md`
5. Current Application code, tests, and established local conventions

The CMS contract is authoritative for request and response semantics. Current Application code is authoritative for architecture and UI conventions.

## Product outcome

An authenticated account user can upload or edit a Media Gallery image and assign it to one or more specific asset types. The Application sends plural assignments to the CMS, displays all assignments, and places a multi-assigned image in every matching specific group.

The special `ALL` assignment remains exclusive:

- selecting `ALL` clears specific selections;
- selecting a specific value removes `ALL`;
- removing the final specific value restores `ALL`; and
- an `ALL`-only item appears only in the ALL group.

## Scope

### Included

- Application API types for plural read/create/update fields
- Multipart upload serialization
- Upload and edit form state, validation, and multi-select UI
- Upload/edit error mapping for plural validation
- Media card display of multiple assignments
- Grid grouping and option aggregation
- Media Gallery catalogue sport filtering aligned with CMS rules
- Focused unit/component tests and manual CMS smoke verification
- Local handoff/evidence updates after implementation

### Excluded

- CMS storage, scheduler, creator, or renderer changes
- Removal of the deprecated singular read alias from the CMS
- Focal-point or tags UI changes
- Upload size or supported-format changes
- Bulk upload or bulk edit
- Unrelated changes to Image Options or Data Lab catalogue behavior

## Locked CMS contract

### Read DTO

The canonical field is:

```ts
assetTypes: string[]
```

The CMS may also return:

```ts
assetType?: string // deprecated alias of assetTypes[0]
```

Use `assetTypes` for all normal UI and write logic. Do not rebuild a multi-value assignment from `assetType`.

### POST multipart

```ts
formData.append("assetTypes", JSON.stringify(["Upcoming Fixtures", "Weekend Results"]));
```

Rules:

- omitted `assetTypes` defaults to `["ALL"]` in the CMS;
- never send `assetTypes` and `assetType` together; and
- the multipart value is one JSON-encoded array, not repeated form fields.

### PATCH JSON

```json
{
  "assetTypes": ["Upcoming Fixtures", "Team List"]
}
```

Rules:

- omitted field leaves the assignment unchanged;
- `null` or `[]` resets it to `["ALL"]`; and
- normal form submission should send a non-empty array.

### Errors

| Case                                             | HTTP | Field/code                                             |
| ------------------------------------------------ | ---: | ------------------------------------------------------ |
| Invalid plural input                             |  400 | `details.fields.assetTypes`                            |
| `ALL` mixed with specifics                       |  400 | `ALL_MUST_BE_EXCLUSIVE` under `assetTypes`             |
| Legacy singular PATCH against multi-assigned row |  409 | `ASSET_TYPES_REQUIRE_CURRENT_CLIENT` under `assetType` |

The completed client should not trigger the 409 because it must write plural values only. Still convert it into a clear refresh/retry message rather than exposing a raw backend error.

## Current repository baseline

The feature is implemented with singular state today.

| Area              | Current evidence                                                             | Required migration                                                                               |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| DTOs and inputs   | `src/types/api/account.ts`                                                   | Required plural item field; plural create/PATCH inputs; deprecated optional read alias           |
| Multipart builder | `src/lib/api/media-library/build-media-library-create-form-data.ts`          | JSON-encode `assetTypes`; never append singular field                                            |
| Builder tests     | `src/lib/api/media-library/build-media-library-create-form-data.test.ts`     | Cover one, many, omitted, and absence of singular key                                            |
| Error parser      | `src/lib/api/media-library/parse-media-library-api-error.ts`                 | Preserve plural field errors and add useful legacy-conflict message if needed                    |
| Catalogue query   | `src/lib/api/hooks/account/useAssetsListForSelection.ts`                     | Add Media Gallery-specific global-plus-sport filtering without silently changing other consumers |
| Form utilities    | `src/app/(members)/o/[accountId]/media-gallery/_utils/media-gallery-form.ts` | Plural defaults, toggle helper, flattened extras                                                 |
| Form schema/UI    | `media-gallery/_components/media-gallery-item-form-fields.tsx`               | Array schema, exclusivity refinement, accessible multi-select                                    |
| Upload flow       | `media-gallery/_components/media-gallery-upload-dialog.tsx`                  | Submit `assetTypes` and map plural errors                                                        |
| Edit flow         | `media-gallery/_components/media-gallery-edit-dialog.tsx`                    | PATCH `assetTypes` and handle conflict safely                                                    |
| Card              | `media-gallery/_components/media-gallery-item-card.tsx`                      | Render all assignments as badges/chips                                                           |
| Grid              | `media-gallery/_components/media-gallery-grid.tsx`                           | Membership via `includes`; explicit ALL-only rule                                                |
| Content           | `media-gallery/media-gallery-content.tsx`                                    | Flatten all plural assignments into available options                                            |

The account-scoped BFF routes and existing account service/hooks are transparent for these fields and should not need transformation changes unless implementation evidence proves otherwise.

## Phase plan

| Phase                             | Monday subitem                                                                                  | Deliverable                                                   | Exit gate                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1 — Types and compatibility       | [`2789078317`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789078317) | Canonical plural DTO/create/PATCH types                       | TypeScript prevents new singular writes                                   |
| 2 — Multipart upload contract     | [`2789089743`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789089743) | JSON-encoded plural FormData plus tests                       | Builder sends one `assetTypes` field and no `assetType`                   |
| 3 — Catalogue filtering           | [`2789028290`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789028290) | CMS-aligned Media Gallery asset catalogue                     | Global/matching/no-sport cases pass without unrelated consumer regression |
| 4 — Form state and helpers        | [`2789067086`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789067086) | Plural defaults, option aggregation, exclusive toggle helper  | All selection transitions are unit tested                                 |
| 5 — Multi-select form UI          | [`2789089744`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789089744) | Accessible plural selection control and validation            | Two specifics can be selected; invalid ALL mix cannot submit              |
| 6 — Upload/edit writes and errors | [`2789067087`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789067087) | Plural create/PATCH payloads and useful field/conflict errors | Both mutations persist multiple assignments                               |
| 7 — Card display                  | [`2789089681`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789089681) | Badge/chip per assignment                                     | Single, multiple, and ALL-only layouts are correct                        |
| 8 — Grouping and options          | [`2789067275`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2789067275) | Multi-membership grouping and deduped options                 | Multi-assigned item appears in each specific group; ALL stays isolated    |
| 9 — Verification and closeout     | [`2788954040`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2788954040) | Regression evidence, CMS smoke test, local handoff update     | All automated and manual acceptance checks are recorded                   |

### Dependency order

1. Complete Phases 1–2 before changing submit flows.
2. Complete Phase 3 before finalizing options in the form.
3. Complete Phase 4 before Phase 5 so UI logic has a tested state transition function.
4. Complete Phases 5–6 together to avoid a UI that collects plural values but writes singular values.
5. Phases 7–8 may proceed after the item DTO is plural.
6. Phase 9 is the release gate.

## Phase knowledge base

### Phase 1 — Types and compatibility

Target shape:

```ts
export interface AccountMediaLibraryItem {
  // existing fields
  assetTypes: AccountMediaLibraryAssetType[];
  /** @deprecated CMS read alias; do not use for write logic. */
  assetType?: AccountMediaLibraryAssetType;
}

export interface CreateAccountMediaLibraryMetadata {
  // existing fields
  assetTypes?: AccountMediaLibraryAssetType[];
}

export interface PatchAccountMediaLibraryBody {
  // existing fields
  assetTypes?: AccountMediaLibraryAssetType[] | null;
}
```

Only add a transitional normalizer if live or fixture data can omit the plural response during rollout. If used, keep it at the read boundary and use this precedence:

1. non-empty `assetTypes`;
2. trimmed singular alias as a one-element fallback;
3. `["ALL"]`.

Do not make the singular field available in create or PATCH types.

### Phase 2 — Multipart builder

Replace the existing singular append with:

```ts
if (metadata?.assetTypes !== undefined) {
  form.append("assetTypes", JSON.stringify(metadata.assetTypes));
}
```

Test:

- a one-value array;
- a two-value array;
- omitted metadata;
- an explicit empty array if the builder permits it; and
- `form.has("assetType") === false`.

### Phase 3 — Catalogue filtering

Required Media Gallery semantics:

```ts
const assetSport = asset.Sport?.trim() || null;

if (assetSport === null) return true;
if (!accountSport) return false;
return assetSport.toLowerCase() === accountSport.toLowerCase();
```

`useAssetsListForSelection` is used outside Media Gallery. Prefer either:

- a mode such as `catalogueMode: "media-library" | "strict-sport"`; or
- a dedicated `useMediaLibraryAssetCatalogue(accountSport)` wrapper.

Keep the query key tied to server data, not the client-side filter result. Do not create account cache leakage by keying shared server data incorrectly.

### Phase 4 — Form state and helper

Defaults:

```ts
assetTypes: item?.assetTypes?.length ? item.assetTypes : [MEDIA_LIBRARY_ASSET_TYPE_ALL];
```

Selection helper invariants:

```ts
toggleAssetTypeSelection(current, "ALL"); // => ["ALL"]
toggleAssetTypeSelection(["ALL"], "Team List"); // => ["Team List"]
toggleAssetTypeSelection(["Team List"], "Weekend Results");
// => ["Team List", "Weekend Results"]
toggleAssetTypeSelection(["Team List"], "Team List"); // => ["ALL"]
```

Avoid mutating the current array. Deduplicate values and keep output stable enough for predictable rendering and tests.

For discovered options, change singular aggregation to:

```ts
items.flatMap((item) => item.assetTypes ?? []);
```

### Phase 5 — Form schema and UI

Base validation:

```ts
assetTypes: z.array(z.string().trim().min(1)).min(1, "Select at least one asset type");
```

Add a refinement that rejects `ALL` when the array contains any other value.

Use existing UI primitives and local form conventions. The control must:

- expose a programmatic label and visible selected state;
- work with keyboard navigation;
- show loading and catalogue failure states;
- remain usable with long labels and multiple selections;
- show `errors.assetTypes` beside the field; and
- call `setValue` with validation and dirty-state flags appropriate to the existing form behavior.

Read before implementing:

- `.skills/form-Patterns.md`
- `.skills/component-Usage-Patterns.md`
- `.skills/ui-State-Patterns.md`
- `.skills/layout-and-Spacing-System.md`
- `.skills/buttons-and-CTA.md`
- `.skills/feedback-and-Notifications.md`

### Phase 6 — Submit flows and errors

Upload metadata:

```ts
assetTypes: values.assetTypes;
```

Edit body:

```ts
assetTypes: values.assetTypes;
```

Map `details.fields.assetTypes` to the plural form field. Preserve entered selections after a recoverable request failure. For `ASSET_TYPES_REQUIRE_CURRENT_CLIENT`, tell the user the item uses newer multi-assignment data and should be refreshed/retried; do not silently overwrite it with a singular value.

### Phase 7 — Card display

Render one existing-style badge/chip per plural value. Ensure:

- wrapping does not obscure card actions;
- duplicate labels are not rendered twice;
- ALL is presented consistently; and
- the card does not fall back to singular data unless a documented transitional normalizer is in use.

### Phase 8 — Grouping and options

Grouping rule:

```ts
if (groupName === MEDIA_LIBRARY_ASSET_TYPE_ALL) {
  return item.assetTypes.length === 1 && item.assetTypes[0] === MEDIA_LIBRARY_ASSET_TYPE_ALL;
}

return item.assetTypes.includes(groupName);
```

A multi-assigned item is intentionally visible in more than one specific group. This is not accidental duplication. ALL-only items must not be treated as universal membership.

### Phase 9 — Verification

Automated checks should cover the smallest relevant files first, then the repository-level gates:

```text
npx vitest run <focused test files>
npx eslint <changed files>
npm run typecheck
npm run build
```

Use `npm test` when the change footprint or shared helper risk warrants the full suite. Separate unrelated pre-existing failures from regressions introduced by this ticket.

## Manual CMS smoke checklist

- [ ] A legacy row renders the plural response with one assignment.
- [ ] Upload with omitted assignment returns `["ALL"]`.
- [ ] Upload with two specifics sends a JSON-encoded multipart `assetTypes` field.
- [ ] Edit with two specifics sends a flat JSON `assetTypes` array.
- [ ] Both assignments persist after refetch.
- [ ] Selecting ALL after specifics leaves only ALL.
- [ ] Selecting a specific after ALL removes ALL.
- [ ] Removing the final specific restores ALL.
- [ ] Multiple badges render on the card.
- [ ] A multi-assigned item appears in every matching specific group.
- [ ] An ALL-only item appears only in the ALL group.
- [ ] Global catalogue assets appear for an account with a sport.
- [ ] An account without a sport sees global catalogue assets only.
- [ ] No create or PATCH request sends singular `assetType`.
- [ ] Plural server validation appears beside the form field.

## Definition of done

- All nine Monday subitems meet their acceptance criteria.
- `assetTypes` is canonical through types, form state, writes, display, and grouping.
- No new Application write sends singular `assetType`.
- ALL exclusivity is enforced in both UI behavior and schema validation.
- Media Gallery catalogue filtering matches the CMS while unrelated consumers remain stable.
- Focused tests, lint for changed files, typecheck, and build pass, or exceptions are documented with evidence.
- The manual CMS smoke checklist is complete.
- Local handoff notes record implementation decisions and test evidence.
- The parent Monday ticket receives a concise completion update only when the user or PM asks the team to post it.

## Required phase report

After each phase, return:

1. Phase and Monday subitem ID
2. State: `not started`, `in progress`, `blocked`, `ready for review`, or `complete`
3. Outcome delivered
4. Files changed
5. Tests/checks and exact results
6. Contract decisions or deviations with evidence
7. Remaining risks or blockers
8. Recommended Monday status and update text
9. Next phase
