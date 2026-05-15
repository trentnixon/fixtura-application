"use client";

import { Archive, LayoutGrid, Plus, Target } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { useSponsorAssignmentTargetCopy } from "../_hooks/use-sponsor-assignment-target-copy";

export function ManageSponsorsHeader({ accountId }: { accountId: string }) {
  const targetCopy = useSponsorAssignmentTargetCopy(accountId);

  return (
    <PageHeader
      title="Manage sponsors"
      description="Add, review, and organise the sponsors available for your account."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="accent" asChild>
            <Link href={accountScopedRoutes.addSponsor(accountId)}>
              <Plus aria-hidden />
              Add sponsor
            </Link>
          </Button>
          <Button variant="brandPrimaryOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsAssignPosition(accountId)}>
              <LayoutGrid aria-hidden />
              Assign to position
            </Link>
          </Button>
          <Button variant="brandPrimaryOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsAssignEntity(accountId)}>
              <Target aria-hidden />
              {targetCopy.buttonLabel}
            </Link>
          </Button>
          <Button variant="brandPrimaryOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsArchive(accountId)}>
              <Archive aria-hidden />
              View archive
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
