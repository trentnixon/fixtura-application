# Skill — Form Patterns

## 1. Purpose

This skill defines how forms should be structured, validated, and presented inside the Fixtura Members Area.

It exists to ensure:

- consistent form layout and behaviour
- predictable validation patterns
- clean and readable form UI
- alignment with auth flows (especially login)
- reusable form structures across the app

This skill should be used whenever building or modifying forms.

---

## 2. When to Use This Skill

Use this skill when:

- building login forms
- creating input forms for features
- handling user input and submission
- adding validation logic
- designing form layout and structure
- implementing form error states

Do not use this skill for general layout or API-only concerns.

---

## 3. Core Rule

Forms must be simple, structured, and predictable.

That means:

- consistent layout
- clear labels
- clear validation feedback
- minimal complexity

Avoid over-engineered forms.

---

## 4. Form Structure Pattern

Forms should follow a consistent structure:

1. Form title (optional)
2. Form description (optional)
3. Input fields (stacked)
4. Validation messages (inline)
5. Primary action (submit)
6. Secondary actions (optional)

---

## 5. Layout Rule

Forms should:

- use vertical stacking
- maintain consistent spacing between fields (standard `space-y-6`)
- align labels and inputs clearly
- avoid multi-column layouts unless necessary

Use the layout-and-spacing-system for spacing consistency. For high-trust flows, wrap forms in a `GlassSurface`.

---

## 6. Input Rule

Each input should include:

- label
- input field
- optional helper text
- validation message

### Input Specification (Prime)

All inputs must follow the **Prime** specification for consistency:

- **Height**: `h-11` (44px)
- **Radius**: `rounded-xl` (0.75rem / 12px)
- **Background**: `bg-white/60` (light) or `bg-black/40` (dark) with backdrop blur.

Inputs must be:

- clearly identifiable
- consistently styled
- aligned with other inputs

---

## 7. Validation Rule

Validation should be:

- immediate where appropriate
- clear and user-friendly
- non-technical
- consistent across forms

Types of validation:

- required fields
- format validation (email, etc.)
- submission errors

---

## 8. Error Messaging Rule

Error messages must be:

- specific
- clear
- non-technical

Examples:

- “Email is required”
- “Please enter a valid email address”
- “We couldn’t sign you in. Please check your details.”

Avoid:

- technical error messages
- backend error text
- vague messaging

---

## 9. Submission Rule

During submission:

- disable the submit control and show a clear pending state
- use **`Button`** with **`loading`** and **`loadingText`**, or **`SubmitButton`** from `@/components/auth/actions` (wraps **`Button`**, defaults to **`variant="brand"`**, supports **`loadingText`** and optional **`fullWidth={false}`** for inline footers)
- for full-page or section loading, **`BrandedLoader`** remains appropriate
- prevent duplicate submissions (built-in when using **`Button`** **`loading`**)

Do not allow multiple concurrent submissions.

Primary submit styling: prefer **`brand`** or **`accent`** over **`default`** (blue) in members-area forms—see **[`buttons-and-CTA.md`](buttons-and-CTA.md)**.

---

## 10. Success Handling Rule

On success:

- proceed with expected flow (e.g. redirect)
- reset form state if needed
- avoid unnecessary success messages unless useful

Example:

- login → redirect immediately

---

## 11. Kitchen Sink Reference Rule

Before building a form:

- check `/sandbox/kitchen-sink/forms`
- check `/sandbox/kitchen-sink/inputs`
- check `/sandbox/kitchen-sink/buttons` (variants, **`loading`**, form action pairs)

Match the approved patterns. Button semantics and **`SubmitButton`**: **[`buttons-and-CTA.md`](buttons-and-CTA.md)**.

---

## 12. shadcn Rule

Use shadcn components for:

- inputs
- labels
- buttons
- form controls (Form, FormField, etc.)

Extend them where needed, but do not rewrite.

---

## 13. Correct Usage Pattern

### Example form pattern (Premium)

```tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GlassSurface } from "@/components/ui/container";

// ... inside component
<GlassSurface>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Identity</FormLabel>
            <FormControl>
              <Input placeholder="name@company.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" variant="brand">
        Authorize
      </Button>
    </form>
  </Form>
</GlassSurface>;
```

---

## 14. What Not to Do

### Do not create inconsistent layouts

Wrong:

- different spacing per form
- misaligned inputs

---

### Do not expose backend errors

Wrong:

- showing raw API response messages

---

### Do not allow uncontrolled submissions

Wrong:

- multiple clicks triggering multiple requests

---

### Do not mix validation patterns

Wrong:

- one form uses inline validation
- another uses only submit-time validation

---

## 15. Anti-Patterns

Avoid:

- overly complex multi-step forms without need
- inconsistent label placement
- missing validation feedback
- mixing input styles
- unclear form actions
- cluttered form UI

---

## 16. Validation Steps

After building a form, validate:

1. layout is consistent
2. inputs are aligned and readable
3. validation messages are clear
4. submission state works correctly
5. duplicate submissions are prevented
6. error handling is consistent
7. matches kitchen sink examples

---

## 17. Completion Checklist

Before considering the form complete, confirm:

- [ ] form follows standard structure
- [ ] spacing is consistent
- [ ] validation is implemented clearly
- [ ] error messages are user-friendly
- [ ] submission state handled correctly
- [ ] shadcn components used properly
- [ ] kitchen sink patterns followed

---

## 18. Summary

This skill ensures that forms in the Fixtura Members Area remain clean, consistent, and easy to use.

Use it whenever building user input flows, and prioritise clarity and consistency over complexity.
