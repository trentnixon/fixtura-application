# Fixtura Members Area — API Data Layer, Fetch Service, Hooks, Types, and Route Registry

## Overview

This document defines the recommended **data access and state management architecture** for the Fixtura Members Area application.

The goal is to establish a **single, predictable, type-safe system** for:

- handling all `GET`, `POST`, `PUT`, and `DELETE` requests
- centralising request transport through one fetch service
- exposing typed domain APIs
- standardising TanStack Query hook patterns
- managing server state for UI consumption
- maintaining route definitions and implementation status
- providing an admin-only diagnostics area for service health

This is a foundational system and should be treated as a **core application architecture**, not a convenience utility.

---

## Architectural Goal

The application should have one clear data pipeline:

### Request Flow

`UI Component`  
→ `TanStack Hook`  
→ `Domain API Service`  
→ `Central Fetch Client`  
→ `Application Route`

### Response Flow

`Application Route`  
→ `Central Fetch Client`  
→ `Typed API Response`  
→ `TanStack Query Cache`  
→ `Derived UI State`

This keeps concerns separated and makes the system:

- easier to debug
- easier to type
- easier to test
- safer to extend
- easier for LLMs and developers to reason about

---

## Core Principles

### 1. One transport layer only

All network requests must go through the **central fetch client**.

No component should call `fetch()` directly.

---

### 2. One route source of truth

All route paths and metadata must come from a **central route registry**.

No endpoint string literals should be scattered through the app.

---

### 3. One domain API layer

All endpoint access should be wrapped in typed domain services such as:

- `auth.api.ts`
- `bundles.api.ts`
- `templates.api.ts`
- `account.api.ts`

---

### 4. TanStack Query owns server state

Fetched data should live in **TanStack Query**, not duplicated into arbitrary client stores.

Use:

- TanStack Query for server state and cache
- local component state for temporary UI state
- global client state only for genuine UI-only cross-page needs

---

### 5. Types are first-class architecture

The app must use a clean type structure that separates:

- API contracts
- entities
- UI models
- route metadata
- diagnostics and health data
- error contracts

---

### 6. Diagnostics must use the same system

The admin-only fetch health page must inspect the same route registry and service layer concepts used by the live application.

That keeps diagnostics aligned with the real system.

---

## Recommended Folder Structure

```txt
src/
  lib/
    api/
      client/
        fetch-client.ts
        api-error.ts
        api-response.ts
        request-config.ts

      routes/
        route-definitions.ts
        route-groups.ts
        route-status.ts

      services/
        auth.api.ts
        bundles.api.ts
        templates.api.ts
        account.api.ts
        health.api.ts

      hooks/
        auth/
          useCurrentUser.ts
          useLogin.ts
          useLogout.ts
        bundles/
          useBundles.ts
          useBundle.ts
          useCreateBundle.ts
        templates/
          useTemplates.ts
        admin/
          useFetchHealth.ts
          useRouteRegistry.ts

      query/
        query-keys.ts
        query-client.ts
        invalidate.ts

  types/
    api/
      common.ts
      auth.ts
      bundles.ts
      templates.ts
      health.ts

    entities/
      user.ts
      bundle.ts
      template.ts

    ui/
      state.ts
      table.ts
      form.ts

    routes/
      route-meta.ts
      route-status.ts

  app/
    (auth)/
      admin/
        system/
          fetch-health/
            page.tsx
```

---

## Layer Breakdown

## 1. Route Registry Layer

This layer defines:

- the endpoint path
- HTTP method
- auth requirement
- admin-only restriction
- implementation status
- domain ownership
- description

This is not just a collection of strings. It is a structured metadata system.

### Why this matters

A proper route registry allows the app to:

- standardise endpoint usage
- avoid route duplication
- track endpoint readiness
- power admin diagnostics
- power internal route tables
- improve LLM/developer reasoning

### Recommended route status

```ts
export type RouteImplementationStatus =
  | "planned"
  | "in-progress"
  | "ready"
  | "deprecated"
  | "disabled";
```

