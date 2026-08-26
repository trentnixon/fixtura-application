"use client";

import { ClubLogosPageHelpTrigger } from "@/app/(members)/o/[accountId]/club-logos/_components/club-logos-page-help-trigger";
import { getClubLogosPageHelpRouteFromPathRest } from "@/lib/club-logos/get-club-logos-page-help-route-from-path";
import { parseAccountScopePath } from "@/lib/config/account-routes";

export function SiteHeaderClubLogosHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getClubLogosPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <ClubLogosPageHelpTrigger accountId={scoped.accountId} route={route} variant="site-header" />
  );
}
