# 🏗️ Fixtura Kitchen Sink (dev sandbox)

This directory lives under `src/app/sandbox/kitchen-sink`. URLs are **`/sandbox/kitchen-sink/*`**. The whole **`/sandbox`** tree is gated by `NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true` via `src/app/sandbox/layout.tsx`. Entry hub: **`/sandbox`**. This remains the visual reference for the **Fixtura Members Area** design system.

---

## 🎨 Core Design Specification: "Fixtura Prime"

We have established a high-end, glassmorphism-inspired design system characterized by:

- **Glassmorphism**: Using `backdrop-blur-md` and translucent white/black backgrounds (`white/40` or `black/40`) with subtle `white/20` borders.
- **Enhanced Geometry**: A standardized high-density corner radius of **`1.25rem`** (rounded-[1.25rem]) for primary containers and modals.
- **Premium Inputs**: All interactive inputs follow a **`h-11 rounded-xl`** (0.75rem) specification for better presence and accessibility.
- **Bold Typography**: Distinct use of **Plus Jakarta Sans** for headers with bold uppercase metadata for data grids and technical labels.
- **Rich Motion**: Integrated branded pulse animations and custom `loading-bar` transitions.

---

## 📂 Reference Directory

### 1. Brand & Foundations

- **`brand-colors`**: Full color palette including our primary Blue, secondary Teal (brand), and accent Orange. Maps semantic tokens to their usage.
- **`typography`**: Standardizes font scales, weights, and usage rules for the platform.
- **`containers`**: Structural primitives (`Container`, `Section`, `PageHeader`, `Surface`, `GlassSurface`) that enforce vertical rhythm and layout consistency.

### 2. Interaction & Input

- **`buttons`**: Comprehensive guide to variants, including our custom `brand` and `accent` button types.
- **`inputs`**: Advanced controls such as Date Pickers, OTP verification grids, Sliders, and Switches.
- **`forms`**: Premium auth flows (Login, Forgot Password) and high-trust financial patterns (Checkout).

### 3. Layout & Navigation

- **`navigation`**: References for breadcrumbs, top-level navigation menus, and menubars.
- **`cards`**: Versatile containers for dashboard modules, feed items, and statistics.
- **`tables`**: Visual guides for basic data lists and advanced data grids with integrated toolbars and sorting.

### 4. Feedback & Status

- **`toasts`**: Status-based notifications for success, error, and contextual feedback using Sonner.
- **`dialogs`**: Premium glassmorphic modals for critical confirmations and sub-form entries.
- **`loading`**: Branded loaders, skeleton screens, and progress indicators for app-level and component-level occupancy.

---

## 🛠️ Usage for Developers

Before implementing a new feature in the platform:

1. **Match the pattern**: Check the relevant Kitchen Sink page for the correct layout and component composition.
2. **Reuse primitives**: Prioritize the components found in `src/components/ui` and `src/components/ui/container.tsx`.
3. **Follow the spec**: Ensure inputs are `h-11`, containers are `rounded-[1.25rem]`, and primary actions use the `variant="brand"` or `variant="accent"` buttons.

---

_Last Updated: April 2026_
