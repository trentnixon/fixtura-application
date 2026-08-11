# Tickets — Bundles route

Execution detail for `/o/[accountId]/bundles`.

---

# Completed Tickets Index

- TKT-BUNDLES-001
- TKT-BUNDLES-002

---

ID: TKT-BUNDLES-001
Status: Completed
Priority: Medium
Owner:
Created: 2026-06-01
Updated: 2026-06-01
Related: Route-bundles

---

## Overview

Align bundles route folder structure with club-logos and other member routes: thin pages, screen hooks, placeholders, stub detail route, documentation.

## What We Need to Do

Scaffold `_components`, `_hooks`, `_utils`, `_types`, `_consts`, `.docs`, move dev API dump under `_components` (development only), add `[renderId]` stub.

## Completion Summary

Restructured bundles route with `BundlesScreen`, scheduler bootstrap hook, placeholder panels, dev-gated API dump, `[renderId]` detail stub, `accountScopedRoutes.bundlesRender`, and feature documentation under `.docs`/`.comms`.

---

ID: TKT-BUNDLES-002
Status: Completed
Priority: Medium
Owner:
Created: 2026-06-01
Updated: 2026-06-01
Related: Route-bundles, TKT-BUNDLES-001

---

## Overview

Wire bundles index and detail to Phase 5–8 data; build render list, scheduler strip, and external asset links.

## What We Need to Do

Replace placeholders with production UI; inventory CMS payloads; clarify bundle hub URL model.

## Completion Summary

Index: Phase 5 delivery schedule card and Phase 7 paginated render table. Detail (`/bundles/[renderId]`): Phase 8 via `useAccountRenderDetail` — header, summary counts, downloads table with external links. Dev dump keeps Phase 6–7 only. Optional follow-up: staging data inventory and bundle hub URL with CMS.

---

## Constraints, Risks, Assumptions

- `render-token` must not appear in UI.
- Detail API is Phase 8; Phase 7 remains the list endpoint only.
