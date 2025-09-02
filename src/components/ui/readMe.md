# Folder Overview

Wrapped UI primitives used across the app (shadcn-style components).

## Files

- `button.tsx`: button variants and sizes
- `button.test.tsx`: button component tests
- `card.tsx`: card container and sections
- `card.test.tsx`: card component tests
- `tabs.tsx`: tabs wrapper for Radix Tabs
- `table.tsx`: table elements
- `table.test.tsx`: table component tests
- `skeleton.tsx`: skeleton loader
- `skeleton.test.tsx`: skeleton component tests
- `empty-state.tsx`: empty state presentation component
- `empty-state.test.tsx`: empty state component tests
- `error-state.tsx`: error state presentation component
- `error-state.test.tsx`: error state component tests
- `dialog.tsx`: modal dialog primitives (Dialog, Content, Header, Footer, etc.)
- `dialog.test.tsx`: dialog component tests
- `sheet.tsx`: side drawer primitives (Sheet, Content, Header, Footer, etc.)
- `dropdown-menu.tsx`: context menu primitives
- `popover.tsx`: popover primitives
- `tooltip.tsx`: tooltip primitives
- `select.tsx`: select primitives
- `calendar.tsx`: calendar (react-day-picker wrapper)
- `calendar.test.tsx`: calendar component tests
- `input-otp.tsx`: OTP inputs
- `slider.tsx`: slider primitives
- `switch.tsx`: switch primitive
- `switch.test.tsx`: switch component tests
- `textarea.tsx`: textarea primitive
- `textarea.test.tsx`: textarea component tests
- `command.tsx`: command palette primitives
- `command.test.tsx`: command component tests
- `carousel.tsx`: carousel primitives
- `carousel.test.tsx`: carousel component tests
- `avatar.tsx`: avatar primitives
- `avatar.test.tsx`: avatar component tests
- `breadcrumb.tsx`: breadcrumb primitives
- `breadcrumb.test.tsx`: breadcrumb component tests

## Relations

- Parent folder: [../readMe.md](../readMe.md)
- Consumed by: `src/app/components/*` panels and feature modules

## Dependencies

- External: `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `@radix-ui/react-select`, `@radix-ui/react-slider`, `@radix-ui/react-switch`, `react-day-picker`, `lucide-react`
- Internal: `@/lib/utils` (`cn`)
