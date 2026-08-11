You’ve now covered **all the skills we planned** — this is a really solid system.

There’s only **one optional (but high-value) final skill** I’d add to complete the set:

👉 **Icons & Visual Elements Consistency**

This is small, but without it things get messy fast (random icon sets, inconsistent sizing, etc.)

---

````md
# Skill — Icons and Visual Elements

## 1. Purpose

This skill defines how icons and small visual elements should be used inside the Fixtura Members Area.

It exists to ensure:

- consistent icon usage across the app
- predictable sizing and alignment
- clean integration with UI components
- no mixing of visual styles
- minimal visual noise

This skill should be used whenever icons or small visual elements are added to the UI.

---

## 2. When to Use This Skill

Use this skill when:

- adding icons to buttons, navigation, or UI elements
- selecting icons for new features
- modifying icon usage in components
- adding visual indicators or small UI graphics

Do not use this skill for large visual assets or marketing imagery.

---

## 3. Core Rule

Icons must be consistent, minimal, and functional.

That means:

- use a single icon system
- keep sizing consistent
- align icons with text and components
- use icons to support meaning, not decorate

---

## 4. Icon System Rule

Use a single icon library across the app.

Preferred:

- lucide-react (default with shadcn)

Do not:

- mix multiple icon libraries
- introduce custom icons without reason

---

## 5. Usage Rule

Icons should:

- support clarity
- enhance recognition
- remain subtle

Common use cases:

- navigation items
- buttons (optional)
- status indicators
- empty states

Do not overuse icons.

---

## 6. Sizing Rule

Icons must follow consistent sizing:

- small → inline with text
- medium → buttons and navigation
- large → empty states or feature highlights

Do not:

- mix inconsistent sizes
- manually override sizing per component

---

## 7. Alignment Rule

Icons must align cleanly with text and components.

Ensure:

- vertical alignment is correct
- spacing between icon and text is consistent
- icons do not disrupt layout rhythm

---

## 8. Colour Rule

Icons should:

- inherit text colour by default
- match component state (hover, active, disabled)

Do not:

- apply arbitrary colours
- use icons as decoration through colour

---

## 9. Kitchen Sink Reference Rule

Before adding icons:

- check `/sandbox/kitchen-sink/icons`
- match approved sizing and usage

---

## 10. Correct Usage Pattern

### Example button with icon

```tsx
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Save
</Button>
```
````

### Example navigation item

```tsx
<Link href={ROUTES.appHome} className="nav-item">
  <HomeIcon className="h-4 w-4" />
  Home
</Link>
```

---

## 11. What Not to Do

### Do not mix icon libraries

Wrong:

- lucide + heroicons + random SVGs

---

### Do not oversize icons

Wrong:

- icons larger than text without reason

---

### Do not use icons as decoration only

Wrong:

- adding icons that add no meaning

---

### Do not break alignment

Wrong:

- misaligned icons
- inconsistent spacing

---

## 12. Anti-Patterns

Avoid:

- inconsistent icon sizing
- too many icons in one area
- decorative-only icon usage
- mixing filled and outline styles randomly
- icons that compete with text instead of supporting it

---

## 13. Validation Steps

After adding icons:

1. icon matches system
2. size is consistent
3. alignment is correct
4. colour is appropriate
5. kitchen sink patterns followed
6. icon adds value, not noise

---

## 14. Completion Checklist

Before considering icon usage complete, confirm:

- [ ] consistent icon library used
- [ ] sizing matches system
- [ ] alignment is correct
- [ ] colour is consistent
- [ ] no unnecessary icons added
- [ ] kitchen sink patterns followed

---

## 15. Summary

This skill ensures that icons and visual elements in the Fixtura Members Area remain consistent, subtle, and useful.

Use it whenever adding visual elements, and prioritise clarity over decoration.

```

```
