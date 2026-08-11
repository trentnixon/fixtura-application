"use client";

import { X } from "lucide-react";

import { TypographyBodySmall, TypographyCaption } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { GridCardVisualSlot } from "@/components/ui/grid-card";
import { cn } from "@/lib/utils";

import { SelectOrgStatusBadge } from "./select-org-status-badge";
import { selectOrgPrimaryButtonVariant } from "../_utils/select-org-display-state";

import type { SelectOrganisationItemViewModel } from "../_utils/select-org-display-state";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type SelectOrgResumePanelProps = {
  item: SelectOrganisationItemViewModel;
  busy: boolean;
  pending: boolean;
  onPrimaryAction: () => void;
  onViewDetails: () => void;
  onDismiss: () => void;
};

export function SelectOrgResumePanel({
  item,
  busy,
  pending,
  onPrimaryAction,
  onViewDetails,
  onDismiss,
}: SelectOrgResumePanelProps) {
  const showDetails = item.displayState !== "needs-attention";
  const hideStatusBadge =
    item.displayState === "setup-required" && item.primaryActionLabel === "Continue setup";

  return (
    <section
      aria-label="Continue where you left off"
      className={cn(
        "border-border/70 bg-card relative flex w-full flex-col gap-4 overflow-hidden rounded-xl border p-4 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between min-[769px]:p-5",
        item.brandColors && "border-l-4",
      )}
      style={item.brandColors ? { borderLeftColor: item.brandColors.primary } : undefined}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 size-8"
        aria-label="Dismiss continue where you left off"
        onClick={onDismiss}
      >
        <X className="size-4" aria-hidden />
      </Button>
      <div className="flex min-w-0 flex-1 items-start gap-3 pr-8 min-[769px]:items-center min-[769px]:pr-10">
        <GridCardVisualSlot
          visual="org"
          className="!size-12 shrink-0 min-[769px]:!size-14"
          initials={initialsFromName(item.name)}
          {...(item.logo ? { imageSrc: item.logo, imageAlt: item.name } : {})}
          {...(item.brandColors ? { brandColors: item.brandColors } : {})}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <TypographyCaption
            as="p"
            tone="muted"
            className="font-medium tracking-wide uppercase max-[768px]:tracking-normal max-[768px]:normal-case"
          >
            <span className="min-[769px]:hidden">Continue</span>
            <span className="hidden min-[769px]:inline">Continue where you left off</span>
          </TypographyCaption>
          <TypographyBodySmall
            as="p"
            className="line-clamp-2 text-sm font-semibold min-[769px]:text-base"
          >
            {item.name}
          </TypographyBodySmall>
          <div className="flex flex-wrap items-center gap-2">
            {item.sport ? (
              <TypographyCaption as="span" tone="muted">
                {item.sport}
              </TypographyCaption>
            ) : null}
            {!hideStatusBadge ? (
              <SelectOrgStatusBadge
                displayState={item.displayState}
                statusLabel={item.statusLabel}
                statusDescription={item.statusDescription}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 min-[769px]:w-auto min-[769px]:flex-row min-[769px]:items-center">
        {showDetails ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full min-[769px]:w-auto"
            disabled={busy}
            onClick={onViewDetails}
          >
            View details
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={selectOrgPrimaryButtonVariant(item)}
          className="w-full min-[769px]:w-auto"
          disabled={busy}
          aria-busy={pending}
          onClick={onPrimaryAction}
        >
          {pending ? "Opening…" : item.primaryActionLabel}
        </Button>
      </div>
    </section>
  );
}