### Recommended route definition type

```ts
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface AppRouteDefinition {
  key: string;
  method: HttpMethod;
  path: string;
  authRequired: boolean;
  adminOnly?: boolean;
  status: RouteImplementationStatus;
  description: string;
  domain: "auth" | "account" | "bundles" | "templates" | "season" | "admin";
}
```

### Example route registry

```ts
export const appRoutes = {
  auth: {
    login: {
      key: "auth.login",
      method: "POST",
      path: "/api/auth/login",
      authRequired: false,
      status: "ready",
      description: "Authenticate user and establish session",
      domain: "auth",
    },
    logout: {
      key: "auth.logout",
      method: "POST",
      path: "/api/auth/logout",
      authRequired: true,
      status: "ready",
      description: "Destroy current session",
      domain: "auth",
    },
    me: {
      key: "auth.me",
      method: "GET",
      path: "/api/auth/me",
      authRequired: true,
      status: "ready",
      description: "Get current authenticated user",
      domain: "auth",
    },
  },
  bundles: {
    list: {
      key: "bundles.list",
      method: "GET",
      path: "/api/bundles",
      authRequired: true,
      status: "planned",
      description: "List content bundles",
      domain: "bundles",
    },
    create: {
      key: "bundles.create",
      method: "POST",
      path: "/api/bundles",
      authRequired: true,
      status: "planned",
      description: "Create a new bundle",
      domain: "bundles",
    },
  },
  admin: {
    fetchHealth: {
      key: "admin.fetch-health",
      method: "GET",
      path: "/api/admin/fetch-health",
      authRequired: true,
      adminOnly: true,
      status: "planned",
      description: "Check availability of internal API routes",
      domain: "admin",
    },
  },
} as const;
```

---

## 2. Central Fetch Client Layer

This is the single transport system for the entire app.

It is responsible for:

- calling `fetch`
- applying common headers
- including credentials
- handling JSON parsing
- normalising errors
- handling timeouts
- exposing typed method wrappers

### Rules

- No raw `fetch()` calls outside this layer
- No auth header logic in components
- No endpoint-specific logic here
- No UI-specific transformation here

### Fetch client responsibilities

- generic request transport only
- error handling and normalization
- method wrapper convenience
- safe timeout handling

### Recommended request options type

```ts
export interface RequestOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
}
```

### Recommended `ApiError`

```ts
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor({
    status,
    message,
    details,
  }: {
    status: number;
    message: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
```

### Recommended fetch client

```ts
import { ApiError } from "./api-error";

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers, signal, timeoutMs = 15000 } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(path, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal ?? controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message:
          typeof payload === "object" && payload && "message" in payload
            ? String(payload.message)
            : `Request failed with status ${response.status}`,
        details: payload,
      });
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError({
        status: 408,
        message: "Request timed out",
      });
    }

    throw new ApiError({
      status: 500,
      message: error instanceof Error ? error.message : "Unknown request error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
```

### Recommended method wrappers

```ts
export const apiClient = {
  get: <TResponse>(path: string) => apiRequest<TResponse>(path, { method: "GET" }),

  post: <TResponse, TBody>(path: string, body: TBody) =>
    apiRequest<TResponse, TBody>(path, { method: "POST", body }),

  put: <TResponse, TBody>(path: string, body: TBody) =>
    apiRequest<TResponse, TBody>(path, { method: "PUT", body }),

  delete: <TResponse>(path: string) => apiRequest<TResponse>(path, { method: "DELETE" }),
};
```

---

## 3. Domain API Service Layer

This layer converts route definitions into typed application functions.

### Responsibilities

- use the route registry
- call the central fetch client
- expose typed domain operations
- stay UI-agnostic

### Example domains

- auth
- account
- bundles
- templates
- season
- admin diagnostics

