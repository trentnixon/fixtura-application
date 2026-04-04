import { Box, LayoutGrid, Route, Zap, type LucideIcon } from "lucide-react";

import { TypographyH1, TypographyInlineCode, TypographyMuted } from "@/components/typography";
import { GridCard, GridCardIcon } from "@/components/ui/grid-card";
import { ROUTES } from "@/lib/config/routes";
import { SANDBOX_PORTAL_LINKS } from "@/lib/dev-sandbox-nav";

export const metadata = {
  title: "Sandbox",
  description:
    "Development sandbox portal — route lab, kitchen sink, interaction lab, and future tools.",
};

const SANDBOX_TOOL_ICONS: Record<string, LucideIcon> = {
  [ROUTES.routeLab]: Route,
  [ROUTES.kitchenSink]: LayoutGrid,
  [ROUTES.interactionLab]: Zap,
};

export default function SandboxPortalPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Development only
        </TypographyMuted>
        <TypographyH1 className="text-3xl font-semibold">Sandbox portal</TypographyH1>
        <TypographyMuted className="max-w-2xl leading-relaxed">
          All URLs under <TypographyInlineCode>{ROUTES.sandbox}</TypographyInlineCode> are hidden
          unless <TypographyInlineCode>NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true</TypographyInlineCode>.
          Use the tiles below to open tools; register new areas in{" "}
          <TypographyInlineCode>src/lib/dev-sandbox-nav.ts</TypographyInlineCode>.
        </TypographyMuted>
      </header>

      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
        {SANDBOX_PORTAL_LINKS.map((item) => {
          const Icon = SANDBOX_TOOL_ICONS[item.href] ?? Box;
          return (
            <GridCard
              key={item.href}
              title={item.label}
              ctaLabel="Open"
              href={item.href}
              visual={<GridCardIcon icon={Icon} />}
              {...(item.description ? { description: item.description } : {})}
            />
          );
        })}
      </div>
    </div>
  );
}
