"use client";

import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import {
  isAccountSponsorEntityTargetsGatewayRedirect,
  useAccountSponsorEntityTargets,
} from "@/lib/api/hooks/account/useAccountSponsorEntityTargets";

import { AssignSponsorsHeader } from "../../_components/assignment/assign-sponsors-header";
import { ManageSponsorsShell } from "../../_components/shared/manage-sponsors-shell";

import type { ReactNode } from "react";

export function EntityAssignmentSettingsPrint({ accountId }: { accountId: string }) {
  const settingsQuery = useAccountSettings(accountId);
  const targetsQuery = useAccountSponsorEntityTargets(accountId);

  let content: ReactNode;

  if (settingsQuery.isPending || targetsQuery.isPending) {
    content = <p className="text-muted-foreground text-sm">Loading account settings...</p>;
  } else if (settingsQuery.isError || targetsQuery.isError) {
    const error = settingsQuery.error ?? targetsQuery.error;
    content = (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Could not load account settings."}
      </p>
    );
  } else if (isAccountSettingsGatewayRedirect(settingsQuery.data)) {
    content = (
      <p className="text-muted-foreground text-sm">
        Account settings redirected: {settingsQuery.data.reason}
      </p>
    );
  } else if (isAccountSponsorEntityTargetsGatewayRedirect(targetsQuery.data)) {
    content = (
      <p className="text-muted-foreground text-sm">
        Sponsor entity targets redirected: {targetsQuery.data.reason}
      </p>
    );
  } else {
    const targets = targetsQuery.data.data.targets;

    content = (
      <div className="rounded-lg border p-6">
        <p className="text-sm font-medium">Entity sponsor placements are ready.</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {targets.length === 0
            ? "No clubs, teams, or grades are available for sponsor placement yet."
            : `${targets.length} club, team, or grade target${targets.length === 1 ? "" : "s"} can be assigned a sponsor.`}
        </p>
      </div>
    );
  }

  return (
    <ManageSponsorsShell>
      <AssignSponsorsHeader accountId={accountId} mode="entity" />
      {content}
    </ManageSponsorsShell>
  );
}