### Example service

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";
import type { LoginRequest, LoginResponse, CurrentUserResponse } from "@/types/api/auth";

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse, LoginRequest>(appRoutes.auth.login.path, body),

  logout: () => apiClient.post<void, undefined>(appRoutes.auth.logout.path, undefined),

  getCurrentUser: () => apiClient.get<CurrentUserResponse>(appRoutes.auth.me.path),
};
```

### Service layer rule

Every domain service must:

- consume route definitions
- consume shared types
- expose predictable names
- avoid component-specific transformation

---

## 4. TanStack Query Hook Layer

This is the UI-facing access layer.

The UI should prefer hooks over directly calling service functions.

### Responsibilities

- manage request lifecycle
- cache server state
- expose loading/error/data states
- invalidate caches
- orchestrate mutations
- optionally shape data for UI

### Hook categories

- query hooks
- mutation hooks
- derived UI hooks
- admin diagnostics hooks

### Example query key registry

```ts
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  bundles: {
    all: ["bundles"] as const,
    detail: (id: string) => ["bundles", id] as const,
  },
  admin: {
    fetchHealth: ["admin", "fetch-health"] as const,
    routes: ["admin", "routes"] as const,
  },
};
```

### Example query hook

```ts
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../services/auth.api";
import { queryKeys } from "../../query/query-keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
```

### Example mutation hook

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../services/auth.api";
import { queryKeys } from "../../query/query-keys";
import type { LoginRequest } from "@/types/api/auth";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
```

---

## 5. Type Architecture

Types should be separated by purpose, not dumped into one large file.

## Recommended type groups

### `types/api/*`

Used for endpoint contracts.

Examples:

- request payloads
- response payloads
- pagination wrappers
- health response contracts

### `types/entities/*`

Used for app-level domain entities.

Examples:

- `User`
- `Bundle`
- `Template`

### `types/ui/*`

Used for derived UI models.

Examples:

- table row shapes
- form view models
- local state models

### `types/routes/*`

Used for route metadata and route statuses.

---

## Example types

### `types/api/auth.ts`

```ts
import type { User } from "../entities/user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}
```

### `types/entities/user.ts`

```ts
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
}
```

---

## 6. UI Preparation and Data Shaping

The UI should not repeatedly interpret raw API payloads in page components.

Instead, use derived data shaping in hooks or focused mapping utilities.

### Pattern

- raw API contract for transport
- entity type for domain consistency
- optional UI view model for rendering

### Example entity

```ts
export interface Bundle {
  id: string;
  title: string;
  status: "draft" | "ready" | "published";
  createdAt: string;
}
```

### Example derived UI hook

```ts
export function useBundleTableRows() {
  const query = useBundles();

  const rows =
    query.data?.bundles.map((bundle) => ({
      id: bundle.id,
      title: bundle.title,
      statusLabel: bundle.status.toUpperCase(),
      createdDate: new Date(bundle.createdAt).toLocaleDateString(),
    })) ?? [];

  return {
    ...query,
    rows,
  };
}
```

### Rule

Keep transformation logic out of JSX where possible.

---

## State Management Strategy

This application should treat state in three categories.

### 1. Server state

Use TanStack Query for:

- fetched data
- cache
- background refresh
- invalidation
- stale state logic

### 2. Temporary UI state

Use local component state for:

- modal open/close
- tabs
- filters
- sorting
- temporary form data

### 3. Cross-page UI-only state

Use a lightweight global store only if truly needed for things like:

- sidebar collapse state
- client-side display preferences
- UI-only session preferences

### Important rule

Do not duplicate TanStack Query server data into another global store unless there is a very clear need.

That creates synchronization overhead and increases bugs.

---

## Admin-Only Fetch Health System

An admin-only diagnostics route is recommended and should be part of the authenticated area.

### Recommended route

```txt
/app/admin/system/fetch-health
```

This provides room for future related routes:

- `/app/admin/system/routes`
- `/app/admin/system/auth`
- `/app/admin/system/cache`

---

## Fetch Health Responsibilities

The health system should help answer:

- is the fetch client working?
- are core endpoints responding?
- are auth-protected routes behaving correctly?
- what route implementations are ready vs planned?
- how long are endpoints taking to respond?

