"use client";

import { CloudDownload, Loader2, RefreshCw } from "lucide-react";
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

import type { SeasonOverviewHeaderProps } from "../_types";

export function SeasonOverviewHeader({
  accountId,
  loading,
  orgSyncPending,
  showSyncActions = true,
  onRefresh,
  onOpenSync,
}: SeasonOverviewHeaderProps) {
  return (
    <header className="pb-6">
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
              <BreadcrumbPage>Vision</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* page.header.actions.trailing @see sandbox/kitchen-sink/page-headers/_sections/actions.tsx */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Fixtura Vision
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm">
              Your synced season in one place — browse your competitions, grades, teams, and
              fixtures to confirm what Fixtura has loaded.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" onClick={onRefresh}>
              <RefreshCw className="size-4" aria-hidden />
              Refresh
            </Button>
            {showSyncActions ? (
              <Button
                type="button"
                variant="accent"
                disabled={loading || orgSyncPending}
                onClick={onOpenSync}
              >
                {loading || orgSyncPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CloudDownload className="size-4" aria-hidden />
                )}
                Sync
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
