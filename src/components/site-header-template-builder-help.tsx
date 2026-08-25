"use client";

import { TemplateBuilderPageHelpTrigger } from "@/app/(members)/o/[accountId]/template-builder/_components/template-builder-page-help-trigger";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { getTemplateBuilderPageHelpRouteFromPathRest } from "@/lib/template-builder/get-template-builder-page-help-route-from-path";

export function SiteHeaderTemplateBuilderHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getTemplateBuilderPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <TemplateBuilderPageHelpTrigger
      accountId={scoped.accountId}
      route={route}
      variant="site-header"
    />
  );
}
