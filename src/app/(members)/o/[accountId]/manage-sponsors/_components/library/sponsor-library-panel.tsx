import { MediaCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { SponsorLibraryFilters } from "./sponsor-library-filters";
import { SponsorLibrarySearch } from "./sponsor-library-search";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";
import type { ManageSponsorsLibraryFilter } from "../../_types/manage-sponsors";

export function SponsorLibraryPanel({
  sponsors,
  selectedSponsorId,
  onSelectSponsor,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
}: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  selectedSponsorId: number | string | null;
  onSelectSponsor: (sponsorId: number | string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
  disabled?: boolean;
}) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle>Sponsor pool</CardTitle>
        <CardDescription>
          Filter and search across the sponsor pool, then jump straight into the sponsor you want to
          work on.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <SponsorLibrarySearch value={searchValue} onChange={onSearchChange} disabled={disabled} />
        <SponsorLibraryFilters
          activeFilter={activeFilter}
          onChange={onFilterChange}
          disabled={disabled}
        />
        {disabled ? (
          <div className="bg-muted/50 text-muted-foreground rounded-xl border border-dashed p-3 text-xs leading-relaxed">
            Finish or cancel the new sponsor before switching to another sponsor in the pool.
          </div>
        ) : null}
        <p className="text-muted-foreground text-xs">
          {sponsors.length} sponsor{sponsors.length === 1 ? "" : "s"} in view
        </p>
        {sponsors.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            No sponsors match the current search or filter.
          </div>
        ) : null}
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sponsors.map((sponsor) => {
            const isSelected = sponsor.id === selectedSponsorId;

            return (
              <li key={sponsor.id}>
                <div
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-disabled={disabled}
                  onClick={() => {
                    if (!disabled) onSelectSponsor(sponsor.id);
                  }}
                  onKeyDown={(event) => {
                    if (disabled) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectSponsor(sponsor.id);
                    }
                  }}
                  className={cn(
                    "focus-visible:ring-ring focus-visible:ring-offset-background block w-full cursor-pointer text-left transition-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    !disabled && "hover:-translate-y-0.5",
                    disabled && "cursor-not-allowed opacity-70",
                  )}
                >
                  <MediaCard
                    className={cn(
                      "h-full overflow-hidden shadow-sm",
                      !disabled && "hover:border-primary/50 hover:bg-accent/20",
                      isSelected && "border-primary bg-primary/5 ring-primary/20 ring-2",
                    )}
                    title={sponsor.name}
                    description={sponsor.tagline ?? sponsor.usageLabel}
                    media={
                      <div className="bg-muted flex aspect-video items-center justify-center">
                        {sponsor.logoUrl ? (
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.logoAlt ?? sponsor.name}
                            className="max-h-20 max-w-[12rem] object-contain"
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
                          {sponsor.rank != null ? (
                            <Badge variant="outline">Rank {sponsor.rank}</Badge>
                          ) : null}
                          {!sponsor.isPrimary && sponsor.rank == null ? (
                            <Badge variant="outline">Unassigned</Badge>
                          ) : null}
                          {!sponsor.isActive ? <Badge variant="outline">Inactive</Badge> : null}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={disabled}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Edit
                        </Button>
                      </div>
                    }
                  >
                    <div className="text-muted-foreground grid gap-1 text-xs">
                      <p>{sponsor.placementLabel}</p>
                      <p>{sponsor.usageLabel}</p>
                    </div>
                  </MediaCard>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
