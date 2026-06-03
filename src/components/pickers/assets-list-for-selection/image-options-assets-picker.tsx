"use client";

import { Image } from "lucide-react";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { ALL_SPORTS_KEY } from "./_consts";
import { useImageOptionsAssetsPicker } from "./_hooks";
import { assetCategoryTypeLabel } from "./_utils";

type ImageOptionsAssetsPickerProps = {
  /** Narrow sidebar: single column, no selection detail card (e.g. Remotion sandbox filters). */
  compact?: boolean;
  /** Show a select input for the asset. */
  isSelect?: boolean;
  /** Show a list of assets. */
  isList?: boolean;
  /**
   * Organisation (or other) sport: locks asset list to this sport and hides the Sport filter.
   */
  organisationSport?: string | null;
};

/** Self-contained: loads assets, sport filter, TanStack selection, grouped select, list, and detail. */
export function ImageOptionsAssetsPicker({
  compact = false,
  isSelect = false,
  isList = false,
  organisationSport = null,
}: ImageOptionsAssetsPickerProps) {
  const lockSportFilterTo =
    organisationSport != null && organisationSport.trim() !== "" ? organisationSport : null;

  const {
    assets,
    sportFilterOptions,
    sportFilter,
    setSportFilter,
    effectiveSportFilter,
    isSportFilterLocked,
    filteredAssets,
    assetsBySportAll,
    assetsBySport,
    resolvedSelectedId,
    selectValue,
    selected,
    showTypeBesideName,
    rawAssetCount,
    setSelectedId,
  } = useImageOptionsAssetsPicker(lockSportFilterTo !== null ? { lockSportFilterTo } : undefined);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs" role="status">
        {effectiveSportFilter !== ALL_SPORTS_KEY
          ? `Showing ${filteredAssets.length} of ${assets.length} Image Options asset${assets.length === 1 ? "" : "s"}`
          : `${assets.length} Image Options asset${assets.length === 1 ? "" : "s"} (published only)`}
        {assets.length > 0 &&
        effectiveSportFilter === ALL_SPORTS_KEY &&
        assetsBySportAll.length > 0 ? (
          <span className="text-muted-foreground/90">
            {" "}
            · {assetsBySportAll.map((g) => `${g.label}: ${g.items.length}`).join(" · ")}
          </span>
        ) : null}
        {isSportFilterLocked && lockSportFilterTo !== null ? (
          <span className="text-muted-foreground/90"> · {lockSportFilterTo}</span>
        ) : null}
        {!isSportFilterLocked &&
        effectiveSportFilter !== ALL_SPORTS_KEY &&
        filteredAssets.length > 0 ? (
          <span className="text-muted-foreground/90"> · sport filter active</span>
        ) : null}
      </p>

      {assets.length === 0 ? (
        <TypographyMuted className="text-sm">
          {rawAssetCount > 0
            ? "No assets in the Image Options category (response had other categories only)."
            : "No assets returned."}
        </TypographyMuted>
      ) : filteredAssets.length === 0 ? (
        <TypographyMuted className="text-sm">
          {lockSportFilterTo !== null
            ? `No Image Options assets for ${lockSportFilterTo}.`
            : "No Image Options assets for this sport. Choose another sport or All sports."}
        </TypographyMuted>
      ) : (
        <div className={cn("grid gap-6", !compact && "md:grid-cols-2")}>
          <div className="space-y-4">
            {!isSportFilterLocked ? (
              <div className="space-y-2">
                <Label htmlFor="asset-picker-sport-filter">Sport</Label>
                <Select
                  value={sportFilter}
                  onValueChange={setSportFilter}
                  disabled={assets.length === 0}
                >
                  <SelectTrigger id="asset-picker-sport-filter" className="w-full">
                    <SelectValue placeholder="Choose a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportFilterOptions.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {isSelect && (
              <div className="space-y-2">
                <Label htmlFor="asset-picker-asset-select">Select asset</Label>
                <Select
                  value={selectValue}
                  onValueChange={(v) => setSelectedId(v)}
                  disabled={filteredAssets.length === 0}
                >
                  <SelectTrigger id="asset-picker-asset-select" className="w-full">
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsBySport.map((group) => (
                      <SelectGroup key={group.key}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.items.map((a) => {
                          const typeLabel = assetCategoryTypeLabel(a);
                          const title = a.Name ?? `Asset ${a.id}`;
                          return (
                            <SelectItem key={a.id} value={String(a.id)}>
                              <span className="flex flex-wrap items-baseline gap-x-1.5">
                                <span>{title}</span>
                                {showTypeBesideName && typeLabel ? (
                                  <span className="text-muted-foreground text-xs font-normal">
                                    · {typeLabel}
                                  </span>
                                ) : null}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isList && (
              <div className="space-y-3">
                <TypographyMuted className="text-xs font-semibold tracking-wide uppercase">
                  {effectiveSportFilter === ALL_SPORTS_KEY ? "By sport" : "Assets"}
                </TypographyMuted>
                <div className="space-y-4">
                  {assetsBySport.map((group) => (
                    <div key={group.key} className="space-y-1.5">
                      <p className="text-foreground text-sm font-medium">{group.label}</p>
                      <div className="bg-card/50 rounded-xl border p-2">
                        <ul
                          className="flex flex-col gap-1"
                          role="listbox"
                          aria-label={`${group.label} — Image Options assets`}
                        >
                          {group.items.map((a) => {
                            const typeLabel = assetCategoryTypeLabel(a);
                            const title = a.Name ?? `Asset ${a.id}`;
                            const isSelected = resolvedSelectedId === String(a.id);
                            const desc = a.description?.trim();
                            const secondary =
                              desc ||
                              (showTypeBesideName && typeLabel ? typeLabel : null) ||
                              a.Sport ||
                              null;
                            return (
                              <li key={a.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => setSelectedId(String(a.id))}
                                  className={cn(
                                    "flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                                    "text-foreground cursor-pointer",
                                    isSelected
                                      ? "border-primary/25 bg-primary/10 ring-primary/20 hover:bg-primary/15 shadow-sm ring-1"
                                      : "hover:border-primary/15 hover:bg-primary/5 border-transparent",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                      !isSelected && "border-border bg-card text-muted-foreground",
                                      isSelected && "border-primary/40 bg-primary/15 text-primary",
                                    )}
                                    aria-hidden
                                  >
                                    <Image className="size-4 shrink-0" strokeWidth={2} />
                                  </span>
                                  <span className="min-w-0 flex-1 space-y-0.5">
                                    <span
                                      className={cn(
                                        "block text-sm font-medium",
                                        isSelected && "text-primary",
                                      )}
                                    >
                                      {title}
                                    </span>
                                    {secondary ? (
                                      <TypographyMuted
                                        className={cn("text-xs", isSelected && "text-primary/80")}
                                      >
                                        {secondary}
                                      </TypographyMuted>
                                    ) : null}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!compact && selected ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selection detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">id</dt>
                  <dd className="font-mono">{selected.id}</dd>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd>{selected.Name ?? "—"}</dd>
                  <dt className="text-muted-foreground">Sport</dt>
                  <dd>{selected.Sport ?? "—"}</dd>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{assetCategoryTypeLabel(selected) ?? "—"}</dd>
                  <dt className="text-muted-foreground">CompositionID</dt>
                  <dd className="font-mono text-xs break-all">{selected.CompositionID ?? "—"}</dd>
                  <dt className="text-muted-foreground">description</dt>
                  <dd className="wrap-break-word">{selected.description ?? "—"}</dd>
                </dl>
                <div className="pt-2">
                  <p className="text-muted-foreground mb-1 text-xs">Metadata</p>
                  <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
                    {selected.Metadata === null
                      ? "null"
                      : JSON.stringify(selected.Metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
