# Worker Brief: Integrate `GET /api/template-textures/ui`

## Objective

Implement the new authenticated app-facing endpoint `GET /api/template-textures/ui` in the Fixtura frontend using the established data-layer architecture, then add a dedicated Data Lab route to test it with:

1. a select input
2. clickable cards
3. a selected-result detail panel

Source handoff:
`src/app/sandbox/data-lab/.doc/requests/template-textures-ui-endpoint-handoff.md`

Follow the same conventions already used for:

- `GET /api/template-gradients/ui`
- `GET /api/template-images/ui`
- `GET /api/template-modes/ui`
- `GET /api/template-patterns/ui`

---

## Non-negotiable architecture rules

1. Do not use raw `fetch()` in React components.
2. Do not hardcode `/api/...` strings outside `src/lib/api/routes/route-definitions.ts`.
3. Route must flow through the standard layers:
   - route registry
   - BFF route
   - typed service
   - query key
   - React Query hook
   - UI consumer
4. Keep this endpoint in its own top-level domain, not inside `accountApi`, because it is authenticated but not account-scoped.
5. Reuse the style and behaviour patterns already present in the Data Lab pages.
6. Preserve the app-facing payload naming from the handoff.
7. Handle `opacity` defensively because the current backend may return it as either `string` or `number`.

---

## Domain decision

Use a new top-level API domain named `templateTextures`.

Expected additions:

- `appRoutes.templateTextures.ui`
- `queryKeys.templateTextures.ui`
- `templateTexturesApi.getTemplateTexturesUi()`
- `useTemplateTexturesUi()`

Do not place this inside `accountApi`.

---

## Work scope

### Part 1: API integration

Implement the full app integration for `GET /api/template-textures/ui`.

### Part 2: Data Lab page

Create a new Data Lab scenario that fetches this endpoint and proves selection works.

---

## Part 1: API integration tasks

### 1. Add frontend types

Create:
`src/types/api/template-textures.ts`

Use the handoff contract and include these exported types:

```ts
export type TemplateTextureBlendMode = "multiply";

export type TextureMedia = {
  id: number;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
};

export type TemplateTextureUiItem = {
  id: number;
  name: string | null;
  opacity: string | number | null;
  blendMode: TemplateTextureBlendMode | null;
  texture: TextureMedia | null;
};

export type GetTemplateTexturesForUiResponse = {
  data: TemplateTextureUiItem[];
};
```

Also add a small helper in the same file or a nearby utility if useful:

```ts
export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
```

Notes:

- `name` should remain nullable.
- `opacity` should remain `string | number | null` at the contract edge.
- Coerce `opacity` only when the UI needs numeric display or logic.

### 2. Add route registry entry

Update:
`src/lib/api/routes/route-definitions.ts`

Add a new top-level section:

```ts
templateTextures: {
  ui: {
    key: "template-textures.ui",
    method: "GET",
    path: "/api/template-textures/ui",
    authRequired: true,
    status: "ready",
    description: "GET - published template textures for UI selection",
    domain: "template-textures",
  },
},
```

### 3. Add query key

Update:
`src/lib/api/query/query-keys.ts`

Add:

```ts
templateTextures: {
  ui: ["template-textures", "ui"] as const,
},
```

### 4. Add domain service

Create:
`src/lib/api/services/template-textures.api.ts`

Implementation target:

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { GetTemplateTexturesForUiResponse } from "@/types/api/template-textures";

export const templateTexturesApi = {
  getTemplateTexturesUi: () =>
    apiClient.get<GetTemplateTexturesForUiResponse>(appRoutes.templateTextures.ui.path),
};
```

### 5. Add React Query hook

Create:
`src/lib/api/hooks/template-textures/useTemplateTexturesUi.ts`

Implementation target:

```ts
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateTexturesApi } from "../../services/template-textures.api";

export function useTemplateTexturesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.templateTextures.ui,
    queryFn: () => templateTexturesApi.getTemplateTexturesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
```

Optional:

- add `src/lib/api/hooks/template-textures/index.ts` if the folder pattern benefits from re-exports

### 6. Add Next.js BFF route

Create:
`src/app/api/template-textures/ui/route.ts`

The route must:

- read auth token from cookie using the same auth pattern as existing authenticated BFF routes
- return `401` when no token is present
- return `503` if `STRAPI_URL` is unavailable
- proxy to `${strapiUrl}/api/template-textures/ui`
- send headers:
  - `Authorization: Bearer <token>`
  - `Accept: application/json`
- use `cache: "no-store"`
- parse JSON or text responses safely
- pass successful payloads through with `NextResponse.json(payload)`
- normalize non-OK responses into `{ error: string }`
- capture unexpected exceptions with Sentry and return `500`

Use these files as references:

- `src/app/api/account/template-categories/list-for-selection/route.ts`
- `src/app/api/assets/list-for-selection/route.ts`

Expected behaviour:

- no session -> `401`
- missing Strapi permission -> `403`
- server issue -> `500`

Include an `@see` reference back to:
`src/app/sandbox/data-lab/.doc/requests/template-textures-ui-endpoint-handoff.md`

---

## Part 2: Data Lab implementation tasks

Create a dedicated route for testing this endpoint in the sandbox.

### 1. Create the page route

Create:

- `src/app/sandbox/data-lab/template-textures/ui/page.tsx`
- `src/app/sandbox/data-lab/template-textures/ui/layout.tsx`

Suggested URL:
`/sandbox/data-lab/template-textures/ui`

### 2. Add nav entry

Update:
`src/lib/dev-sandbox-nav.ts`

Add a new Data Lab section:

```ts
{
  title: "Template textures",
  links: [
    {
      href: `${ROUTES.dataLab}/template-textures/ui`,
      label: "UI endpoint",
    },
  ],
}
```

Also update the Data Lab overview page so the route is visible from the examples list:

- `src/app/sandbox/data-lab/page.tsx`

### 3. Page behaviour requirements

The page must:

- call `useTemplateTexturesUi()`
- show a `Refetch` button
- show loading, refreshing, error, empty, and success states
- support two interaction modes:
  - `Select`
  - `Cards`
- show a shared detail panel for the currently selected row

### 4. State model

Store selection as local state in the page unless you intentionally extract a reusable picker module.

Recommended model:

```ts
const q = useTemplateTexturesUi();
const textures = useMemo(() => q.data?.data ?? [], [q.data]);
const [selectedId, setSelectedId] = useState<string>("");
const [pattern, setPattern] = useState<"select" | "cards">("select");

