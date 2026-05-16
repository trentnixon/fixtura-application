"use client";

import { PageHeader } from "@/components/ui/container";

import { AssignSponsorsHeaderActions } from "./_components/assign-sponsors-header-actions";
import { ASSIGN_SPONSORS_POSITION_HEADER_COPY } from "./_constants/assign-sponsors-header";
import { useSponsorAssignmentTargetCopy } from "../../_hooks/use-sponsor-assignment-target-copy";

import type { AssignSponsorsHeaderProps } from "./_types/assign-sponsors-header";

export function AssignSponsorsHeader({ accountId, mode }: AssignSponsorsHeaderProps) {
  const targetCopy = useSponsorAssignmentTargetCopy(accountId);
  const copy = mode === "entity" ? targetCopy : ASSIGN_SPONSORS_POSITION_HEADER_COPY;

  return (
    <PageHeader title={copy.title} description={copy.description}>
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <AssignSponsorsHeaderActions
          accountId={accountId}
          mode={mode}
          entityButtonLabel={targetCopy.buttonLabel}
        />
      </div>
    </PageHeader>
  );
}
