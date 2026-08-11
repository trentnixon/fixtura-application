"use client";

import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { SelectOrganisationDisplayState } from "../_utils/select-org-display-state";

type SelectOrgStatusBadgeProps = {
  displayState: SelectOrganisationDisplayState;
  statusLabel: string;
  statusDescription: string;
  className?: string;
  onInfoClick?: () => void;
};

function badgeVariant(
  displayState: SelectOrganisationDisplayState,
): "default" | "secondary" | "destructive" | "outline" {
  switch (displayState) {
    case "active":
      return "outline";
    case "setup-required":
      return "secondary";
    case "needs-attention":
      return "destructive";
    case "preparing":
    case "updating":
      return "outline";
    default:
      return "outline";
  }
}

export const selectOrgBadgeXsClass =
  "h-4 px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase";

export function SelectOrgStatusBadge({
  displayState,
  statusLabel,
  statusDescription,
  className,
  onInfoClick,
}: SelectOrgStatusBadgeProps) {
  if (displayState === "status-loading") {
    return <Skeleton className={cn("h-5 w-24 rounded-full", className)} aria-hidden />;
  }

  const badge = (
    <Badge
      variant={badgeVariant(displayState)}
      className={cn(
        selectOrgBadgeXsClass,
        displayState === "active" &&
          "bg-success-600 hover:bg-success-600/90 border-transparent text-white",
        className,
      )}
    >
      {statusLabel}
    </Badge>
  );

  if (!statusDescription) return badge;

  if (onInfoClick) {
    return (
      <div className="flex items-center gap-1">
        {badge}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`About ${statusLabel} status`}
          onClick={onInfoClick}
        >
          <Info className="size-3" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {statusDescription}
      </TooltipContent>
    </Tooltip>
  );
}
