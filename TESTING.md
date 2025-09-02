# Testing Guidelines

Concise rules for writing, organizing, and running tests.

## What to test

- Public behavior: props, events, conditional render, state via user actions.
- Critical logic: pure functions, mappers, guards, branches.
- Edge cases: empty/invalid inputs, loading, error states.

Avoid testing implementation details or 3rd‑party internals.

## Structure

- Co‑locate tests: `Thing.tsx` → `Thing.test.tsx`.
- One `describe` per unit; multiple `it` cases for behaviors.
- Prefer Testing Library queries by role/label; minimize snapshots.

## Setup

- Vitest + jsdom via `vite.config.ts` and `vitest.setup.ts`.
- Use `@testing-library/react` helpers (`render`, `screen`).

Example

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
```

## When to add/update tests

- New component/hook/utility → add `.test.tsx`/`.test.ts` next to it.
- Bug fix → write failing test first, then fix.
- Behavior change → update tests to match new contract.

## Git automation

- Pre‑commit: auto‑creates TODO test stubs for new components and runs staged tests.
- Pre‑push: runs full suite.

## Commands

- All: `npm run test`
- Watch: `npm run test:watch`
- Coverage: `npm run test:coverage`
