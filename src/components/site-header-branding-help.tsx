"use client";

import { BrandingPageHelpTrigger } from "@/app/(members)/o/[accountId]/branding/_components/branding-page-help-trigger";
import { getBrandingPageHelpRouteFromPathRest } from "@/lib/branding/get-branding-page-help-route-from-path";
import { parseAccountScopePath } from "@/lib/config/account-routes";

export function SiteHeaderBrandingHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getBrandingPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <BrandingPageHelpTrigger accountId={scoped.accountId} route={route} variant="site-header" />
  );
}
