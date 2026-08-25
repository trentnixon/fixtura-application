"use client";

import { BrandLogoPageHelpTrigger } from "@/app/(members)/o/[accountId]/brand-logo/_components/brand-logo-page-help-trigger";
import { getBrandLogoPageHelpRouteFromPathRest } from "@/lib/brand-logo/get-brand-logo-page-help-route-from-path";
import { parseAccountScopePath } from "@/lib/config/account-routes";

export function SiteHeaderBrandLogoHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getBrandLogoPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <BrandLogoPageHelpTrigger accountId={scoped.accountId} route={route} variant="site-header" />
  );
}
