# Folder Overview

Shadcn/ui wrappers and project UI components. This folder contains reusable building blocks consumed by app routes.

## Files

- `ui/` – wrapped shadcn primitives with comprehensive test coverage (see `ui/readMe.md`)
- `cards/` – card wrappers with comprehensive test coverage (Basic, ActionHeader, Media, List)
- `containers/` – layout wrappers with comprehensive test coverage (FullWidth, Constrained, SidebarLayout)
- `tables/` – table wrappers with comprehensive test coverage (BasicTable, AdvancedTable)
- `typography/` – text components with comprehensive test coverage (H1–H4, P, Blockquote, etc.)
- `skeletons/` – skeleton components with comprehensive test coverage

## Relations

- Parent folder: [../../readMe.md](../../readMe.md)
- Consumed by: App Router pages and layouts under `src/app/*`
- Error/UI states: consider common components like `ErrorState` and `EmptyState`

## Dependencies

- Internal: `src/lib/utils.ts`
- External: `@radix-ui/react-*` (dialog, tabs, dropdown-menu, popover, tooltip, select, slider),
  `react-day-picker` (calendar), `class-variance-authority`, `lucide-react`, Tailwind v4
