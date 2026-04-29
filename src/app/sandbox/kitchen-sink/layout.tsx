import Link from "next/link";

import { SandboxToolsShell } from "@/components/dev/sandbox-tools-shell";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

import type { ReactNode } from "react";

const K = ROUTES.kitchenSink;

const NAV_LINKS = [
  { href: K, label: "Overview" },
  { href: `${K}/brand-colors`, label: "Brand Colors" },
  { href: `${K}/typography`, label: "Typography" },
  { href: `${K}/containers`, label: "Containers" },
  { href: `${K}/navigation`, label: "Navigation" },
  { href: `${K}/sections-and-dividers`, label: "Sections & Dividers" },
  { href: `${K}/page-headers`, label: "Page Headers" },
  { href: `${K}/buttons`, label: "Buttons" },
  { href: `${K}/cards`, label: "Cards" },
  { href: `${K}/toasts`, label: "Toasts" },
  { href: `${K}/forms`, label: "Forms" },
  { href: `${K}/dialogs`, label: "Dialogs" },
  { href: `${K}/tables`, label: "Tables" },
  { href: `${K}/popovers`, label: "Popovers" },
  { href: `${K}/loading`, label: "Loading" },
  { href: `${K}/lists`, label: "Lists" },
  { href: `${K}/inputs`, label: "Inputs" },
];

export default function KitchenSinkLayout({ children }: { children: ReactNode }) {
  return (
    <SandboxToolsShell
      sidebar={
        <aside className="border-border bg-card sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r p-6">
          <div>
            <Link
              href={ROUTES.sandbox}
              className="text-primary hover:text-primary/90 mb-3 block text-sm font-semibold underline-offset-4 hover:underline"
            >
              ← Sandbox portal
            </Link>
            <TypographyH2 className="text-xl font-semibold tracking-tight">
              Kitchen Sink
            </TypographyH2>
            <TypographyMuted className="mt-1">Reference for design and patterns.</TypographyMuted>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
      }
    >
      {children}
    </SandboxToolsShell>
  );
}
