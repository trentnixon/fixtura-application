Absolutely — let’s do **one skill at a time** and keep the formatting clean.

We’ll start with:

# `authenticated-api-call`

````md
# Skill — Authenticated API Call

## 1. Purpose

This skill defines the correct way to perform authenticated API requests inside the Fixtura Members Area.

It exists to ensure:

- consistent request patterns
- correct session-expiry handling
- correct forbidden-access handling
- no duplication of auth-aware fetch logic
- no auth responsibility leaking into UI components

This skill should be used whenever protected app code needs to fetch data.

---

## 2. When to Use This Skill

Use this skill when:

- adding data fetching to a protected page under `/app/*`
- calling internal members-area API routes
- calling protected backend endpoints
- building a component that needs authenticated data
- replacing raw `fetch` usage inside the protected app

Do not use this skill for unrelated public-site fetching outside the members app.

---

## 3. Core Rule

All authenticated requests must use the central API utilities:

- `apiFetch`
- `apiFetchJson`

Do not use raw `fetch` for authenticated app requests unless there is an explicit exception already defined in the architecture.

---

## 4. System Rules This Skill Must Respect

### Middleware owns route protection

This skill does not decide whether a user can access a page.

### The API client owns auth-aware request behaviour

This skill must rely on the established API layer for session-aware handling.

### UI components only handle presentation

Components may display loading or error states, but they must not invent custom auth flows.

---

## 5. Required Pattern

### Preferred default

Use `apiFetchJson` when expecting JSON data.

Example:

```ts
import { apiFetchJson } from "@/lib/api";

const data = await apiFetchJson<MyResponse>("/api/member/account");
```
````

### Use `apiFetch` when you need the raw `Response`

Example:

```ts
import { apiFetch } from "@/lib/api";

const response = await apiFetch("/api/member/export");
```

---

## 6. Expected Auth Behaviour

### 401 Unauthorized

Treat this as an invalid or expired session.

Expected system behaviour:

- logout flow is triggered
- session is cleared through the existing mechanism
- user is redirected to the login route using the established session-expiry pattern

This must be handled centrally by the API layer, not re-implemented in components.

### 403 Forbidden

Treat this as an authorization failure, not a logout condition.

Expected system behaviour:

- keep the session intact
- show access-denied UI where appropriate

### 5xx Server Errors

Show a safe, generic message.

Do not expose raw backend error payloads to the user.

### Network Failures

Show the standard network-failure message and allow retry where appropriate.

---

## 7. UI Error Handling Rule

Components may catch errors only to control UI state.

Correct examples:

- show an inline error message
- render an access denied state
- render an empty or retry state

Incorrect examples:

- manually logging the user out
- redirecting on 401 from inside the component
- parsing auth meaning from raw response codes in multiple places

---

## 8. Correct Usage Pattern

### Example: simple JSON request

```ts
import { apiFetchJson } from "@/lib/api";

type AccountResponse = {
  id: string;
  email: string;
  plan: string;
};

export async function loadAccount() {
  return apiFetchJson<AccountResponse>("/api/member/account");
}
```

### Example: component usage

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetchJson } from "@/lib/api";

type AccountResponse = {
  id: string;
  email: string;
  plan: string;
};

export function AccountSummary() {
  const [data, setData] = useState<AccountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const result = await apiFetchJson<AccountResponse>("/api/member/account");
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

  return <div>{data.email}</div>;
}
```

---

## 9. What Not to Do

### Do not use raw fetch for protected app requests

Wrong:

```ts
const response = await fetch("/api/member/account");
```

### Do not manually attach auth tokens

The auth model already defines how session/auth is handled.

Wrong:

```ts
headers: {
  Authorization: `Bearer ${token}`,
}
```

### Do not implement custom 401 handling inside components

Wrong:

```ts
if (response.status === 401) {
  router.push("/login");
}
```

### Do not duplicate parsing rules

Do not recreate generic response parsing in each feature.

---

## 10. Server-Side Note

If a request is being made from server-side code and must include auth context, use the established server-safe auth helpers already defined in the members-area architecture.

Do not copy browser-side API patterns into server code without checking the approved server utility path first.

---

## 11. Anti-Patterns

Avoid:

- raw `fetch` inside protected feature code
- custom token plumbing
- custom logout triggers in page components
- inconsistent error-copy logic
- exposing backend response text directly to users
- creating alternate authenticated request helpers when a central one already exists

---

## 12. Completion Checklist

Before considering this task complete, confirm:

- [ ] the request uses `apiFetch` or `apiFetchJson`
- [ ] no raw `fetch` was used for the authenticated app request
- [ ] no component-level auth logic was introduced
- [ ] UI only handles presentation state
- [ ] 401 / 403 / server-error behaviour remains centralised
- [ ] no sensitive auth details are exposed in the UI

---

## 13. Summary

This skill protects the consistency of the Fixtura Members Area by ensuring all authenticated data access flows through the approved API layer.

Use it whenever protected app code needs data, and do not bypass it unless the architecture explicitly allows an exception.
