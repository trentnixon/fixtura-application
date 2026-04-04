import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

/** Width preset for scenario UI inside RouteLabPage. */
export type RouteLabContentPreset = "auth" | "form" | "full";

const PRESET_CLASS: Record<RouteLabContentPreset, string> = {
  /** Narrow column — public auth-style screens (matches AuthContentContainer width). */
  auth: "mx-auto w-full max-w-md",
  /** Single-column forms — create organisation, similar. */
  form: "mx-auto w-full max-w-lg",
  /** Full width of the route-lab main column — grids, dashboards, settings. */
  full: "w-full min-w-0",
};

type RouteLabScreenBodyProps = {
  preset: RouteLabContentPreset;
  className?: string;
  children: ReactNode;
};

/**
 * Consistent inner content width for `/sandbox/route-lab/*` screens.
 * Use via RouteLabPage `contentPreset`; do not re-wrap with ad hoc max-w-* on each page.
 */
export function RouteLabScreenBody({ preset, className, children }: RouteLabScreenBodyProps) {
  return <div className={cn(PRESET_CLASS[preset], className)}>{children}</div>;
}
