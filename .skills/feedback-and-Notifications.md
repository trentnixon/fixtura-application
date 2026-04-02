# Skill — Feedback and Notifications

## 1. Purpose

This skill defines how user feedback and notifications should be presented in the Fixtura Members Area.

It exists to ensure:

- consistent messaging across the app
- clear communication of system events
- predictable use of toasts, alerts, and inline feedback
- alignment with UI state and form patterns
- calm, non-intrusive user experience

This skill should be used whenever displaying feedback to the user.

---

## 2. When to Use This Skill

Use this skill when:

- showing toast notifications
- displaying inline success or error messages
- presenting system alerts or banners
- handling form feedback
- responding to API actions
- communicating background events

Do not use this skill for core UI state rendering (use `ui-state-patterns`).

---

## 3. Core Rule

Feedback must be clear, minimal, and purposeful.

That means:

- only show feedback when necessary
- keep messages short and understandable
- avoid overwhelming the user with notifications

---

## 4. Feedback Types

### 4.1 Toasts

Used for:

- short-lived feedback
- non-blocking events
- background confirmations

Examples:

- “Saved successfully”
- “Item deleted”

Toasts should:

- appear briefly
- not interrupt workflow
- be dismissible or auto-dismiss

---

### 4.2 Inline Messages

Used for:

- form validation
- contextual errors
- small feedback within a component

Examples:

- “Email is required”
- “Invalid input”

Inline messages should:

- appear close to the relevant element
- be clearly associated with the action

---

### 4.3 Alerts / Banners

Used for:

- important system messages
- global issues
- warnings

Examples:

- “Your session has expired”
- “System maintenance in progress”

Alerts should:

- be clearly visible
- use minimal styling
- not overwhelm the page

---

## 5. Messaging Rule

All messages must be:

- clear
- calm
- non-technical
- actionable where appropriate

Good examples:

- “Something went wrong. Please try again.”
- “You don’t have access to this.”
- “Saved successfully.”

Avoid:

- technical jargon
- internal system references
- vague messaging

---

## 6. Tone Rule

Tone should be:

- professional
- neutral
- supportive

Avoid:

- overly casual language
- marketing tone
- overly dramatic messaging

---

## 7. Timing Rule

Feedback should:

- appear at the right moment
- not persist longer than needed
- not disappear too quickly

Toasts:

- short duration
- optional manual dismissal

Inline messages:

- persist until resolved

---

## 8. Kitchen Sink Reference Rule

Before adding feedback UI:

- check `/app/kitchen-sink/toasts`
- check `/app/kitchen-sink/states`

Match approved patterns.

---

## 9. shadcn Rule

Use shadcn components for:

- toasts
- alerts
- form messages

Extend them as needed, but keep consistent styling.

---

## 10. Correct Usage Pattern

### Example toast

```ts
toast({
  title: "Saved successfully",
});
```

### Example inline error

```tsx
<p className="text-destructive">Invalid input</p>
```

---

## 11. What Not to Do

### Do not show unnecessary feedback

Wrong:

- showing toast for every small action

---

### Do not expose backend errors

Wrong:

- raw API messages
- error codes without context

---

### Do not mix feedback types incorrectly

Wrong:

- using toast for form validation
- using inline message for global errors

---

### Do not overwhelm the user

Wrong:

- multiple toasts at once
- stacked alerts with no hierarchy

---

## 12. Anti-Patterns

Avoid:

- inconsistent message tone
- different styles of error messages across pages
- excessive notifications
- unclear or vague feedback
- mixing success and error styles inconsistently

---

## 13. Validation Steps

After adding feedback:

1. message is clear and non-technical
2. correct feedback type is used
3. timing feels appropriate
4. matches kitchen sink patterns
5. does not overwhelm UI
6. aligns with UI state patterns

---

## 14. Completion Checklist

Before considering feedback complete, confirm:

- [ ] message is clear and concise
- [ ] correct feedback type used
- [ ] no backend errors exposed
- [ ] tone is consistent
- [ ] kitchen sink patterns followed
- [ ] UI remains clean and calm

---

## 15. Summary

This skill ensures that all feedback and notifications in the Fixtura Members Area are consistent, clear, and user-friendly.

Use it whenever communicating with the user, and prioritise clarity and restraint.
