````md
# Skill — Dev Debug Extension

## 1. Purpose

This skill defines how to safely add, modify, or extend development-only debugging tools inside the Fixtura Members Area.

It exists to ensure:

- debugging visibility is improved during development
- auth, routing, and API behaviour are easy to inspect
- debug tools do not affect production behaviour
- no sensitive data is exposed
- debug logic does not leak into core application logic

This skill should be used whenever dev-only debug UI, logging, or instrumentation is introduced or modified.

---

## 2. When to Use This Skill

Use this skill when:

- editing the Dev Debug Panel
- adding new debug fields to the UI overlay
- adding middleware debug logging
- exposing safe session or route state for debugging
- tracking API failures for development visibility
- adding temporary build-time instrumentation

Do not use this skill for production analytics, logging pipelines, or user-facing features.

---

## 3. Core Rule

All debug tooling must be development-only and non-invasive.

That means:

- it must not run in production
- it must not change application behaviour
- it must not introduce new dependencies for core logic
- it must not expose sensitive information

Debugging is an observation layer, not a control layer.

---

## 4. Environment Rule

All debug UI and logic must be gated by environment.

Approved pattern:

```ts
if (process.env.NODE_ENV !== "development") return null;
```
````

or equivalent gating in middleware or utilities.

No debug UI or logging should appear in production builds.

---

## 5. Allowed Debug Data

You may display:

- current pathname
- query parameters
- session status (authenticated / not)
- safe user identifiers (email or username if already exposed in UI)
- session expiry timestamps (derived, not raw token)
- last API error status and endpoint
- high-level middleware decision context (via console logs)

---

## 6. Restricted Data

You must not display:

- JWT tokens
- raw cookies
- authorization headers
- backend secrets
- raw backend error payloads
- full user objects if not already approved for UI use

Debug tools must never expose sensitive or security-relevant information.

---

## 7. Debug Panel Rules

The Dev Debug Panel must:

- be visually lightweight
- be non-blocking (fixed overlay)
- not interfere with interaction
- be easy to remove or disable
- update based on route/session changes

The panel should be mounted at layout level, not inside individual feature components.

---

## 8. API Debug Tracking Rule

When tracking API errors:

- store only minimal metadata (status, endpoint)
- do not store request bodies
- do not store headers
- expose data only in development
- avoid creating persistent global state that leaks across sessions

Example safe tracking shape:

```ts
{
  status: number;
  url: string;
}
```

---

## 9. Middleware Debug Rule

Middleware debugging must use console logs only.

Approved pattern:

```ts
if (process.env.NODE_ENV === "development") {
  console.log("[middleware]", {
    pathname,
    hasToken,
  });
}
```

Do not attempt to render UI from middleware.

Do not log sensitive values such as tokens.

---

## 10. Debug Isolation Rule

Debug logic must be isolated from core logic.

That means:

- no production code should depend on debug variables
- no feature behaviour should change because debug mode is active
- debug utilities should not be imported into core business logic unnecessarily

If debug tooling is removed, the application must behave identically.

---

## 11. Correct Usage Pattern

### Example: Dev Debug Panel mount

```tsx
{
  process.env.NODE_ENV === "development" && <DevDebugPanel />;
}
```

### Example: safe session display

```tsx
<div>{session?.authenticated ? "AUTH" : "NO AUTH"}</div>
```

### Example: API error display

```tsx
<div>
  Last API: {lastError?.status} ({lastError?.url})
</div>
```

---

## 12. What Not to Do

### Do not expose auth tokens

Wrong:

```ts
<div>{token}</div>
```

### Do not run debug logic in production

Wrong:

- always-mounted debug panel
- logging without environment guard

### Do not couple debug state to feature logic

Wrong:

- feature behaviour changing based on debug flags
- debug variables influencing auth or routing decisions

### Do not persist debug data across sessions unnecessarily

Wrong:

- storing debug info in localStorage without reason
- leaking debug state between unrelated flows

---

## 13. Anti-Patterns

Avoid:

- debug UI that overlaps or blocks core UI
- excessive logging that obscures useful information
- logging entire objects instead of targeted fields
- exposing raw backend responses for convenience
- building debug tools that become required for app functionality
- forgetting to gate debug logic behind environment checks

---

## 14. Validation Steps

After adding or modifying debug tooling, validate:

1. debug UI appears only in development
2. no debug UI appears in production build
3. no sensitive data is visible in the panel
4. middleware logs show expected route/auth behaviour
5. API tracking reflects real failures correctly
6. debug tooling does not affect routing, auth, or API behaviour
7. removing the debug panel does not break any functionality

---

## 15. Completion Checklist

Before considering the debug extension complete, confirm:

- [ ] debug logic is gated to development only
- [ ] no sensitive data is exposed
- [ ] debug UI is non-blocking and minimal
- [ ] middleware logging is safe and useful
- [ ] API tracking is minimal and safe
- [ ] debug code does not affect application logic
- [ ] debug tooling can be removed without side effects

---

## 16. Summary

This skill ensures that debugging enhancements improve developer visibility without compromising security, performance, or architectural integrity.

Use it whenever you extend the dev debug system, and keep debug tooling strictly observational and development-only.
