"use client";

import { ExternalLink } from "lucide-react";
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
import { buildBundlesHubAccountUrl } from "@/lib/config/bundles-hub";

import { BUNDLES_SCREEN_COPY } from "../_consts";

type BundlesScreenHeaderProps = {
  accountId: string;
};

/** Matches `season-overview-header` — breadcrumb, title, trailing actions. */
export function BundlesScreenHeader({ accountId }: BundlesScreenHeaderProps) {
  const accountHubUrl = buildBundlesHubAccountUrl(accountId);

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
              <BreadcrumbPage>{BUNDLES_SCREEN_COPY.pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {BUNDLES_SCREEN_COPY.pageTitle}
            </h1>
          </div>
          {accountHubUrl ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="accent" asChild>
                <a href={accountHubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" aria-hidden />
                  {BUNDLES_SCREEN_COPY.assetHubAction}
                </a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
