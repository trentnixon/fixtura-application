"use client";

import { Info } from "lucide-react";

import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyCardTitle,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GridCardVisualSlot,
  selectOrgBrandTileStyle,
  selectOrgGridTileSurfaceClass,
} from "@/components/ui/grid-card";
import { cn } from "@/lib/utils";

import { SelectOrgStatusBadge, selectOrgBadgeXsClass } from "./select-org-status-badge";
import { selectOrgPrimaryButtonVariant } from "../_utils/select-org-display-state";

import type { SelectOrganisationItemViewModel } from "../_utils/select-org-display-state";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function shouldHideStatusBadge(item: SelectOrganisationItemViewModel): boolean {
  return item.displayState === "setup-required" && item.primaryActionLabel === "Continue setup";
}

type SelectOrgItemActionProps = {
  item: SelectOrganisationItemViewModel;
  busy: boolean;
  pending: boolean;
  onPrimaryAction: () => void;
  onStatusInfo?: () => void;
};

function SelectOrgStatusBadgeOnly({ item }: { item: SelectOrganisationItemViewModel }) {
  if (item.displayState === "status-loading") {
    return (
      <SelectOrgStatusBadge
        displayState={item.displayState}
        statusLabel={item.statusLabel}
        statusDescription={item.statusDescription}
      />
    );
  }

  if (shouldHideStatusBadge(item)) {
    return null;
  }

  return (
    <SelectOrgStatusBadge
      displayState={item.displayState}
      statusLabel={item.statusLabel}
      statusDescription={item.statusDescription}
    />
  );
}

function SelectOrgPrimaryActionLabel({ pending, label }: { pending: boolean; label: string }) {
  if (pending) return "Opening…";
  if (label !== "Open organisation") return label;
  return (
    <>
      <span className="lg:hidden">Open</span>
      <span className="hidden lg:inline">Open organisation</span>
    </>
  );
}

function SelectOrgStatusInfoButton({
  item,
  onStatusInfo,
  className,
}: {
  item: SelectOrganisationItemViewModel;
  onStatusInfo?: () => void;
  className?: string;
}) {
  if (!onStatusInfo || item.displayState === "status-loading") {
    return null;
  }

  const ariaLabel =
    item.displayState === "setup-required"
      ? `About ${item.name} setup`
      : `About ${item.statusLabel} status`;

  return (
    <button
      type="button"
      className={cn(
        "text-muted-foreground hover:text-foreground border-border/70 bg-background/80 focus-visible:ring-ring hidden size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ease-out focus-visible:ring-2 focus-visible:outline-none lg:inline-flex",
        className,
      )}
      aria-label={ariaLabel}
      onClick={onStatusInfo}
    >
      <Info className="size-3" aria-hidden />
    </button>
  );
}

