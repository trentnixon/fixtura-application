# 2026-04-28 — Page Header Variants

## Context

Stand up a kitchen-sink reference for the title section that opens every members-area route. Today every route hand-rolls its header (see Season Overview), which produces drift across pages and makes it hard for new routes to pick a consistent pattern.

## Planned variants

1. **Basic** — title + subtitle. Baseline. Equivalent to the existing `PageHeader` primitive.
2. **Eyebrow** — small overline / category above the title. Useful when the page belongs to a parent context (e.g. "Organisation" → "Dashboard").
3. **Breadcrumbs** — crumb trail above the title for nested routes.
4. **Actions** — title left, primary + secondary buttons right. Most common dashboard pattern.
5. **Meta** — title with a metadata row underneath (status badge, last-updated, owner).
6. **Tabs** — title block followed by sibling sub-route tabs.
7. **Stats** — hero header with KPI strip inline (Competitions / Grades / Teams / Fixtures).
8. **Back** — detail-page header with back link above the entity title.
9. **Search** — index-page header with inline search / filter slot.

## Reference patterns already in the codebase

- `src/components/ui/container.tsx` → `PageHeader` primitive (current baseline).
- `src/app/sandbox/kitchen-sink/buttons/page.tsx` → canonical kitchen-sink usage of `PageHeader`.
- `src/app/sandbox/route-lab/season/575/_components/season-route-lab-frame.tsx` → hand-rolled lab header (the pattern we want to replace via TKT-2026-005).
- `src/app/sandbox/route-lab/season/575/overview/page.tsx` → inline KPI stats pattern that feeds the **Stats** variant.
- `src/components/ui/breadcrumb.tsx` and `src/app/sandbox/kitchen-sink/navigation/page.tsx` → existing breadcrumb usage to compose into the **Breadcrumbs** variant.
- `src/components/typography/index.ts` → `TypographyEyebrow`, `TypographyOverline`, `TypographyPageTitle`, `TypographyPageDescription`. Prefer these over ad-hoc Tailwind text utilities.

## Open questions for the build phase

- **Single composable component or 9 distinct components?** Leaning toward a single `<PageTitleBlock />` with optional `eyebrow`, `breadcrumbs`, `meta`, `actions`, and `tabs` slots — but only commit after building two variants.
- **Where do tabs live?** Inside the header component, or as a sibling under it. Affects the API surface and how routes structure their layouts.
- **Mobile collapse for actions + search variants.** Stack vs. menu vs. drop secondary actions to an overflow.
- **Breadcrumbs + back-link — both?** Probably either/or; document the rule in the intro section once decided.
- **Stats variant on small screens.** KPI strip wraps to a 2-column grid? Hides? Defer to a separate ticket if needed.

## Non-goals

- Do not introduce a new shared component in `src/components/ui/` during the boilerplate pass.
- Do not change the Season Overview header in this pass — captured as TKT-2026-005.
- No tests added for stub sections.

## Next

- [ ] Approve variant inventory.
- [ ] Run TKT-2026-002 (basic + eyebrow + breadcrumbs) and decide composable-vs-variants API.
