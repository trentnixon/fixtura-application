"use client";

import { ArrowLeft, LayoutGrid, Target } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { useSponsorAssignmentTargetCopy } from "../_hooks/use-sponsor-assignment-target-copy";

const HEADER_COPY = {
  position: {
    title: "Assign sponsors to positions",
    description: "Choose which sponsor appears in each account-wide sponsor position.",
  },
} as const;

export function AssignSponsorsHeader({
  accountId,
  mode,
}: {
  accountId: string;
  mode: keyof typeof HEADER_COPY | "entity";
}) {
  const targetCopy = useSponsorAssignmentTargetCopy(accountId);
  const copy = mode === "entity" ? targetCopy : HEADER_COPY[mode];

  return (
    <PageHeader title={copy.title} description={copy.description}>
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
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
              {targetCopy.buttonLabel}
            </Link>
          </Button>
          <Button variant="brandPrimaryOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>
              <ArrowLeft aria-hidden />
              Back to sponsor pool
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
