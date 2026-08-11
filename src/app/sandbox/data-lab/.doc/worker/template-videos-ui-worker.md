# Worker Brief: Integrate `GET /api/template-videos/ui`

## Objective

Implement the new authenticated app-facing endpoint `GET /api/template-videos/ui` in the Fixtura frontend using the established data-layer architecture, then add a dedicated Data Lab route to test it with:

1. a select input
2. clickable cards
3. a selected-result detail panel

Source handoff:
`src/app/sandbox/data-lab/.doc/requests/template-videos-ui-endpoint-handoff.md`

Follow the same conventions already used for:

- `GET /api/template-gradients/ui`
- `GET /api/template-images/ui`
- `GET /api/template-patterns/ui`
- `GET /api/template-textures/ui`

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
6. Preserve the app-facing payload naming from the handoff: `ui.useOffthreadVideo`, `ui.playbackRate`, not raw CMS names like `offthread` or `rate`.
7. Handle `volume` and `playbackRate` defensively because the backend may return them as `string | number | null`.
8. Do not invent or display a `videoUrl` field; this content type is configuration-only and does not include a media URL.

---

## Domain decision

Use a new top-level API domain named `templateVideos`.

Expected additions:

- `appRoutes.templateVideos.ui`
- `queryKeys.templateVideos.ui`
- `templateVideosApi.getTemplateVideosUi()`
- `useTemplateVideosUi()`

Do not place this inside `accountApi`.

---

## Work scope

### Part 1: API integration

Implement the full app integration for `GET /api/template-videos/ui`.

### Part 2: Data Lab page

Create a new Data Lab scenario that fetches this endpoint and proves selection works.

---

## Part 1: API integration tasks

### 1. Add frontend types

Create:
`src/types/api/template-videos.ts`

Use the handoff contract and include these exported types:

```ts
export type TemplateVideoPosition = "center" | "left" | "right" | "top" | "bottom";

export type TemplateVideoSize = "cover" | "contain";

export type TemplateVideoOverlay = Record<string, unknown>;

export type TemplateVideoUiSettings = {
  position: TemplateVideoPosition | null;
  size: TemplateVideoSize | null;
  loop: boolean | null;
  muted: boolean | null;
  overlay: TemplateVideoOverlay;
  useOffthreadVideo: boolean | null;
  volume: string | number | null;
  playbackRate: string | number | null;
};

export type TemplateVideoUiItem = {
  id: number;
  name: string | null;
  ui: TemplateVideoUiSettings;
};

export type GetTemplateVideosForUiResponse = {
  data: TemplateVideoUiItem[];
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
- `overlay` should default to an object shape in the contract, not `null`, matching the handoff.
- `volume` and `playbackRate` should remain `string | number | null` at the contract edge.
- Coerce decimals only when the UI needs numeric display or logic.

### 2. Add route registry entry

Update:
`src/lib/api/routes/route-definitions.ts`

Add a new top-level section:

```ts
templateVideos: {
  ui: {
    key: "template-videos.ui",
    method: "GET",
    path: "/api/template-videos/ui",
    authRequired: true,
    status: "ready",
    description: "GET - published template video configs for UI selection",
    domain: "template-videos",
  },
},
```

### 3. Add query key

Update:
`src/lib/api/query/query-keys.ts`

Add:

```ts
templateVideos: {
  ui: ["template-videos", "ui"] as const,
},
```

### 4. Add domain service

Create:
`src/lib/api/services/template-videos.api.ts`

Implementation target:

```ts
import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { GetTemplateVideosForUiResponse } from "@/types/api/template-videos";

export const templateVideosApi = {
  getTemplateVideosUi: () =>
    apiClient.get<GetTemplateVideosForUiResponse>(appRoutes.templateVideos.ui.path),
};
```

### 5. Add React Query hook

Create:
`src/lib/api/hooks/template-videos/useTemplateVideosUi.ts`

Implementation target:

```ts
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateVideosApi } from "../../services/template-videos.api";

export function useTemplateVideosUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.templateVideos.ui,
    queryFn: () => templateVideosApi.getTemplateVideosUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
