# Skill — Navigation and Route Management

## 1. Purpose

This skill defines how routes and navigation are created, updated, and maintained inside the Fixtura Members Area.

It exists to ensure:

- routes remain consistent across the application
- navigation is driven from a single source of truth
- redirect behaviour remains predictable
- route strings are not duplicated across components
- future scaling of navigation does not create drift

This skill should be used whenever routes or navigation are added or modified.

---

## 2. When to Use This Skill

Use this skill when:

- adding a new protected page to navigation
- modifying existing routes
- adding links inside the app shell
- updating route constants
- changing redirect targets
- wiring new pages into the sidebar or header

Do not use this skill for middleware logic changes or API-level routing.

---

## 3. Core Rule

Routes must be defined once and reused everywhere.

That means:

- route strings should not be hardcoded in multiple places
- navigation should be driven from configuration
- redirects should use shared route constants

### Members URLs (multi-organisation)

The members app uses `src/app/(members)/` with:

- **Gateway:** `/select-organisation`, `/create-organisation` (no account in URL).
- **Scoped:** `/o/[accountId]/...` — build links with `accountScopedRoutes` in `src/lib/config/account-routes.ts` (Strapi account id).
- **Default after login:** `ROUTES.selectOrganisation`; safe `from` paths only under `/o/{accountId}/...` per `isSafeAppReturnPath`.

Spec: [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](../.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md).

---

## 4. Route Ownership

### Route constants/config own:

- route paths (public + members gateway + **scoped** paths under `/o/[accountId]/...` — use `accountScopedRoutes` in `src/lib/config/account-routes.ts` and `ROUTES` in `src/lib/config/routes.ts`)
- default redirect targets (e.g. post-login **`ROUTES.selectOrganisation`**)
- navigation structure

### Components own:

- rendering links
- triggering navigation actions

Components must not define routes independently.

---

## 5. Navigation Source of Truth

Navigation must be defined in a central config file.

Example intent:

```ts
navigation = [
  {
    label: "Home",
    href: ROUTES.appHome,
  },
  {
    label: "Account",
    href: ROUTES.appAccount,
  },
];
```

This config should drive:

- sidebar
- header navigation
- any reusable navigation components

---

## 6. Adding a New Route

When adding a new protected route:

1. define the route in the route constants/config
2. create the page under the protected route structure
3. add the route to navigation config if needed
4. update any redirect logic if applicable
5. verify route behaviour with middleware

---

## 7. Redirect Rule

All redirects must use shared route definitions.

Correct:

```ts
router.push(ROUTES.selectOrganisation);
// or, for scoped navigation:
router.push(accountScopedRoutes.dashboard(accountId));
```

Incorrect:

```ts
router.push("/dashboard");
```

This prevents:

- typos
- drift when routes change
- inconsistent behaviour across the app

---

## 8. Linking Rule

Use consistent linking patterns:

- `Link` component for navigation UI
- `router.push` for programmatic navigation

Always reference route constants where available.

---

## 9. What Not to Do

### Do not hardcode routes in multiple places

Wrong:

```ts
<Link href="/app/account" />
```

in multiple unrelated files.

---

### Do not duplicate route definitions

Wrong:

- defining `/app/account` in:
  - component A
  - component B
  - navigation config
  - redirect logic

---

### Do not mix relative and absolute route patterns inconsistently

Keep route usage predictable and consistent.

---

### Do not invent routes outside the approved namespace

Protected **members** routes must use either the **gateway** paths (`/select-organisation`, `/create-organisation`, …) or the **scoped** prefix **`/o/{accountId}/...`** (positive integer Strapi account id). Legacy flat paths such as `/dashboard` are redirected by middleware; do not add new features there.

---

## 10. Anti-Patterns

Avoid:

- scattered route strings across the codebase
- navigation defined inside components instead of config
- inconsistent route naming (e.g. mixing ad-hoc `/o/...` strings instead of `accountScopedRoutes`)
- redirects using raw strings
- routes that are not represented in navigation or config

---

## 11. Validation Steps

After adding or modifying routes:

1. route resolves correctly in browser
2. navigation links point to the correct route
3. middleware protects the route correctly
4. redirects land on expected pages
5. no duplicate route strings were introduced
6. route constants/config updated correctly

---

## 12. Completion Checklist

Before considering the task complete, confirm:

- [ ] route defined in central config/constants
- [ ] no duplicate hardcoded route strings exist
- [ ] navigation updated correctly if needed
- [ ] redirects use shared route definitions
- [ ] scoped routes use `accountScopedRoutes` / valid `accountId`; gateway routes use `ROUTES.*`
- [ ] middleware behaviour remains correct

---

## 13. Summary

This skill ensures that navigation and routing remain consistent, scalable, and maintainable across the Fixtura Members Area.

Use it whenever routes or navigation change, and prevent route logic from becoming fragmented across the codebase.
