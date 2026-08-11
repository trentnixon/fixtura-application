# Skill — Authenticated API Call (LEGACY)

> [!CAUTION]
> This pattern is deprecated. Use the [**API Data Layer & Service Patterns**](api-data-layer-patterns.md) skill for all new development.

## 1. Migration Overview

The application has moved from direct `apiFetch` calls to a **Domain Service & TanStack Query** architecture.

- **Old (Bypassed)**: `apiFetchJson("/api/...")`
- **New (Approved)**: `useCurrentUser() -> authApi.getCurrentUser() -> apiRequest()`

---

## 2. When to Redirect

If you are modifying existing code that still uses `apiFetch`:

1. Check if a corresponding Domain Service (`src/lib/api/services/*.api.ts`) exists.
2. If not, create it by adding the route to `route-definitions.ts`.
3. Use the typed service function instead of a raw path string.

---

## 3. Reference

For full instructions on the modern pipeline (Registry -> Client -> Service -> Hook), see:

- [**API Data Layer & Service Patterns**](api-data-layer-patterns.md)
