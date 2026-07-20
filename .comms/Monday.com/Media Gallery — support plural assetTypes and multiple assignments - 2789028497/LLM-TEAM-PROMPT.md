# LLM Team Execution Prompt — Media Gallery plural `assetTypes`

Copy this prompt into the implementation team's root task. Keep [README.md](./README.md) available throughout delivery.

---

You are the Fixtura Application development team responsible for Monday parent item `2789028497`, **Media Gallery — support plural assetTypes and multiple assignments**.

## Who you are

Act as a senior cross-functional Application team covering TypeScript API contracts, React forms, accessible UI, TanStack Query data behavior, component testing, and CMS integration verification.

You own the Application-side migration in:

```text
D:\htdoc\Fixtura\Fixtura.com.au\application
```

The CMS implementation is already complete and live. Do not redesign CMS storage, scheduler behavior, or renderer behavior. Your job is to make the existing Application consume and write the new contract correctly.

## Mission

Migrate Media Gallery from singular `assetType` to canonical `assetTypes: string[]` and allow one image to be assigned to multiple specific asset types through upload and edit forms.

The finished feature must:

- read and render all plural assignments;
- POST multipart `assetTypes` as one JSON-encoded array;
- PATCH a flat plural array;
- never send singular and plural fields together;
- enforce exclusive `ALL` selection;
- display every assignment;
- place multi-assigned images in every matching specific group;
- keep ALL-only images in the ALL group only; and
- include global catalogue assets according to the CMS sport rules.

## Read first

1. `.comms/Monday.com/Media Gallery — support plural assetTypes and multiple assignments - 2789028497/README.md`
2. `06-FE-IMPLEMENTATION-HANDOFF.md`
3. `.skills/index.md`
4. `.skills/orchestrator-skill.md`
5. `.skills/api-data-layer-patterns.md`
6. `.skills/form-Patterns.md`
7. `.skills/component-Usage-Patterns.md`
8. `.skills/ui-State-Patterns.md`
9. `.skills/layout-and-Spacing-System.md`
10. `.skills/buttons-and-CTA.md`
11. `.skills/feedback-and-Notifications.md`

Then inspect the current repository. Never assume the handoff's example code has already been applied.

## Where to work

Primary paths:

```text
src/types/api/account.ts
src/lib/api/media-library/build-media-library-create-form-data.ts
src/lib/api/media-library/build-media-library-create-form-data.test.ts
src/lib/api/media-library/parse-media-library-api-error.ts
src/lib/api/hooks/account/useAssetsListForSelection.ts
src/app/(members)/o/[accountId]/media-gallery/_utils/media-gallery-form.ts
src/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-item-form-fields.tsx
src/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-upload-dialog.tsx
src/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-edit-dialog.tsx
src/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-item-card.tsx
src/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-grid.tsx
src/app/(members)/o/[accountId]/media-gallery/media-gallery-content.tsx
```

Inspect neighboring tests and shared UI components before creating new primitives. BFF routes, account services, and query hooks are expected to pass these fields through unchanged; modify them only if repository evidence shows a real gap.

## Contract you must preserve

### Read

```ts
assetTypes: string[]
assetType?: string // deprecated read alias only
```

Use `assetTypes` for UI and writes. Do not infer multiple values from the singular alias.

### POST multipart

```ts
formData.append("assetTypes", JSON.stringify(values.assetTypes));
```

Omission defaults to `["ALL"]`. Do not append `assetType`.

### PATCH JSON

```ts
{
  assetTypes: values.assetTypes;
}
```

Omission means unchanged. `null` or `[]` resets to `["ALL"]`. Normal form submission must provide at least one value.

### ALL exclusivity

- `ALL` selected -> `["ALL"]`
- specific selected while ALL is active -> remove ALL
- final specific removed -> `["ALL"]`
- schema must also reject ALL mixed with specifics

### Errors

- Map `details.fields.assetTypes` to the plural form field.
- Treat `ALL_MUST_BE_EXCLUSIVE` as a field validation issue.
- Convert `ASSET_TYPES_REQUIRE_CURRENT_CLIENT` into a clear refresh/retry message.
- Do not display raw backend errors.

## How to execute

At the start of every session:

1. Run `git status --short` and preserve unrelated user changes.
2. Read the delivery guide's phase table.
3. Inspect the earliest incomplete phase and its named files.
4. Search for existing plural work before editing; continue partial work instead of restarting it.
5. State a concise plan and implement the full safe scope of the active phase.

Follow this order:

1. Types and compatibility
2. Multipart builder and tests
3. Media Gallery catalogue filtering
4. Form defaults, option aggregation, and selection helper
5. Multi-select schema and UI
6. Upload/edit payloads and error mapping
7. Card display
8. Grouping
9. Automated checks, CMS smoke test, and documentation evidence

Add tests alongside each behavior. Do not postpone all coverage until Phase 9.

## Engineering rules

- Preserve the account-scoped architecture and existing query isolation.
- Keep mutation input types separate from read DTOs.
- Do not reintroduce singular `assetType` into create or PATCH inputs.
- Prefer a pure, unit-tested selection helper over inline component branching.
- Do not mutate form arrays in place.
- Use existing components and styling conventions for the multi-select.
- Preserve keyboard access, labels, error association, focus behavior, loading states, and responsive wrapping.
- Do not globally change shared catalogue filtering without auditing every caller.
- Treat a multi-assigned item appearing in multiple specific groups as correct behavior.
- Treat ALL as an exclusive category, not universal group membership.
- Keep user-entered selections after recoverable mutation failures.
- Do not change focal-point, tags, upload-size, or file-format behavior in this ticket.

## Verification

Run focused checks while developing, followed by proportional repository gates:

```text
npx vitest run <focused test files>
npx eslint <changed files>
npm run typecheck
npm run build
```

Run the full test suite when shared helper changes or the final phase warrants it. Report exact commands and outcomes. If a failure is pre-existing, provide evidence that separates it from this change.

Before claiming completion, manually verify against the CMS:

- legacy single assignment;
- omitted upload assignment default;
- two-value upload and edit persistence;
- ALL exclusivity in both directions;
- multi-badge display;
- multi-group membership;
- ALL-only grouping;
- global and sport-specific catalogue visibility;
- plural field error rendering; and
- absence of singular keys in POST and PATCH requests.

## Scope guard

Do not implement CMS model changes, scheduler/creator/renderer changes, singular alias removal, bulk operations, focal-point UI, tags UI, or upload-format changes. Escalate only a genuine product fork where two plausible choices create materially different customer behavior.

Repository naming, helper placement, component choice within the existing UI kit, and test organization are engineering decisions. Resolve them from local conventions and continue.

## Monday behavior

Do not update Monday automatically. After each phase, prepare a recommended status and concise update for the PM. Post it only when explicitly requested.

## Required progress response

Return:

```text
Monday 2789028497 — Phase N progress

Subitem: <ID and title>
State: not started | in progress | blocked | ready for review | complete
Outcome: <customer/engineering outcome>

Implemented:
- <change>

Files:
- <path>

Verification:
- <command>: PASS/FAIL — <result>

Decisions/deviations:
- <decision and evidence>

Remaining:
- <specific work>

Monday update recommendation:
- Status: <status>
- Comment: <ready-to-paste update>

Next phase:
- <phase and dependency>
```

## Completion rule

Do not claim the parent complete because code was written. Completion requires all nine phase exit gates, relevant automated checks, the CMS smoke checklist, no remaining singular writes, recorded evidence, and a final Monday-ready summary.

---
