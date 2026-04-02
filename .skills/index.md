---
description: Index of all available skills for the AI assistant to browse
---

# 📚 Fixtura LLM Skills Guide

This directory contains specialized **Skills** (instruction manuals and patterns) to guide you while operating inside the **Fixtura Members Area** application.

**Whenever you encounter a task related to one of the following topics**, refer to its corresponding `.md` file in this `.skills/` directory to learn the established conventions before writing code. You can use the `view_file` tool to read the specific skill.

---

## 🧭 Skill Orchestration

- [**`orchestrator-skill.md`**](orchestrator-skill.md) — Read this first for any non-trivial task. It helps determine which other skills must be consulted before planning or writing code.

## 🔐 Core App & Authentication

- [**`login-Flow.md`**](login-Flow.md) — Read this to understand how user login is implemented, the sequence of events, token handling, and redirection logic.
- [**`logoutFlow.md`**](logoutFlow.md) — Read this to learn the proper way to sign a user out, clear their sessions, and redirect them.
- [**`middleware-Update.md`**](middleware-Update.md) — Read this when you need to modify route protection mechanisms, verify tokens server-side, or update error handling in `middleware.ts`.
- [**`add-protected-page.md`**](add-protected-page.md) — Read this whenever the user asks you to create a new page that requires the user to be logged in.
- [**`authenticated-api-call.md`**](authenticated-api-call.md) — Read this to learn the standard `apiFetch` pattern for communicating securely with backend APIs via JWTs.

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

- [**`devDebugExtension.md`**](devDebugExtension.md) — Read this to understand how to interact with the development-only debug panel to improve observability while modifying the application.
- [**`kitchen-Sink-Maintenance.md`**](kitchen-Sink-Maintenance.md) — Read this to learn how to keep the Kitchen Sink testing page updated whenever you add or modify a UI component.

---

> **💡 Best Practice:** Always `view_file` on the relevant skill document before writing code on an unfamiliar part of the system. Following these established patterns ensures a robust, consistent, and maintainable codebase.
