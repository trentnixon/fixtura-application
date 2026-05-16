"use client";

import { useSearchParams } from "next/navigation";

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

import { DashboardActivityTable } from "./_components/dashboard-activity-table";
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

  const pctComplete = model.metricsPct?.percentageCompleteRenders;

  return (
    <div className="grid gap-12">
      <DashboardHeader accountId={accountId} model={model} />

      <DashboardCategorySection
        title="Overview"
        description="Activity snapshot and render metrics for this organisation."
      >
        <DashboardKpiStrip
          isPending={analytics.isPending}
          rollup={model.rollup}
          percentageComplete={pctComplete}
        />
      </DashboardCategorySection>

      <DashboardCategorySection
        title="Organisation"
        description="Go to the pages where you manage branding, logo, sponsors, and season."
      >
        <DashboardOrganisationRouteCards
          accountId={accountId}
          model={model}
          brandingPending={branding.isPending}
          organisationPending={organisationContext.isPending}
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
