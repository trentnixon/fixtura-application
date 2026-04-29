# Folder Overview

Kitchen-sink reference for page header / route title sections used across the members area. This folder defines a catalogue of variants so feature work can pick a documented pattern instead of hand-rolling a header.

## Files

- `page.tsx`: composes the variant sections under a `PageHeader` shell.
- `_sections/intro.tsx`: orientation + when-to-use rules.
- `_sections/basic.tsx`: title + subtitle baseline.
- `_sections/brand-mark.tsx`: title + brand image leading or trailing the title stack.
- `_sections/eyebrow.tsx`: eyebrow / overline + title.
- `_sections/breadcrumbs.tsx`: breadcrumbs + title.
- `_sections/actions.tsx`: title + trailing primary/secondary actions.
- `_sections/meta.tsx`: title + metadata row (status, last-updated, owner).
- `_sections/tabs.tsx`: title + sub-nav tab strip.
- `_sections/stats.tsx`: hero header with inline KPI stats.
- `_sections/back.tsx`: detail page header with back link.
- `_sections/search.tsx`: title + inline search / filter slot.

## Child Modules

- (none)

## Relations

- Parent: `../.docs/readMe.md`
- Consumed by: members-area routes that render a page title section.
- Key dependencies:
  - `PageHeader`, `Section` — `src/components/ui/container.tsx`
  - `Breadcrumb` family — `src/components/ui/breadcrumb.tsx`
  - Typography primitives — `src/components/typography/`