export function SelectOrgGridItem({
  item,
  busy,
  pending,
  onPrimaryAction,
  onStatusInfo,
}: SelectOrgItemActionProps) {
  const disabled = busy && !pending;
  const tileStyle = selectOrgBrandTileStyle(item.brandColors);

  return (
    <article
      aria-label={item.name}
      aria-busy={pending}
      className={cn(
        selectOrgGridTileSurfaceClass,
        "justify-between gap-1.5 p-2 pt-6 lg:gap-2 lg:p-3 lg:pt-4 xl:p-4",
        disabled && "opacity-60",
      )}
      style={tileStyle}
    >
      {item.brandColors ? (
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-1.5 rounded-b-[1.25rem]"
          style={{
            backgroundImage: `linear-gradient(90deg, ${item.brandColors.primary} 0%, ${item.brandColors.secondary} 100%)`,
          }}
          aria-hidden
        />
      ) : null}
      {item.isNew ? (
        <Badge
          variant="destructive"
          className={cn(
            "absolute top-1.5 right-1.5 z-10 lg:top-2 lg:right-2",
            selectOrgBadgeXsClass,
          )}
        >
          New
        </Badge>
      ) : null}
      <div className="absolute top-1.5 left-1.5 z-10 flex max-w-[calc(100%-1rem)] items-center gap-0.5 lg:top-2 lg:left-2">
        <SelectOrgStatusBadgeOnly item={item} />
      </div>
      <div className="relative z-[2] flex min-h-0 flex-1 flex-col items-center gap-1 text-center lg:gap-1.5">
        <div className="pt-1 transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100 lg:pt-2">
          <GridCardVisualSlot
            visual="org"
            className="!size-14 lg:!size-[4.75rem]"
            initials={initialsFromName(item.name)}
            {...(item.logo ? { imageSrc: item.logo, imageAlt: item.name } : {})}
            {...(item.brandColors ? { brandColors: item.brandColors } : {})}
          />
        </div>
        {item.sport ? (
          <TypographyCaption className="line-clamp-1 w-full">{item.sport}</TypographyCaption>
        ) : null}
        <TypographyCardTitle className="mt-auto line-clamp-2 w-full shrink-0 text-xs leading-tight font-semibold sm:text-xs lg:text-sm lg:leading-none xl:text-base">
          {item.name}
        </TypographyCardTitle>
      </div>
      <div className="relative z-[2] mt-auto flex w-full items-center gap-1.5 pt-1.5 lg:pt-2">
        <Button
          type="button"
          size="xs"
          variant={selectOrgPrimaryButtonVariant(item)}
          className="min-w-0 flex-1"
          disabled={disabled}
          aria-busy={pending}
          aria-label={pending ? "Opening…" : item.primaryActionLabel}
          onClick={onPrimaryAction}
        >
          <SelectOrgPrimaryActionLabel pending={pending} label={item.primaryActionLabel} />
        </Button>
        <SelectOrgStatusInfoButton item={item} {...(onStatusInfo ? { onStatusInfo } : {})} />
      </div>
    </article>
  );
}

type SelectOrgListItemProps = SelectOrgItemActionProps & {
  showLastOpened?: boolean;
};

export function SelectOrgListItem({
  item,
  busy,
  pending,
  onPrimaryAction,
  onStatusInfo,
  showLastOpened = false,
}: SelectOrgListItemProps) {
  const disabled = busy && !pending;

  return (
    <article
      aria-label={item.name}
      aria-busy={pending}
      className={cn(
        "border-border/60 bg-card flex items-center gap-2 rounded-xl border px-2.5 py-2.5 lg:gap-3 lg:px-3 lg:py-3 xl:gap-4 xl:px-4",
        disabled && "opacity-60",
      )}
    >
      <GridCardVisualSlot
        visual="org"
        className="!size-9 shrink-0 lg:!size-11 xl:!size-12"
        initials={initialsFromName(item.name)}
        {...(item.logo ? { imageSrc: item.logo, imageAlt: item.name } : {})}
        {...(item.brandColors ? { brandColors: item.brandColors } : {})}
      />
      <div className="min-w-0 flex-1 space-y-0.5 lg:space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <TypographyBodySmall as="p" className="truncate text-xs font-semibold lg:text-sm">
            {item.name}
          </TypographyBodySmall>
          {item.isNew ? (
            <Badge variant="destructive" className={selectOrgBadgeXsClass}>
              New
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          {item.sport ? (
            <TypographyCaption as="span" tone="muted">
              {item.sport}
            </TypographyCaption>
          ) : null}
          <SelectOrgStatusBadgeOnly item={item} />
        </div>
        {showLastOpened && item.lastOpenedAt ? (
          <TypographyCaption as="span" tone="muted">
            Last opened {new Date(item.lastOpenedAt).toLocaleDateString()}
          </TypographyCaption>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          size="xs"
          variant={selectOrgPrimaryButtonVariant(item)}
          className="min-w-0 lg:min-w-[7.5rem]"
          disabled={disabled}
          aria-busy={pending}
          aria-label={pending ? "Opening…" : item.primaryActionLabel}
          onClick={onPrimaryAction}
        >
          <SelectOrgPrimaryActionLabel pending={pending} label={item.primaryActionLabel} />
        </Button>
        <SelectOrgStatusInfoButton item={item} {...(onStatusInfo ? { onStatusInfo } : {})} />
      </div>
    </article>
  );
}
