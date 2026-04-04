"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TypographyH2, TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";
import { ROUTE_LAB_NAV_SECTIONS } from "@/lib/dev-sandbox-nav";
import { cn } from "@/lib/utils";

function screenLinkActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function SandboxRouteLabSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-card sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r p-6">
      <div>
        <Link
          href={ROUTES.sandbox}
          className="text-primary hover:text-primary/90 mb-3 block text-sm font-semibold underline-offset-4 hover:underline"
        >
          ← Sandbox portal
        </Link>
        <TypographyH2 className="text-xl font-semibold tracking-tight">Route lab</TypographyH2>
        <TypographyMuted className="mt-1">
          Full pages, routes, and flow states. Register screens in{" "}
          <code className="text-xs">dev-sandbox-nav.ts</code>.
        </TypographyMuted>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase">
          Route lab screens
        </p>
        <p className="text-muted-foreground -mt-2 px-1 text-xs">
          Use <code className="text-[0.65rem]">state</code> /{" "}
          <code className="text-[0.65rem]">mode</code> query params where each page supports them.
        </p>
        {ROUTE_LAB_NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              {section.title}
            </p>
            <nav className="flex flex-col gap-1" aria-label={section.title}>
              {section.links.map((link) => {
                const active = screenLinkActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "hover:bg-secondary rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
