# Response: Template gradients data-lab plan

## Goal

Add a dedicated data-lab scenario that fetches `GET /api/template-gradients/ui` through the app BFF and proves selection works in two ways:

1. select input
2. clickable cards

The page should also display the currently selected result so we can validate returned values visually.

---

## Recommended route

Create a new sandbox route:

- page: `src/app/sandbox/data-lab/template-gradients/ui/page.tsx`
- layout metadata: `src/app/sandbox/data-lab/template-gradients/ui/layout.tsx`

This keeps the URL structure parallel with the existing data-lab routes:

- `src/app/sandbox/data-lab/template-categories/list-for-selection/page.tsx`
- `src/app/sandbox/data-lab/assets/list-for-selection/page.tsx`

Suggested URL:

`/sandbox/data-lab/template-gradients/ui`

---

## Navigation updates

Update:
`src/lib/dev-sandbox-nav.ts`

Add a new section or extend an existing one:

```ts
{
  title: "Template gradients",
  links: [
    {
      href: `${ROUTES.dataLab}/template-gradients/ui`,
      label: "UI endpoint",
    },
  ],
}
```

Also update the data-lab overview page if we want the new scenario linked from the examples list:

- `src/app/sandbox/data-lab/page.tsx`

---

## UI structure

The page should mirror the tone and mechanics already used in the other data-lab pages:

- heading
- endpoint description
- refetch button
- loading state
- error state
- success state with interactive selection controls

Recommended page sections:

1. header
2. refresh controls
3. tabs for `Select` and `Cards`
4. shared selected-detail panel

---

## Suggested component split

### Option A: Page-level implementation only

Fastest path for the first pass:

- keep most UI in `page.tsx`
- use the new `useTemplateGradientsUi()` hook directly
- store selected id in local component state

This is good if the lab is the only current consumer.

### Option B: Reusable picker components

Better if this will likely be reused outside the sandbox:

Create a new picker domain:

- `src/components/pickers/template-gradients/index.ts`
- `src/components/pickers/template-gradients/template-gradient-select-picker.tsx`
- `src/components/pickers/template-gradients/template-gradient-card-picker.tsx`
- `src/components/pickers/template-gradients/template-gradient-picker-detail.tsx`
- `src/components/pickers/template-gradients/_hooks/...`
- `src/components/pickers/template-gradients/_utils/...`

Recommendation:

- use Option A first if speed matters
- use Option B if this picker is expected to appear in onboarding, template builder, or theme tooling soon

---

## Recommended state model

Minimal state for the lab page:

```ts
const q = useTemplateGradientsUi();
const gradients = q.data?.data ?? [];
const [selectedId, setSelectedId] = useState<string>("");

const selected = useMemo(
  () => gradients.find((item) => String(item.id) === selectedId) ?? null,
  [gradients, selectedId],
);
```

Suggested enhancement:

- when data loads and nothing is selected, auto-select the first returned row

Example:

```ts
useEffect(() => {
  if (!selectedId && gradients.length > 0) {
    setSelectedId(String(gradients[0].id));
  }
}, [gradients, selectedId]);
```

This makes the detail card useful immediately.

---

## Select control requirements

The select view should:

- render every returned gradient as an option
- use `String(id)` as the `SelectItem` value
- display the gradient `name`
- optionally show type/direction in the detail panel instead of cluttering the select label

Suggested label text:

- label: `Template gradient`
- placeholder: `Select a gradient`

Recommended primitives:

- `Label`
- `Select`
- `SelectTrigger`
- `SelectContent`
- `SelectItem`

These match the existing style used in:

- `src/components/pickers/template-category/template-category-select-picker.tsx`
- `src/components/pickers/assets-list-for-selection/image-options-assets-picker.tsx`

---

## Card click requirements

The cards view should:

- render one card per gradient
- support mouse click selection
- support keyboard selection with Enter and Space
- visibly indicate the selected card
- show the important UI fields on each card

Suggested card content:

- title: `name`
- badge or muted row: `id`
- metadata rows: `ui.type`, `ui.direction`
- preview swatch optional if/when the API later returns gradient stops or CSS-ready values

Recommended primitives:

- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `Badge` only if we need a small field chip

Best styling reference:

- `src/components/pickers/template-category/template-category-card-picker.tsx`

---

## Selected result display

The selected detail card should prove the endpoint works by showing the currently selected object.

Recommended fields:

- `id`
- `name`
- `ui.type`
- `ui.direction`

Recommended display:

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base">Selection detail</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">...</dl>
    <div className="pt-2">
      <p className="text-muted-foreground mb-1 text-xs">Raw JSON</p>
      <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
        {JSON.stringify(selected, null, 2)}
      </pre>
    </div>
  </CardContent>
</Card>
```

Why include raw JSON:

- fastest way to validate the returned shape during integration
- helps compare the live result with the original handoff document

---

## Page behaviour checklist

The page should support:

- [ ] authenticated fetch through the new BFF route
- [ ] `Refetch` button
- [ ] loading state
- [ ] error state with readable message
- [ ] empty state when `data.length === 0`
- [ ] select-based selection
- [ ] card-based selection
- [ ] shared selected-detail display

---

## Suggested implementation order

1. add the endpoint integration pipeline first
2. create the lab route and layout metadata
3. wire the page to `useTemplateGradientsUi()`
4. add local selected-id state
5. add the select view
6. add the card-click view
7. add selected-detail output
8. add the nav link
9. optionally add a link on the data-lab overview page

---

## Concrete file plan

Create:

- `src/app/sandbox/data-lab/template-gradients/ui/page.tsx`
- `src/app/sandbox/data-lab/template-gradients/ui/layout.tsx`

Update:

- `src/lib/dev-sandbox-nav.ts`
- `src/app/sandbox/data-lab/page.tsx`

Optional reusable extraction:

- `src/components/pickers/template-gradients/...`

---

## Suggested page copy

Header title:

`Template gradients - UI endpoint`

Header helper text:

`Calls /api/template-gradients/ui (BFF -> Strapi). Sign in first; unauthenticated requests return 401 and missing CMS permission returns 403.`

Status line:

`gradients: {gradients.length} (published only)`

Tabs:

- `Select`
- `Cards`

---

## Verification steps

1. sign in to the app
2. open `/sandbox/data-lab/template-gradients/ui`
3. confirm gradients load
4. change selection in the select input and verify the detail panel updates
5. click a card and verify the same detail panel updates
6. click `Refetch` and confirm refresh state appears
7. test a user/role without `getTemplateGradientsForUi` permission and confirm a `403` message is surfaced

---

## Dependencies

This page depends on the API integration work described in:
`src/app/sandbox/data-lab/.doc/response/template-gradients-ui-integration-plan.md`
