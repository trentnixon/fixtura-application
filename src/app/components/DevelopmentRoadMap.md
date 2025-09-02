# Development Roadmap – Components Showcase

## ✅ Completed

- [x] Create route and tabs skeleton (buttons, cards, states, toasts, forms)
- [x] Split tabs content into separate panel files under `components/`
- [x] Buttons demo
- [x] Toasts demo (success/error via Sonner)
- [x] Buttons: semantic variants (warning, info, CTA) and state examples (disabled, loading)
- [x] Toasts: variants (warning, info, CTA with action, loading/promise)
- [x] Typography panel and reusable components (H1–H4, P, Blockquote, Inline code, List, Lead/Large/Small/Muted/Brand)
- [x] Card Options (basic, actions, media, list); wrappers under `src/components/cards/*`
- [x] Loading/Skeleton panel with premade skeletons from `src/components/skeletons/*`
- [x] Table + Pagination (basic) using shadcn Table primitives and TanStack sortable demo
- [x] Monitoring/Analytics: Sentry (error monitoring) and PostHog (analytics) integrated

## ⏳ To Do (easy → hard)

1. Typography (COMPLETED)
   - Implemented examples; components accept children; documented brand font usage
2. Brand Colors (COMPLETED)
   - Swatches for `--brand-*`, primary/secondary/accent across light/dark
   - Usage examples (bg/text/border)
3. Container Options (COMPLETED)
   - Page containers: full, `max-w-2xl/3xl/6xl`, sidebar layout
4. Card Options (COMPLETED)
   - Variants: basic, with actions, with media, with list
   - Reusable wrappers created under `src/components/cards/*`
5. Form Options
   - React Hook Form + Zod basic example (input, select, checkbox)
   - Validation messages + disabled/submit states
6. Dialogs & Drawers (COMPLETED)
   - Modal dialog; drawer from side with form
7. Navigation/Menu (COMPLETED)
   - Navigation Menu or Menubar; Breadcrumb
8. Popover/Tooltip/Dropdown (COMPLETED)

- Popover form; Tooltip on controls; Dropdown Menu

9. Date/Inputs (COMPLETED)

- Date Picker; Input OTP; Textarea; Switch; Slider; Select

10. Advanced (later)

11. Advanced (later)

- Data Table
- Combobox / Command palette (COMPLETED)
- Sidebar
- Carousel (IN PROGRESS)
- Chart

Order components by usefulness for the app; build progressively from simple to complex.

## 💡 Recommendations

- Keep each demo self-contained and minimal
- Link to upstream shadcn documentation for advanced usage
- Consider storybook later for visual regressions
- Add accessibility notes for interactive components (focus, ARIA)
