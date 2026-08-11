# Skill — API Data Layer & Service Patterns

## 1. Purpose

This skill defines the canonical architecture for all data access and state management in the Fixtura Members Area.

It ensures:

- **Single Source of Truth**: All routes are managed in a registry.
- **Unified Transport**: All requests use a single, auth-aware fetch client.
- **Domain Privacy**: UI components never touch raw fetch; they use typed services and TanStack hooks.
- **Predictable State**: TanStack Query owns all server data.

---

## 2. When to Use This Skill

Use this skill whenever you need to:

- Add a new API endpoint.
- Connect a UI component to backend data.
- Manage user authentication flows (Login/Logout).
- Update implementation status of a route.
- Implement a new domain (e.g., Bundles, Templates, Account).

---

## 3. The Layered Pipeline

Data must flow through these 4 layers in sequence:

### Layer A: Route Registry (`src/lib/api/routes/route-definitions.ts`)

Define the endpoint metadata (path, method, protection, domain).

```typescript
export const appRoutes = {
  auth: {
    me: {
      key: "auth.me",
      method: "GET",
      path: "/api/auth/me",
      authRequired: true,
      status: "ready",
      domain: "auth",
    },
  },
};
```

### Layer B: Central Fetch Client (`src/lib/api/client/fetch-client.ts`)

The unified `apiRequest` logic. Handles timeouts, JSON parsing, error normalization, and **automatic 401 redirects**.

### Layer C: Domain API service (`src/lib/api/services/*.api.ts`)

Converts registry paths into typed functions.

```typescript
export const authApi = {
  getCurrentUser: () => apiClient.get<UserResponse>(appRoutes.auth.me.path),
};
```

### Layer D: TanStack Query Hooks (`src/lib/api/hooks/*.ts`)

The UI-facing entry point.

```typescript
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getCurrentUser,
  });
}
```

---

## 4. System Rules

1. **Never use raw `fetch()`** in a component.
2. **Never hardcode `/api/...` strings** anywhere except `route-definitions.ts`.
3. **Always use TanStack hooks** for components.
4. **Assume cookies are handled**: `fetch-client` includes `credentials: "include"`. You do not need to manually pass JWT tokens to service functions.

---

## 5. What Not to Do

- **Do not bypass the registry**: Don't call `apiClient.get("/api/my-new-route")` directly. Add it to the registry first.
- **Do not store server state in local/global UI stores**: Use TanStack Query as the cache.
- **Do not implement 401 handling in hooks**: This is handled globally in `fetch-client.ts`.

---

## 6. Verification Checklist

- [ ] Route added to `route-definitions.ts` with correct metadata.
- [ ] Service function defined in corresponding `*.api.ts`.
- [ ] Query key added to `query-keys.ts`.
- [ ] Hook implemented using `useQuery` or `useMutation`.
- [ ] UI component consumes the hook and handles `isLoading`/`isError`.
