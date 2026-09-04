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

import type { SeasonFixtureViewHeaderProps } from "../_types";

export function SeasonFixtureViewHeader({
  accountId,
  seasonBase,
  competitionHref,
  gradeHref,
  model,
  isFetching,
  canQueueResultSync,
  showSyncActions = true,
  onReload,
  onOpenSync,
}: SeasonFixtureViewHeaderProps) {
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
                <Link href={seasonBase}>Vision</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={competitionHref} className="max-w-[min(100%,20rem)] truncate">
                  {model.competitionBreadcrumbLabel}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={gradeHref} className="max-w-[min(100%,20rem)] truncate">
                  {model.gradeName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                {model.headline}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {model.headline}
            </h1>
            {model.headerContextLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">{model.headerContextLine}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
            <Button variant="outline" size="icon" asChild>
              <Link href={gradeHref} aria-label="Back to grade">
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
            {/* Scorecard CTA temporarily hidden
            {model.scorecardUrl ? (
              <Button variant="accent" asChild>
                <a href={model.scorecardUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden />
                  Scorecard
                </a>
              </Button>
            ) : null}
            */}
            {showSyncActions ? (
              <Button
                type="button"
                variant="accent"
                disabled={!canQueueResultSync}
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
