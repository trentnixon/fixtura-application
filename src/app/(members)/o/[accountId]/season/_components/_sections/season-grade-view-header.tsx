"use client";

import { ArrowLeft, CloudDownload, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

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

import type { SeasonGradeViewHeaderProps } from "../_types";

export function SeasonGradeViewHeader({
  accountId,
  competitionHref,
  displayModel,
  isFetching,
  canQueueCombinedSync,
  showSyncActions = true,
  onReload,
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
                <Link href={accountScopedRoutes.season(accountId)}>Vision</Link>
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
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {displayModel.displayName}
            </h1>
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
            <Button variant="outline" size="icon" asChild>
              <Link href={competitionHref} aria-label="Back to competition">
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button type="button" variant="outline" disabled={isFetching} onClick={onReload}>
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Refresh
            </Button>
            {showSyncActions ? (
              <Button
                type="button"
                variant="accent"
                disabled={!canQueueCombinedSync}
                onClick={onOpenSync}
              >
                <CloudDownload className="size-4" aria-hidden />
                Sync
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
