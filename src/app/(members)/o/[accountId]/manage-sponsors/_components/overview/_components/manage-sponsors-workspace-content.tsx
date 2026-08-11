"use client";

import { SponsorLibraryPanel } from "../../library/sponsor-library-panel";
import { ManageSponsorsEmptyState } from "../../shared/manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "../../shared/manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "../../shared/manage-sponsors-loading-state";

import type { ManageSponsorsWorkspaceContentProps } from "../_types/manage-sponsors-workspace";

export function ManageSponsorsWorkspaceContent({
  accountId,
  workspace,
  readOnly = false,
  onEditSponsor,
}: ManageSponsorsWorkspaceContentProps) {
  const hasAnySponsors = workspace.workspaceSponsors.length > 0;

  if (workspace.isLoading) {
    return <ManageSponsorsLoadingState />;
  }

  if (workspace.isError) {
    return (
      <ManageSponsorsErrorState
        description={workspace.errorMessage}
        onRetry={() => void workspace.refetch()}
      />
    );
  }

  if (!hasAnySponsors) {
    return <ManageSponsorsEmptyState accountId={accountId} readOnly={readOnly} />;
  }

  return (
    <div className="grid gap-4">
      <SponsorLibraryPanel
        accountId={accountId}
        sponsors={workspace.sponsors}
        stats={workspace.stats}
        searchValue={workspace.searchValue}
        onSearchChange={workspace.setSearchValue}
        activeFilter={workspace.activeFilter}
        onFilterChange={workspace.setActiveFilter}
        readOnly={readOnly}
        onEditSponsor={readOnly ? undefined : onEditSponsor}
      />
    </div>
  );
}