```

Optional:

- add `src/lib/api/hooks/template-videos/index.ts` if the folder pattern benefits from re-exports

### 6. Add Next.js BFF route

Create:
`src/app/api/template-videos/ui/route.ts`

The route must:

- read auth token from cookie using the same auth pattern as existing authenticated BFF routes
- return `401` when no token is present
- return `503` if `STRAPI_URL` is unavailable
- proxy to `${strapiUrl}/api/template-videos/ui`
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
`src/app/sandbox/data-lab/.doc/requests/template-videos-ui-endpoint-handoff.md`

---

## Part 2: Data Lab implementation tasks

Create a dedicated route for testing this endpoint in the sandbox.

### 1. Create the page route

Create:

- `src/app/sandbox/data-lab/template-videos/ui/page.tsx`
- `src/app/sandbox/data-lab/template-videos/ui/layout.tsx`

Suggested URL:
`/sandbox/data-lab/template-videos/ui`

### 2. Add nav entry

Update:
`src/lib/dev-sandbox-nav.ts`

Add a new Data Lab section:

```ts
{
  title: "Template videos",
  links: [
    {
      href: `${ROUTES.dataLab}/template-videos/ui`,
      label: "UI endpoint",
    },
  ],
}
```

Also update the Data Lab overview page so the route is visible from the examples list:

- `src/app/sandbox/data-lab/page.tsx`

### 3. Page behaviour requirements

The page must:

- call `useTemplateVideosUi()`
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
const q = useTemplateVideosUi();
const videos = useMemo(() => q.data?.data ?? [], [q.data]);
const [selectedId, setSelectedId] = useState<string>("");
const [pattern, setPattern] = useState<"select" | "cards">("select");

const selected = useMemo(
  () => videos.find((item) => String(item.id) === selectedId) ?? null,
  [videos, selectedId],
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

- value: `String(video.id)`
- label: `video.name ?? \`Template video ${video.id}\``

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
  - `ui.position`
  - `ui.size`
  - `ui.loop`
  - `ui.muted`
  - `ui.useOffthreadVideo`
  - `ui.volume` raw value
  - `ui.playbackRate` raw value
- optional note when overlay contains keys, for example `overlay: 3 keys`

Do not show or imply a video media URL, because this endpoint does not include one.

### 7. Selected detail panel

Render a detail panel showing the selected item.

Minimum fields:

- `id`
- `name`
- `ui.position`
- `ui.size`
- `ui.loop`
- `ui.muted`
- `ui.useOffthreadVideo`
- `ui.volume` raw value
- `ui.volume` coerced numeric value
- `ui.playbackRate` raw value
- `ui.playbackRate` coerced numeric value
- `ui.overlay`

Also render a raw JSON block for quick visual verification.

Make the panel clear that:

- this is a configuration catalog entry
- no video file or URL is part of this contract

### 8. Copy and presentation

Suggested page title:
`Template videos - UI endpoint`

Suggested helper copy:
`Calls /api/template-videos/ui (BFF -> Strapi). Sign in first; unauthenticated requests return 401 and missing CMS permission returns 403.`

Suggested status line:
`template videos: {videos.length} (published only)`

Add a small note in the detail panel or helper copy that:

- `volume` and `playbackRate` may arrive as strings and are coerced in the UI when needed
- this endpoint returns configuration only, not a media URL

---

## Reuse guidance

If you decide to extract a reusable picker set, use:

- `src/components/pickers/template-videos/...`

Suggested reusable files:

- `template-video-select-picker.tsx`
- `template-video-card-picker.tsx`
- `template-video-picker-detail.tsx`
- `_hooks/...`
- `_utils/...`

If time matters, page-local implementation is acceptable for the first pass.

---

## Recommended implementation order

1. create `src/types/api/template-videos.ts`
2. add `appRoutes.templateVideos.ui`
3. add `queryKeys.templateVideos.ui`
4. create `src/lib/api/services/template-videos.api.ts`
5. create `src/lib/api/hooks/template-videos/useTemplateVideosUi.ts`
6. create `src/app/api/template-videos/ui/route.ts`
7. create `src/app/sandbox/data-lab/template-videos/ui/layout.tsx`
8. create `src/app/sandbox/data-lab/template-videos/ui/page.tsx`
9. update `src/lib/dev-sandbox-nav.ts`
10. update `src/app/sandbox/data-lab/page.tsx`
11. run targeted verification

---

## Acceptance criteria

### API layer

- [ ] route registry entry exists for `/api/template-videos/ui`
- [ ] BFF route proxies authenticated requests to Strapi
- [ ] types match the handoff contract
- [ ] service function exists
- [ ] query key exists
- [ ] React Query hook exists

### Data Lab UI

- [ ] route exists at `/sandbox/data-lab/template-videos/ui`
- [ ] route appears in the Data Lab nav
- [ ] loading state renders correctly
- [ ] error state renders readable message
- [ ] empty state is handled
- [ ] select mode updates the selected detail panel
- [ ] card click mode updates the selected detail panel
- [ ] selected detail panel shows the expected fields and raw JSON
- [ ] UI makes the decimal coercion behaviour clear enough for debugging
- [ ] UI does not imply a media URL exists on this contract

---

## Verification checklist

1. sign in to the app
2. open `/sandbox/data-lab/template-videos/ui`
3. confirm the request succeeds and rows render
4. test select-based selection
5. test card-based selection
6. confirm raw/coerced `volume` and `playbackRate` values are visible
7. confirm overlay JSON is visible in the detail panel
8. click `Refetch` and confirm refreshing state appears
9. verify `401` handling when signed out
10. verify `403` handling if the Strapi permission is disabled

---

## Notes for the worker

- Preserve existing code style and comments.
- Prefer matching the structure of the existing template-categories and assets Data Lab pages.
- Do not widen the endpoint into account-specific logic.
- If you find related existing `template-videos` types or services in the repo, reuse them only if they match this contract cleanly. Otherwise create the dedicated files above.
- If there are unrelated uncommitted changes, do not revert them.
