# Typography Refactoring Guide

## Purpose

This document defines the standard process for sweeping a folder and replacing raw HTML typography tags with shared typography components.

Use this guide when refactoring route folders, feature folders, or shared component folders that contain direct text elements such as `<p>`, `<h1>`, `<h2>`, `<h3>`, `<small>`, `<label>`, `<blockquote>`, `<ul>`, or inline code tags.

The goal is consistent typography, semantic markup, and fewer one-off Tailwind text styles.

## Typography Source

Typography components live here:

```text
src/components/typography
```

Import components from the barrel export:

```tsx
import {
  TypographyPageTitle,
  TypographyPageDescription,
  TypographySectionTitle,
  TypographyCardTitle,
  TypographyCardDescription,
  TypographyP,
} from "@/components/typography";
```

Do not import individual typography component files directly unless there is a clear local reason.

## Sweep Process

When sweeping a folder:

1. Search for raw typography tags.
2. Replace raw text elements with the closest typography component.
3. Preserve semantic hierarchy and accessibility.
4. Move only typography-related classes when the component already owns that concern.
5. Keep layout, spacing, color overrides, and state classes only when they are still needed.
6. Run lint/typecheck or the closest available verification for the changed files.

Recommended searches:

```powershell
rg "<(h1|h2|h3|h4|h5|p|small|label|blockquote|ul|ol|li|code|span)" path\to\folder
rg "text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)" path\to\folder
rg "font-(sans|heading|mono|medium|semibold|bold)" path\to\folder
```

Use the first search to find raw tags. Use the second and third searches to find text styles hidden on generic elements such as `<div>` or `<span>`.

## Component Selection

Prefer semantic typography components that describe the role of the text in the UI.

### Page And Shell Text

Use these for route-level or section-level hierarchy:

- `<h1>` page title: `TypographyPageTitle`
- page subtitle or route intro: `TypographyPageDescription`
- major section heading: `TypographySectionTitle`
- major section description: `TypographySectionDescription`
- nested section heading: `TypographySubsectionTitle`
- card heading: `TypographyCardTitle`
- card body summary: `TypographyCardDescription`
- eyebrow or short category label: `TypographyEyebrow`
- compact upper label: `TypographyOverline`
- large hero display heading: `TypographyDisplay`

### General Body Text

Use these for general content:

- standard paragraph: `TypographyP` or `TypographyBody`
- larger body copy: `TypographyBodyLarge`
- smaller body copy: `TypographyBodySmall`
- caption: `TypographyCaption`
- fine print: `TypographyFinePrint`
- muted paragraph or secondary copy: `TypographyMuted`
- leading intro paragraph: `TypographyLead`
- prominent inline text: `TypographyLarge`
- small inline text: `TypographySmall`

### Forms

Use these inside forms:

- field label: `TypographyLabel`
- required field label: `TypographyLabelRequired`
- helper copy: `TypographyHelperText`
- error copy: `TypographyErrorText`
- success copy: `TypographySuccessText`
- fieldset title: `TypographyFieldsetLegend`

### Navigation

Use these for navigation and route chrome:

- nav item text: `TypographyNavLabel`
- nav section label: `TypographyNavSectionLabel`
- tab text: `TypographyTabLabel`
- breadcrumb text: `TypographyBreadcrumbText`

### Data Display

Use these in tables, stats, and data summaries:

- metric value: `TypographyMetricValue`
- metric label: `TypographyMetricLabel`
- metric change: `TypographyMetricChange`
- data label: `TypographyDataLabel`
- data value: `TypographyDataValue`
- table heading: `TypographyTableHeading`
- table cell text: `TypographyTableCell`
- table metadata: `TypographyTableMeta`

### State And Overlay Text

Use these in alerts, empty states, dialogs, and popovers:

- alert title: `TypographyAlertTitle`
- alert body: `TypographyAlertDescription`
- status label: `TypographyStatusLabel`
- empty state title: `TypographyEmptyStateTitle`
- empty state body: `TypographyEmptyStateDescription`
- dialog title: `TypographyDialogTitle`
- dialog body: `TypographyDialogDescription`
- popover title: `TypographyPopoverTitle`
- popover body: `TypographyPopoverDescription`

### Direct HTML Equivalents

Use direct equivalents when there is no stronger semantic component:

- `<h1>`: `TypographyH1`
- `<h2>`: `TypographyH2`
- `<h3>`: `TypographyH3`
- `<h4>`: `TypographyH4`
- `<h5>`: `TypographyH5`
- `<p>`: `TypographyP`
- `<blockquote>`: `TypographyBlockquote`
- `<ul>` or list wrapper: `TypographyList`
- inline `<code>`: `TypographyInlineCode`, `TypographyMonoText`, or `TypographyCodeInline`
- brand wordmark/text: `TypographyBrand`

## Replacement Rules

### Preserve Meaning

Do not flatten heading levels just to match a visual size.

Good:

```tsx
<TypographySectionTitle>Fixtures</TypographySectionTitle>
<TypographySubsectionTitle>Upcoming rounds</TypographySubsectionTitle>
```

Avoid:

```tsx
<TypographyH2>Fixtures</TypographyH2>
<TypographyH2>Upcoming rounds</TypographyH2>
```

