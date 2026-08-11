# Worker Brief: Integrate `GET /api/template-palettes/ui`

## Objective

Implement the new authenticated app-facing endpoint `GET /api/template-palettes/ui` in the Fixtura frontend using the established data-layer architecture, then add a dedicated Data Lab route to test it with:

1. a select input
2. clickable cards
3. a selected-result detail panel
4. a visible colour swatch using the returned palette value

Source handoff:
`src/app/sandbox/data-lab/.doc/requests/template-palettes-ui-endpoint-handoff.md`

Follow the same conventions already used for:

- `GET /api/template-gradients/ui`
- `GET /api/template-images/ui`
- `GET /api/template-modes/ui`
- `GET /api/template-noises/ui`
- `GET /api/account/template-categories/list-for-selection`
- `GET /api/assets/list-for-selection`

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
6. Keep the palette value in the app-shaped `ui.value` field. Do not flatten it into a top-level raw CMS field in the frontend contract.

---

## Domain decision

Use a new top-level API domain named `templatePalettes`.

Expected additions:

- `appRoutes.templatePalettes.ui`
- `queryKeys.templatePalettes.ui`
- `templatePalettesApi.getTemplatePalettesUi()`
- `useTemplatePalettesUi()`

Do not place this inside `accountApi`.

---

## Work scope

### Part 1: API integration

Implement the full app integration for `GET /api/template-palettes/ui`.

### Part 2: Data Lab page

Create a new Data Lab scenario that fetches this endpoint and proves selection works.

---

## Part 1: API integration tasks

### 1. Add frontend types

Create:
`src/types/api/template-palettes.ts`

Use the handoff contract and include these exported types:

```ts
export interface TemplatePalettesUiResponse {
  data: TemplatePaletteUiItem[];
}

export interface TemplatePaletteUiItem {
  id: number;
  name: string;
  ui: TemplatePaletteUiFields;
}

export interface TemplatePaletteUiFields {
  value: string;
}
```

Notes:

- Stay close to the handoff contract.
- `ui.value` is the CSS-ready colour string returned by CMS.
- If you see evidence the backend can return nullish values in practice, widen carefully and document why. Otherwise keep the handoff shape intact.

### 2. Add route registry entry

Update:
`src/lib/api/routes/route-definitions.ts`

Add a new top-level section:

```ts
templatePalettes: {
  ui: {
    key: "template-palettes.ui",
    method: "GET",
    path: "/api/template-palettes/ui",
    authRequired: true,
    status: "ready",
    description: "GET - published template palettes for UI selection",
    domain: "template-palettes",
  },
},
```

### 3. Add query key

Update:
`src/lib/api/query/query-keys.ts`

Add:

```ts
templatePalettes: {
  ui: ["template-palettes", "ui"] as const,
},
```

### 4. Add domain service

Create:
`src/lib/api/services/template-palettes.api.ts`

Implementation target:

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplatePalettesUiResponse } from "@/types/api/template-palettes";

export const templatePalettesApi = {
  getTemplatePalettesUi: () =>
    apiClient.get<TemplatePalettesUiResponse>(appRoutes.templatePalettes.ui.path),
};
```

### 5. Add React Query hook

Create:
`src/lib/api/hooks/template-palettes/useTemplatePalettesUi.ts`

Implementation target:

```ts
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templatePalettesApi } from "../../services/template-palettes.api";

export function useTemplatePalettesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.templatePalettes.ui,
    queryFn: () => templatePalettesApi.getTemplatePalettesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
```

Optional:

- add `src/lib/api/hooks/template-palettes/index.ts` if the folder pattern benefits from re-exports

### 6. Add Next.js BFF route

Create:
`src/app/api/template-palettes/ui/route.ts`

The route must:

- read auth token from cookie using the same auth pattern as existing authenticated BFF routes
- return `401` when no token is present
- return `503` if `STRAPI_URL` is unavailable
- proxy to `${strapiUrl}/api/template-palettes/ui`
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
`src/app/sandbox/data-lab/.doc/requests/template-palettes-ui-endpoint-handoff.md`

---

## Part 2: Data Lab implementation tasks

Create a dedicated route for testing this endpoint in the sandbox.

### 1. Create the page route

Create:

- `src/app/sandbox/data-lab/template-palettes/ui/page.tsx`
- `src/app/sandbox/data-lab/template-palettes/ui/layout.tsx`

Suggested URL:
`/sandbox/data-lab/template-palettes/ui`

### 2. Add nav entry

Update:
`src/lib/dev-sandbox-nav.ts`

Add a new Data Lab section:

```ts
{
  title: "Template palettes",
  links: [
    {
      href: `${ROUTES.dataLab}/template-palettes/ui`,
      label: "UI endpoint",
    },
  ],
}
```

Also update the Data Lab overview page so the route is visible from the examples list:

- `src/app/sandbox/data-lab/page.tsx`

### 3. Page behaviour requirements

The page must:

- call `useTemplatePalettesUi()`
- show a `Refetch` button
- show loading, refreshing, error, empty, and success states
- support two interaction modes:
  - `Select`
  - `Cards`
- show a shared detail panel for the currently selected row
- visibly render the selected colour using `ui.value`

### 4. State model

Store selection as local state in the page unless you intentionally extract a reusable picker module.

Recommended model:

```ts
const q = useTemplatePalettesUi();
const palettes = useMemo(() => q.data?.data ?? [], [q.data]);
const [selectedId, setSelectedId] = useState<string>("");
const [pattern, setPattern] = useState<"select" | "cards">("select");

