# Fixtura Members Area — Private App Shell

> **Route group note (2026):** The shared members shell described here is implemented under **`src/app/(members)/`** (replacing earlier `(auth)` examples in this doc). Navigation is **gateway vs scoped**: see [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) and the **Application implementation** table at the end of that document.

## Purpose

This document defines the recommended implementation approach for the **Fixtura private members area shell**.

It takes the provided shadcn sidebar shell example and adapts it into a **production-ready authenticated application layout** for Fixtura.

This shell is intended to be the shared frame for all protected routes inside the members application.

---

## Locked Decisions

The following shell decisions are now considered agreed for the first implementation pass:

- **Desktop navigation:** full persistent sidebar
- **Desktop collapsed mode:** collapsible icon-only sidebar
- **Mobile navigation:** drawer-style sidebar
- **Header pattern:** title only
- **Content width:** full width
- **Visual tone:** Fixtura branding and style system, not generic starter styling

---

## Design Intent

The shell should feel:

- calm
- structured
- operational
- professional
- branded, but not loud

This is not a marketing layout.
This is not a dashboard card demo.
This is the structural operating frame for the authenticated members experience.

---

## Shell Responsibilities

The private app shell is responsible for:

- authenticated application framing
- global navigation
- responsive sidebar behaviour
- page title display
- consistent page padding and spacing
- defining the visual boundary between navigation and page content

The shell is **not** responsible for:

- individual page business logic
- feature-specific layout inventions
- security decisions

Security remains controlled by middleware and auth-aware server logic.

---

## Layout Model

The shell should follow this structure:

1. `SidebarProvider`
2. `AppSidebar`
3. `SidebarInset`
4. `AppHeader`
5. `PageBody`
6. page content (`children`)

### Mental model

- `AppSidebar` = navigation system
- `AppHeader` = current page context
- `PageBody` = standard full-width content wrapper
- `children` = route-specific content only

---

## Recommended File Structure

```txt
app/
  (auth)/
    layout.tsx
    dashboard/page.tsx
    bundles/page.tsx
    templates/page.tsx
    media-gallery/page.tsx
    sponsors/page.tsx
    season/page.tsx
    settings/page.tsx
    kitchen-sink/page.tsx

components/
  layout/
    app-shell.tsx
    app-sidebar.tsx
    app-header.tsx
    page-body.tsx
    nav-main.tsx
    nav-secondary.tsx
    nav-user.tsx

lib/
  navigation/
    app-nav.ts
```

---

## Implementation Strategy

Build this shell in four layers.

### Layer 1 — Shared authenticated layout

Create the shared protected layout in `app/(auth)/layout.tsx`.

Responsibilities:

- mount the sidebar provider
- render the sidebar
- render the shared header
- wrap page content in a reusable body container

### Layer 2 — Sidebar system

Create the sidebar as the primary navigation UI.

Required behaviour:

- fully visible on desktop
- collapsible to icon rail on desktop
- temporary drawer on mobile
- supports grouped navigation items
- supports a secondary utility/support section

### Layer 3 — Header system

Create a title-only header.

Required behaviour:

- show sidebar trigger
- show current page title
- support future right-side utilities without redesigning the component

No breadcrumbs in v1.

### Layer 4 — Page body wrapper

Create a reusable full-width page body wrapper.

Required behaviour:

- standard horizontal padding
- standard vertical spacing
- no restrictive max-width container
- works for dashboards, data tables, forms, and media screens

---

## Recommended Navigation Shape

### Primary navigation

- Dashboard
- Content Bundles
- Templates
- Media Gallery
- Sponsors
- Season

### Secondary navigation

- Kitchen Sink
- Settings
- Help

### User/account area

- Account
- Logout

This structure can be refined later, but the shell should be built to support this pattern from the start.

---

## Styling Recommendations

Use shadcn component behaviour and composition, but apply Fixtura styling decisions.

### Recommendations

- use Fixtura brand colors via tokens or theme variables
- keep surfaces restrained
- use subtle borders instead of heavy shadows
- use consistent radius values
- use calm spacing, not dense stacking
- keep the header and sidebar visually related

### Avoid

- placeholder demo cards in production shell
- oversized decorative gradients
- inconsistent internal spacing per page
- adding page-specific navigation into the shell

---

## Core Rule

> The authenticated shell owns navigation, framing, spacing, and page context. Pages only own their content.