### Prefer Semantic Components

Choose the component that describes the UI role before choosing the component that matches the old tag.

Good:

```tsx
<TypographyCardTitle>Competition status</TypographyCardTitle>
<TypographyCardDescription>Last synced 4 minutes ago.</TypographyCardDescription>
```

Acceptable fallback:

```tsx
<TypographyH3>Competition status</TypographyH3>
<TypographyP>Last synced 4 minutes ago.</TypographyP>
```

### Keep Layout Classes Outside Typography

Typography components should own text style. Parent containers should own layout.

Good:

```tsx
<div className="space-y-2">
  <TypographySectionTitle>Teams</TypographySectionTitle>
  <TypographySectionDescription>Manage team setup and allocations.</TypographySectionDescription>
</div>
```

Avoid:

```tsx
<TypographySectionTitle className="mb-2 flex items-center gap-2">Teams</TypographySectionTitle>
```

Keep a layout class on typography only when the element itself is the correct layout target.

### Remove Duplicate Text Classes

When replacing a tag, remove classes already provided by the typography component.

Before:

```tsx
<p className="text-muted-foreground text-sm leading-6">No fixtures found.</p>
```

After:

```tsx
<TypographySectionDescription>No fixtures found.</TypographySectionDescription>
```

Do not carry over `text-sm`, `text-base`, `leading-*`, `font-*`, or `tracking-*` unless the component needs a deliberate local override.

### Use `as` When Semantics And Visual Role Differ

Many semantic typography components support an `as` prop. Use it when the visual role is right but the document structure needs a different HTML tag.

Example:

```tsx
<TypographyCardTitle as="h2">Season summary</TypographyCardTitle>
```

This keeps the card-title styling while preserving the correct heading level.

### Be Careful With Interactive Text

Do not replace text inside buttons, links, menu items, or controls if the typography component would produce invalid nested markup or interfere with the control.

Good:

```tsx
<Button>
  <span className="font-medium">Save changes</span>
</Button>
```

Better only if the component renders a safe inline element for that context:

```tsx
<Button>
  <TypographyNavLabel as="span">Save changes</TypographyNavLabel>
</Button>
```

Check the target component before using it inside interactive elements.

## Common Replacements

### Page Header

Before:

```tsx
<header>
  <h1 className="text-3xl font-semibold tracking-tight">Competition settings</h1>
  <p className="text-muted-foreground mt-2 text-sm">
    Configure grades, teams, and fixture generation.
  </p>
</header>
```

After:

```tsx
<header className="space-y-2">
  <TypographyPageTitle>Competition settings</TypographyPageTitle>
  <TypographyPageDescription>
    Configure grades, teams, and fixture generation.
  </TypographyPageDescription>
</header>
```

### Card Header

Before:

```tsx
<div>
  <h3 className="text-lg font-semibold">Sync status</h3>
  <p className="text-muted-foreground text-sm">Review the latest import result.</p>
</div>
```

After:

```tsx
<div className="space-y-1">
  <TypographyCardTitle>Sync status</TypographyCardTitle>
  <TypographyCardDescription>Review the latest import result.</TypographyCardDescription>
</div>
```

### Form Field

Before:

```tsx
<label className="text-sm font-medium" htmlFor="season-name">
  Season name
</label>
<p className="text-muted-foreground text-xs">This appears in public fixtures.</p>
```

After:

```tsx
<TypographyLabel htmlFor="season-name">Season name</TypographyLabel>
<TypographyHelperText>This appears in public fixtures.</TypographyHelperText>
```

### Empty State

Before:

```tsx
<div>
  <h3 className="text-lg font-semibold">No teams yet</h3>
  <p className="text-muted-foreground text-sm">Add teams before generating fixtures.</p>
</div>
```

After:

```tsx
<div className="space-y-1">
  <TypographyEmptyStateTitle>No teams yet</TypographyEmptyStateTitle>
  <TypographyEmptyStateDescription>
    Add teams before generating fixtures.
  </TypographyEmptyStateDescription>
</div>
```

## Import Rules

- Use one import from `@/components/typography`.
- Add only the typography components used in the file.
- Remove unused imports after replacing raw tags.
- Keep import ordering consistent with the surrounding file.

Example:

```tsx
import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyPageTitle,
} from "@/components/typography";
```

## What Not To Replace

Do not replace raw tags when:

- the tag is required by a third-party component API
- the element is part of generated MDX or rich text rendering
- a component already wraps typography internally
- replacing it would create invalid HTML, such as a `<p>` inside a `<p>`
- the text is purely structural or screen-reader-only
- the element is an icon-only accessibility label or `sr-only` text

For `sr-only` text, preserve the existing element unless there is a specific accessibility reason to change it.

## Verification Checklist

After a sweep:

- no obvious raw heading or paragraph tags remain in the target folder
- heading order still makes sense
- forms still associate labels with controls
- buttons and links do not contain invalid nested block elements
- visual spacing is still controlled by containers
- unused imports were removed
- lint/typecheck passes for touched files

## Refactor Goal

A swept folder should use shared typography components for product text.

Developers should be able to scan the UI and quickly understand:

- which text is a page title
- which text is a section title
- which text is card, form, table, or state copy
- which text intentionally uses a local override
- where typography behavior comes from
