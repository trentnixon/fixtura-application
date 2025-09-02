# Development Roadmap – Components Library

## ✅ Completed

- [x] Cards: wrappers (Basic, ActionHeader, Media, List) with props
- [x] Containers: wrappers (FullWidth, Constrained, SidebarLayout) with props
- [x] Typography: reusable components (H1–H4, P, Blockquote, Inline, List, Lead/Large/Small/Muted/Brand)
- [x] Dialogs & Drawers: shadcn `dialog` and `sheet` wrappers
- [x] Popover/Tooltip/Dropdown: shadcn `popover`, `tooltip`, `dropdown-menu`
- [x] Date/Inputs: `calendar`, `input-otp`, `textarea`, `switch`, `slider`, `select`
- [x] Monitoring/Analytics: Sentry and PostHog integration

## ⏳ To Do (easy → hard)

1. Extract Buttons semantic variants into first-class variants or wrappers
2. Add Form wrappers (RHF + Zod) with field components
3. Add Navigation primitives (Breadcrumb, Navigation Menu)
4. Add Table abstraction (basic sortable + pagination)

## 💡 Recommendations

- Keep components unopinionated; push composition to call-sites
- Favor props + children; no hardcoded strings
- Co-locate README and simple config per folder
