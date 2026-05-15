"use client";

import { AssignSponsorsHeader } from "./assign-sponsors-header";
import { ManageSponsorsEmptyState } from "./manage-sponsors-empty-state";
import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { SponsorEntityAssignmentPanel } from "./placement/sponsor-entity-assignment-panel";
import { SponsorSlotPlacementPanel } from "./placement/sponsor-slot-placement-panel";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";

type AssignSponsorsMode = "position" | "entity";

export function AssignSponsorsWorkspace({
  accountId,
  mode,
}: {
  accountId: string;
  mode: AssignSponsorsMode;
}) {
  const { isRedirecting, isLoading, isError, errorMessage, sponsors, workspaceSponsors, refetch } =
    useManageSponsorsWorkspace(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <AssignSponsorsHeader accountId={accountId} mode={mode} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}
      {!isLoading && !isError && sponsors.length === 0 ? (
        <ManageSponsorsEmptyState accountId={accountId} />
      ) : null}

      {!isLoading && !isError && sponsors.length > 0 ? (
        <div className="grid gap-4">
          {mode === "position" ? (
            <SponsorSlotPlacementPanel accountId={accountId} sponsors={workspaceSponsors} />
          ) : null}
          {mode === "entity" ? (
            <SponsorEntityAssignmentPanel accountId={accountId} sponsors={workspaceSponsors} />
          ) : null}
        </div>
      ) : null}
    </ManageSponsorsShell>
  );
}
