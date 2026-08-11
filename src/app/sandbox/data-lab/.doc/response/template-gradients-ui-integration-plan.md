# Response: Template gradients UI endpoint integration

## Goal

Integrate the new authenticated CMS endpoint `GET /api/template-gradients/ui` into the app using the established Fixtura data pipeline:

1. Route registry
2. Next.js BFF route
3. Typed API service
4. Query key
5. React Query hook
6. UI consumers

Source handoff:
`src/app/sandbox/data-lab/.doc/requests/template-gradients-ui-endpoint-handoff.md`

---

## Recommended implementation shape

This endpoint is not account-scoped and is not a generic asset route, so the cleanest fit is a new top-level domain:

- route registry group: `templateGradients`
- service: `src/lib/api/services/template-gradients.api.ts`
- query keys: `queryKeys.templateGradients.ui`
- hook: `src/lib/api/hooks/template-gradients/useTemplateGradientsUi.ts`
- types: `src/types/api/template-gradients.ts`
- BFF route: `src/app/api/template-gradients/ui/route.ts`

This keeps the domain private, avoids growing `account.api.ts` for unrelated concerns, and matches the layering described in `.skills/api-data-layer-patterns.md`.

---

## Layer-by-layer plan

### 1. Add TypeScript types

Create:
`src/types/api/template-gradients.ts`

Recommended shape:

```ts
/** GET /api/template-gradients/ui (Next.js BFF -> Strapi). */
export interface TemplateGradientsUiResponse {
  data: TemplateGradientUiItem[];
}

export interface TemplateGradientUiItem {
  id: number;
  name: string | null;
  ui: TemplateGradientUiConfig | null;
}

export interface TemplateGradientUiConfig {
  type: string | null;
  direction: string | null;
}
```

Notes:

- Keep `name` nullable to stay defensive against CMS drift.
- Keep `ui` nullable unless the backend contract is guaranteed non-null for every published row.
- Do not overload `src/types/api/account.ts`; this endpoint has its own domain.

### 2. Add route registry metadata

Update:
`src/lib/api/routes/route-definitions.ts`

Add a new route group:

```ts
templateGradients: {
  ui: {
    key: "template-gradients.ui",
    method: "GET",
    path: "/api/template-gradients/ui",
    authRequired: true,
    status: "ready",
    description: "GET - published template gradients for UI selection",
    domain: "template-gradients",
  },
},
```

Why:

- prevents hard-coded `/api/...` usage
- makes the endpoint available to the central fetch client and service layer
- aligns with the system rule that app routes live in the registry first

### 3. Add query key

Update:
`src/lib/api/query/query-keys.ts`

Add:

```ts
templateGradients: {
  ui: ["template-gradients", "ui"] as const,
},
```

Why:

- gives a stable cache key
- keeps server data out of local UI stores
- mirrors the existing `assets.listForSelection` and `account.templateCategoriesListForSelection` patterns

### 4. Add domain service

Create:
`src/lib/api/services/template-gradients.api.ts`

Recommended implementation:

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateGradientsUiResponse } from "@/types/api/template-gradients";

export const templateGradientsApi = {
  getTemplateGradientsUi: () =>
    apiClient.get<TemplateGradientsUiResponse>(appRoutes.templateGradients.ui.path),
};
```

Why:

- UI components should never fetch directly
- this is the canonical place for typed endpoint access

### 5. Add React Query hook

Create:
`src/lib/api/hooks/template-gradients/useTemplateGradientsUi.ts`

Recommended implementation:

```ts
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateGradientsApi } from "../../services/template-gradients.api";

export function useTemplateGradientsUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.templateGradients.ui,
    queryFn: () => templateGradientsApi.getTemplateGradientsUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
```

Why:

- follows the exact TanStack usage already used by `useAssetsListForSelection` and `useTemplateCategoriesListForSelection`
- keeps loading, error, and refetch flow consistent in the lab and production UI

### 6. Add BFF proxy route

Create:
`src/app/api/template-gradients/ui/route.ts`

Responsibilities:

- require auth cookie/JWT
- return `401` when no token exists
- proxy to `${STRAPI_URL}/api/template-gradients/ui`
- forward `Authorization: Bearer <token>`
- use `cache: "no-store"`
- pass through success payload as JSON
- normalize Strapi error payloads into `{ error: string }`
- send `503` if `STRAPI_URL` is missing
- capture unexpected failures in Sentry and return `500`

Best reference:

- authenticated pattern: `src/app/api/account/template-categories/list-for-selection/route.ts`
- public-but-token-aware pattern: `src/app/api/assets/list-for-selection/route.ts`

Recommended behaviour:

- `401` if not signed in
- `403` pass-through if route permission is missing in Strapi
- `500` pass-through message if Strapi sends a usable message, otherwise `Unexpected server error`

### 7. Add UI-facing docs/comments

Where appropriate, include `@see` references back to:

- `src/app/sandbox/data-lab/.doc/requests/template-gradients-ui-endpoint-handoff.md`

This mirrors the documentation breadcrumbs already used in:

- `src/app/api/assets/list-for-selection/route.ts`
- `src/app/api/account/template-categories/list-for-selection/route.ts`
- `src/lib/api/hooks/account/useAssetsListForSelection.ts`

---

## Error and auth expectations

The handoff makes these behaviours important for the frontend:

- unauthenticated request: `401`
- authenticated but missing Strapi permission: `403`
- server failure: `500`

Frontend guidance:

- let the central fetch client own redirect/session behaviour
- show readable error text in the lab page
- do not special-case this endpoint inside components with custom fetch logic

---

## Suggested file checklist

Create:

- `src/types/api/template-gradients.ts`
- `src/lib/api/services/template-gradients.api.ts`
- `src/lib/api/hooks/template-gradients/useTemplateGradientsUi.ts`
- `src/app/api/template-gradients/ui/route.ts`

Update:

- `src/lib/api/routes/route-definitions.ts`
- `src/lib/api/query/query-keys.ts`

Optional:

- `src/lib/api/hooks/template-gradients/index.ts`
- `src/lib/api/services/index.ts` if the repo uses service re-exports elsewhere

---

## Verification checklist

- [ ] route is defined in `route-definitions.ts`
- [ ] no component uses raw `fetch()` for this endpoint
- [ ] the BFF route proxies to `/api/template-gradients/ui`
- [ ] auth is required and `401` is returned when no session exists
- [ ] a typed service function exists
- [ ] a dedicated query key exists
- [ ] a React Query hook exists
- [ ] types match the handoff payload shape
- [ ] hook consumers handle loading, error, and success states

---

## Recommended next consumer

The first consumer should be the data-lab test harness so we can prove:

- endpoint wiring works
- auth works
- select-based selection works
- card-click selection works
- selected result detail renders correctly

That harness is described in:
`src/app/sandbox/data-lab/.doc/response/template-gradients-data-lab-plan.md`
