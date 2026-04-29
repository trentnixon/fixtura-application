"use client";

import { Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { cn } from "@/lib/utils";

import type { SeasonGradeViewHeaderProps } from "../_types";

export function SeasonGradeViewHeader({
  accountId,
  competitionHref,
  displayModel,
  gradeRaw,
  isFetching,
  isSyncMutating,
  canQueueCombinedSync,
  onOpenSync,
}: SeasonGradeViewHeaderProps) {
  return (
    <header className="border-border border-b pb-8">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={accountScopedRoutes.dashboard(accountId)}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={accountScopedRoutes.season(accountId)}>Season</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={competitionHref} className="max-w-[min(100%,20rem)] truncate">
                  {displayModel.competitionBreadcrumbLabel}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                {displayModel.displayName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {displayModel.displayName}
              </h1>
              {gradeRaw && displayModel.status !== "Unknown status" ? (
                <Badge
                  className={cn(
                    "shrink-0 border-transparent text-white hover:opacity-90",
                    displayModel.gradeHeaderActive ? "bg-success-600" : "bg-error-600",
                  )}
                >
                  {displayModel.status}
                </Badge>
              ) : null}
            </div>
            {displayModel.headerContextLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">
                {displayModel.headerContextLine}
              </p>
            ) : null}
            {displayModel.headerGradeMetaLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">
                {displayModel.headerGradeMetaLine}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
            <Button variant="outline" asChild>
              <Link href={competitionHref}>Back</Link>
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={isFetching || isSyncMutating || !canQueueCombinedSync}
              onClick={onOpenSync}
            >
              {isFetching || isSyncMutating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Sync
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
