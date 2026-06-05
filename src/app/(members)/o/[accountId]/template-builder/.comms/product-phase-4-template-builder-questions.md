# Product questions — Phase 4: Template builder save (POC)

**From:** Fixtura App (template builder POC)  
**To:** Product  
**Date:** 2026-06-04  
**Status:** Needed for UX and save behavior; CMS PUT contract is tracked separately  
**Related:** [template-builder-poc-phases.md](../.docs/template-builder-poc-phases.md), [phase-1-data-contract.md](../.docs/phase-1-data-contract.md), [phase-4-save-pathway-llm-brief.md](../.docs/phase-4-save-pathway-llm-brief.md)

---

## Context

The template builder POC at `/o/[accountId]/template-builder` lets users change template-option choices locally (category, mode, palette, gradient, image, noise, particle, pattern, texture, video, use background). **Save to CMS is blocked** until the backend team confirms the PUT API.

These questions are **product / UX decisions** that affect what we build even after CMS confirms the technical contract.

**CMS technical questions:** [cms-phase-4-put-template-options-questions.md](./cms-phase-4-put-template-options-questions.md)

---

## Current behavior (for alignment)

- **Saved state** comes from `GET …/all-template-options` → `currentSelection` (not from branding destruct).
- **`templateOptionId`** for hydration: `/account/me` first, then branding, then catalog fetch without id.
- **Category picker** uses **public** categories from the full catalog GET (`isPrivate: false` only in `categories`).
- A separate API **`list-for-selection`** includes **private** categories for other flows.
- **Branding workspace** already saves **palette + template mode** via `PATCH …/branding` — not the full template-option relations.
- Save button is disabled with copy: “Save blocked pending CMS contract.”

---

## Questions

### 1. Private categories

**Today:** Full catalog GET **omits** private categories from `categories`. `list-for-selection` **includes** them.

**Question:** For the template builder POC, should users be able to select and **save** a **private** category?

| Option                                   | Implication                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| A — Public only (current POC)            | Picker stays on GET `categories`; private rows diagnostic-only via dump                     |
| B — Allow private via list-for-selection | Switch category source to `list-for-selection`; CMS must accept private category ids on PUT |
| C — Admin-only private                   | Role-gated picker; needs CMS/product rule for who can save private                          |

**Your decision:** A / B / C / other: \_\_\_

---

### 2. Template mode: two write paths

The editor includes **Mode** as part of template-option save (pending CMS PUT).

The **branding workspace** can change **`templateModeId`** via `PATCH …/branding` (palette + mode only).

**Questions:**

- Are these the **same** `templateMode` concept in CMS, or different layers?
- If a user changes mode in the template builder and separately in branding, which wins?
- Should the template builder **hide** mode until branding and template-option are unified?
- After template builder save, should we **refetch branding** so the header card (“Template / Theme”) stays accurate?

**Your decision:** \_\_\_

---

### 3. First-time save (no existing template option)

Some accounts have **`templateOptionId: null`** — no `currentSelection` on GET.

**Questions:**

- Is “first save creates the row” the expected product behavior for POC?
- Any onboarding copy or empty state before first save?
- Should we show a warning if they save with many fields still empty/null?

**Your decision:** \_\_\_

---

### 4. Required selections before save

**Question:** For POC, must users set certain fields before save is allowed (e.g. category + mode required), or is **any partial save** allowed if CMS accepts it?

| Option              | Implication                                               |
| ------------------- | --------------------------------------------------------- |
| Allow partial save  | Save enabled whenever dirty; CMS validates                |
| Require minimum set | Client disables save until category + mode (or other) set |

**Minimum required fields (if any):** \_\_\_

---

### 5. Clearing selections

Pickers support “unset” → `null` in draft state.

**Question:** Should users be allowed to **clear** optional relations (set back to none) in POC, or only change from one option to another?

**Note:** Depends on CMS null/clear semantics — product should state intent even before CMS confirms technical format.

**Your decision:** Allow clear / disallow clear for POC: \_\_\_

---

### 6. POC scope vs production UI

**Questions:**

- Keep **raw JSON dumps** on the page until save is proven in staging?
- Is this route **internal/diagnostic only** for POC, or ship-visible to customers?
- Success feedback: inline message only, toast, or redirect?
- After successful save, stay on template builder or navigate elsewhere?

**Your decision:** \_\_\_

---

### 7. Relationship to Settings / custom template flags

Template builder copy references that **custom template flags** live on **Settings**.

**Question:** Does template builder POC **replace**, **complement**, or **ignore** those settings for this release?

**Your decision:** \_\_\_

---

### 8. Category/mode filtering (future vs POC)

**Question:** For POC, should changing **category** or **mode** **filter** which palettes/images/etc. appear in pickers, or show **full catalog** for every group (current behavior)?

| Option                    | POC effort                               |
| ------------------------- | ---------------------------------------- |
| Full catalog (current)    | Low                                      |
| Filtered by category/mode | Higher; needs CMS rules or client matrix |

**Your decision:** Full catalog / filtered / defer: \_\_\_

---

## What we will do with your answers

| Topic                    | App impact                                              |
| ------------------------ | ------------------------------------------------------- |
| Private categories       | Picker data source + validation before PUT              |
| Mode vs branding         | Whether to show mode field; refetch branding after save |
| First save / empty state | Copy and optional client guards                         |
| Required fields          | Save button rules + inline validation                   |
| Clear semantics          | Mapper + picker “unset” behavior (with CMS)             |
| POC visibility           | Dumps, messaging, error UX                              |
| Settings overlap         | Docs + out-of-scope banner if needed                    |
| Filtering                | Phase 6+ vs POC scope                                   |

---

## Dependencies

- **CMS team:** PUT body, create/update, null semantics — [cms-phase-4-put-template-options-questions.md](./cms-phase-4-put-template-options-questions.md)
- **Ops:** `getAllTemplateOptions` permission enabled in target environments for read/smoke tests.

---

## Response checklist (for Product)

Please reply with decisions on:

- [ ] 1. Private categories (A/B/C)
- [ ] 2. Template mode vs branding PATCH
- [ ] 3. First-time save UX
- [ ] 4. Required fields before save
- [ ] 5. Allow clearing relations
- [ ] 6. POC visibility and post-save UX
- [ ] 7. Settings / custom template flags
- [ ] 8. Filtered pickers vs full catalog

**Owner:** **\_  
**Target date:** \_**
