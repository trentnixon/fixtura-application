"use client";

import { useEffect, useMemo, useRef } from "react";

import { resolveTemplateModeSlugFromBranding } from "@/features/remotion-asset-preview";
import { captureUserAction } from "@/lib/analytics";
import {
  isAccountAnalyticsOverviewGatewayRedirect,
  useAccountAnalyticsOverview,
} from "@/lib/api/hooks/account/useAccountAnalyticsOverview";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useTemplateCategoriesListForSelection } from "@/lib/api/hooks/account/useTemplateCategoriesListForSelection";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";

import { DashboardAssetPreviewPanel } from "./_components/dashboard-asset-preview-panel";
import { DashboardBillingRouteCard } from "./_components/dashboard-billing-route-card";
import { DashboardBrandingRouteCard } from "./_components/dashboard-branding-route-card";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardKpiStrip } from "./_components/dashboard-kpi-strip";
import { DashboardSponsorsRouteCard } from "./_components/dashboard-sponsors-route-card";
import { DashboardVisionRouteCard } from "./_components/dashboard-vision-route-card";
import { buildDashboardViewModel } from "./dashboard-view-model";

export function DashboardContent({ accountId }: { accountId: string }) {
  const viewedRef = useRef(false);
  const me = useAccountMe();
  const settings = useAccountSettings(accountId);
  const branding = useAccountBranding(accountId);
  const organisationContext = useAccountOrganisationContext(accountId);
  const analytics = useAccountAnalyticsOverview(accountId);

  const settingsData =
    settings.data && !isAccountSettingsGatewayRedirect(settings.data) ? settings.data.data : null;

  const brandingData =
    branding.data && !isAccountBrandingGatewayRedirect(branding.data) ? branding.data.data : null;

  const organisationContextData =
    organisationContext.data &&
    !isAccountOrganisationContextGatewayRedirect(organisationContext.data)
      ? organisationContext.data.data
      : null;

  const analyticsResponse =
    analytics.data && !isAccountAnalyticsOverviewGatewayRedirect(analytics.data)
      ? analytics.data
      : null;

  const model = buildDashboardViewModel({
    accountId,
    me: me.data,
    settings: settingsData,
    branding: brandingData,
    organisationContext: organisationContextData,
    analytics: analyticsResponse,
  });

  const templateModesQuery = useTemplateModesUi();
  const templateCategoriesQuery = useTemplateCategoriesListForSelection();
  const templateCategoryCatalog = useMemo(
    () => templateCategoriesQuery.data?.data ?? [],
    [templateCategoriesQuery.data],
  );

  const templateModeSlug = useMemo(
    () => resolveTemplateModeSlugFromBranding(model.branding, templateModesQuery.data?.data ?? []),
    [model.branding, templateModesQuery.data],
  );

  useEffect(() => {
    if (viewedRef.current || me.isPending || settings.isPending) return;
    if (!me.isSuccess || !settings.isSuccess) return;
    viewedRef.current = true;
    captureUserAction("dashboard_viewed", { accountId });
  }, [accountId, me.isPending, me.isSuccess, settings.isPending, settings.isSuccess]);

  return (
    <div className="grid gap-12">
      <div className="mt-0 grid gap-6">
        <DashboardHeader accountId={accountId} model={model} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_3fr] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <DashboardAssetPreviewPanel
              accountId={accountId}
              sport={model.sport}
              branding={model.branding}
              logoUrl={model.logoUrl}
              templateModeSlug={templateModeSlug}
              templateCategoryCatalog={templateCategoryCatalog}
              debugPlacement="none"
            />
            <DashboardBrandingRouteCard accountId={accountId} logoUrl={model.logoUrl} />
            <DashboardVisionRouteCard accountId={accountId} />
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <DashboardBillingRouteCard accountId={accountId} />
            <DashboardKpiStrip
              accountId={accountId}
              isPending={analytics.isPending}
              rollup={model.rollup}
              analyticsMeta={model.analytics?.meta ?? null}
            />
            <DashboardSponsorsRouteCard accountId={accountId} />
          </div>
        </div>
      </div>
    </div>
  );
}
