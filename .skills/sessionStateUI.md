````md
# Skill — Session State UI

## 1. Purpose

This skill defines how to safely build UI that reacts to session state inside the Fixtura Members Area.

It exists to ensure:

- client-side session awareness is used correctly
- UI stays aligned with middleware as the protection boundary
- loading and transition states are handled cleanly
- expired-session behaviour is communicated consistently
- session-aware UI does not become a second auth system

This skill should be used whenever session state is shown, consumed, or reacted to in the client UI.

---

## 2. When to Use This Skill

Use this skill when:

- using `useSession()` or similar session hooks
- showing logged-in user UI
- rendering session-aware layout or navigation
- adding loading states while session resolves
- reacting to session expiry in the client
- building a session boundary component
- showing session-related status or messaging in development/debug tooling

Do not use this skill for middleware changes, login submission changes, or route-protection logic itself.

---

## 3. Core Rule

Client-side session state is for UI awareness only.

It is not the source of truth for access control.

That means:

- middleware decides whether a protected route may be accessed
- the client uses session state to improve UX
- session hooks must not replace route protection
- protected UI should not invent its own access rules

---

## 4. Ownership Rules

### Middleware owns:

- route-level access control
- signed-out redirect enforcement
- redirecting signed-in users away from login

### Session-aware UI owns:

- loading states
- session-dependent display
- expired-session messaging
- “signing you out” transitions
- safe rendering behaviour while session state resolves

### API/auth layer owns:

- session invalidation on `401`
- central logout behaviour
- session-expiry redirect behaviour

Do not blur these responsibilities.

---

## 5. Approved Uses of Session State in UI

Session state may be used to:

- show a loading skeleton while session resolves
- display safe user information already approved for UI use
- conditionally show UI affordances such as user labels or sign-out controls
- react to an expired session and transition the user safely
- support development-only debugging displays

Session state must not be used to decide whether a protected route should exist.

---

## 6. Session Loading Rule

While session is resolving, the UI should remain stable.

Preferred behaviour:

- show a loading or skeleton state
- avoid flashing protected content before the session check is complete
- avoid showing contradictory UI such as both signed-in and signed-out states briefly

This is especially important in layout-level session boundaries.

---

## 7. Expired Session Rule

If session-aware UI detects that the session is no longer valid:

- use the approved logout/invalidation path
- redirect using the approved session-expired redirect rule
- show the approved session-expired message
- do not leave the user inside stale protected UI

Do not invent a separate expired-session flow in individual components.

---

## 8. Correct Pattern

Session hooks should be used as a UI input, not a protection gate.

### Correct examples

- rendering a session loading skeleton
- showing a user email in the app chrome
- showing a “Signing you out…” state
- rendering a session-expired message in the login area

### Incorrect examples

- `if (!session) redirect("/login")` inside a protected page
- hiding route content as a substitute for middleware
- building a separate client-only auth gate that overrides system behaviour

---

## 9. Correct Usage Pattern

### Example session-aware component

```tsx
"use client";

import { useSession } from "@/hooks/use-session";

export function SessionStatus() {
  const { data, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading session…</div>;
  }

  if (!data?.authenticated) {
    return <div>Session unavailable.</div>;
  }

  return <div>Signed in as {data.user?.email ?? "member"}</div>;
}
```
````

### Example layout-level awareness

A session boundary may:

- show a loading skeleton first
- verify session-expiry conditions
- trigger approved logout/invalidation if needed
- render children only when the session-aware UI is stable

---

## 10. What Not to Do

### Do not use session UI state as route protection

Wrong:

```ts
if (!session) {
  router.push("/login");
}
```

inside a protected page as the main protection mechanism.

### Do not duplicate middleware logic in React

Wrong:

- re-checking route entitlement in every page
- building custom “is this protected?” logic in components

### Do not expose sensitive data in session-aware UI

Wrong:

- token values
- raw JWT payload
- internal backend-only claims not approved for UI use

### Do not create multiple session meanings

Wrong:

- one component treating missing session as logout
- another treating it as loading forever
- another treating it as an access-denied state

Keep session-state meanings consistent.

---

## 11. Anti-Patterns

Avoid:

- auth drift from middleware into the UI layer
- flashing protected content before session resolves
- stale user info after logout
- per-component session-expiry implementations
- raw backend/session payloads shown directly in the UI
- session hooks used as if they were security controls

---

## 12. Validation Steps

After changing session-aware UI, validate:

1. protected routes still depend on middleware, not the UI layer
2. loading state appears while session resolves
3. no protected-content flash occurs before session is stable
4. expired-session handling follows the approved invalidation path
5. logout clears session-aware UI correctly
6. no sensitive session data is exposed in components
7. all session-related messaging remains consistent with the auth system

If possible, validate both normal page load and refresh/load transitions.

---

## 13. Completion Checklist

Before considering the session-state UI change complete, confirm:

- [ ] session state is used for UI awareness only
- [ ] no page-level route protection was added
- [ ] loading state is handled cleanly
- [ ] expired-session handling uses the approved invalidation path
- [ ] no sensitive auth/session details are exposed
- [ ] no stale user UI remains after logout
- [ ] session-related messaging remains consistent

---

## 14. Summary

This skill protects the boundary between security and UX by ensuring session state is used only to support interface behaviour, not to replace middleware or redefine auth rules.

Use it whenever you build session-aware UI in the Fixtura Members Area, and do not let client-side session state become a second protection system.
