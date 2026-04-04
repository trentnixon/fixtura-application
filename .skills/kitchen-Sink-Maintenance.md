# Skill — Kitchen Sink Maintenance

## 1. Purpose

This skill defines how to build, extend, and maintain the Fixtura Members Area kitchen sink.

It exists to ensure:

- the kitchen sink becomes the live visual reference for the members app
- design and component choices stay consistent
- shadcn usage is shown through approved examples
- future UI work references real patterns instead of inventing new ones
- the kitchen sink remains curated, not a random sandbox

This skill should be used whenever a kitchen sink route, example, or component reference page is added or changed.

---

## 2. When to Use This Skill

Use this skill when:

- creating the main kitchen sink route
- adding a new kitchen sink section
- updating an existing kitchen sink example
- changing the approved way a component should look or behave
- adding new visual states or pattern examples
- documenting design choices through real UI examples
- reviewing whether a new UI pattern belongs in the design reference system

Do not use this skill for regular feature-page development unless the work is specifically about the visual reference system.

---

## 3. Core Rule

The kitchen sink is the live visual source of truth for members-area UI patterns.

That means:

- it should show approved patterns
- it should reflect real app usage
- it should influence design and component decisions elsewhere
- it should not become an experiment dump or disconnected playground

If a pattern should not be used in the real app, it should not be presented as approved in the kitchen sink.

---

## 4. What the Kitchen Sink Is

The kitchen sink is:

- a protected route inside the members app
- a curated set of reference pages
- a visual implementation guide for the design and component system
- a place to demonstrate approved UI structure, states, and usage

The kitchen sink is not:

- a random demo area
- a place for unfinished visual experiments without context
- a disconnected Storybook replacement with no product alignment
- a dumping ground for every shadcn component regardless of relevance

---

## 5. Kitchen Sink Ownership Rule

The kitchen sink owns visual reference, not product logic.

That means it may demonstrate:

- typography
- colors
- containers
- forms
- buttons
- cards (standard cards, persistent feedback cards, GridCard tiles)
- navigation
- states
- dialogs
- tables
- popovers
- loading patterns
- avatars
- icons
- command surfaces
- other approved UI patterns

It should not own:

- production business workflows
- backend feature logic
- alternate auth flows
- hidden product behaviour that is not being deliberately documented

---

## 6. Route Structure Rule

The kitchen sink should live inside the protected members app so it is rendered within the real app shell and design environment.

Recommended route model:

- `/sandbox/kitchen-sink`
- `/sandbox/kitchen-sink/typography`
- `/sandbox/kitchen-sink/brand-colors`
- `/sandbox/kitchen-sink/containers`
- `/sandbox/kitchen-sink/navigation`
- `/sandbox/kitchen-sink/buttons`
- `/sandbox/kitchen-sink/cards`
- `/sandbox/kitchen-sink/states`
- `/sandbox/kitchen-sink/toasts`
- `/sandbox/kitchen-sink/forms`
- `/sandbox/kitchen-sink/dialogs`
- `/sandbox/kitchen-sink/tables`
- `/sandbox/kitchen-sink/popovers`
- `/sandbox/kitchen-sink/loading`
- `/sandbox/kitchen-sink/inputs`
- `/sandbox/kitchen-sink/avatar`
- `/sandbox/kitchen-sink/icons`
- `/sandbox/kitchen-sink/carousel`
- `/sandbox/kitchen-sink/command`

This keeps the kitchen sink aligned with the protected shell and the real members-area design system.

---

## 7. Content Rule

Each kitchen sink page should demonstrate approved patterns, not just list components.

Each page should show:

- what the pattern is
- how it is used in Fixtura
- the preferred variants
- spacing and layout expectations
- relevant states
- any do/don’t guidance where helpful

The page should feel like a visual reference, not a raw component catalogue.

---

## 8. Approved Example Rule

Examples shown in the kitchen sink should be:

