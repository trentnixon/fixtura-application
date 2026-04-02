# Skill — Navigation UI Patterns

## 1. Purpose

This skill defines how navigation UI should be structured and behave inside the Fixtura Members Area.

It exists to ensure:

- consistent navigation experience across the app
- clear orientation for users
- predictable interaction patterns
- alignment with route-management rules
- scalable navigation as the app grows

This skill should be used whenever building or modifying navigation UI.

---

## 2. When to Use This Skill

Use this skill when:

- building or updating sidebar navigation
- building header navigation
- adding new navigation items
- handling active states
- structuring navigation groups
- modifying navigation layout or behaviour

Do not use this skill for route logic (use `navigation-route-management`).

---

## 3. Core Rule

Navigation must be clear, consistent, and predictable.

That means:

- users always know where they are
- navigation structure does not change unexpectedly
- active states are always visible
- navigation reflects real app structure

---

## 4. Navigation Types

### Primary Navigation (Sidebar)

Used for:

- main app sections
- persistent navigation
- top-level features

Should:

- remain visible
- be consistent across pages
- follow a clear structure

---

### Secondary Navigation (Header / Page Level)

Used for:

- actions
- contextual navigation
- filters or tabs

Should:

- be minimal
- not compete with primary navigation

---

## 5. Structure Rule

Navigation should be:

- grouped logically
- ordered by importance
- consistent across sessions

Example structure:

- Home
- Content
- Reports
- Settings

Do not:

- reorder items unpredictably
- mix unrelated items in the same group

---

## 6. Active State Rule

The current route must be clearly visible.

Use:

- visual highlight
- consistent styling

Active state should:

- match current route
- persist across navigation
- be easy to identify at a glance

---

## 7. Link Behaviour Rule

Navigation links must:

- use route constants/config
- be consistent with route-management rules
- navigate predictably

Avoid:

- hardcoded inconsistent paths
- dynamic route guessing without structure

---

## 8. Layout Rule

Navigation UI must:

- align with layout-and-spacing-system
- maintain consistent spacing
- not crowd content area

Sidebar should:

- have consistent width
- align with page layout

---

## 9. Interaction Rule

Navigation interactions should be:

- simple
- fast
- predictable

Avoid:

- complex animations
- delayed navigation
- unexpected behaviour

---

## 10. Kitchen Sink Reference Rule

Before building navigation:

- check `/app/kitchen-sink/navigation`

Match:

- layout
- spacing
- active states
- grouping patterns

---

## 11. Correct Usage Pattern

### Example sidebar item

```tsx
<Link href={ROUTES.appHome} className="nav-item">
  Home
</Link>
```

### Example active state logic

```tsx
const isActive = pathname === ROUTES.appHome;
```

---

## 12. What Not to Do

### Do not hardcode navigation logic

Wrong:

- repeating route strings in multiple places

---

### Do not hide active state

Wrong:

- no visual indication of current page

---

### Do not mix navigation styles

Wrong:

- different sidebar styles per page
- inconsistent spacing or grouping

---

### Do not overload navigation

Wrong:

- too many items
- unclear grouping

---

## 13. Anti-Patterns

Avoid:

- inconsistent navigation layout
- unclear active states
- changing navigation structure without reason
- deeply nested navigation without clarity
- mixing navigation and actions

---

## 14. Validation Steps

After modifying navigation:

1. active state is correct
2. navigation structure is consistent
3. links resolve correctly
4. layout matches kitchen sink
5. navigation is easy to understand
6. no duplicate routes exist

---

## 15. Completion Checklist

Before considering navigation complete, confirm:

- [ ] navigation structure is clear
- [ ] active states are visible
- [ ] route constants are used
- [ ] layout is consistent
- [ ] kitchen sink patterns followed
- [ ] no duplicate or conflicting routes

---

## 16. Summary

This skill ensures navigation UI in the Fixtura Members Area remains clear, consistent, and scalable.

Use it whenever navigation changes, and keep user orientation and predictability as the priority.