### Health response contract

```ts
export interface EndpointHealthResult {
  key: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: "ok" | "error" | "skipped";
  responseTimeMs?: number;
  httpStatus?: number;
  message?: string;
}

export interface FetchHealthResponse {
  service: "fetch-client";
  overallStatus: "ok" | "degraded" | "error";
  checkedAt: string;
  results: EndpointHealthResult[];
}
```

### Example service

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";
import type { FetchHealthResponse } from "@/types/api/health";

export const healthApi = {
  getFetchHealth: () => apiClient.get<FetchHealthResponse>(appRoutes.admin.fetchHealth.path),
};
```

### Example hook

```ts
import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../../services/health.api";
import { queryKeys } from "../../query/query-keys";

export function useFetchHealth() {
  return useQuery({
    queryKey: queryKeys.admin.fetchHealth,
    queryFn: healthApi.getFetchHealth,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}
```

---

## Recommended Admin UI for Route and Service Diagnostics

The admin diagnostics page should ideally display:

- overall fetch service status
- last checked timestamp
- route implementation registry table
- endpoint health table
- method
- path
- auth requirement
- admin-only flag
- implementation status
- response time
- latest message / error

This page should be read-only and tightly controlled via admin route protections.

---

## Naming Conventions

Use precise naming.

### Recommended

- `fetch-client.ts`
- `api-error.ts`
- `route-definitions.ts`
- `query-keys.ts`
- `auth.api.ts`
- `bundles.api.ts`
- `useCurrentUser.ts`
- `useFetchHealth.ts`

### Avoid vague names

- `helpers.ts`
- `utils.ts`
- `common.ts` for everything
- `apiService.ts`
- `fetchHelper.ts`

Clear file names improve maintainability and LLM reasoning.

---

## Implementation Rules

These rules should be enforced consistently.

### Rule 1

All network calls go through the central fetch client.

### Rule 2

All route paths come from the route registry.

### Rule 3

All UI fetching uses typed service and hook layers.

### Rule 4

TanStack Query owns server state.

### Rule 5

Every route has metadata and implementation status.

### Rule 6

Derived UI mapping should happen in hooks or mapping utilities, not scattered in JSX.

### Rule 7

Admin diagnostics must reflect the same route system used by the live app.

---

## Recommended Build Order

Build this architecture in sequence.

### Phase 1 — Core Types and Route Registry

1. create `types/` structure
2. create route status type
3. create route metadata type
4. build `route-definitions.ts`

### Phase 2 — Central Fetch Client

5. build `ApiError`
6. build `apiRequest`
7. build `apiClient` wrappers

### Phase 3 — Query Foundation

8. build `query-keys.ts`
9. configure `query-client.ts`

### Phase 4 — First Domain Pattern

10. implement `auth` types
11. implement `auth.api.ts`
12. implement `useCurrentUser`
13. implement `useLogin`
14. implement `useLogout`

### Phase 5 — Diagnostics

15. create admin-only health route
16. create `health.api.ts`
17. create `useFetchHealth`
18. build diagnostics page UI
19. build route registry table UI

### Phase 6 — Rollout to Other Domains

20. implement bundles domain
21. implement templates domain
22. implement account domain
23. implement season domain

This order proves the pattern before spreading it across the entire app.

---

## Recommended Mental Model

This system should be understood as:

> A route-driven, type-safe, centrally transported data layer where TanStack Query owns server state, domain services define business access, route metadata powers both implementation and diagnostics, and the UI consumes consistent typed hooks rather than raw fetch calls.

---

## Final Recommendation

This architecture should be treated as a **core application skill** and used as the default pattern for all new data access work in the Fixtura Members Area.

The strongest implementation for this application is:

- central fetch client
- typed route registry
- typed domain API services
- TanStack Query hooks
- central query key registry
- separated type architecture
- admin-only fetch diagnostics page
- route implementation status tracking

This gives the app a clean and scalable data foundation that is safe to extend over time.
