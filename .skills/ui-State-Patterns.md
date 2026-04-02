# Skill — UI State Patterns

## 1. Purpose

This skill defines the standard UI patterns for representing application states inside the Fixtura Members Area.

It exists to ensure:

- consistent handling of loading, empty, and error states
- predictable user experience across all pages
- alignment with auth, API, and session behaviour
- reusable and recognisable state patterns
- no missing or ambiguous UI states

This skill should be used whenever a component or page needs to represent a system or data state.

---

## 2. When to Use This Skill

Use this skill when:

- loading data in a page or component
- displaying empty data sets
- handling API errors
- showing access-denied states
- handling session expiry UI
- building feedback UI for async operations
- designing fallback or failure states

Do not use this skill for layout rules or component structure alone.

---

## 3. Core Rule

Every data-driven UI must handle its states explicitly.

At minimum, consider:

- loading
- empty
- error

Do not leave the UI in an undefined or ambiguous state.

---

## 4. Standard State Set

### 4.1 Loading State (Branded)

Used when:

- waiting for API data
- resolving session state
- performing async actions

Expected behaviour:

- **Full Page**: Use `BrandedLoader` with `fullPage` prop for initial hydration.
- **In-Place**: Use `BrandedLoader` with `size="md"` or `size="sm"` for local containers.
- **Content Placeholder**: Use `Skeleton` (from `ui/skeleton`) or pre-built `CardBlockSkeleton` / `ListItemSkeleton`.

Do not:

- leave blank space with no feedback
- flash incorrect data before loading completes

---

### 4.2 Empty State

Used when:

- no data exists
- filters return no results
- initial state has no content

Expected behaviour:

- clear message
- optional guidance (e.g. “Create your first…”)
- calm and minimal UI

Do not:

- show empty containers with no explanation
- confuse empty with error

---

### 4.3 Error State

Used when:

- API request fails
- unexpected issue occurs
- data cannot be loaded

Expected behaviour:

- clear, non-technical message
- optional retry action
- consistent styling across the app

Do not:

- show raw backend errors
- expose stack traces or debug info

---

### 4.4 Access Denied State

Used when:

- user is authenticated
- but not allowed to access resource

Expected behaviour:

- clear “no permission” message
- no logout triggered
- consistent visual pattern

---

### 4.5 Session Expired State

Used when:

- session is no longer valid
- detected via API or session layer

Expected behaviour:

- transition to login via approved flow
- show session-expired message
- do not leave user inside broken UI

---

## 5. State Priority Rule

States should be handled in a clear order.

Typical order:

1. loading
2. error
3. empty
4. success (data display)

Do not mix multiple states at once.

---

## 6. Kitchen Sink Reference Rule

Before implementing a state:

- check `/app/kitchen-sink/loading`
- check `/app/kitchen-sink/toasts` (for transient feedback)
- check `/app/kitchen-sink/containers` (for state wrappers)

Match the approved patterns.

---

## 7. Correct Usage Pattern

### Example state handling

```tsx
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ErrorState } from "@/components/feedback/error-state"; // Example component
import { EmptyState } from "@/components/ui/empty-state";

if (loading) {
  return <BrandedLoader label="Fetching project details..." />;
}

if (error) {
  return <ErrorState message="We couldn't load the audit data." />;
}

if (!data.items.length) {
  return <EmptyState title="No Audits Found" description="Start by running your first scan." />;
}

return <DataView data={data} />;
```

---

## 8. Component Strategy

State UI should be:

- reusable where possible
- consistent across pages
- simple and focused

Prefer:

- shared `BrandedLoader`
- shared `ErrorState`
- shared `EmptyState`

Avoid:

- rewriting state UI per component
- inconsistent styling between states

---

## 9. Messaging Rule

All state messages must be:

- clear
- calm
- non-technical
- actionable where possible

Examples:

- “No results found.”
- “Something went wrong. Please try again.”
- “You don’t have access to this.”

---

## 10. What Not to Do (Anti-Patterns)

### Do not leave blank UI

- Wrong: empty screen with no explanation

### Do not mix states

- Wrong: showing loading and data together

### Do not expose backend details

- Wrong: raw API response or stack traces

### Do not handle states inconsistently

- Wrong: different loading UI per page or different error message styles

---

## 11. Validation Steps

After implementing UI states, validate:

1. loading state appears correctly (branded)
2. empty state is clear and intentional
3. error state is consistent and helpful
4. access denied is handled without logout
5. session expiry triggers correct flow
6. no ambiguous UI state exists
7. patterns match kitchen sink references

---

## 12. Completion Checklist

Before considering state handling complete, confirm:

- [ ] branded loader implemented
- [ ] empty state implemented
- [ ] error state implemented
- [ ] access denied handled where relevant
- [ ] session expiry handled correctly
- [ ] messaging is clear and non-technical
- [ ] kitchen sink patterns followed

---

## 13. Summary

This skill ensures that all UI states in the Fixtura Members Area are handled consistently, clearly, and predictably. Use the `BrandedLoader` and `Skeleton` systems to provide high-fidelity feedback during all system operations.
