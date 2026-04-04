"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/config/routes";
import { ROUTE_LAB_NAV_SECTIONS, SANDBOX_PORTAL_LINKS } from "@/lib/dev-sandbox-nav";
import { cn } from "@/lib/utils";

function portalLinkActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (href === ROUTES.routeLab && pathname.startsWith(`${ROUTES.routeLab}/`)) return true;
  if (href === ROUTES.kitchenSink && pathname.startsWith(`${ROUTES.kitchenSink}/`)) return true;
  if (href === ROUTES.interactionLab && pathname.startsWith(`${ROUTES.interactionLab}/`))
    return true;
  return false;
}

function sandboxPortalHomeActive(pathname: string): boolean {
  return pathname === ROUTES.sandbox;
}

function screenLinkActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function SandboxRouteLabSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-card sticky top-0 flex h-screen w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r p-6">
      <div>
        <h2 className="font-heading text-foreground text-xl font-semibold tracking-tight">
          Dev sandbox
        </h2>
        <p className="text-muted-foreground mt-1 font-sans text-sm">
          Environment-gated tools. Add new areas in{" "}
          <code className="text-xs">dev-sandbox-nav.ts</code>.
        </p>
        <Link
          href={ROUTES.sandbox}
          className={cn(
            "mt-3 inline-flex text-sm font-semibold underline-offset-4 hover:underline",
            sandboxPortalHomeActive(pathname)
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          ← Sandbox portal (home)
        </Link>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase">
          Tools
        </p>
        <nav
          className="border-border bg-muted/40 flex flex-col gap-1 rounded-lg border p-2"
          aria-label="Sandbox areas"
        >
          {SANDBOX_PORTAL_LINKS.map((item) => {
            const active = portalLinkActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:bg-secondary rounded-md px-3 py-2.5 transition-colors",
                  active
                    ? "bg-secondary text-foreground ring-ring ring-1"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs leading-snug opacity-80">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
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
