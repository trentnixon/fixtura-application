"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { resolveTemplateModeSlugFromBranding } from "@/features/remotion-asset-preview";
import {
  isAccountAnalyticsOverviewGatewayRedirect,
  useAccountAnalyticsOverview,
} from "@/lib/api/hooks/account/useAccountAnalyticsOverview";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { useAccountOrganisation } from "@/lib/api/hooks/account/useAccountOrganisation";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";

import { DashboardActivityTable } from "./_components/dashboard-activity-table";
import { DashboardAssetPreviewPanel } from "./_components/dashboard-asset-preview-panel";
import { DashboardCategorySection } from "./_components/dashboard-category-section";
import { DashboardDevPayloads } from "./_components/dashboard-dev-payloads";
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardKpiStrip } from "./_components/dashboard-kpi-strip";
import { DashboardOrganisationRouteCards } from "./_components/dashboard-organisation-route-cards";
import { buildDashboardViewModel } from "./dashboard-view-model";

export function DashboardContent({ accountId }: { accountId: string }) {
  const searchParams = useSearchParams();
  /** Dev/staging: show JSON dumps in development or when `?debug=1`. */
  const showDevPayloads =
    process.env.NODE_ENV === "development" || searchParams.get("debug") === "1";

  const me = useAccountMe();
  const settings = useAccountSettings(accountId);
  const branding = useAccountBranding(accountId);
  const organisationContext = useAccountOrganisationContext(accountId);
  const analytics = useAccountAnalyticsOverview(accountId);
  const legacy = useAccountOrganisation(accountId);

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
  const templateModeSlug = useMemo(
    () => resolveTemplateModeSlugFromBranding(model.branding, templateModesQuery.data?.data ?? []),
    [model.branding, templateModesQuery.data],
  );

  return (
    <div className="grid gap-12">
      <div className="mt-0 grid gap-6">
        <DashboardHeader accountId={accountId} model={model} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_3fr] lg:items-stretch">
          <div className="min-w-0">
            <DashboardAssetPreviewPanel
              accountId={accountId}
              sport={model.sport}
              branding={model.branding}
              logoUrl={model.logoUrl}
              templateModeSlug={templateModeSlug}
            />
          </div>
          <div className="min-w-0">
            <DashboardKpiStrip
              accountId={accountId}
              isPending={analytics.isPending}
              rollup={model.rollup}
              analyticsMeta={model.analytics?.meta ?? null}
            />
          </div>
        </div>
      </div>

      <DashboardCategorySection
        title="Organisation"
        description="Go to the pages where you manage branding, sponsors, and Vision."
      >
        <DashboardOrganisationRouteCards
          accountId={accountId}
          model={model}
          brandingPending={branding.isPending}
        />
      </DashboardCategorySection>

      <DashboardCategorySection
        title="Assets"
        description="Settings, templates, media, and bundles — daily activity from renders and downloads."
      >
        <DashboardActivityTable
          isPending={analytics.isPending}
          series={model.series}
          totalRenders={model.rollup?.totalRenders ?? 0}
        />
      </DashboardCategorySection>

      {showDevPayloads ? (
        <DashboardDevPayloads
          me={me}
          settings={settings}
          branding={branding}
          organisationContext={organisationContext}
          analytics={analytics}
          legacy={legacy}
        />
      ) : null}
    </div>
  );
}
