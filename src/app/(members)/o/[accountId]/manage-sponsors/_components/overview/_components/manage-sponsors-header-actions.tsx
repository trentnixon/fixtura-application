"use client";

import { LayoutGrid, Plus, Target } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { ManageSponsorsHeaderActionsProps } from "../_types/manage-sponsors-header";

export function ManageSponsorsHeaderActions({
  accountId,
  readOnly = false,
  entityButtonLabel,
}: ManageSponsorsHeaderActionsProps) {
  if (readOnly) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button variant="brandPrimaryOutline" asChild>
        <Link href={accountScopedRoutes.manageSponsorsAssignPosition(accountId)}>
          <LayoutGrid aria-hidden />
          Assign to position
        </Link>
      </Button>
      <Button variant="brandPrimaryOutline" asChild>
        <Link href={accountScopedRoutes.manageSponsorsAssignEntity(accountId)}>
          <Target aria-hidden />
          {entityButtonLabel}
        </Link>
      </Button>
      <Button variant="success" asChild>
        <Link href={accountScopedRoutes.addSponsor(accountId)}>
          <Plus aria-hidden />
          Add sponsor
        </Link>
      </Button>
    </div>
  );
}
