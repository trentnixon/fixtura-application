"use client";

import { ManageSponsorsPageHelpTrigger } from "@/app/(members)/o/[accountId]/manage-sponsors/_components/shared/manage-sponsors-page-help-trigger";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { getSponsorsPageHelpRouteFromPathRest } from "@/lib/sponsors/get-sponsors-page-help-route-from-path";

export function SiteHeaderSponsorsHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getSponsorsPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <ManageSponsorsPageHelpTrigger
      accountId={scoped.accountId}
      route={route}
      variant="site-header"
    />
  );
}
