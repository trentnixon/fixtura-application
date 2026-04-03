---
description: Index of all available skills for the AI assistant to browse
---

# 📚 Fixtura LLM Skills Guide

This directory contains specialized **Skills** (instruction manuals and patterns) to guide you while operating inside the **Fixtura Members Area** application.

**Whenever you encounter a task related to one of the following topics**, refer to its corresponding `.md` file in this `.skills/` directory to learn the established conventions before writing code. You can use the `view_file` tool to read the specific skill.

---

## 🧭 Skill Orchestration

- [**`orchestrator-skill.md`**](orchestrator-skill.md) — Read this first for any non-trivial task. It helps determine which other skills must be consulted before planning or writing code.

## 🏢 Members area — multi-organisation routes (current)

The authenticated members app uses a **gateway + account-scoped** URL model (Strapi **account id** in the path):

- **Route group:** `src/app/(members)/` — shared shell (`MembersSessionBoundary` + `MembersAppShell`).
- **Gateway (no account yet):** `/select-organisation`, `/create-organisation` (create flow API TBC).
- **Scoped UI:** `/o/[accountId]/...` (e.g. `/o/319/dashboard`) — `OrgAccessBoundary` + `GET /api/account/organisation/[accountId]` (BFF → CMS).
- **Path builders:** `src/lib/config/account-routes.ts` — use `accountScopedRoutes.*(accountId)`; **route constants:** `src/lib/config/routes.ts` (`ROUTES.selectOrganisation`, etc.).
- **Product / architecture spec:** [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](../.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md).
- **CMS handoff (selected account aggregate):** [`.comms/responses/app-handoff-account-organisation-endpoint.md`](../.comms/responses/app-handoff-account-organisation-endpoint.md).

When touching members routing, read **`navigation-route-management.md`**, **`middleware-Update.md`**, and **`api-data-layer-patterns.md`** together with the orchestrator.

## 🔐 Core App & Authentication

- [**`api-data-layer-patterns.md`**](api-data-layer-patterns.md) — **Read this first for any data access task.** Outlines the Route Registry, Domain Services, and TanStack Hook architecture.
- [**`login-Flow.md`**](login-Flow.md) — Read this to understand how user login is implemented using the `useLogin` hook and service layers.
- [**`logoutFlow.md`**](logoutFlow.md) — Read this to learn the proper way to sign a user out using `useLogout` and clearing the query cache.
- [**`middleware-Update.md`**](middleware-Update.md) — Read this when you need to modify route protection mechanisms or verify tokens server-side.
- [**`add-protected-page.md`**](add-protected-page.md) — Read this whenever creating a new page requiring authentication.
- [**`authenticated-api-call.md`**](authenticated-api-call.md) — (Legacy) Pointing to the new API Data Layer patterns.

## 🧭 Routing & Navigation

- [**`navigation-route-management.md`**](navigation-route-management.md) — Read this when creating, updating, or maintaining the overall route structures and configurations.
- [**`navigation-UI-Patterns.md`**](navigation-UI-Patterns.md) — Read this to understand how the navigation UI (menus, sidebars) should be structured and styled.

## 🧠 UX & State Management

- [**`ui-State-Patterns.md`**](ui-State-Patterns.md) — Read this for standard patterns on representing Loading, Error, Empty, and Success states within the UI.
- [**`sessionStateUI.md`**](sessionStateUI.md) — Read this to learn how to reflect the current user session (e.g., username, profile picture, roles) visually in the UI.
- [**`feedback-and-Notifications.md`**](feedback-and-Notifications.md) — Read this before implementing UI feedback mechanisms such as toast notifications, alerts, or inline error messages.

## 🎨 Design System & Components

- [**`layout-and-Spacing-System.md`**](layout-and-Spacing-System.md) — Read this to adhere to the core application layout design and standardize your padding, margins, and gaps.
- [**`component-Usage-Patterns.md`**](component-Usage-Patterns.md) — Read this to understand the methodology behind how shared components should be consumed, extended, and reused across the app.
- [**`icons-and-Visual-Elements.md`**](icons-and-Visual-Elements.md) — Read this for instructions on the standard icon library (e.g., Lucide) and how to apply visual elements effectively.
- [**`form-Patterns.md`**](form-Patterns.md) — Read this **before** building any forms. It details the standards for using `react-hook-form`, Zod validation schemas, and reusable `<Input>` components.

## 🛠️ System & Maintenance

- [**`system-diagnostics-skill.md`**](system-diagnostics-skill.md) — Read this for patterns on maintaining and expanding the internal Fetch Health diagnostics.
- [**`devDebugExtension.md`**](devDebugExtension.md) — Read this to understand how to interact with the development-only debug panel to improve observability while modifying the application.
- [**`kitchen-Sink-Maintenance.md`**](kitchen-Sink-Maintenance.md) — Read this to learn how to keep the Kitchen Sink testing page updated whenever you add or modify a UI component.

---

> **💡 Best Practice:** Always `view_file` on the relevant skill document before writing code on an unfamiliar part of the system. Following these established patterns ensures a robust, consistent, and maintainable codebase.
