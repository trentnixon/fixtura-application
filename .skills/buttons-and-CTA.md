# Skill — Buttons and CTA integration

## 1. Purpose

This skill defines how to use the shared **`Button`** component, **`SubmitButton`** for auth-style forms, and CTA hierarchy in the Fixtura Members Area.

It exists to ensure:

- one integration path (`@/components/ui/button`) instead of one-off styled `<button>` elements
- consistent **brand** / **accent** usage for product CTAs vs the default blue **`default`** variant
- async states (**`loading`**, **`aria-busy`**) aligned with the design system
- kitchen sink and route lab as living references

Use this skill whenever adding or changing buttons, form submits, dialog footers, or toolbars.

---

## 2. Core component

**Import:** `import { Button, buttonVariants } from "@/components/ui/button";`

- **`buttonVariants`** is for rare composition (e.g. calendar nav) where a native element needs the same classes as **`Button`**.
- Prefer **`Button`** for all interactive triggers; do not fork a second button primitive in feature folders.

---

## 3. Variants (semantic)

| Variant                                | Role                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **`default`**                          | Primary in local context (blue token). Use sparingly in members flows where **brand** is not appropriate—often non-form surfaces. |
| **`secondary`**                        | Important non-primary actions (e.g. cancel in a pair).                                                                            |
| **`outline`**, **`ghost`**, **`link`** | Tertiary / low emphasis; **`link`** for text-like actions.                                                                        |
| **`destructive`**                      | Irreversible or harmful actions only.                                                                                             |
| **`brand`**                            | Fixtura teal—preferred **primary submit** for member-area forms and product CTAs.                                                 |
| **`accent`**                           | Orange—promotional / upgrade / recovery emphasis; not a substitute for **`destructive`**.                                         |

Do not invent new CVA variants per feature without design review; use composition + **`className`** only for one-off labelling (see kitchen sink **Experimental** section).

---

## 4. Sizes and layout props

- **`sm`**, **`default`**, **`lg`**, **`icon`**, **`compact`** (dense tables / toolbars).
- **`fullWidth`**: block-width CTAs (e.g. mobile auth).
- **`asChild`**: render as child element (Radix **`Slot`**) for **`Link`** or **`DialogTrigger`**. **`loading` is ignored when `asChild` is true**—do not combine async state with **`asChild`**.

---

## 5. Async and disabled behaviour

- Use **`loading`** and optional **`loadingText`** on **`Button`** for pending submits (spinner, **`disabled`**, **`aria-busy`**).
- Prefer this over hand-rolled **`Loader2`** inside **`Button`** children unless you need a fully custom layout.

**Auth forms:** use **`SubmitButton`** from `@/components/auth/actions`:

- Defaults to **`variant="brand"`** and **`fullWidth`** (set **`fullWidth={false}`** for inline footers beside cancel).
- Pass **`loadingText`** for context-specific copy (e.g. “Signing in…”).
- **`buttonVariant`** can be **`"accent"`** for specific flows (e.g. recovery).

---

## 6. Members-area form rule

For **form primary actions** in the members app, prefer **`brand`** or **`accent`** over **`default`** (blue), so submits align with Fixtura branding. Secondary actions use **`secondary`**, **`outline`**, or **`ghost`**.

**`SubmitButton`** already defaults to **`brand`**—do not override to **`default`** unless there is an explicit product reason.

---

## 7. Global styling (no extra props)

The shared **`Button`** applies globally:

- pill shape (**`rounded-full`**)
- hover lift (**border + shadow + slight translate**)
- **`cursor-pointer`**; **`disabled:cursor-not-allowed`**

Do not strip these with ad-hoc classes unless the design system is updated.

---

## 8. References

| Resource                      | Path / URL                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component                     | [`src/components/ui/button.tsx`](../src/components/ui/button.tsx)                                                                                                                                      |
| Auth submit wrapper           | [`src/components/auth/actions.tsx`](../src/components/auth/actions.tsx) (`SubmitButton`)                                                                                                               |
| Kitchen sink (full reference) | `/sandbox/kitchen-sink/buttons` (requires **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true`**)                                                                                                                   |
| PRD / brief                   | [`src/app/sandbox/kitchen-sink/.comms/Buttons-prd-kitchen-sink.md`](../src/app/sandbox/kitchen-sink/.comms/Buttons-prd-kitchen-sink.md)                                                                |
| Related skills                | [`component-Usage-Patterns.md`](component-Usage-Patterns.md), [`form-Patterns.md`](form-Patterns.md), [`kitchen-Sink-Maintenance.md`](kitchen-Sink-Maintenance.md), [`dev-Sandbox.md`](dev-Sandbox.md) |

---

## 9. Summary

Use **`Button`** everywhere; choose **`brand`** / **`accent`** for member CTAs by intent; use **`loading`** / **`SubmitButton`** for async; confirm patterns in **`/sandbox/kitchen-sink/buttons`** and mirror them in **`/sandbox/route-lab`** screens when building full-page labs.
