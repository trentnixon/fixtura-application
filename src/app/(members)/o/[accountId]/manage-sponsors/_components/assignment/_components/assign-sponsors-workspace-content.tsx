"use client";

import { AssignSponsorsPlacementPanels } from "./assign-sponsors-placement-panels";
import { ManageSponsorsEmptyState } from "../../shared/manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "../../shared/manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "../../shared/manage-sponsors-loading-state";

import type { AssignSponsorsWorkspaceContentProps } from "../_types/assign-sponsors-workspace";

export function AssignSponsorsWorkspaceContent({
  accountId,
  mode,
  errorMessage,
  hasSponsors,
  isError,
  isLoading,
  onRetry,
  sponsors,
}: AssignSponsorsWorkspaceContentProps) {
  if (isLoading) {
    return <ManageSponsorsLoadingState />;
  }

  if (isError) {
    return <ManageSponsorsErrorState description={errorMessage} onRetry={onRetry} />;
  }

  if (!hasSponsors) {
    return <ManageSponsorsEmptyState accountId={accountId} />;
  }

  return <AssignSponsorsPlacementPanels accountId={accountId} mode={mode} sponsors={sponsors} />;
}
