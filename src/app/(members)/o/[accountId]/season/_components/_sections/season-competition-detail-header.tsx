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

import type { SeasonCompetitionDetailHeaderProps } from "../_types";

export function SeasonCompetitionDetailHeader({
  accountId,
  competitionPageTitle,
  competitionMeta,
  headerContextLine,
  timeframeLine,
  competitionHeaderActive,
  competitionStatus,
  seasonOverviewHref,
  isFetching,
  canQueueGradesRefresh,
  onReload,
  onOpenSyncGrades,
}: SeasonCompetitionDetailHeaderProps) {
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
                <Link href={seasonOverviewHref}>Vision</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                {competitionPageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {competitionPageTitle}
              </h1>
              {competitionMeta &&
              (competitionMeta.status || typeof competitionMeta.isActive === "boolean") ? (
                <Badge
                  className={cn(
                    "shrink-0 border-transparent text-white hover:opacity-90",
                    competitionHeaderActive ? "bg-success-600" : "bg-error-600",
                  )}
                >
                  {competitionMeta.status ??
                    (competitionMeta.isActive === true
                      ? "Active"
                      : competitionMeta.isActive === false
                        ? "Inactive"
                        : competitionStatus)}
                </Badge>
              ) : null}
            </div>
            {headerContextLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">{headerContextLine}</p>
            ) : null}
            {timeframeLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">
                <span className="text-foreground font-medium">Season dates: </span>
                {timeframeLine}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
            <Button variant="outline" asChild>
              <Link href={seasonOverviewHref}>Back</Link>
            </Button>
            <Button type="button" variant="outline" disabled={isFetching} onClick={onReload}>
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Refresh Vision
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={!canQueueGradesRefresh}
              onClick={onOpenSyncGrades}
            >
              <RefreshCw className="size-4" aria-hidden />
              Sync grades
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