const selected = useMemo(
  () => palettes.find((item) => String(item.id) === selectedId) ?? null,
  [palettes, selectedId],
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

- value: `String(palette.id)`
- label: `palette.name ?? \`Template palette ${palette.id}\`` if you decide to harden the UI defensively

The detail panel or helper copy should make it clear that:

- `name` is for display
- `ui.value` is the CSS-ready colour value

### 6. Card UI requirements

Use card-based selection similar to the template-category picker.

Requirements:

- card is clickable
- keyboard-selectable with Enter and Space
- visibly selected state
- show useful metadata on each card
- show a live colour preview block using `ui.value`

Suggested card content:

- title: `name`
- description: `id`
- metadata text:
  - `ui.value`
- colour swatch:
  - a small block or chip with `style={{ backgroundColor: palette.ui.value }}`

### 7. Selected detail panel

Render a detail panel showing the selected item.

Minimum fields:

- `id`
- `name`
- `ui.value`

Also render:

- a larger colour swatch preview using `ui.value`
- a raw JSON block for quick visual verification

The panel should explicitly label `ui.value` as the CSS-ready colour value.

### 8. Copy and presentation

Suggested page title:
`Template palettes - UI endpoint`

Suggested helper copy:
`Calls /api/template-palettes/ui (BFF -> Strapi). Sign in first; unauthenticated requests return 401 and missing CMS permission returns 403.`

Suggested status line:
`template palettes: {palettes.length} (published only)`

Add a short note in the success state or detail panel clarifying that `ui.value` is ready for CSS usage.

---

## Reuse guidance

If you decide to extract a reusable picker set, use:

- `src/components/pickers/template-palettes/...`

Suggested reusable files:

- `template-palette-select-picker.tsx`
- `template-palette-card-picker.tsx`
- `template-palette-picker-detail.tsx`
- `_hooks/...`
- `_utils/...`

If time matters, page-local implementation is acceptable for the first pass.

---

## Recommended implementation order

1. create `src/types/api/template-palettes.ts`
2. add `appRoutes.templatePalettes.ui`
3. add `queryKeys.templatePalettes.ui`
4. create `src/lib/api/services/template-palettes.api.ts`
5. create `src/lib/api/hooks/template-palettes/useTemplatePalettesUi.ts`
6. create `src/app/api/template-palettes/ui/route.ts`
7. create `src/app/sandbox/data-lab/template-palettes/ui/layout.tsx`
8. create `src/app/sandbox/data-lab/template-palettes/ui/page.tsx`
9. update `src/lib/dev-sandbox-nav.ts`
10. update `src/app/sandbox/data-lab/page.tsx`
11. run targeted verification

---

## Acceptance criteria

### API layer

- [ ] route registry entry exists for `/api/template-palettes/ui`
- [ ] BFF route proxies authenticated requests to Strapi
- [ ] types match the handoff contract
- [ ] service function exists
- [ ] query key exists
- [ ] React Query hook exists

### Data Lab UI

- [ ] route exists at `/sandbox/data-lab/template-palettes/ui`
- [ ] route appears in the Data Lab nav
- [ ] loading state renders correctly
- [ ] error state renders readable message
- [ ] empty state is handled
- [ ] select mode updates the selected detail panel
- [ ] card click mode updates the selected detail panel
- [ ] selected detail panel shows the expected fields and raw JSON
- [ ] selected value includes a visible colour swatch
- [ ] UI makes it clear that `ui.value` is the CSS-ready colour string

---

## Verification checklist

1. sign in to the app
2. open `/sandbox/data-lab/template-palettes/ui`
3. confirm the request succeeds and rows render
4. test select-based selection
5. test card-based selection
6. confirm the colour swatch updates with the selected palette
7. confirm the detail panel clearly surfaces `ui.value`
8. click `Refetch` and confirm refreshing state appears
9. verify `401` handling when signed out
10. verify `403` handling if the Strapi permission is disabled

---

## Notes for the worker

- Preserve existing code style and comments.
- Prefer matching the structure of the existing template-categories and assets Data Lab pages.
- Do not widen the endpoint into account-specific logic.
- If you find related existing `template-palettes` types or services in the repo, reuse them only if they match this contract cleanly. Otherwise create the dedicated files above.
- If there are unrelated uncommitted changes, do not revert them.
- Keep the frontend contract app-shaped as `ui.value`, not a flattened CMS colour field.
