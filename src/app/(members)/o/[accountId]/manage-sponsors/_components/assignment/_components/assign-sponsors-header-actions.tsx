"use client";

import { ArrowLeft, LayoutGrid, Target } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { AssignSponsorsHeaderActionsProps } from "../_types/assign-sponsors-header";

export function AssignSponsorsHeaderActions({
  accountId,
  mode,
  entityButtonLabel,
}: AssignSponsorsHeaderActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button variant={mode === "position" ? "brandPrimary" : "brandPrimaryOutline"} asChild>
        <Link href={accountScopedRoutes.manageSponsorsAssignPosition(accountId)}>
          <LayoutGrid aria-hidden />
          Assign to position
        </Link>
      </Button>
      <Button variant={mode === "entity" ? "brandPrimary" : "brandPrimaryOutline"} asChild>
        <Link href={accountScopedRoutes.manageSponsorsAssignEntity(accountId)}>
          <Target aria-hidden />
          {entityButtonLabel}
        </Link>
      </Button>
      <Button variant="brandPrimaryOutline" asChild>
        <Link href={accountScopedRoutes.manageSponsors(accountId)}>
          <ArrowLeft aria-hidden />
          Back to sponsor pool
        </Link>
      </Button>
    </div>
  );
}
