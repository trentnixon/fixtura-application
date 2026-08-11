# Tickets — Page Headers

# Completed Tickets Index

- (none yet; details live in `Completed.md`)

---

---

ID: TKT-2026-001
Status: In Progress
Priority: High
Owner: Fixtura UI
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-PageHeaders

---

## Overview

Stand up the `/sandbox/kitchen-sink/page-headers` route with a compiling skeleton plus planning notes so subsequent phases can fill in real variants without re-discovering the structure.

## What We Need to Do

Create the route folder, stub each variant section, wire the route into the kitchen-sink sidebar + overview grid, and seed `.docs` + `.research` notes.

### Phase 1: Skeleton

- [x] Create `page.tsx` + `_sections/*.tsx` stubs (intro + 9 variants)
- [x] Add nav link to `src/app/sandbox/kitchen-sink/layout.tsx`
- [x] Add overview card to `src/app/sandbox/kitchen-sink/kitchen-sink-overview-grid.tsx`

### Phase 2: Notes

- [x] Seed `.docs/readMe.md`, `DevelopmentRoadMap.md`, `Tickets.md`, `Completed.md`
- [x] Seed `.research/2026-04-28-page-header-variants.md`

### Constraints, Risks, Assumptions

- Stubs must compile (named exports must match `page.tsx` imports).
- No new shared component is added under `src/components/ui/` in this pass.
- The Season Overview title in `route-lab/season/575` is intentionally unchanged here.

---

---

ID: TKT-2026-002
Status: Draft
Priority: Medium
Owner: Fixtura UI
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-PageHeaders

---

## Overview

Build the foundational three variants that most routes will use: basic, eyebrow, breadcrumbs.

## What We Need to Do

Replace the TODO markers in `_sections/basic.tsx`, `_sections/eyebrow.tsx`, and `_sections/breadcrumbs.tsx` with real preview blocks. Decide on the shared API shape (composable vs. variants).

### Phase 1: API Decision

- [ ] Compare composable `<PageTitleBlock />` slots vs. dedicated components
- [ ] Document the chosen approach in `.research/`

### Phase 2: Implement

- [ ] Build basic variant preview
- [ ] Build eyebrow variant preview
- [ ] Build breadcrumbs variant preview

---

---

ID: TKT-2026-003
Status: Draft
Priority: Medium
Owner: Fixtura UI
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-PageHeaders, TKT-2026-002

---

## Overview

Build the interaction-bearing variants: actions, metadata, tabs.

## What We Need to Do

Compose existing primitives (Button, Badge, tab strip) into the title section while respecting mobile collapse behaviour.

### Phase 1: Implement

- [ ] Build actions variant preview (primary + secondary CTAs, mobile stack)
- [ ] Build meta variant preview (status badge, timestamp, owner)
- [ ] Build tabs variant preview

---

---

ID: TKT-2026-004
Status: Draft
Priority: Medium
Owner: Fixtura UI
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-PageHeaders, TKT-2026-002

---

## Overview

Build the heavier hero variants: stats, back-link, search.

## What We Need to Do

Reuse the inline KPI pattern from the Season Overview as the source for the stats variant. Define back-link layout for detail pages.

### Phase 1: Implement

- [ ] Build stats variant preview (KPI strip)
- [ ] Build back-link variant preview
- [ ] Build search / filter variant preview

---

---

ID: TKT-2026-005
Status: Draft
Priority: Low
Owner: Fixtura UI
Created: 2026-04-28
Updated: 2026-04-28
Related: Roadmap-PageHeaders, TKT-2026-002

---

## Overview

Refactor the Season Overview route header to consume the chosen page-header variant from the kitchen-sink reference.

## What We Need to Do

Replace the hand-rolled `<header>` block in `src/app/sandbox/route-lab/season/575/_components/season-route-lab-frame.tsx` with the agreed page-header component, keeping the existing title + endpoints scope intact.

### Phase 1: Implement

- [ ] Pick the variant that fits Season Overview (likely stats or eyebrow + breadcrumbs)
- [ ] Swap the hand-rolled header
- [ ] Verify the route still renders identically (visual + endpoints)