This rule should be followed consistently to prevent layout drift as new areas are added.

---

## Provided Starter Example

This is the boilerplate example being adapted:

```tsx
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## Recommended Adaptation

The boilerplate should be simplified and restructured.

### Main changes

- remove breadcrumb usage from the shell
- replace placeholder demo blocks with `{children}`
- move header into a reusable component
- move body spacing into a reusable wrapper
- move navigation configuration into a dedicated data structure

---

## Recommended Code

### `app/(auth)/layout.tsx`

```tsx
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { PageBody } from "@/components/layout/page-body";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader title="Dashboard" />
        <PageBody>{children}</PageBody>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

### `components/layout/app-header.tsx`

```tsx
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <header className="bg-background flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="hidden h-4 md:block" />
        <div>
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
```

---

### `components/layout/page-body.tsx`

```tsx
interface PageBodyProps {
  children: React.ReactNode;
}

export function PageBody({ children }: PageBodyProps) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8">{children}</div>
    </main>
  );
}
```

---

### `lib/navigation/app-nav.ts`

```tsx
import {
  LayoutDashboard,
  FolderKanban,
  PencilRuler,
  Images,
  HandCoins,
  CalendarRange,
  Settings,
  BookOpen,
  CircleHelp,
  User,
  LogOut,
} from "lucide-react";

export const primaryNavItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Content Bundles",
    url: "/app/bundles",
    icon: FolderKanban,
  },
  {
    title: "Templates",
    url: "/app/templates",
    icon: PencilRuler,
  },
  {
    title: "Media Gallery",
    url: "/app/media-gallery",
    icon: Images,
  },
  {
    title: "Sponsors",
    url: "/app/sponsors",
    icon: HandCoins,
  },
  {
    title: "Season",
    url: "/app/season",
    icon: CalendarRange,
  },
];

export const secondaryNavItems = [
  {
    title: "Kitchen Sink",
    url: "/sandbox/kitchen-sink",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/app/help",
    icon: CircleHelp,
  },
];

export const userNavItems = [
  {
    title: "Account",
    url: "/app/account",
    icon: User,
  },
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
  },
];
```

---

### `components/layout/app-sidebar.tsx`

```tsx
import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { primaryNavItems, secondaryNavItems, userNavItems } from "@/lib/navigation/app-nav";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-background flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold">
            F
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Fixtura</p>
            <p className="text-muted-foreground truncate text-xs">Members Area</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {userNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
```

---

### Example page using the shell

```tsx
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm">
          This is where the dashboard content will begin.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card rounded-xl border p-4">Metric card</div>
        <div className="bg-card rounded-xl border p-4">Metric card</div>
        <div className="bg-card rounded-xl border p-4">Metric card</div>
        <div className="bg-card rounded-xl border p-4">Metric card</div>
      </section>
    </div>
  );
}
```

---

## Important Note About Page Titles

The example `layout.tsx` hardcodes `title="Dashboard"`.

That is acceptable as a starting implementation, but not the final pattern.

### Recommended follow-up

Move page titles into one of these approaches:

1. route-based title mapping
2. page-level header injection
3. segment-aware layout helper

For the first pass, hardcoded titles are fine while the shell is being assembled.

---

## Recommended First Build Sequence

### Step 1

Build the shared protected layout with sidebar, inset, header, and page body.

### Step 2

Build static navigation items and verify responsive sidebar behaviour.

### Step 3

Swap the shell onto one protected route such as dashboard.

### Step 4

Apply Fixtura-specific visual styling.

### Step 5

Refine title handling and active navigation states.

### Step 6

Introduce layout primitives for cards, sections, and page headers as needed.

---

## Future Enhancements

After the shell is stable, likely next improvements will be:

- active route highlighting
- dynamic page titles
- account dropdown in header or sidebar footer
- notification area
- team/club switcher if needed
- skeleton states for route loading
- tighter integration with kitchen sink patterns

---

## Final Recommendation

The provided shadcn shell should be used as a behavioural foundation only.

The production Fixtura version should:

- keep the responsive sidebar mechanics
- remove breadcrumb/demo assumptions
- enforce a reusable authenticated shell
- use full-width content layout
- adopt Fixtura’s own styling language
- keep page implementation separate from shell implementation

This gives Fixtura a stable private-area frame that can scale cleanly as the members application grows.
