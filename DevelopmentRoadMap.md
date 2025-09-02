# Development Roadmap – Code Quality, Strict TS, Linting, Tailwind, Error Handling

## ✅ Completed

- [x] Created root roadmap focused on TS strictness, linting, Tailwind v4 review, and error handling
- [x] TypeScript strict baseline (tsconfig hardened, typecheck script added; build depends on it)
- [x] ESLint flat config (TS/React/a11y/import-order) and scripts
- [x] Prettier with Tailwind plugin and scripts
- [x] Husky pre-commit + lint-staged

## ⏳ To Do (easy → hard)

1. Tailwind v4 review (COMPLETED)
   - Confirmed PostCSS/Tailwind v4 config, class sorting, and utilities usage
   - Documented conventions for component styling (utility-first vs. composition) in `readMe.md`
2. Error handling foundations (COMPLETED)
   - Implemented `src/app/error.tsx` and `src/app/not-found.tsx`
   - Added typed error helpers (`src/lib/error.ts`)
3. TanStack Query defaults (COMPLETED)
   - Centralized `QueryClient` with retries/backoff and toasts on error
   - Added React Query Devtools in development
4. UI/UX error feedback (COMPLETED)
   - Standardized toast helpers via `sonner` (`src/lib/notify.ts`)
   - Added reusable `<ErrorState />` and `<EmptyState />`
5. Continuous Integration (COMPLETED)
   - Added GitHub Actions workflow for `install → lint → typecheck → build`
6. Testing (NEXT)
   - Add Vitest + RTL configuration and basic component test
   - Add CI step to run unit tests with coverage
   - Test Coverage Plan (identification only):
     - src/lib
       - error.ts: mapErrorToMessage, edge cases and unknowns
       - notify.ts: toast helpers triggered on success/error paths
       - query.tsx: provider renders, default options wiring
       - utils.ts: className merger and helpers
     - src/components/ui (shadcn wrappers):
       - avatar.tsx, breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx, carousel.tsx, command.tsx,
         dialog.tsx, dropdown-menu.tsx, input-otp.tsx, menubar.tsx, navigation-menu.tsx, popover.tsx,
         select.tsx, sheet.tsx, skeleton.tsx, slider.tsx, switch.tsx, table.tsx, tabs.tsx, textarea.tsx, tooltip.tsx,
         empty-state.tsx, error-state.tsx
       - Focus: render with required props, disabled/readonly states, size/variant props, a11y roles/labels,
         basic keyboard interactions for menus/popovers where feasible (smoke-level)
     - src/components/tables
       - BasicTable.tsx, AdvancedTable.tsx: headers/rows render, empty state; sort/paginate control callbacks
     - src/components/cards
       - BasicCard.tsx, MediaCard.tsx, ListCard.tsx, ActionHeaderCard.tsx: title/description slots render,
         optional actions present
     - src/components/containers
       - Constrained.tsx, FullWidth.tsx, SidebarLayout.tsx: children layout presence, class merges
     - src/components/skeletons
       - card-block.tsx, list-item.tsx, text-block.tsx: render shape, optional props
     - src/components/typography (DONE)
       - h1/h2/h3/h4, p, small, lead, large, inline-code, muted, blockquote, list
     - src/app components
       - error.tsx, not-found.tsx: render fallback copy; ensure no crash
       - app/components/\* demo pages: render smoke tests
     - instrumentation
       - instrumentation.ts, instrumentation-client.ts: no-op smoke tests to ensure imports valid
     - next/app integration
       - layout.tsx: renders children and providers; smoke test
     - routes
       - src/app/page.tsx, src/app/components/page.tsx: page renders required sections
       - api/sentry-example-api/route.ts: smoke test 200 response in node env (mock Request)
     - configuration & tooling
       - postcss.config.mjs: loads without error
       - next.config.ts: basic shape present (non-executing smoke)
       - eslint.config.mjs: exports array and applies overrides
       - vite.config.ts: loads with react plugin and test config
       - components.json (shadcn): valid JSON shape

   - Test Coverage Checklist (progress):
     - [x] Typography components: h1/h2/h3/h4, p, small, lead, large, inline-code, muted, blockquote, list
     - [x] UI wrappers: avatar, breadcrumb, button, calendar, card, carousel, command, dialog, empty-state, error-state, skeleton, switch, table, textarea
     - [ ] UI wrappers remaining: dropdown-menu, input-otp, menubar, navigation-menu, popover, select, sheet, slider, tabs, tooltip
     - [x] Tables: BasicTable, AdvancedTable
     - [x] Cards: BasicCard, MediaCard, ListCard, ActionHeaderCard
     - [x] Containers: Constrained, FullWidth, SidebarLayout
     - [x] Skeletons: card-block, list-item, text-block
     - [ ] App pages and error states: error.tsx, not-found.tsx, app/components/\* demos, layout.tsx
     - [ ] Routes: app/page.tsx, app/components/page.tsx, api/sentry-example-api/route.ts
     - [ ] Instrumentation: instrumentation.ts, instrumentation-client.ts
     - [ ] Config/tooling smoke: postcss, next.config, eslint.config, vite.config, components.json

   - Rollout program:
     1. lib and typography (quick wins) → completed
     2. ui wrappers (props/a11y/disabled states)
     3. containers/cards/tables (rendering + simple interactions)
     4. app-level pages (smoke) and instrumentation (import smoke)
     5. refine coverage thresholds on changed files in CI

7. Advanced TS hardening (optional)

- Enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`, etc.

7. Observability (optional)

- Integrate Sentry (or similar) for server and client error reporting with DSN via env

8. Tailwind branding (NEXT)
   - Define brand tokens: colors (primary/secondary/muted/etc.), radii, spacing
   - Configure brand fonts via `next/font` and map to Tailwind theme tokens
   - Document usage and examples in `readMe.md`

## 💡 Acceptance Criteria (high-level)

- TypeScript
  - `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true` (or justified off), `noFallthroughCasesInSwitch: true`
  - `npm run typecheck` passes; `npm run build` runs `typecheck` first
- ESLint
  - `npm run lint` passes with Next.js + TS rules; unused imports flagged; consistent import ordering
- Prettier
  - `npm run format` formats files; Tailwind classes sorted deterministically
- Tailwind v4
  - PostCSS/Tailwind pipeline confirmed; documented class naming and composition conventions
- Error handling
  - App-level `error.tsx` and `not-found.tsx` present
  - Shared error helpers for logging + user-facing copy
- TanStack Query
  - Central `QueryClient` with defaults for retries/backoff and error routing to toasts
- Tooling
  - Pre-commit hooks enforce `lint` + `typecheck` + `format`
  - CI runs on PRs and fails on lint/type errors

## 🧭 Suggested Order of Work (fast feedback → depth)

1. TS strict baseline → 2) ESLint → 3) Prettier → 4) Tailwind review → 5) Error foundations → 6) TanStack Query defaults → 7) UI error states → 8) Git hooks → 9) CI → 10) Advanced TS flags → 11) Observability.

## 📌 Notes

- Keep `skipLibCheck: true` initially to speed up DX; revisit later if needed
- Prefer incremental adoption of advanced TS flags, fixing violations per folder to avoid churn
