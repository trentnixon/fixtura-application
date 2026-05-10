import { Badge } from "@/components/ui/badge";
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
}: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  selectedSponsorId: number | string | null;
  onSelectSponsor: (sponsorId: number | string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
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
        <SponsorLibrarySearch value={searchValue} onChange={onSearchChange} />
        <SponsorLibraryFilters activeFilter={activeFilter} onChange={onFilterChange} />
        <p className="text-muted-foreground text-xs">
          {sponsors.length} sponsor{sponsors.length === 1 ? "" : "s"} in view
        </p>
        {sponsors.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            No sponsors match the current search or filter.
          </div>
        ) : null}
        <ul className="grid gap-3">
          {sponsors.map((sponsor) => {
            const isSelected = sponsor.id === selectedSponsorId;

            return (
              <li key={sponsor.id}>
                <button
                  type="button"
                  onClick={() => onSelectSponsor(sponsor.id)}
                  className={cn(
                    "border-border bg-background hover:border-primary/50 hover:bg-accent/30 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                    isSelected && "border-primary bg-primary/5 ring-primary/20 ring-2",
                  )}
                >
                  <div className="bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.logoAlt ?? sponsor.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground text-[10px] font-medium uppercase">
                        No logo
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{sponsor.name}</p>
                      {sponsor.isDraft ? <Badge variant="secondary">Draft</Badge> : null}
                      {sponsor.isPrimary ? <Badge>Primary</Badge> : null}
                      {sponsor.rank != null ? (
                        <Badge variant="outline">Rank {sponsor.rank}</Badge>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground grid gap-1 text-xs">
                      <p>{sponsor.placementLabel}</p>
                      <p>{sponsor.usageLabel}</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
