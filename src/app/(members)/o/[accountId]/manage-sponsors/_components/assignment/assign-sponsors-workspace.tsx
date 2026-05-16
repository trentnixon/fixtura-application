"use client";

import { AssignSponsorsWorkspaceContent } from "./_components/assign-sponsors-workspace-content";
import { AssignSponsorsHeader } from "./assign-sponsors-header";
import { useManageSponsorsWorkspace } from "../../_hooks/use-manage-sponsors-workspace";
import { ManageSponsorsLoadingState } from "../shared/manage-sponsors-loading-state";
import { ManageSponsorsShell } from "../shared/manage-sponsors-shell";

import type { AssignSponsorsWorkspaceProps } from "./_types/assign-sponsors-workspace";

export function AssignSponsorsWorkspace({ accountId, mode }: AssignSponsorsWorkspaceProps) {
  const { isRedirecting, isLoading, isError, errorMessage, sponsors, workspaceSponsors, refetch } =
    useManageSponsorsWorkspace(accountId);

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <AssignSponsorsHeader accountId={accountId} mode={mode} />
      <AssignSponsorsWorkspaceContent
        accountId={accountId}
        mode={mode}
        errorMessage={errorMessage}
        hasSponsors={sponsors.length > 0}
        isError={isError}
        isLoading={isLoading}
        onRetry={() => void refetch()}
        sponsors={workspaceSponsors}
      />
    </ManageSponsorsShell>
  );
}
