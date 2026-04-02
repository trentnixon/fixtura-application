````md
# Skill — Login Flow

## 1. Purpose

This skill defines how to safely implement or modify the login flow for the Fixtura Members Area.

It exists to ensure:

- login behaviour remains aligned with the Strapi JWT auth model
- cookie-setting stays server-owned
- redirect behaviour stays safe and predictable
- login error handling remains consistent
- UI changes do not break the auth boundary

This skill should be used whenever the login form, login route, login response handling, or post-login redirect logic is changed.

---

## 2. When to Use This Skill

Use this skill when:

- editing the login form UI
- changing login submission behaviour
- changing `/api/auth/login`
- changing post-login redirect logic
- changing login error messages
- changing `from` handling
- adding login-related debug behaviour in development

Do not use this skill for general protected-page work, logout work, or middleware-only changes unless they directly affect the login flow.

---

## 3. Core Rule

The login flow must pass through the approved server boundary.

That means:

- the client submits credentials to the internal login API route
- the internal login API route communicates with Strapi
- the internal login API route sets the auth cookie
- the client reacts to the result and navigates appropriately

The client must never take ownership of auth-cookie or JWT storage.

---

## 4. Standard Login Flow

The approved flow is:

1. user enters credentials in the login form
2. login form submits to `/api/auth/login`
3. internal login route sends credentials to Strapi
4. Strapi returns JWT + user payload on success
5. internal login route sets the HTTP-only auth cookie
6. internal login route returns a safe redirect target
7. client navigates to that redirect target
8. middleware and protected app routes now see the authenticated session

This flow must remain intact.

---

## 5. Login Ownership Rules

### Client owns:

- form rendering
- loading state
- success/error UI
- safe handling of returned redirect target
- navigation after successful login

### Internal login API route owns:

- validating request shape
- calling Strapi
- interpreting success/failure from Strapi
- setting the auth cookie
- returning safe response payload

### Middleware owns:

- redirecting authenticated users away from login
- protecting `/app/*`

Do not blur these responsibilities.

---

## 6. Redirect Rule

After successful login:

- use the approved safe `from` value if provided and valid
- otherwise fall back to the default app landing route

Do not trust raw redirect input from query params or request payload without validation.

The login flow must use the existing safe return-path rules already defined in the members-area architecture.

---

## 7. Error Handling Rule

Login failures must remain user-safe and consistent.

Expected handling:

- invalid credentials → show the approved invalid-credentials message
- network failure → show the approved network message
- unavailable auth/backend failure → show the approved login-unavailable message
- expired-session re-entry (`reason=session`) → show the approved session-expired message

Do not expose raw Strapi errors directly to users.

---

## 8. Loading State Rule

During login submission:

- disable the form submit action
- show a clear pending state
- prevent duplicate submissions
- keep the UI calm and deterministic

Do not allow repeated clicks to create multiple concurrent login attempts.

---

## 9. Safe Request Pattern

The login form should submit to the internal API route, not directly to Strapi.

### Correct pattern

```ts
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    identifier,
    password,
    from,
  }),
});
```
````

The returned payload should then drive:

- error presentation
- redirect/navigation

Do not store auth tokens in client state.

---

## 10. Correct Response Pattern

The internal login route should return a safe JSON response shaped for the client.

Typical response expectations:

### Success

- `ok: true`
- `redirectTo`
- optional safe user summary

### Failure

- `ok: false`
- approved user-facing error message

Do not return raw backend exception detail.

---

## 11. Correct Login Route Behaviour

The internal login route must:

- parse and validate the request body
- verify required credentials exist
- call the Strapi auth endpoint
- map Strapi failures to approved user-facing errors
- set the auth cookie on success
- return a safe redirect target

Do not let the client set the cookie itself.

---

## 12. Correct Usage Pattern

### Client-side login submission example

```ts
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    identifier: email,
    password,
    from,
  }),
});

const result = await response.json();

if (!response.ok || !result.ok) {
  setError(result.error ?? "We’re unable to sign you in right now. Please try again.");
  return;
}

router.push(result.redirectTo);
router.refresh();
```

### Internal login route expectations

The route should:

- call Strapi
- set the auth cookie through the approved auth-cookie helper
- validate `from` using the approved safe return-path helper
- fall back to the default app route when needed

---

## 13. What Not to Do

### Do not call Strapi directly from the login form

Wrong:

```ts
await fetch(`${STRAPI_URL}/api/auth/local`, ...)
```

### Do not store JWT in localStorage or sessionStorage

Wrong:

```ts
localStorage.setItem("jwt", token);
```

### Do not set auth cookies from client-side code

Wrong:

- `document.cookie = ...`
- custom browser token persistence

### Do not trust raw redirect input

Wrong:

```ts
router.push(searchParams.get("from") || "/app");
```

without validation.

### Do not expose raw backend messages

Wrong:

- rendering raw Strapi error text
- showing stack traces
- passing backend response bodies straight to the user

### Do not invent alternate login flows without instruction

Do not create a second auth path that bypasses the approved `/api/auth/login` route.

---

## 14. Anti-Patterns

Avoid:

- direct frontend-to-Strapi login coupling
- client-owned token storage
- unvalidated post-login redirects
- duplicated login error-copy logic
- multi-step custom login handling when the simple approved flow is sufficient
- silent login failure states with no clear user messaging

---

## 15. Validation Steps

After changing the login flow, validate:

1. valid credentials sign in successfully
2. auth cookie is set through the internal route
3. signed-in user can access `/app/*`
4. invalid credentials show the approved error message
5. network failure shows the approved error message
6. `from` redirects only when safe
7. invalid `from` falls back to the default app landing route
8. authenticated visit to `/login` redirects away correctly
9. no token is exposed to client storage

If available, validate with a live Strapi environment.

---

## 16. Completion Checklist

Before considering the login-flow change complete, confirm:

- [ ] the form submits to `/api/auth/login`
- [ ] the internal route owns Strapi communication
- [ ] the internal route sets the auth cookie
- [ ] no client-side token storage was introduced
- [ ] login redirects use safe validated paths
- [ ] approved login error messages are preserved
- [ ] loading state prevents duplicate submissions
- [ ] no raw backend error text is exposed

---

## 17. Summary

This skill protects one of the highest-risk parts of the Fixtura Members Area by keeping login flow responsibilities clear, cookie-setting server-owned, and redirect/error handling consistent.

Use it whenever the sign-in experience or login route is modified, and do not let the client become responsible for session ownership.
