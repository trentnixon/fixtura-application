import Link from "next/link";

import { SandboxToolsShell } from "@/components/dev/sandbox-tools-shell";
import { TypographyH2, TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";
import { INTERACTION_LAB_NAV_SECTIONS } from "@/lib/dev-sandbox-nav";

import type { ReactNode } from "react";

const IL = ROUTES.interactionLab;

export default function InteractionLabLayout({ children }: { children: ReactNode }) {
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
              Interaction lab
            </TypographyH2>
            <TypographyMuted className="mt-1">
              Placeholders for behaviour and stateful UI—implement scenarios later.
            </TypographyMuted>
          </div>
          <nav className="mt-4 flex flex-col gap-6">
            <Link
              href={IL}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              Overview
            </Link>
            {INTERACTION_LAB_NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <TypographyMuted className="mb-2 px-3 text-xs font-semibold tracking-wide uppercase">
                  {section.title}
                </TypographyMuted>
                <div className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      }
    >
      {children}
    </SandboxToolsShell>
  );
}
