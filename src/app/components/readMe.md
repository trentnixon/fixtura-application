# Folder Overview

Components showcase route with tabbed demos for common UI primitives.

## Files

- `page.tsx`: Tabs container that renders individual demo panels
- `components/buttons.tsx`: ButtonsPanel
- `components/cards.tsx`: CardsPanel
- `components/states.tsx`: StatesPanel
- `components/toasts.tsx`: ToastsPanel
- `components/forms.tsx`: FormsPanel (placeholder)
- `components/tables.tsx`: TablesPanel (basic + advanced)
- `components/loading.tsx`: LoadingPanel (skeletons)
- `components/dialogs.tsx`: DialogsPanel (modal + drawer)
- `components/popovers.tsx`: PopoversPanel (popover, tooltip, dropdown)
- `components/inputs.tsx`: InputsPanel (date picker, otp, textarea, switch, slider, select)
- `components/navigation.tsx`: NavigationPanel (navigation menu, menubar, breadcrumb)
- `components/avatar.tsx`: AvatarPanel (image + fallback)
- `components/icons.tsx`: IconsPanel (comprehensive icon library with namespace access)
- `components/carousel.tsx`: CarouselPanel (slides with controls)
- `components/command.tsx`: CommandPanel (command palette + combobox)

## Relations

- Parent folder: [../readMe.md](../readMe.md)
- Depends on: `src/components/ui/*`, `src/lib/notify.ts`, `src/components/tables/*`, `src/components/skeletons/*`

## Dependencies

- Internal: shadcn components, toast helpers, icon library (`src/components/ui/icon.tsx`)
- External: `@radix-ui/react-tabs` via wrapper `src/components/ui/tabs.tsx`, `lucide-react` for icons
