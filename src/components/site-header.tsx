"use client";

import { usePathname } from "next/navigation";

import { ScopedOnboardingSyncBanner } from "@/components/scoped-onboarding-sync-banner";
import { TypographyNavLabel } from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

/**
 * Maps current URL to a human-readable page title.
 */
function getPageTitle(pathname: string): string {
  if (pathname === ROUTES.selectOrganisation) return "Select organisation";
  if (pathname === ROUTES.createOrganisation) return "Create organisation";

  const scoped = parseAccountScopePath(pathname);
  if (scoped) {
    const seg = scoped.rest.split("/")[0] ?? "";
    if (seg === "dashboard") return "Dashboard";
    if (seg === "settings") return "Settings";
    if (seg === "bundles") return "Bundles";
    if (seg === "branding") return "Branding";
    if (seg === "template-builder") return "Templates";
    if (seg === "media-gallery") return "Media Gallery";
    if (seg === "manage-sponsors") return "Sponsorships";
    if (seg === "billing") return "Billing";
    if (seg === "season") return "Season Control";
    if (seg === "account") return "Account";
  }

  if (pathname === ROUTES.sandbox) return "Sandbox";
  if (pathname.startsWith(ROUTES.kitchenSink)) return "Kitchen Sink";
  if (pathname.startsWith(ROUTES.routeLab)) return "Route lab";
  if (pathname.startsWith(ROUTES.interactionLab)) return "Interaction lab";
  if (pathname === ROUTES.help) return "Help \u0026 Support";

  if (pathname.startsWith("/admin/system")) {
    if (pathname.includes("inspector")) return "System Inspector";
    if (pathname.includes("fetch-health")) return "Fetch Health";
    return "System";
  }

  const lastSegment = pathname.split("/").pop();
  if (lastSegment) {
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  return "Fixtura";
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex shrink-0 flex-col border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-(--header-height)">
      <div className="flex h-(--header-height) items-center gap-2">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <TypographyNavLabel as="h1" className="text-base font-medium">
            {title}
          </TypographyNavLabel>
        </div>
      </div>
      <ScopedOnboardingSyncBanner />
    </header>
  );
}
