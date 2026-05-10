"use client";

import { AssignSponsorsHeader } from "./assign-sponsors-header";
import { SponsorLibraryPanel } from "./library/sponsor-library-panel";
import { ManageSponsorsEmptyState } from "./manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { SponsorPlacementPanel } from "./placement/sponsor-placement-panel";
import { SponsorTargetingPanel } from "./targeting/sponsor-targeting-panel";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";

export function AssignSponsorsWorkspace({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    sponsors,
    workspaceSponsors,
    selectedSponsor,
    selectedSponsorId,
    setSelectedSponsorId,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    setPrimarySponsor,
    clearPrimarySponsor,
    assignSponsorRank,
    removeSponsorRank,
    moveSponsorRank,
    refetch,
  } = useManageSponsorsWorkspace(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <AssignSponsorsHeader accountId={accountId} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isLoading && !isError && sponsors.length === 0 ? <ManageSponsorsEmptyState /> : null}

      {!isLoading && !isError && sponsors.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
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
            <SponsorPlacementPanel
              sponsors={workspaceSponsors}
              onSetPrimarySponsor={setPrimarySponsor}
              onClearPrimarySponsor={clearPrimarySponsor}
              onAssignRank={assignSponsorRank}
              onRemoveRank={removeSponsorRank}
              onMoveRank={moveSponsorRank}
            />
            <SponsorTargetingPanel sponsor={selectedSponsor} />
          </div>
        </div>
      ) : null}
    </ManageSponsorsShell>
  );
}
