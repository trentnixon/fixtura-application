"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TEMPLATE_BUILDER_CHANGED_BADGE_CLASS =
  "border-amber-500/30 bg-amber-500/15 text-amber-700 shadow-sm dark:text-amber-400";

const TEMPLATE_BUILDER_CHANGED_BADGE_FLOATING_CLASS =
  "pointer-events-none fixed bottom-[10px] left-1/2 z-50 -translate-x-1/2";

export function TemplateBuilderChangedBadge({
  placement = "floating",
  className,
}: {
  placement?: "floating" | "title";
  className?: string;
}) {
  return (
    <Badge
      role="status"
      aria-label="Changed from saved"
      variant="outline"
      className={cn(
        TEMPLATE_BUILDER_CHANGED_BADGE_CLASS,
        placement === "floating" && TEMPLATE_BUILDER_CHANGED_BADGE_FLOATING_CLASS,
        className,
      )}
    >
      Changed
    </Badge>
  );
}
