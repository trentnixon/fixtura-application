"use client";

import { SponsorLibraryPanel } from "./library/sponsor-library-panel";
import { ManageSponsorsEmptyState } from "./manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsHeader } from "./manage-sponsors-header";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { SponsorAssignmentEntryCard } from "./sponsor-assignment-entry-card";
import { SponsorPoolSummaryCards } from "./sponsor-pool-summary-cards";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";

export function ManageSponsorsWorkspace({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    sponsors,
    workspaceSponsors,
    stats,
    selectedSponsorId,
    setSelectedSponsorId,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    refetch,
  } = useManageSponsorsWorkspace(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  const hasAnySponsors = workspaceSponsors.length > 0;

  return (
    <ManageSponsorsShell>
      <ManageSponsorsHeader accountId={accountId} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isLoading && !isError && hasAnySponsors ? <SponsorPoolSummaryCards stats={stats} /> : null}
      {!isLoading && !isError && hasAnySponsors ? (
        <SponsorAssignmentEntryCard accountId={accountId} />
      ) : null}
      {!isLoading && !isError && !hasAnySponsors ? (
        <ManageSponsorsEmptyState accountId={accountId} />
      ) : null}

      {!isLoading && !isError && hasAnySponsors ? (
        <div className="grid gap-6">
          <SponsorLibraryPanel
            sponsors={sponsors}
            selectedSponsorId={selectedSponsorId}
            onSelectSponsor={setSelectedSponsorId}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      ) : null}
    </ManageSponsorsShell>
  );
}
