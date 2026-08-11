"use client";

import { Box, Database, LayoutGrid, Route, Zap, type LucideIcon } from "lucide-react";

import { GridCard, GridCardIcon } from "@/components/ui/grid-card";
import { ROUTES } from "@/lib/config/routes";
import { SANDBOX_PORTAL_LINKS } from "@/lib/dev-sandbox-nav";

const SANDBOX_TOOL_ICONS: Record<string, LucideIcon> = {
  [ROUTES.routeLab]: Route,
  [ROUTES.kitchenSink]: LayoutGrid,
  [ROUTES.interactionLab]: Zap,
  [ROUTES.dataLab]: Database,
};

export function SandboxPortalGrid() {
  return (
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
  );
}
