# Skill — Login Flow

## 1. Purpose

This skill defines how to safely implement or modify the login flow for the Fixtura Members Area using the **API Data Layer**.

It ensures:

- Login behavior remains aligned with the Strapi JWT auth model.
- Cookie-setting stays server-owned (via the internal proxy route).
- Redirect behavior stays safe and predictable.
- Implementation uses the canonical `useLogin` hook.

---

## 2. When to Use This Skill

Use this skill when:

- Editing the login form UI.
- Changing login submission behavior.
- Modifying the authentication service layer (`auth.api.ts`).
- Changing post-login redirect logic.

---

## 3. Core Rule: The Data Layer Pipeline

The login flow must follow the standard 4-layer API pipeline:

1. **Registry**: `/api/auth/login` must be defined in `route-definitions.ts`.
2. **Client**: The request passes through `fetch-client.ts` to pick up global error handling.
3. **Service**: The call is wrapped in `authApi.login()` in `auth.api.ts`.
4. **Hook**: The UI component uses the `useLogin()` mutation hook.

---

## 4. Required Implementation Pattern

### The Service Call (`src/lib/api/services/auth.api.ts`)

```typescript
export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse, LoginRequest>(appRoutes.auth.login.path, body),
};
```

### The Component Usage (`LoginForm.tsx`)

```typescript
const login = useLogin();

async function onSubmit(values: LoginValues) {
  try {
    await login.mutateAsync({
      identifier: values.email,
      password: values.password,
    });
    // Handle success (toast, navigate)
  } catch (error) {
    // Handle error (feedback)
  }
}
```

---

## 5. Success/Failure Rules

- **Success**: The internal `/api/auth/login` route sets the HTTP-only cookie. The UI should then invalidate the `auth` query keys and navigate to **`/select-organisation`** by default (or a validated `from` path). Safe return paths must pass **`isSafeAppReturnPath`** — only scoped members URLs under **`/o/{accountId}/...`** (positive integer account id) are allowed, not legacy flat `/dashboard` routes.
- **Failure**: Errors must be caught and displayed using the approved `AUTH_ERROR_MESSAGES`. Do not surface raw server strings.

---

## 6. What Not to Do

- **Do not use raw `fetch()`**: Always use the `useLogin` hook.
- **Do not store JWT in client state**: The token belongs in the HTTP-only cookie set by the server.
- **Do not bypass the safe return-path check**: Always validate the `from` query parameter before redirecting.

---

## 7. Verification Checklist

- [ ] Login submission uses `useLogin()` hook.
- [ ] Form is disabled during `isPending` state.
- [ ] Successful login clears/invalidates TanStack Query cache.
- [ ] Redirects use `isSafeAppReturnPath` validation (scoped `/o/...` only; default landing **`ROUTES.selectOrganisation`**).
- [ ] Auth cookie is confirmed as `httpOnly` and `Secure` in the browser.
