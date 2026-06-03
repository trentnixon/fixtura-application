"use client";

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

import { BundlesRenderStatusPill } from "./bundles-render-status-pill";
import { BUNDLES_RENDER_DETAIL_COPY } from "../_consts/render-detail";
import { formatRenderCreatedDate } from "../_utils/format-render-created-at";

import type { AccountRenderDetail } from "@/types/api/account";

/** Matches `BundlesScreenHeader` / season fixture header — breadcrumb, title, hub CTA. */
export function BundlesRenderDetailHeader({
  accountId,
  render,
}: {
  accountId: string;
  render: AccountRenderDetail;
}) {
  const bundlesHref = accountScopedRoutes.bundles(accountId);
  const showUpdated = render.updatedAt !== render.createdAt;
  const createdDateLabel = formatRenderCreatedDate(render.createdAt);

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
              <BreadcrumbLink asChild>
                <Link href={bundlesHref}>Bundles</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                {createdDateLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {createdDateLabel}
              </h1>
              <BundlesRenderStatusPill status={render.status} />
            </div>
            {showUpdated ? (
              <p className="text-muted-foreground text-sm">
                {BUNDLES_RENDER_DETAIL_COPY.updatedLabel}{" "}
                <span className="text-foreground font-medium">
                  {formatRenderCreatedDate(render.updatedAt)}
                </span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="brandPrimaryOutline" size="sm" asChild>
              <Link href={bundlesHref}>{BUNDLES_RENDER_DETAIL_COPY.backAction}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
