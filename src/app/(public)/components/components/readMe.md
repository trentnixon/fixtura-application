# Folder Overview

Panels for the Components Showcase route. Each file exports a `*Panel` component rendered in `src/app/components/page.tsx` tabs.

## Files

- `brand-colors.tsx`: Brand color tokens demo
- `buttons.tsx`: ButtonsPanel
- `cards.tsx`: CardsPanel
- `containers.tsx`: ContainerOptionsPanel
- `dialogs.tsx`: DialogsPanel (modal + drawer)
- `forms.tsx`: FormsPanel placeholder
- `loading.tsx`: LoadingPanel
- `states.tsx`: StatesPanel
- `tables.tsx`: TablesPanel
- `toasts.tsx`: ToastsPanel
- `typography.tsx`: TypographyPanel

## Relations

- Parent folder: [../readMe.md](../readMe.md)
- Consumed by: `../page.tsx`
- Depends on: `@/components/ui/*`, `@/components/*`

## Dependencies

- External: Radix UI for primitives, Sonner for toasts
- Internal: UI wrappers under `src/components/ui`, skeletons/tables/typography wrappers
