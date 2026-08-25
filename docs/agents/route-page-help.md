# Pattern: Route page help

Status: current

Reference implementation: manage-sponsors / add-sponsor.

Use this when adding or changing in-product **How this works** help for a members route. Do not invent tours, glossaries, or feature-wide manuals.

## What it is

On-demand Sheet help keyed to the **current route**. Short summary, then **On this page** how-tos for real controls, then **Related** links that navigate. Entry point lives in the **site header** (filled brand button), not in the page action button group.

## Do this

1. **Reuse the shell** — `PageHelpSheet` + `PageHelpContent` in `src/components/page-help/`. Do not fork a new Sheet.
2. **Own content in the feature** — pure builder next to the route (see manage-sponsors `_utils/build-manage-sponsors-page-help-content.ts`). One `route` argument selects the payload.
3. **Map path → route key** — extend or add a path helper (sponsors: `src/lib/sponsors/get-sponsors-page-help-route-from-path.ts`) so the site header can resolve help without guessing.
4. **Wire the site header** — show the trigger from `SiteHeader` via a thin feature helper (sponsors: `src/components/site-header-sponsors-help.tsx`) with `variant="site-header"` (filled `brandPrimary`, size `sm`).
5. **Optional empty-state open** — same route payload; do not invent a second content object for empty vs filled.
6. **Unit-test the builder** — titles, summary length, items with how-tos, related hrefs, any account-aware wording. Do not unit-test Sheet open/close.
7. **Unslop copy** — plain, short, active voice. Say what the control does. No glossaries, no em dashes, no filler.

## Content shape

```ts
type PageHelpContent = {
  title: string;
  summary: string; // 1–2 sentences: why this page + how it hits assets/outcomes
  items: { label: string; howTo: string }[]; // only real on-page controls
  visual?: { alt: string; src: string }; // optional; screenshots deferred
  related: { label: string; href: string }[]; // navigate to sibling routes
};
```

Sheet section order: header (title + summary) → On this page → Example (if visual) → Related.

## Content rules

- **Route-scoped.** Only what this URL is for. Related links cover the rest of the area.
- **Skim in ~20–30 seconds.** Prefer fewer items. Cut anything the UI already labels clearly (e.g. do not explain an obvious name field).
- **Items = controls.** Label matches the UI. `howTo` is how to use it, not a definition essay.
- **Summary** combines benefit and asset/outcome impact. No separate Why / On assets headings.
- **No glossary.** No feature-wide dump across every sub-route in one Sheet.
- **Related navigates** (closes the mental loop by changing page). Do not open another route’s help remotely.
- **Account-aware labels** when the product already has a copy helper (e.g. teams / competitions / grades).

## Layout / chrome rules

- Primary entry: site header row with Toggle Sidebar + area title (**Sponsorships** pattern).
- Do not put How this works in the page header action cluster (Assign / Add / Back).
- Empty state may keep a secondary help open using the **same** route key.
- Sheet styling matches members primary surfaces (`primary/5`, brand accents). Keep the shared shell.

## Sponsors route keys (reference)

| Path rest                         | Help route key    |
| --------------------------------- | ----------------- |
| `manage-sponsors`                 | `pool`            |
| `add-sponsor`                     | `add-sponsor`     |
| `manage-sponsors/assign/position` | `assign-position` |
| `manage-sponsors/assign/entity`   | `assign-entity`   |
| `manage-sponsors/archive`         | `archive`         |

Site header title for these paths: **Sponsorships**.

## Reference implementation map

| Piece                            | Where                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| Content DTO + Sheet              | `src/components/page-help/`                                                |
| Sponsors content builder + tests | `manage-sponsors/_utils/build-manage-sponsors-page-help-content.*`         |
| Feature trigger                  | `manage-sponsors/_components/shared/manage-sponsors-page-help-trigger.tsx` |
| Path → route key                 | `src/lib/sponsors/get-sponsors-page-help-route-from-path.ts`               |
| Site header wire                 | `src/components/site-header-sponsors-help.tsx` + `site-header.tsx`         |

## Extrapolating to another area

1. Add a pure `buildXPageHelpContent({ route, ... })` under that feature.
2. Add path mapping for that area’s URLs (prefer `src/lib/...` helpers the site header can import).
3. Add a thin site-header helper for that area (or extend a shared approach later — only when a second consumer exists; do not invent a CMS/registry early).
4. Set the area title in `getPageTitle` if needed (same pattern as Sponsorships).
5. Copy from sponsors only the **shape and rules**, not the sponsor wording.
6. Run `/unslop` on user-facing strings before shipping.

### Done checklist for a new area

- [ ] Builder returns `PageHelpContent` per route key
- [ ] Builder unit tests at the content seam
- [ ] Path → route key helper covered by tests
- [ ] Site header shows filled How this works on those URLs
- [ ] Page action clusters do **not** include How this works
- [ ] Empty state (if any) reuses the same route key
- [ ] Copy unslopped; items only name real controls

## Out of scope

- Product tours, coachmarks, first-visit modals
- Field-level `?` icons everywhere
- CMS / MDX for help copy (code constants until length forces otherwise)
- Screenshots until explicitly decided (keep `visual` optional)

## Historical specs

- `.scratch/page-help-manage-sponsors/spec.md` — v1 feature-wide help (superseded)
- `.scratch/page-help-manage-sponsors/spec-v2-route-based.md` — early route-based addendum (superseded)
