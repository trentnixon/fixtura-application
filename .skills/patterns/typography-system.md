# Skill — Application typography system

## Purpose

Define how shared typography components from `@/components/typography` should be used in the Fixtura Members Area so hierarchy, tone, and semantics stay consistent across pages, cards, forms, tables, and overlays.

## Applies To

- Any new or updated UI in members routes, shared components, and production-ready sandbox demos
- Page shells, dashboards, settings, dialogs, alerts, empty states, data tables, and navigation labels

## Inputs

- Barrel export: `@/components/typography` (includes `TypographyBase`, `typographyBaseVariants`, semantic components, and scale primitives `TypographyH1`–`TypographyH5`, `TypographyP`, etc.)
- Reference: [`/sandbox/kitchen-sink/typography`](../../src/app/sandbox/kitchen-sink/typography/page.tsx) (grouped `_sections/` scenarios)

## Rules

1. Prefer shared typography components over raw Tailwind text utility combinations for headings, labels, descriptions, helper text, metrics, table text, alerts, dialogs, and navigation labels.
2. Choose variants by **UI purpose** (semantic name), not by guessing font size.
3. If the same text pattern appears more than once across features, propose adding a named variant to `src/components/typography` and document it in the kitchen sink.
4. The typography kitchen sink route is the reference for approved hierarchy, `as` usage, and tone.
5. Cards, forms, dialogs, tables, alerts, and page shells should consume the typography system consistently; `PageHeader` uses `TypographyPageTitle` and `TypographyPageDescription`.

## Scale vs semantic

- **Semantic** (`TypographyPageTitle`, `TypographyCardTitle`, `TypographyLabel`, …): default for product UI.
- **Scale** (`TypographyH1`–`TypographyH5`, `TypographyP`): keep for backwards compatibility and simple doc-style hierarchy; override `as` when the document outline requires it.

## Output

- JSX that imports from `@/components/typography` with minimal extra `className` (only layout, truncation, or token overrides).

## References

- Implementation: [`src/components/typography`](../../src/components/typography)
- Related: [`component-Usage-Patterns.md`](../component-Usage-Patterns.md), [`kitchen-Sink-Maintenance.md`](../kitchen-Sink-Maintenance.md), [`layout-and-Spacing-System.md`](../layout-and-Spacing-System.md)