- realistic
- deliberate
- visually representative of the real app
- consistent with design-system and component-usage skills
- useful enough that future pages can copy from them

Do not include examples that are:

- visually unfinished with no note
- intentionally bad with no explanation
- unreviewed experiments presented as defaults
- disconnected from actual app patterns

---

## 9. Relationship to Other Skills

The kitchen sink supports and informs other skills.

It should be referenced by:

- `design-system-foundation`
- `component-usage-patterns`
- `ui-state-patterns`
- `form-patterns`
- `layout-and-spacing-system`
- `navigation-ui-patterns`
- `feedback-and-notifications`

When building new UI, the expected workflow is:

1. check the relevant skill
2. check the relevant kitchen sink page
3. build to match the approved pattern
4. update the kitchen sink if a genuinely new approved pattern is introduced

---

## 10. shadcn Rule

The kitchen sink should demonstrate how shadcn components are used in the Fixtura Members Area.

That means:

- show approved usage of shadcn components
- show Fixtura-specific styling patterns
- show how components are composed inside real layouts
- prefer reuse and extension over deep rewrites

Do not use the kitchen sink to showcase every shadcn option if it does not belong in the members app.

---

## 11. Page Structure Pattern

A kitchen sink page should usually include:

1. page title
2. short explanation of what the page covers
3. one or more example sections
4. examples of approved variants
5. optional notes or usage guidance

This should remain visually clean and easy to scan.

Do not overload a page with too many unrelated examples.

---

## 12. Naming Rule

Kitchen sink pages and sections should use clear, durable names.

Preferred names:

- Typography
- Brand Colors
- Containers
- Navigation
- Buttons
- Cards
- States
- Toasts
- Forms
- Dialogs
- Tables
- Popovers
- Loading
- Inputs
- Avatar
- Icons
- Carousel
- Command

Avoid vague names like:

- Misc
- Tests
- Extra Stuff
- UI Experiments

---

## 13. What Not to Do

### Do not treat the kitchen sink like a random sandbox

Wrong:

- dumping temporary experiments into it
- mixing approved and unapproved patterns with no distinction

### Do not present unfinished patterns as canonical

Wrong:

- adding examples that are not actually acceptable for app usage
- leaving broken spacing/layout examples without context

### Do not duplicate patterns unnecessarily

Wrong:

- two or three versions of the same approved card style with no reason
- competing examples that create confusion about which pattern is preferred

### Do not ignore the kitchen sink when building new UI

Wrong:

- inventing new UI patterns in feature pages without updating or checking the reference system

---

## 14. Anti-Patterns

Avoid:

- kitchen sink pages with no explanation
- kitchen sink routes that are visually inconsistent with the real app shell
- reference pages that drift away from actual production usage
- showing raw component states with no Fixtura-specific context
- allowing the kitchen sink to grow without curation
- treating it as a one-time build instead of a maintained system

---

## 15. Validation Steps

After adding or modifying kitchen sink content, validate:

1. the page lives under the approved kitchen sink route structure
2. the examples reflect approved real-app patterns
3. the page is visually consistent with the members-area shell
4. the examples are clear and curated
5. the content is useful as a real reference for future UI work
6. no misleading or unapproved patterns are presented as defaults
7. relevant design/component skills can safely reference the page

---

## 16. Completion Checklist

Before considering the kitchen sink update complete, confirm:

- [ ] the page or section lives in the approved kitchen sink route structure
- [ ] examples are curated and intentional
- [ ] patterns shown are acceptable for real app usage
- [ ] shadcn usage reflects Fixtura-specific implementation choices
- [ ] the page is clear enough to act as a design reference
- [ ] no random experiments are being presented as standards
- [ ] the update supports other skills and future UI work

---

## 17. Summary

This skill keeps the Fixtura Members Area kitchen sink useful, trustworthy, and aligned with the real application.

Use it whenever kitchen sink routes or examples change, and keep the kitchen sink curated enough that it can act as the visual source of truth for design and component decisions across the app.
