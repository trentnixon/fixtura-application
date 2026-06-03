"use client";

import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
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

import { fixtureStatusBadgeClass } from "../_utils";

import type { SeasonFixtureViewHeaderProps } from "../_types";

export function SeasonFixtureViewHeader({
  accountId,
  seasonBase,
  competitionHref,
  gradeHref,
  model,
  isFetching,
  isSyncMutating,
  canQueueResultSync,
  onOpenSync,
}: SeasonFixtureViewHeaderProps) {
  return (
    <header className="border-border border-b pb-6">
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">
              Fixture detail
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {model.headline}
              </h1>
              {model.status && model.status.trim().length > 0 ? (
                <Badge
                  className={cn(
                    "shrink-0 border-transparent text-white hover:opacity-90",
                    fixtureStatusBadgeClass(model.status),
                  )}
                >
                  {model.status}
                </Badge>
              ) : null}
            </div>
            {model.headerContextLine ? (
              <p className="text-muted-foreground max-w-3xl text-sm">{model.headerContextLine}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
            <Button variant="outline" asChild>
              <Link href={gradeHref}>Back</Link>
            </Button>
            {model.scorecardUrl ? (
              <Button variant="accent" asChild>
                <a href={model.scorecardUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden />
                  Scorecard
                </a>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="accent"
              disabled={isFetching || isSyncMutating || !canQueueResultSync}
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
