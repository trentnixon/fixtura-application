# Skill — Layout and Spacing System

## 1. Purpose

This skill defines the layout and spacing system for the Fixtura Members Area.

It exists to ensure:

- pages feel structured and consistent
- spacing is predictable across the app
- layouts are easy to scan and understand
- components align visually across screens
- new UI does not introduce layout drift

This skill should be used whenever building or modifying page layout, containers, or spacing.

---

## 2. When to Use This Skill

Use this skill when:

- building a new page under `/app/*`
- structuring page layout
- creating or modifying containers
- adjusting spacing between elements
- designing card layouts or sections
- building form layouts
- refining visual alignment

Do not use this skill for component logic, API behaviour, or auth handling.

---

## 3. Core Rule

Layout must be consistent, predictable, and structured.

That means:

- spacing should follow a consistent rhythm
- layouts should follow repeatable patterns
- elements should align cleanly
- visual hierarchy should be clear

Do not invent new layout patterns without reason.

---

## 4. Layout Philosophy

The members area should feel:

- structured
- calm
- readable
- functional

Avoid:

- cramped layouts
- overly dense UI
- excessive nesting
- inconsistent spacing

This is a working application, not a marketing page.

---

## 5. Page Structure Pattern

Most pages should follow a consistent structure:

1. Page header
   - title
   - optional description

2. Primary content block
   - main feature content

3. Secondary content (optional)
   - supporting sections
   - additional actions

---

## 6. Container System

Use consistent container patterns:

### Page Container

- defines overall page width
- provides horizontal padding

### Section Container

- groups related content
- separates logical sections

### Card Container

- used for grouped UI elements
- includes padding and border
- default radius is `rounded-xl` (0.75rem)
- **Persistent feedback cards:** for semantic, state-based messaging (info, success, warning, error, critical, premium) that stays visible until the user acts, use `FeedbackCard` / `FeedbackCardSoft` / `FeedbackCardTinted` / `FeedbackCardStrong` from `@/components/ui/feedback-card`—same radius and card language as standard cards; see `/sandbox/kitchen-sink/cards`

### GlassSurface (Premium)

- used for high-trust or dashboard-level containers
- includes glassmorphism (`backdrop-blur-md`)
- standard premium radius is `rounded-[1.25rem]` (20px)

### Form Container

- structured vertical layout
- consistent spacing between inputs (standard `space-y-6`)

Do not mix container styles randomly.

---

## 7. Spacing System

Spacing should follow a consistent scale.

Common spacing intent:

- small spacing → between related elements
- medium spacing → between sections within a component
- large spacing → between major sections on a page

Do not:

- mix arbitrary spacing values
- use inconsistent margins between similar components
- collapse spacing to “make things fit”

---

## 8. Alignment Rule

All elements should align consistently:

- text aligns with container edges
- components align within grid or stack
- vertical rhythm is consistent

Avoid:

- misaligned components
- uneven padding
- inconsistent offsets

---

## 9. Grid vs Stack Rule

Use:

### Stack layout (default)

- vertical flow
- most pages
- forms and lists

### Grid layout

- dashboards
- multi-column layouts
- dense data views

Do not mix grid and stack unnecessarily in the same section.

---

## 10. Component Spacing Rule

Components should:

- have consistent internal padding
- respect external spacing rules
- not override layout spacing unpredictably

Avoid:

- components with custom spacing that breaks layout rhythm
- inconsistent padding across similar components

---

## 11. Kitchen Sink Reference Rule

Before creating or modifying layout:

- check `/sandbox/kitchen-sink/containers`
- check `/sandbox/kitchen-sink/typography` and **`patterns/typography-system.md`** for shared text components
- check `/sandbox/kitchen-sink/cards`

Match those patterns unless a new pattern is intentionally being introduced.

---

## 12. Correct Usage Pattern

### Example page structure

```tsx
import { PageHeader, Section, Surface } from "@/components/ui/container";

export default function Page() {
  return (
    <div className="space-y-12">
      <PageHeader title="Page Title" description="Clear description of this module's purpose." />

      <div className="space-y-6">
        <Surface>Primary content area</Surface>
        <Surface>Supporting content block</Surface>
      </div>
    </div>
  );
}
```

---

## 13. What Not to Do

### Do not invent spacing per page

Wrong:

- random margin values
- inconsistent spacing between similar sections

---

### Do not mix layout styles arbitrarily

Wrong:

- combining grid and stack with no structure
- inconsistent container widths

---

### Do not over-nest containers

Wrong:

- unnecessary wrapper divs
- deeply nested layout structures

---

### Do not collapse spacing to fit content

Wrong:

- reducing spacing instead of restructuring layout

---

## 14. Anti-Patterns

Avoid:

- inconsistent vertical rhythm
- different spacing rules on similar pages
- components that break layout alignment
- content touching container edges without padding
- layouts that feel visually noisy or cramped

---

## 15. Validation Steps

After building or modifying layout:

1. spacing is consistent across the page
2. sections are clearly separated
3. alignment is clean and predictable
4. layout matches kitchen sink examples
5. no unnecessary nesting exists
6. page feels readable and structured

---

## 16. Completion Checklist

Before considering layout work complete, confirm:

- [ ] page follows a consistent structure
- [ ] spacing follows a predictable system
- [ ] containers are used correctly
- [ ] alignment is consistent
- [ ] kitchen sink patterns were followed
- [ ] no layout drift introduced

---

## 17. Summary

This skill ensures that layout and spacing in the Fixtura Members Area remain clean, consistent, and scalable.

Use it whenever building or refining page structure, and rely on established patterns rather than inventing new ones.
