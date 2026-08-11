````md
# Skill — Add Protected Page

## 1. Purpose

This skill defines how to correctly add a new page inside the protected Fixtura Members Area.

It exists to ensure:

- new pages are placed in the correct protected route space
- route protection remains centralised in middleware
- page structure stays aligned with the app shell
- data fetching follows the approved auth-aware API patterns
- loading, error, and empty states remain consistent

This skill should be used whenever a new members-area screen is introduced.

---

## 2. When to Use This Skill

Use this skill when:

- creating a new route under the members app (`src/app/(members)/`), usually **`/o/[accountId]/your-segment`** for organisation-scoped UI, or a **gateway** route alongside `/select-organisation`
- adding a new screen to the protected members application
- introducing a new section to private navigation
- building the first version of a protected feature page
- replacing placeholder content with a real protected page

Do not use this skill for login routes, public-domain marketing pages, or middleware changes.

---

## 3. Core Rule

Protected pages must rely on the existing system boundary.

That means:

- middleware handles route protection
- the app shell handles protected layout structure
- the API layer handles auth-aware requests
- the page handles only page-level UI and feature composition

Do not move access-control logic into the page component.

---

## 4. Route Placement Rule

New protected pages must live inside the protected members-area route structure.

Organisation-scoped screens belong under **`src/app/(members)/o/[accountId]/...`** (e.g. `.../o/[accountId]/reports/page.tsx` → `/o/319/reports`). Use **`accountScopedRoutes`** from `src/lib/config/account-routes.ts` for links.

Gateway screens (no account chosen yet) live as siblings of `o/`, e.g. **`src/app/(members)/select-organisation/`**.

Follow the existing `(members)` layout and **`MembersAppShell`** / **`OrgAccessBoundary`** patterns.

---

## 5. What a Protected Page Owns

A protected page may own:

- page-level structure
- feature composition
- loading UI
- empty state UI
- access denied UI, where relevant
- data display
- local interaction state

A protected page does not own:

- auth protection
- cookie logic
- session invalidation logic
- login redirect rules
- central API behaviour

---

## 6. Standard Build Pattern

When adding a protected page, follow this sequence:

1. create the page in the protected route area
2. render it inside the existing app shell
3. fetch data using `apiFetch` or `apiFetchJson`
4. add loading, error, and empty states as needed
5. add or update navigation config if the page should be discoverable
6. verify behaviour while signed in and signed out

---

## 7. Data Fetching Rule

All authenticated page data must use the approved API layer.

Use:

- `apiFetch`
- `apiFetchJson`

Do not use raw `fetch` for protected app data unless an explicit architectural exception already exists.

If the page needs server-side auth-aware requests, use the approved server-side helper path already defined for the members area.

---

## 8. Loading and Error Handling Rule

Each protected page should deliberately handle UI state.

At minimum, consider:

- loading
- empty
- access denied
- generic failure

Do not leave the page in an ambiguous blank state while data is loading or after an error.

Prefer using existing shared feedback components where they already exist.

---

## 9. Navigation Rule

If the new protected page should appear in the private app navigation:

- update the central navigation configuration
- keep route definitions consistent with the route constants/config where applicable
- do not hardcode the same route string in multiple disconnected places

This helps keep navigation scalable and prevents route drift.

---

## 10. Correct Usage Pattern

### Example protected page

```tsx
import { apiFetchJson } from "@/lib/api";

type ReportsResponse = {
  items: Array<{
    id: string;
    title: string;
  }>;
};

export default async function ReportsPage() {
  const data = await apiFetchJson<ReportsResponse>("/api/member/reports");

  if (!data.items.length) {
    return <div>No reports available.</div>;
  }

  return (
    <div>
      <h1>Reports</h1>
      <ul>
        {data.items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```
````

### Example with explicit UI states in a client component

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetchJson } from "@/lib/api";

type ReportsResponse = {
  items: Array<{
    id: string;
    title: string;
  }>;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const result = await apiFetchJson<ReportsResponse>("/api/member/reports");
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Something went wrong.";
          setError(message);
        }
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <div>{error}</div>;
  if (!data) return <div>Loading...</div>;
  if (!data.items.length) return <div>No reports available.</div>;

  return (
    <div>
      <h1>Reports</h1>
      <ul>
        {data.items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 11. What Not to Do

### Do not add manual auth redirects in the page

Wrong:

```ts
if (!session) {
  redirect("/login");
}
```

### Do not read cookies directly in the page for access control

Wrong:

```ts
const token = cookies().get("auth");
if (!token) redirect("/login");
```

### Do not bypass the API client

Wrong:

```ts
const response = await fetch("/api/member/reports");
```

### Do not hardcode navigation in multiple places

Wrong:

- route string in the page
- duplicate route string in sidebar
- duplicate route string in another config file

### Do not mix auth flow logic into feature UI

The page should not invent new login, logout, or session-expiry behaviour.

---

## 12. Anti-Patterns

Avoid:

- page-level auth enforcement
- duplicate route constants
- feature pages that assume session hooks are the source of truth
- missing loading states
- missing empty states for list/data views
- raw backend error text shown directly in the UI

---

## 13. Validation Steps

After adding a protected page, validate:

1. signed-out visit to the route redirects correctly through middleware
2. signed-in visit renders inside the app shell
3. data loads through the approved API layer
4. loading state is visible when appropriate
5. error state is visible when appropriate
6. navigation points to the new page correctly, if applicable
7. no manual auth logic was added to the page

---

## 14. Completion Checklist

Before considering the task complete, confirm:

- [ ] the page lives in the protected route structure
- [ ] the page relies on middleware for protection
- [ ] the page uses `apiFetch` or `apiFetchJson` for protected requests
- [ ] no cookie or token logic was added to the page
- [ ] loading, error, and empty states were considered
- [ ] navigation was updated correctly if needed
- [ ] no auth-flow duplication was introduced

---

## 15. Summary

This skill ensures that new members-area pages are added in a way that stays aligned with the Fixtura auth boundary, protected shell architecture, and central API rules.

Use it whenever you create or upgrade a page under **`(members)`** (gateway or `/o/[accountId]/...`), and do not let page components become the place where route protection or session rules are redefined.
