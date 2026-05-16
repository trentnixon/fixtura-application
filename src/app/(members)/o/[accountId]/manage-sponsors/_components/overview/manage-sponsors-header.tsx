"use client";

import { PageHeader } from "@/components/ui/container";

import { ManageSponsorsHeaderActions } from "./_components/manage-sponsors-header-actions";
import { MANAGE_SPONSORS_HEADER_COPY } from "./_constants/manage-sponsors-header";
import { useSponsorAssignmentTargetCopy } from "../../_hooks/use-sponsor-assignment-target-copy";

import type { ManageSponsorsHeaderProps } from "./_types/manage-sponsors-header";

export function ManageSponsorsHeader({ accountId }: ManageSponsorsHeaderProps) {
  const targetCopy = useSponsorAssignmentTargetCopy(accountId);

  return (
    <PageHeader
      title={MANAGE_SPONSORS_HEADER_COPY.title}
      description={MANAGE_SPONSORS_HEADER_COPY.description}
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <ManageSponsorsHeaderActions
          accountId={accountId}
          entityButtonLabel={targetCopy.buttonLabel}
        />
      </div>
    </PageHeader>
  );
}
