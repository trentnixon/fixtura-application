````md
# Skill — Middleware Update

## 1. Purpose

This skill defines how to safely modify the Fixtura Members Area middleware.

It exists to ensure:

- route protection remains correct and centralised
- redirect behaviour stays predictable
- protected-route matching stays precise
- middleware remains small, fast, and deterministic
- new changes do not accidentally introduce auth drift or broken navigation

This skill should be used whenever `middleware.ts` is added to, refactored, or behaviourally changed.

---

## 2. When to Use This Skill

Use this skill when:

- editing `src/middleware.ts`
- changing protected-route matching
- changing login redirect rules
- changing authenticated-user redirect rules
- updating `from` redirect handling
- changing matcher scope
- adding dev-only middleware logs

Do not use this skill for page-level auth changes, component state handling, or general feature development outside route protection behaviour.

---

## 3. Core Rule

Middleware is the source of truth for route-level access control.

That means middleware decides:

- whether a protected route may proceed
- whether a signed-out user must be redirected to login
- whether a signed-in user should be redirected away from login

Middleware must not become a place for business logic, feature rules, or UI behaviour.

---

## 4. Middleware Responsibilities

Middleware is allowed to:

- inspect the request path
- read the auth cookie
- classify route intent
- redirect based on auth presence
- preserve safe return-path information
- emit development-only console logs

Middleware is not allowed to:

- call backend APIs
- load user profiles
- inspect feature permissions from external systems
- depend on React/UI/session hook state
- render user-facing UI
- implement business workflows

---

## 5. Standard Behaviour Rules

### Protected routes

Protected routes under the approved members-app namespace must require auth-cookie presence.

Expected behaviour:

- auth cookie present → allow request
- auth cookie missing → redirect to login

### Login route

The login route must remain accessible when signed out.

Expected behaviour:

- auth cookie missing → allow request
- auth cookie present → redirect to app landing route

### Other routes

Routes outside the middleware’s intended matcher scope should not be affected.

---

## 6. Route Matching Rule

Protected matching must be precise.

**Current members app:** protection is split across gateway routes (`/select-organisation`, …), scoped routes (`pathname.startsWith("/o/")`), `/admin/*`, and `/logout` — see `src/middleware.ts`. Do not assume a single `ROUTES.app` prefix; legacy flat `/dashboard`-style paths are redirected to the gateway.

Illustrative pattern (generic):

```ts
const isProtectedRoute = pathname === ROUTES.app || pathname.startsWith(`${ROUTES.app}/`);
```
````

Do not use loose matching that could accidentally include unrelated paths.

Wrong example:

```ts
pathname.startsWith(ROUTES.app);
```

if that could also match unintended values such as `/application` or similarly prefixed paths.

---

## 7. Redirect Rule

Redirects must be:

- deterministic
- minimal
- safe
- based only on request information already available in middleware

When redirecting a signed-out user from a protected route to login:

- preserve a safe `from` value where possible
- validate that `from` points only to approved app routes
- fall back to the default protected landing route if needed

Do not trust raw query input without validation.

---

## 8. Safe Return-Path Rule

The middleware must use the approved safe return-path helper when preserving intended navigation.

This ensures:

- only valid members-app routes are preserved
- open redirect risks are reduced
- malformed paths do not leak into auth redirects

Do not reimplement safe return-path validation ad hoc inside middleware if an approved shared helper already exists.

---

## 9. Performance Rule

Middleware runs frequently and must stay lightweight.

Therefore:

- avoid expensive logic
- avoid external calls
- avoid large abstractions
- avoid pulling in unnecessary dependencies

A change that increases middleware complexity should be treated as high risk.

---

## 10. Debugging Rule

Development-only logging is allowed when needed.

Example pattern:

```ts
if (process.env.NODE_ENV === "development") {
  console.log("[middleware]", {
    pathname,
    hasToken,
  });
}
```

Debug logging must:

- remain development-only
- avoid sensitive data
- help diagnose route and redirect behaviour
- be easy to remove or keep harmlessly

Do not log token values.

---

## 11. Correct Usage Pattern

### Example middleware structure

```ts
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { ROUTES } from "@/lib/config/routes";
import { isSafeAppReturnPath } from "@/lib/config/safe-return-path";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname === ROUTES.login) {
    if (hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.app;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const isProtectedRoute = pathname === ROUTES.app || pathname.startsWith(`${ROUTES.app}/`);

  if (isProtectedRoute) {
    if (!hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.login;

      const fullPath = pathname + request.nextUrl.search;
      const fromValue = isSafeAppReturnPath(fullPath)
        ? fullPath
        : isSafeAppReturnPath(pathname)
          ? pathname
          : ROUTES.app;

      url.searchParams.set("from", fromValue);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
```

This pattern is preferred because it:

- keeps route classification explicit
- keeps matching tight
- preserves safe redirects
- keeps middleware small and readable

---

## 12. What Not to Do

### Do not call external APIs from middleware

Wrong:

```ts
await fetch("https://example.com/api/session");
```

### Do not load user data in middleware

Wrong:

- requesting profile data
- resolving role-based feature state from backend
- doing permission expansion in middleware

### Do not depend on client state

Wrong:

- React context
- hooks
- browser-only session helpers

### Do not add business rules

Wrong:

- feature entitlement branching
- page content decisions
- product workflow gates

### Do not log sensitive auth values

Wrong:

```ts
console.log(token);
```

---

## 13. Anti-Patterns

Avoid:

- broad or ambiguous route matching
- redirect loops
- duplicate safe-path logic
- multiple conflicting redirect strategies
- route protection logic spread into pages because middleware became unreliable
- mixing route protection with feature authorization

---

## 14. Validation Steps

After changing middleware, validate:

1. signed-out visit to a protected route redirects to login
2. signed-in visit to login redirects to app
3. public or unmatched routes are unaffected
4. `from` is preserved only when safe
5. no redirect loop occurs
6. matcher scope is still correct
7. no API calls or business logic were added

If possible, validate both direct route access and refresh behaviour.

---

## 15. Completion Checklist

Before considering the middleware change complete, confirm:

- [ ] route matching is precise
- [ ] protected routes still require auth presence
- [ ] login redirect behaviour still works
- [ ] safe return-path handling still works
- [ ] no external API calls were added
- [ ] no business logic was added
- [ ] no sensitive data is logged
- [ ] middleware remains small and readable

---

## 16. Summary

This skill protects the integrity of the Fixtura Members Area by keeping route protection centralised, predictable, and lightweight.

Use it whenever middleware changes are needed, and do not let middleware become a second application layer.
