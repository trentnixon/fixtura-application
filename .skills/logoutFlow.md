# Skill — Logout Flow

## 1. Purpose

This skill defines how to safely implement or modify logout behavior in the Fixtura Members Area using the **API Data Layer**.

It ensures:

- All logout paths (manual and forced) behave consistently.
- Auth-cookie clearing remains centralized in the Registry/Service layer.
- Client state (TanStack Query) is cleaned up correctly.
- Implementation uses the canonical `useLogout` hook.

---

## 2. When to Use This Skill

Use this skill when:

- Adding or editing a logout button.
- Changing the logout service layer (`auth.api.ts`).
- Modifying the automatic forced sign-out behavior in `fetch-client.ts`.
- Changing post-logout redirect destinations.

---

## 3. Manual vs. Forced Logout

### Manual Logout

User intentionally clicks "Log out".

1. **Hook**: Use `useLogout()`.
2. **Action**: `await logout.mutateAsync()`.
3. **Result**: Hook clears all query caches and redirects to login.

### Forced Logout (Session Expired)

The system detects an invalid session (HTTP 401).

1. **Detection**: Handled globally in `fetch-client.ts`.
2. **Action**: Centralized `handleUnauthorized()` function clears cookies and redirects.
3. **Feedback**: User is sent to login with `?reason=session`.

---

## 4. Required Implementation Pattern

### The Service Call (`src/lib/api/services/auth.api.ts`)

```typescript
export const authApi = {
  logout: () => apiClient.post<void, undefined>(appRoutes.auth.logout.path, undefined),
};
```

### The Component Usage (`LogoutButton.tsx`)

```typescript
const logout = useLogout();

async function handleLogout() {
  try {
    await logout.mutateAsync();
    toast.success(AUTH_ERROR_MESSAGES.loggedOut);
  } catch (error) {
    // Handle error (feedback)
  }
}
```

---

## 5. What Not to Do

- **Do not manually clear `localStorage`**: The auth cookie is the source of truth.
- **Do not forget to clear the Query Cache**: Leaving stale data visible after logout is a security risk. Use `queryClient.clear()` (built into `useLogout`).
- **Do not duplicate logout logic**: All logout actions must go through the Registry-defined `/api/auth/logout` path.

---

## 6. Verification Checklist

- [ ] Logout action uses `useLogout()` hook.
- [ ] Button shows a "Signing out..." pending state.
- [ ] TanStack Query cache is confirmed clear after logout.
- [ ] User is redirected to the correct login or landing page.
- [ ] Auth cookie is confirmed removed from the browser.
