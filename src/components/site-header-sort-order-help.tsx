"use client";

import { SortOrderPageHelpTrigger } from "@/app/(members)/o/[accountId]/sort-order/_components/sort-order-page-help-trigger";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { getSortOrderPageHelpRouteFromPathRest } from "@/lib/sort-order/get-sort-order-page-help-route-from-path";

export function SiteHeaderSortOrderHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getSortOrderPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <SortOrderPageHelpTrigger accountId={scoped.accountId} route={route} variant="site-header" />
  );
}