const selected = useMemo(
  () => textures.find((item) => String(item.id) === selectedId) ?? null,
  [textures, selectedId],
);
```

Recommended enhancement:

- auto-select the first row once data loads if no selection exists

### 5. Select UI requirements

Use existing UI primitives:

- `Label`
- `Select`
- `SelectTrigger`
- `SelectContent`
- `SelectItem`

Each option should use:

- value: `String(texture.id)`
- label: `texture.name ?? \`Template texture ${texture.id}\``

### 6. Card UI requirements

Use card-based selection similar to the template-category picker.

Requirements:

- card is clickable
- keyboard-selectable with Enter and Space
- visibly selected state
- show useful metadata on each card

Suggested card content:

- title: `name`
- description: `id`
- metadata text:
  - `opacity` (display the raw value and optionally the coerced numeric value if helpful)
  - `blendMode`
  - texture media summary such as mime or dimensions
- optional thumbnail or preview if the returned `texture.url` can be rendered safely in the app context

### 7. Selected detail panel

Render a detail panel showing the selected item.

Minimum fields:

- `id`
- `name`
- `opacity` raw value
- `opacity` coerced numeric value
- `blendMode`
- `texture.id`
- `texture.url`
- `texture.width`
- `texture.height`
- `texture.mime`
- `texture.alternativeText`

Also render a raw JSON block for quick visual verification.

### 8. Copy and presentation

Suggested page title:
`Template textures - UI endpoint`

Suggested helper copy:
`Calls /api/template-textures/ui (BFF -> Strapi). Sign in first; unauthenticated requests return 401 and missing CMS permission returns 403.`

Suggested status line:
`template textures: {textures.length} (published only)`

Add a small note in the detail panel or helper copy that `opacity` may arrive as a string and is coerced in the UI when needed.

---

## Reuse guidance

If you decide to extract a reusable picker set, use:

- `src/components/pickers/template-textures/...`

Suggested reusable files:

- `template-texture-select-picker.tsx`
- `template-texture-card-picker.tsx`
- `template-texture-picker-detail.tsx`
- `_hooks/...`
- `_utils/...`

If time matters, page-local implementation is acceptable for the first pass.

---

## Recommended implementation order

1. create `src/types/api/template-textures.ts`
2. add `appRoutes.templateTextures.ui`
3. add `queryKeys.templateTextures.ui`
4. create `src/lib/api/services/template-textures.api.ts`
5. create `src/lib/api/hooks/template-textures/useTemplateTexturesUi.ts`
6. create `src/app/api/template-textures/ui/route.ts`
7. create `src/app/sandbox/data-lab/template-textures/ui/layout.tsx`
8. create `src/app/sandbox/data-lab/template-textures/ui/page.tsx`
9. update `src/lib/dev-sandbox-nav.ts`
10. update `src/app/sandbox/data-lab/page.tsx`
11. run targeted verification

---

## Acceptance criteria

### API layer

- [ ] route registry entry exists for `/api/template-textures/ui`
- [ ] BFF route proxies authenticated requests to Strapi
- [ ] types match the handoff contract
- [ ] service function exists
- [ ] query key exists
- [ ] React Query hook exists

### Data Lab UI

- [ ] route exists at `/sandbox/data-lab/template-textures/ui`
- [ ] route appears in the Data Lab nav
- [ ] loading state renders correctly
- [ ] error state renders readable message
- [ ] empty state is handled
- [ ] select mode updates the selected detail panel
- [ ] card click mode updates the selected detail panel
- [ ] selected detail panel shows the expected fields and raw JSON
- [ ] UI makes the `opacity` coercion behaviour clear enough for debugging

---

## Verification checklist

1. sign in to the app
2. open `/sandbox/data-lab/template-textures/ui`
3. confirm the request succeeds and rows render
4. test select-based selection
5. test card-based selection
6. confirm opacity raw/coerced values are visible
7. click `Refetch` and confirm refreshing state appears
8. verify `401` handling when signed out
9. verify `403` handling if the Strapi permission is disabled

---

## Notes for the worker

- Preserve existing code style and comments.
- Prefer matching the structure of the existing template-categories and assets Data Lab pages.
- Do not widen the endpoint into account-specific logic.
- If you find related existing `template-textures` types or services in the repo, reuse them only if they match this contract cleanly. Otherwise create the dedicated files above.
- If there are unrelated uncommitted changes, do not revert them.
