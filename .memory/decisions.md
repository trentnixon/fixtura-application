# Decisions

## 2026-04-05 — Member form primary CTAs: `brand` / `accent` over `default`

**Decision:** For members-area forms, primary submit actions should use **`Button`** **`variant="brand"`** (teal) or **`variant="accent"`** (promotional / upgrade) as intent requires—not **`variant="default"`** (blue primary). **`SubmitButton`** defaults to **`brand`**. Secondary / cancel actions use **`secondary`**, **`outline`**, or **`ghost`** per hierarchy.

**Why:** Aligns product UI with Fixtura brand emphasis and keeps the blue **`default`** token for other primary surfaces; kitchen sink and route lab document the pattern.

**Tradeoffs:** Teams must choose **`brand` vs `accent`** deliberately; existing screens using **`default`** on submits should migrate over time.

---

## 2026-04-04 — Select-organisation dev simulator (`orgSim` + env)

**Decision:** Optional UI-state exercise on the real **`/select-organisation`** route uses query **`orgSim=loading|none|one|multiple|error`** only when **`NEXT_PUBLIC_SELECT_ORG_SIMULATOR`** is the literal **`true`**. Implementation lives in **`src/lib/dev/select-organisation-sim.ts`**; **`useAccountMe`** accepts **`{ enabled: false }`** while simulating so GET **`/account/me`** is not called for that view.

**Why:** Teams can validate every screen state on the production route without real account shapes; default path (flag off or param absent) stays the real API.

**Tradeoffs:** Another **`NEXT_PUBLIC_*`** flag to document; query param must not be relied on in production builds without the flag.

---

## 2026-04-04 — Persistent semantic messaging: `FeedbackCard` family

**Decision:** In-page persistent feedback (info, success, warning, error, critical, premium) uses **`@/components/ui/feedback-card`**—either **`FeedbackCard`** with **`visualVariant`** or **`FeedbackCardSoft` / `FeedbackCardTinted` / `FeedbackCardStrong`**. Reference **`/sandbox/kitchen-sink/cards`**. Short-lived confirmations and background events stay on **toasts**; field validation stays **inline**.

**Why:** One card-system surface, three visual variants for hierarchy, kitchen sink + skills give a single approved pattern (vs ad hoc banners).

**Tradeoffs:** Call sites must choose **`kind`** and variant; not a substitute for **`GridCard`** tiles or raw **`Card`** layouts.

---

## 2026-04-04 — RSC boundary: Lucide `LucideIcon` props and client `GridCard`

**Decision:** UI that passes **`LucideIcon` component references** into **`GridCard` / `GridCardIcon`** (both client components) must live in a **`"use client"`** module, or the parent page must be a client component. Thin server pages should import a small client child that owns the icon map; avoid **`visual={<GridCardIcon icon={SomeLucideIcon} />}`** from a Server Component.

**Why:** Next.js serializes server → client props; function/component values are not serializable and produce 500s (`Only plain objects…`, `Functions cannot be passed directly to Client Components`).

**Tradeoffs:** Extra client-only files for grid portals; **`metadata`** stays on the server page when the split is used.

---

## 2026-04-04 — Dev sandbox URL model (`/sandbox` tree + env gate)

**Decision:** Development sandbox routes are served only under **`/sandbox`**: portal at **`/sandbox`**, **kitchen sink** at **`/sandbox/kitchen-sink/*`**, **route lab** at **`/sandbox/route-lab/*`**. The segment **`src/app/sandbox/layout.tsx`** wraps the tree with **`DevSandboxGate`**; access requires **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`** to be the literal string **`true`** (see [`src/lib/dev-sandbox.ts`](src/lib/dev-sandbox.ts)). Public marketing chrome link “Sandbox” points to **`ROUTES.sandbox`**.

**Why:** Single discoverable entry, one layout for env enforcement, room to add more tools under the same prefix without route groups; matches product intent in [`.comms/19-Dev-Sandbox-Routes.md`](.comms/19-Dev-Sandbox-Routes.md) (env-controlled, not auth-controlled).

**Tradeoffs:** Breaks old **`/kitchen-sink`** and **`/route-lab`** bookmarks; preview/CI must set the env flag when those URLs are needed.

---

## 2026-04-04 — Sandbox shell: public chrome + full-bleed tool layouts

**Decision:** The **`src/app/sandbox/layout.tsx`** tree wraps children in **`PublicPageWrapper`** with **`contentAs="div"`** so **`PublicTopBar`** and **`PublicFooter`** apply to the portal and all tools without invalid nested **`<main>`** elements. Kitchen sink, interaction lab, and route lab use **`SandboxToolsShell`**: sidebar flush to the viewport edge (no **`PublicShellContainer`** around the whole row), main column content capped at **`max-w-[min(100%,92rem)]`**. **`PublicPageWrapper`** applies **`py-12`** only when **`contentAs="main"`**; for sandbox **`py-0`** on the content slot—**`/sandbox`** portal adds spacing via **`PublicShellContainer`** + **`py-8 md:py-12`**.

**Why:** One public chrome for the whole sandbox; more horizontal space for dev UIs; semantics-safe layout.

**Tradeoffs:** Slightly more layout composition on the portal page; tool layouts must not re-wrap with **`PublicShellContainer`**.

---

## 2026-04-03 — Members URL model (gateway + account-scoped)

**Decision:** Authenticated members UI lives under **`src/app/(members)/`**. Users land on **`/select-organisation`** after login (unless `from` is a safe **`/o/{accountId}/...`** path). Organisation-scoped pages use **`/o/[accountId]/...`** where **`accountId`** is the Strapi account id; full dashboard data loads via **`GET /api/account/organisation/[accountId]`** (BFF → CMS). Legacy flat **`/dashboard`**-style URLs redirect to the gateway.

**Why:** Matches [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) and [`.comms/responses/app-handoff-account-organisation-endpoint.md`](.comms/responses/app-handoff-account-organisation-endpoint.md) (two-step `account/me` + organisation aggregate).

**Tradeoffs:** Account ids appear in URLs; middleware cannot validate ownership (handled by CMS + **`OrgAccessBoundary`**). **Create organisation** remains TBC until CMS documents an API.
