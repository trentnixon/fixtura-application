"use client";

import { ChevronDown, Search, X } from "lucide-react";

import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  countActiveMediaGalleryFilters,
  type MediaGalleryQueryState,
  type MediaGallerySort,
  type MediaGalleryStatusFilter,
  type MediaGalleryView,
} from "../_utils/media-gallery-query-state";

import type { MediaGalleryCategoryConfig } from "../_utils/media-gallery-category";
import type { ReactNode } from "react";

export type { MediaGalleryView } from "../_utils/media-gallery-query-state";
/** @deprecated Use MediaGalleryView */
export type MediaGalleryGroupBy = Exclude<MediaGalleryView, "pool">;

type MediaGalleryToolbarProps = {
  state: MediaGalleryQueryState;
  searchDraft: string;
  assetTypeOptions: readonly string[];
  categoryConfig: MediaGalleryCategoryConfig;
  totalCount: number;
  filteredCount: number;
  onSearchDraftChange: (value: string) => void;
  onStateChange: (patch: Partial<MediaGalleryQueryState>) => void;
  onClearFilters: () => void;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
};

const SORT_LABELS: Record<MediaGallerySort, string> = {
  updated: "Recently updated",
  available: "Available first",
  unavailable: "Unavailable first",
  title: "Title A–Z",
};

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-muted-foreground text-[10px] font-semibold tracking-tight uppercase"
    >
      {children}
    </Label>
  );
}

function MultiSelectPopover({
  label,
  emptyLabel,
  options,
  selected,
  onToggle,
}: {
  label: string;
  emptyLabel: string;
  options: readonly { id: string; label: string }[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  const count = selected.length;
  const selectedLabels = options
    .filter((option) => selected.includes(option.id))
    .map((option) => option.label);
  const triggerLabel =
    count === 0 ? emptyLabel : count === 1 ? selectedLabels[0] : `${count} selected`;

  return (
    <div className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-full cursor-pointer justify-between gap-2 font-normal",
              count > 0 && "border-primary/40 bg-primary/5",
            )}
            aria-label={`${label}: ${triggerLabel}`}
          >
            <span className="truncate">{triggerLabel}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              {count > 0 ? (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 justify-center px-1.5 text-[10px]"
                >
                  {count}
                </Badge>
              ) : null}
              <ChevronDown className="text-muted-foreground size-3.5" aria-hidden />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-3">
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {options.length === 0 ? (
              <TypographyMuted className="text-xs">No options available</TypographyMuted>
            ) : (
              options.map((option) => {
                const checked = selected.includes(option.id);
                const id = `media-gallery-${label}-${option.id}`.replace(/\s+/g, "-").toLowerCase();
                return (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => onToggle(option.id)}
                    />
                    <Label htmlFor={id} className="truncate text-sm font-normal">
                      {option.label}
                    </Label>
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MediaGalleryFiltersToggle({
  open,
  activeFilterCount,
  onOpenChange,
}: {
  open: boolean;
  activeFilterCount: number;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-9 shrink-0 cursor-pointer",
        open && "border-primary/40 bg-primary/5",
        activeFilterCount > 0 && !open && "border-primary/40",
      )}
      aria-expanded={open}
      aria-controls="media-gallery-filters"
      onClick={() => onOpenChange(!open)}
    >
      {open ? "Hide filters" : "Filters"}
      {activeFilterCount > 0 ? (
        <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px]">
          {activeFilterCount}
        </Badge>
      ) : null}
    </Button>
  );
}

export function MediaGalleryToolbar({
  state,
  searchDraft,
  assetTypeOptions,
  categoryConfig,
  totalCount,
  filteredCount,
  onSearchDraftChange,
  onStateChange,
  onClearFilters,
  filtersOpen,
  onFiltersOpenChange,
}: MediaGalleryToolbarProps) {
  const activeFilterCount = countActiveMediaGalleryFilters(state);

  const toggleCategoryTarget = (value: string) => {
    const next = state.categoryTargets.includes(value)
      ? state.categoryTargets.filter((entry) => entry !== value)
      : [...state.categoryTargets, value];
    onStateChange({ categoryTargets: next });
  };

  const toggleAssetType = (value: string) => {
    const next = state.assetTypes.includes(value)
      ? state.assetTypes.filter((entry) => entry !== value)
      : [...state.assetTypes, value];
    onStateChange({ assetTypes: next });
  };

  if (!filtersOpen) return null;

  return (
    <div
      id="media-gallery-filters"
      className="bg-card/50 w-full min-w-0 overflow-hidden rounded-xl border"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-5">
        <TypographyMuted className="text-xs" aria-live="polite">
          Showing {filteredCount} of {totalCount} {totalCount === 1 ? "image" : "images"}
          {activeFilterCount > 0
            ? ` · ${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"}`
            : null}
        </TypographyMuted>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="warningOutline"
              className="h-8 shrink-0 cursor-pointer"
              onClick={onClearFilters}
            >
              <X className="size-3.5" aria-hidden />
              Clear filters
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 shrink-0 cursor-pointer"
            onClick={() => onFiltersOpenChange(false)}
          >
            Hide
          </Button>
        </div>
      </div>

      <div className="bg-muted/35 m-4 grid gap-4 rounded-lg border px-3 py-3 sm:m-5 sm:px-4">
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="media-gallery-search">Search</FieldLabel>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
            <Input
              id="media-gallery-search"
              type="search"
              value={searchDraft}
              placeholder="Search by title"
              className="h-9 rounded-lg pl-10"
              onChange={(event) => onSearchDraftChange(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-1.5">
            <FieldLabel htmlFor="media-gallery-status-filter">Availability</FieldLabel>
            <Select
              value={state.status}
              onValueChange={(value) =>
                onStateChange({ status: value as MediaGalleryStatusFilter })
              }
            >
              <SelectTrigger id="media-gallery-status-filter" className="h-9 w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <MultiSelectPopover
            label={categoryConfig.categoryLabel}
            emptyLabel={categoryConfig.filterEmptyLabel}
            options={categoryConfig.options}
            selected={state.categoryTargets}
            onToggle={toggleCategoryTarget}
          />

          <MultiSelectPopover
            label="Asset type"
            emptyLabel="All asset types"
            options={assetTypeOptions.map((option) => ({ id: option, label: option }))}
            selected={state.assetTypes}
            onToggle={toggleAssetType}
          />

          <div className="grid gap-1.5">
            <FieldLabel htmlFor="media-gallery-sort">Sort</FieldLabel>
            <Select
              value={state.sort}
              onValueChange={(value) => onStateChange({ sort: value as MediaGallerySort })}
            >
              <SelectTrigger id="media-gallery-sort" className="h-9 w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as MediaGallerySort[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SORT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="media-gallery-needs-attention"
              checked={state.needsAttention}
              onCheckedChange={(checked) => onStateChange({ needsAttention: Boolean(checked) })}
            />
            <Label htmlFor="media-gallery-needs-attention" className="text-sm font-normal">
              Needs attention
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="media-gallery-needs-recategorisation"
              checked={state.needsRecategorisation}
              onCheckedChange={(checked) =>
                onStateChange({ needsRecategorisation: Boolean(checked) })
              }
            />
            <Label htmlFor="media-gallery-needs-recategorisation" className="text-sm font-normal">
              Needs recategorisation
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
