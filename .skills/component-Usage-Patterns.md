# Skill — Component Usage Patterns

## 1. Purpose

This skill defines how components should be used, extended, and composed inside the Fixtura Members Area.

It exists to ensure:

- consistent use of shadcn components
- predictable component behaviour
- minimal visual drift
- reuse over duplication
- clean composition patterns across the app

This skill should be used whenever building or modifying UI components.

---

## 2. When to Use This Skill

Use this skill when:

- building a new UI component
- using shadcn components
- composing UI from multiple components
- extending an existing component
- modifying styles of a component
- deciding between reuse vs creating new components

Do not use this skill for layout-level concerns (use layout-and-spacing-system) or auth/API behaviour.

---

## 3. Core Rule

Reuse before create.

That means:

- prefer existing components over creating new ones
- extend existing components rather than duplicating them
- keep component patterns consistent across the app

Do not create new components unless necessary.

---

## 4. Component Philosophy

Components should be:

- simple
- composable
- predictable
- consistent

Avoid:

- overly complex components
- one-off designs
- inconsistent styling
- deeply nested component hierarchies

---

## 5. shadcn Usage Rule

shadcn is the base component layer.

Use it as:

- the starting point for UI
- the foundation for buttons, inputs, dialogs, etc.

Rules:

- extend, do not rewrite
- avoid deep overrides unless required
- keep styling aligned with the design system
- use consistent variants

Do not fork or duplicate shadcn components unnecessarily.

---

## 6. Component Composition Rule

Prefer composition over modification.

Correct approach:

- combine smaller components
- wrap components when needed
- build predictable structures

Avoid:

- modifying internal behaviour of shared components
- creating tightly coupled component chains

---

## 7. Variant Rule

Components should use a small, controlled set of variants.

Examples:

- primary
- secondary
- destructive
- outline

Do not:

- invent new variants per feature
- overload components with too many visual options

Variants should remain consistent across the app.

---

## 8. Styling Rule

Component styling must:

- align with layout-and-spacing-system
- align with design-system-foundation
- use consistent spacing and typography
- respect container patterns

Avoid:

- inline style overrides that break consistency
- inconsistent padding/margin values
- mixing multiple styling approaches

---

## 9. Kitchen Sink Reference Rule

Before building or modifying a component:

- check the relevant kitchen sink page
- match the approved usage pattern
- reuse the same structure and spacing

If a new pattern is required:

- implement it cleanly
- add it to the kitchen sink
- keep it consistent going forward

---

## 10. Component Responsibility Rule

Each component should have a clear responsibility.

Examples:

- Button → interaction trigger
- Card → content container
- FeedbackCard / FeedbackCardSoft / FeedbackCardTinted / FeedbackCardStrong → persistent semantic notices (info through premium), not toasts
- FormField → input + label + error
- Dialog → modal interaction

Avoid components that:

- try to handle too many concerns
- mix layout, logic, and styling unpredictably

---

## 11. Correct Usage Pattern

### Example: composing a card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
</Card>
```

### Example: persistent feedback cards (semantic state)

Use `@/components/ui/feedback-card` for ongoing product states that should stay on the page until understood or resolved—distinct from transient toasts. Three visual variants are available as named components; or pass `visualVariant` on `FeedbackCard`.

```tsx
import {
  FeedbackCard,
  FeedbackCardSoft,
  FeedbackCardTinted,
  FeedbackCardStrong,
} from "@/components/ui/feedback-card";

<FeedbackCardSoft
  kind="warning"
  label="Warning"
  title="Action needed"
  description="Short supporting copy."
  primaryCta="Resolve"
/>

<FeedbackCard
  visualVariant="tinted"
  kind="info"
  label="Info"
  title="Next step"
  description="Guidance copy."
  primaryCta="Continue"
/>
```

Reference: `/sandbox/kitchen-sink/cards` (Feedback cards section).

### Example: using a button

```tsx
<Button variant="primary">Save</Button>
```

---

## 12. What Not to Do

### Do not create duplicate components

Wrong:

- creating a new button instead of using existing Button

---

### Do not override styles inconsistently

Wrong:

- custom padding that breaks layout rhythm
- different typography inside similar components

---

### Do not mix component patterns

Wrong:

- multiple card styles with no system
- inconsistent dialog layouts

---

### Do not tightly couple components

Wrong:

- component A depends on component B internal behaviour

---

## 13. Anti-Patterns

Avoid:

- one-off components for single pages
- inconsistent variants across features
- deeply nested component trees
- components that manage unrelated responsibilities
- styling that conflicts with global design rules

---

## 14. Validation Steps

After building or modifying a component:

1. check if an existing component could have been reused
2. verify consistency with kitchen sink examples
3. confirm variant usage is correct
4. confirm spacing and styling match system rules
5. ensure component has a clear responsibility
6. confirm no duplicate patterns were introduced

---

## 15. Completion Checklist

Before considering the component work complete, confirm:

- [ ] existing components were reused where possible
- [ ] shadcn components were extended correctly
- [ ] no duplicate components were created unnecessarily
- [ ] variants are consistent with the system
- [ ] styling follows layout and design rules
- [ ] kitchen sink patterns were referenced
- [ ] component responsibility is clear

---

## 16. Summary

This skill ensures that UI components in the Fixtura Members Area remain consistent, reusable, and aligned with the design system.

Use it whenever building or modifying components, and prioritise reuse and consistency over creating new patterns.
