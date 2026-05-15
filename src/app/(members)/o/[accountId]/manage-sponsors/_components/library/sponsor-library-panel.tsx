import { FolderKanban } from "lucide-react";

import { MediaCard, MetricComparisonCard } from "@/components/cards";
import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyMuted,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SponsorLibraryToolbar } from "./sponsor-library-toolbar";

import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../../_types/manage-sponsors";

export type SponsorPoolStats = {
  total: number;
  placed: number;
  unassigned: number;
  archived: number;
};

export function SponsorLibraryPanel({
  sponsors,
  stats,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
  onEditSponsor,
}: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  stats: SponsorPoolStats;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
  disabled?: boolean;
  /** When set, the pool card exposes Edit to manage sponsor fields remotely. */
  onEditSponsor?: (sponsorId: number | string) => void;
}) {
  const poolMetrics: Array<[string, number]> = [
    ["Total sponsors", stats.total],
    ["Placed", stats.placed],
    ["Unassigned", stats.unassigned],
    ["Archived", stats.archived],
  ];

  return (
    <MetricComparisonCard
      className="h-full min-h-0 shadow-sm"
      layout="card"
      headerClassName="px-4 py-4 sm:px-5"
      bodyClassName="px-4 py-4 sm:px-5"
      footerClassName="items-center px-4 py-4 sm:px-5"
      title="Sponsor pool"
      icon={<FolderKanban className="text-primary size-5 shrink-0" aria-hidden />}
      body={
        <div className="space-y-3">
          <div className="grid gap-3">
            <SponsorLibraryToolbar
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              disabled={disabled}
            />
            {disabled ? (
              <div className="bg-muted/50 text-muted-foreground rounded-xl border border-dashed p-3 text-xs leading-relaxed">
                Finish or cancel the new sponsor before switching to another sponsor in the pool.
              </div>
            ) : null}
            {sponsors.length === 0 ? (
              <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                No sponsors match the current search or filter.
              </div>
            ) : null}
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {sponsors.map((sponsor) => (
                <li key={sponsor.id} className="flex h-full min-h-0">
                  <div
                    className={cn(
                      "flex h-full min-h-0 w-full min-w-0 flex-col",
                      disabled && "pointer-events-none opacity-70",
                    )}
                  >
                    <MediaCard
                      cardContentClassName="px-4"
                      cardFooterClassName="px-4"
                      mediaWrapperClassName="-mx-4"
                      className={cn(
                        "h-full min-h-0 flex-1 gap-3 pt-0 pb-4 shadow-sm",
                        !disabled && "hover:border-primary/50 hover:bg-accent/20",
                      )}
                      media={
                        <div className="flex aspect-video items-center justify-center bg-white px-0">
                          {sponsor.logoUrl ? (
                            <img
                              src={sponsor.logoUrl}
                              alt={sponsor.logoAlt ?? sponsor.name}
                              className="max-h-20 max-w-48 object-contain"
                            />
                          ) : (
                            <span className="text-muted-foreground text-[10px] font-medium uppercase">
                              No logo
                            </span>
                          )}
                        </div>
                      }
                      footer={
                        <div className="flex w-full items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {sponsor.isDraft ? <Badge variant="secondary">Draft</Badge> : null}
                            {sponsor.isPrimary ? <Badge>Primary</Badge> : null}
                          </div>
                          <Button
                            type="button"
                            variant="brandPrimary"
                            size="sm"
                            disabled={disabled}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (!disabled) onEditSponsor?.(sponsor.id);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      }
                    >
                      <div className="flex min-h-0 flex-1 flex-col gap-2">
                        <div className="min-w-0 space-y-1">
                          <TypographyCardTitle as="div" className="line-clamp-2">
                            {sponsor.name}
                          </TypographyCardTitle>
                          {sponsor.tagline?.trim() ? (
                            <TypographyCardDescription as="div" className="line-clamp-2">
                              {sponsor.tagline}
                            </TypographyCardDescription>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground grid gap-1 text-xs">
                          <p>{sponsor.placementLabel}</p>
                          {sponsor.usageLabel.trim().length > 0 ? (
                            <p>{sponsor.usageLabel}</p>
                          ) : null}
                        </div>
                      </div>
                    </MediaCard>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      footer={
        <div className="grid w-full min-w-0 grid-cols-2 justify-items-center gap-3 text-center sm:grid-cols-4">
          {poolMetrics.map(([label, value]) => (
            <div key={label} className="max-w-full space-y-0.5">
              <div className="text-foreground text-xl font-semibold tracking-tight tabular-nums">
                {value}
              </div>
              <TypographyMuted className="text-xs leading-snug">{label}</TypographyMuted>
            </div>
          ))}
        </div>
      }
    />
  );
}
