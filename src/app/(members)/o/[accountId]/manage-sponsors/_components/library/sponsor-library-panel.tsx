import { FolderKanban } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";

import { SponsorLibraryCard } from "./_components/sponsor-library-card";
import { SponsorLibraryMetricsFooter } from "./_components/sponsor-library-metrics-footer";
import { SponsorLibraryToolbar } from "./sponsor-library-toolbar";
import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "../shared/manage-sponsors-container-header-title";

import type { SponsorLibraryPanelProps, SponsorPoolStats } from "./_types/sponsor-library";

export type { SponsorPoolStats };

export function SponsorLibraryPanel({
  accountId,
  sponsors,
  stats,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
  readOnly = false,
  onEditSponsor,
}: SponsorLibraryPanelProps) {
  return (
    <MetricComparisonCard
      className="ring-border h-full min-h-0 rounded-2xl border-none shadow-xl ring-1"
      layout="card"
      headerClassName={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}
      bodyClassName="px-4 py-4 sm:px-5"
      footerClassName="items-center px-4 py-4 sm:px-5"
      title={
        <ManageSponsorsContainerHeaderTitle
          icon={<FolderKanban className="size-5" aria-hidden />}
          title="Sponsor pool"
          description="Search, filter, and update the active sponsors available for your assets."
        />
      }
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
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sponsors.map((sponsor) => (
                <SponsorLibraryCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  disabled={disabled}
                  readOnly={readOnly}
                  onEditSponsor={onEditSponsor}
                />
              ))}
            </ul>
          </div>
        </div>
      }
      footer={<SponsorLibraryMetricsFooter accountId={accountId} stats={stats} />}
    />
  );
}
