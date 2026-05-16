import { FolderKanban } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";

import { SponsorLibraryCard } from "./_components/sponsor-library-card";
import { SponsorLibraryMetricsFooter } from "./_components/sponsor-library-metrics-footer";
import { SponsorLibraryToolbar } from "./sponsor-library-toolbar";

import type { SponsorLibraryPanelProps, SponsorPoolStats } from "./_types/sponsor-library";

export type { SponsorPoolStats };

export function SponsorLibraryPanel({
  sponsors,
  stats,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
  onEditSponsor,
}: SponsorLibraryPanelProps) {
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
                <SponsorLibraryCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  disabled={disabled}
                  onEditSponsor={onEditSponsor}
                />
              ))}
            </ul>
          </div>
        </div>
      }
      footer={<SponsorLibraryMetricsFooter stats={stats} />}
    />
  );
}
