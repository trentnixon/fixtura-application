````md
# Skill — Logout Flow

## 1. Purpose

This skill defines how to safely implement or modify logout behaviour in the Fixtura Members Area.

It exists to ensure:

- all logout paths behave consistently
- auth-cookie clearing remains centralised
- client state is cleaned up correctly
- session-expiry and manual logout follow the same system rules
- logout changes do not create stale UI or broken auth state

This skill should be used whenever logout behaviour, session invalidation handling, or sign-out UI is changed.

---

## 2. When to Use This Skill

Use this skill when:

- adding or editing a logout button
- changing `/api/auth/logout`
- changing forced sign-out behaviour after `401`
- changing session-expiry handling
- changing post-logout redirect behaviour
- changing client cleanup after logout
- adding logout-related debug or messaging behaviour

Do not use this skill for login submission changes, middleware route matching changes, or general protected-page work unless they directly affect logout.

---

## 3. Core Rule

All logout paths must converge through the approved logout mechanism.

That means:

- logout should go through the internal logout API route
- the internal logout API route clears the auth cookie
- client state cleanup happens through the approved client-side logout path
- redirect after logout follows the established redirect rules

Do not create alternate logout flows that bypass the approved system.

---

## 4. Standard Logout Flow

The approved logout flow is:

1. a logout action is triggered
2. client calls the approved logout request helper
3. internal logout API route clears the auth cookie
4. client clears local cached/session-aware UI state
5. client navigates to the approved post-logout destination
6. middleware now treats the user as signed out

This same flow should also be used when session invalidation is triggered by auth failure.

---

## 5. Logout Ownership Rules

### Client owns:

- logout button interaction
- loading/disabled state during logout
- post-logout UI cleanup
- redirect/navigation after logout
- success/failure messaging where appropriate

### Internal logout API route owns:

- clearing the auth cookie
- returning a safe success response

### API/auth layer owns:

- forcing logout when `401` means the session is invalid
- using the approved redirect pattern for expired session handling

### Middleware owns:

- treating future protected requests as signed out once the cookie is gone

Do not blur these responsibilities.

---

## 6. Manual Logout vs Forced Logout

### Manual logout

This happens when the user intentionally clicks sign out.

Expected behaviour:

- clear auth cookie through the internal logout route
- clear client-side query/cache state
- redirect to the approved logged-out destination
- optionally show the approved signed-out confirmation

### Forced logout

This happens when the system detects the session is no longer valid, such as after `401`.

Expected behaviour:

- clear auth cookie through the same approved logout path
- clear client-side query/cache state
- redirect to the approved session-expired login path
- show the approved session-expired message, not a generic logout message

These are related flows, but messaging and redirect targets may differ.

---

## 7. Redirect Rule

Logout must use the established redirect rules.

Typical expectations:

- manual logout → default logout destination
- session invalidation → login route with session-expired reason

Do not hardcode inconsistent redirect behaviour in multiple places.

Use the approved redirect helpers/config already defined in the members-area architecture.

---

## 8. Client Cleanup Rule

After logout, the client must not keep stale authenticated state.

Cleanup may include:

- clearing query cache
- resetting auth-aware client state
- refreshing navigation context
- removing protected-page data from view

Do not leave protected data visible after logout has completed.

---

## 9. Correct Client Pattern

The client should use the approved logout helper.

### Correct pattern

```ts
await postLogoutRequest();
```
````

After that, apply the approved cleanup + redirect behaviour.

Do not duplicate cookie-clearing logic in the client.

---

## 10. Correct Logout Route Behaviour

The internal logout route must:

- clear the auth cookie through the approved cookie helper
- return a simple success response
- avoid business logic
- avoid feature-specific branching

The route should remain very small and deterministic.

---

## 11. Correct Usage Pattern

### Example client logout action

```ts
await postLogoutRequest();
queryClient.clear();
router.push("/login");
router.refresh();
```

### Example logout route expectation

The route should:

- build a response
- clear the auth cookie
- return `{ ok: true }`

That is enough for the initial members-area auth boundary.

---

## 12. What Not to Do

### Do not clear auth by inventing client-only state resets

Wrong:

```ts
setSession(null);
router.push("/login");
```

without actually clearing the server-owned auth cookie.

### Do not bypass the logout API route

Wrong:

- clearing cookie-like state only in the browser
- creating a second sign-out endpoint unnecessarily

### Do not mix manual logout and expired-session messaging

Wrong:

- showing “You’ve been signed out” when the actual case is session expiry
- showing inconsistent redirect behaviour depending on where logout was triggered

### Do not leave query/cache state alive after logout

Wrong:

- keeping user-specific data mounted
- relying on route change alone to clear all client state

### Do not expose raw logout/network failures to the user

Use approved safe copy.

---

## 13. Anti-Patterns

Avoid:

- duplicate logout implementations
- cookie clearing outside the approved route/helper path
- stale authenticated UI after logout
- inconsistent redirect destinations
- different logout behaviour depending on which component triggered it
- mixing sign-out logic into unrelated feature components

---

## 14. Validation Steps

After changing logout flow, validate:

1. manual logout clears the auth cookie
2. manual logout clears client-side cached state
3. manual logout redirects to the approved destination
4. signed-out user can no longer access protected routes
5. `401`-driven invalidation also clears the session correctly
6. session-expired flow uses the approved session-expired redirect/message
7. no stale protected data remains visible after logout
8. no alternate logout path was introduced

If available, validate both browser interaction and API-triggered session invalidation.

---

## 15. Completion Checklist

Before considering the logout-flow change complete, confirm:

- [ ] logout uses the approved logout request helper
- [ ] the internal logout route clears the auth cookie
- [ ] client-side cache/state cleanup occurs after logout
- [ ] manual logout redirect matches the approved rule
- [ ] session-expiry logout redirect matches the approved rule
- [ ] no duplicate logout logic was introduced
- [ ] no stale protected data remains after logout
- [ ] no raw backend/network error text is exposed

---

## 16. Summary

This skill keeps logout behaviour consistent across the Fixtura Members Area by ensuring every sign-out path clears the server-owned session correctly, cleans up client state, and follows the established redirect and messaging rules.

Use it whenever logout or session invalidation behaviour changes, and do not allow multiple competing logout patterns to emerge.
