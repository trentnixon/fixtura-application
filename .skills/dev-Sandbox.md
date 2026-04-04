# Skill: Dev Sandbox

## Purpose

Describe how the Fixtura app’s **development sandbox** is gated, routed, and extended so new lab areas stay consistent, offline-safe, and invisible when the sandbox is disabled.

## Applies To

- Anything under `src/app/sandbox/`
- Sandbox portal, route lab, kitchen sink, interaction lab
- `ROUTES`, `dev-sandbox-nav`, `DevSandboxGate`, and sandbox discovery UI

## Inputs

- Env: `NEXT_PUBLIC_ENABLE_DEV_SANDBOX` must be the literal string `"true"` for routes to render (otherwise `notFound()`).
- Canonical URLs live in `src/lib/config/routes.ts` (`ROUTES.sandbox`, `ROUTES.kitchenSink`, `ROUTES.routeLab`, `ROUTES.interactionLab`).

## Process

1. **Add or change a sandbox area** under `src/app/sandbox/<area>/` (do not mount a separate top-level `/kitchen-sink` or `/interaction-lab` outside `/sandbox` unless product explicitly changes that).
2. **Register discovery**: append a card to `SANDBOX_PORTAL_LINKS` in `src/lib/dev-sandbox-nav.ts`; add sectioned links to `ROUTE_LAB_NAV_SECTIONS` or `INTERACTION_LAB_NAV_SECTIONS` (or a new exported section array) as appropriate.
3. **Route constant**: add or reuse an entry in `ROUTES` in `src/lib/config/routes.ts`; use that constant in links and nav, not string literals.
4. **Sidebar active state**: if the area is a top-level tool, extend `portalLinkActive` in `src/components/dev/SandboxRouteLabSidebar.tsx` so the Tools list highlights correctly (same pattern as kitchen sink / route lab / interaction lab).
5. **Header title** (if users see `SiteHeader` on these pages): extend `getPageTitle` in `src/components/site-header.tsx` when a new top-level sandbox prefix needs a stable label.
6. **Gate once**: keep a single `DevSandboxGate` on `src/app/sandbox/layout.tsx`. Do not wrap child lab layouts again unless there is an exceptional reason.
7. **Optional portal home**: mirror important deep links on `src/app/sandbox/page.tsx` (same pattern as route lab and interaction lab placeholder grids).

## Output

- New or updated sandbox routes that 404 when the env flag is off.
- Nav and `ROUTES` stay the single source of truth for URLs.
- Comms/docs can reference `/sandbox/...` paths; older docs may say `/kitchen-sink` shorthand—implementation truth is `ROUTES.*`.

## Rules

- **Environment-controlled, not auth-controlled**: sandbox pages must not require JWT, organisation resolution, live CMS, or real uploads for their baseline behaviour (mocks/fixtures only where behaviour is simulated).
- **Three-way split** (where to put work):
  - **Kitchen sink** (`ROUTES.kitchenSink`): what components look like—primitives, variants, design reference.
  - **Route lab** (`ROUTES.routeLab`): how full pages fit together—shell, layout, screen-level scenarios (`state` / `mode` query params where supported).
  - **Interaction lab** (`ROUTES.interactionLab`): how behaviours work over time—uploads, DnD, async forms, selection, dialogs; prefer `state` / `scenario` / `mode` when implementing scenario-driven pages (see comms).
- **No production dependency**: no user flow may assume sandbox routes exist in production.
- **Scope discipline**: interaction lab placeholders are a reference map until each scenario is implemented; do not treat stubs as partial product features.

## References

- README (LLM overview): `readMe.md` (repo root)
- Roadmap: not present at repo root; use comms and code for sandbox truth.
- Comms: [`.comms/19-Dev-Sandbox-Routes.md`](../.comms/19-Dev-Sandbox-Routes.md) (sandbox system, env gate), [`.comms/20-Interaction Lab.md`](../.comms/20-Interaction%20Lab.md) (interaction lab purpose and structure; note URLs in doc may omit `/sandbox` prefix—use `ROUTES.interactionLab` in code).
- Code: `src/lib/dev-sandbox.ts`, `src/components/dev/DevSandboxGate.tsx`, `src/lib/dev-sandbox-nav.ts`, `src/app/sandbox/layout.tsx`.
- Related skills: [`kitchen-Sink-Maintenance.md`](kitchen-Sink-Maintenance.md), [`navigation-route-management.md`](navigation-route-management.md), [`orchestrator-skill.md`](orchestrator-skill.md).
