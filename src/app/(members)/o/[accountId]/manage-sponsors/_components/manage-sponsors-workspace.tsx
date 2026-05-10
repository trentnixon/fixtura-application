"use client";

import { SponsorEditorSheet } from "./editor/sponsor-editor-sheet";
import { SponsorLibraryPanel } from "./library/sponsor-library-panel";
import { ManageSponsorsEmptyState } from "./manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsHeader } from "./manage-sponsors-header";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { SponsorPlacementPanel } from "./placement/sponsor-placement-panel";
import { SponsorPoolSummaryCards } from "./sponsor-pool-summary-cards";
import { SponsorPreviewPanel } from "./sponsor-preview-panel";
import { SponsorTargetingPanel } from "./targeting/sponsor-targeting-panel";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";

export function ManageSponsorsWorkspace({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    sponsors,
    stats,
    selectedSponsor,
    selectedSponsorId,
    setSelectedSponsorId,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    addSponsorDraft,
    refetch,
  } = useManageSponsorsWorkspace(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <ManageSponsorsHeader accountId={accountId} onAddSponsor={addSponsorDraft} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isLoading && !isError ? <SponsorPoolSummaryCards stats={stats} /> : null}
      {!isLoading && !isError && sponsors.length === 0 ? <ManageSponsorsEmptyState /> : null}

      {!isLoading && !isError && sponsors.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
          <SponsorLibraryPanel
            sponsors={sponsors}
            selectedSponsorId={selectedSponsorId}
            onSelectSponsor={setSelectedSponsorId}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <div className="grid gap-6">
            <SponsorEditorSheet sponsor={selectedSponsor} />
            <SponsorPreviewPanel sponsor={selectedSponsor} />
          </div>
          <div className="grid gap-6">
            <SponsorPlacementPanel sponsor={selectedSponsor} />
            <SponsorTargetingPanel sponsor={selectedSponsor} />
          </div>
        </div>
      ) : null}
    </ManageSponsorsShell>
  );
}
